@echo off
setlocal
pushd %~dp0\..
if not exist .venv (
  python -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt
start "Witchy Backend" cmd /k ".venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
popd
