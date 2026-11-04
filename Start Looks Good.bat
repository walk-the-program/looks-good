@echo off
setlocal
cd /d "%~dp0"
title Looks Good

where py >nul 2>nul
if not errorlevel 1 (
  py -3 tools\serve.py
  if not errorlevel 1 goto :done
)
where python >nul 2>nul
if not errorlevel 1 (
  python tools\serve.py
  if not errorlevel 1 goto :done
)
echo Python was not found, so the built-in PowerShell server is being used instead.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1"
:done
if errorlevel 1 pause
