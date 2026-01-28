@echo off
setlocal
pushd %~dp0

REM Ensure we are in the repo root (the folder that contains frontend\package.json)
if not exist "frontend\package.json" (
  echo [ERROR] Could not find frontend\package.json next to RUN_THIS.cmd
  echo Make sure you extracted the ZIP and are running RUN_THIS.cmd from the project root.
  pause
  exit /b 1
)

echo Starting backend...
call backend\scripts\run.cmd

echo Installing frontend deps (if needed) and starting Vite...
pushd frontend
if not exist node_modules (
  npm install
)
start "Witchy Frontend" cmd /k "npm run dev -- --port 5173"
popd

echo Opening browser...
start "" "http://127.0.0.1:5173/home"
start "" "http://127.0.0.1:5173/businesses"
start "" "http://127.0.0.1:5173/auth/jwt/login"
popd
