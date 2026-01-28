@echo off
setlocal
pushd %~dp0\..\..
if exist Archive (
  del /q Archive\*.json 2>nul
)
echo Archive cleared.
popd
