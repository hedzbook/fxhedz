@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0snapshot.ps1"
if %errorlevel% neq 0 (
    echo Snapshot failed.
    pause
) else (
    exit
)
