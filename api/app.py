"""
FastAPI Bridge for SRS Compliance Analyzer
Wraps existing CompliancePipeline and legacy pipeline — does NOT modify any backend files.
"""
import os
import sys
import json
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# Add project root to sys.path so src/ package is importable
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.pipeline import CompliancePipeline
from src.reporting.report_formatter import ComplianceReportFormatter
from src.pdf_extractor import ScannedPDFError


app = FastAPI(
    title="SRS Compliance Analyzer API",
    description="REST API bridge wrapping the AI-SRS Compliance Analyzer backend pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORTS_DIR = PROJECT_ROOT / "api" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

_pipeline: Optional[CompliancePipeline] = None
_formatter: Optional[ComplianceReportFormatter] = None


def get_pipeline() -> CompliancePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = CompliancePipeline()
    return _pipeline


def get_formatter() -> ComplianceReportFormatter:
    global _formatter
    if _formatter is None:
        _formatter = ComplianceReportFormatter()
    return _formatter


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/api/analyze/v2")
async def analyze_v2(
    reference: UploadFile = File(..., description="Reference template PDF"),
    target: UploadFile = File(..., description="Target document PDF/TXT/MD"),
    page: Optional[int] = Form(None),
    top_k: int = Form(5),
):
    """
    Run V2 Hybrid (BM25 + Dense + NLI) compliance analysis.
    Returns the full DocumentComplianceReport as JSON.
    """
    tmp_dir = tempfile.mkdtemp()
    try:
        # Save uploaded files to temp directory
        ref_suffix = Path(reference.filename).suffix or ".pdf"
        tgt_suffix = Path(target.filename).suffix or ".pdf"
        ref_path = os.path.join(tmp_dir, f"reference{ref_suffix}")
        tgt_path = os.path.join(tmp_dir, f"target{tgt_suffix}")

        with open(ref_path, "wb") as f:
            f.write(await reference.read())
        with open(tgt_path, "wb") as f:
            f.write(await target.read())

        pipeline = get_pipeline()
        formatter = get_formatter()

        try:
            report = pipeline.run(
                reference_path=ref_path,
                target_path=tgt_path,
                target_page=page,
                top_k=top_k,
            )
        except ScannedPDFError as e:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "SCANNED_PDF",
                    "message": str(e),
                    "filepath": e.filepath,
                    "char_count": e.char_count,
                    "page_count": e.page_count,
                },
            )
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Export reports to api/reports/
        base_name = Path(target.filename).stem
        json_path = REPORTS_DIR / f"{base_name}_v2_report.json"
        md_path = REPORTS_DIR / f"{base_name}_v2_report.md"
        formatter.export_json(report, json_path)
        formatter.export_markdown(report, md_path)

        result = formatter.to_json(report)
        result["_report_files"] = {
            "json": json_path.name,
            "markdown": md_path.name,
        }
        return JSONResponse(content=result)

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/api/analyze/legacy")
async def analyze_legacy(
    standard: UploadFile = File(..., description="Reference standard (JSON or PDF)"),
    srs: UploadFile = File(..., description="SRS document (TXT, PDF, or MD)"),
    threshold: float = Form(0.55),
):
    """
    Run Legacy V1 R1-R4 quality rules audit.
    Returns the legacy compliance report as JSON.
    """
    tmp_dir = tempfile.mkdtemp()
    try:
        std_suffix = Path(standard.filename).suffix or ".json"
        srs_suffix = Path(srs.filename).suffix or ".txt"
        std_path = os.path.join(tmp_dir, f"standard{std_suffix}")
        srs_path = os.path.join(tmp_dir, f"srs{srs_suffix}")

        with open(std_path, "wb") as f:
            f.write(await standard.read())
        with open(srs_path, "wb") as f:
            f.write(await srs.read())

        from src.pdf_extractor import ScannedPDFError as SPE
        from src.analyzer import (
            ReferenceStandard, RequirementExtractor, ComplianceAnalyzer, ReportGenerator
        )

        try:
            standard_obj = ReferenceStandard(std_path)
            extractor = RequirementExtractor()
            requirements = extractor.extract_from_file(srs_path)
            sections = extractor.extract_sections_from_file(srs_path)
        except SPE as e:
            raise HTTPException(
                status_code=422,
                detail={"error": "SCANNED_PDF", "message": str(e)},
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

        analyzer = ComplianceAnalyzer(standard_obj, similarity_threshold=threshold)
        report = analyzer.audit_document(requirements, sections=sections)

        base_name = Path(srs.filename).stem
        json_path = REPORTS_DIR / f"{base_name}_legacy_report.json"
        md_path = REPORTS_DIR / f"{base_name}_legacy_report.md"

        report_json = ReportGenerator.to_json(report)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report_json, f, indent=2)
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(ReportGenerator.format_markdown(report))

        report_json["_report_files"] = {
            "json": json_path.name,
            "markdown": md_path.name,
        }
        return JSONResponse(content=report_json)

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.get("/api/reports/{filename}")
def download_report(filename: str):
    """Download a previously generated report file (JSON or Markdown)."""
    # Sanitize filename — no path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found")
    media_type = "application/json" if filename.endswith(".json") else "text/markdown"
    return FileResponse(str(file_path), media_type=media_type, filename=filename)
