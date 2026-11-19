@echo off
echo ============================================================
echo   SRS Compliance Analyzer — Full Stack Startup
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "api\app.py" (
    echo ERROR: Please run this script from the SRSComplianceanalyzer directory
    pause
    exit /b 1
)

echo [1/2] Starting FastAPI backend on http://localhost:8001 ...
start "SRS API Server" cmd /k "python -m uvicorn api.app:app --reload --port 8001"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React frontend on http://localhost:5173 ...
start "SRS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo   Both servers are starting in separate windows.
echo   Open your browser at: http://localhost:5173
echo ============================================================
pause
