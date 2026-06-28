@echo off
echo ============================================
echo  MulePulse — Local Startup
echo ============================================
echo.

:: ── Step 1: Train model if artifacts don't exist ──────────────────────────
if not exist "backend\ml\artifacts\mule_scorer.pkl" (
    echo [1/4] Training ML model for the first time...
    cd backend
    pip install -r requirements.txt --quiet
    python ml/data_gen.py
    python ml/feature_pipeline.py
    python ml/train.py
    cd ..
    echo       Done.
) else (
    echo [1/4] ML model already trained — skipping.
)
echo.

:: ── Step 2: Start backend via Docker ──────────────────────────────────────
echo [2/4] Starting backend (Docker)...
cd backend
docker compose up --build -d
echo       Waiting for API to be ready...
timeout /t 8 /nobreak > nul
cd ..
echo.

:: ── Step 3: Seed test data ─────────────────────────────────────────────────
echo [3/4] Seeding test data...
cd backend
python ml/data_gen.py --seed-api
cd ..
echo.

:: ── Step 4: Serve frontend ─────────────────────────────────────────────────
echo [4/4] Starting frontend server...
echo       Opening http://localhost:5500/frontend_edited/ in your browser...
echo.
start "" "http://localhost:5500/frontend_edited/"
python -m http.server 5500

pause
