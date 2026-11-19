import os
from pathlib import Path
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

# Import the existing app without touching any of its code
from api.app import app

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"

if DIST_DIR.exists():
    # Mount assets folder for static scripts, CSS, and images
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # Serve PWA manifest and icons if present
    @app.get("/manifest.json")
    def get_manifest():
        manifest_file = DIST_DIR / "manifest.json"
        if manifest_file.exists():
            return FileResponse(str(manifest_file), media_type="application/manifest+json")
        return {"error": "Manifest not found"}

    @app.get("/sw.js")
    def get_sw():
        sw_file = DIST_DIR / "sw.js"
        if sw_file.exists():
            return FileResponse(str(sw_file), media_type="application/javascript")
        return HTMLResponse("", status_code=404)

    # Catch-all route to serve React's index.html for client-side routing
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str, request: Request):
        # Don't intercept API routes or reports
        if full_path.startswith("api/"):
            return HTMLResponse("Not Found", status_code=404)
        
        target_file = DIST_DIR / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        
        index_file = DIST_DIR / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return HTMLResponse("Frontend not built. Please run npm run build in frontend directory.", status_code=404)
