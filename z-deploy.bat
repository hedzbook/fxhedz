@echo off
cd /d "%~dp0"

echo ============================================
echo FXHEDZ FULL DEPLOY
echo ============================================
echo.

REM 1. Clean prebuild (regenerates android/)
call z-prebuild-clean.bat
if errorlevel 1 exit /b 1

REM 2. Zip snapshot (optional)
call z-zip-snapshot.bat
if errorlevel 1 exit /b 1

REM 3. Commit and push regenerated files
call z-commit-push.bat
if errorlevel 1 exit /b 1

echo.
echo ============================================
echo Deploy completed successfully.
echo ============================================
echo.

pause
exit /b 0