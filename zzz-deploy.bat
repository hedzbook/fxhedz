@echo off
cd /d "%~dp0"

echo ============================================
echo FXHEDZ FULL DEPLOY
echo ============================================
echo.

REM 1. Clean prebuild (regenerates android/)
call z-prebuild-clean.bat
if errorlevel 1 exit /b 1

REM 2. Generate snapshot via PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0snapshot.ps1"
if errorlevel 1 exit /b 1

REM 3. Commit and push regenerated files
call z-commit-push.bat
if errorlevel 1 exit /b 1

echo.
echo ============================================
echo Deploy completed successfully.
echo ============================================
echo.

exit /b 0