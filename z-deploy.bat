@echo off
cd /d "%~dp0"

call z-zip-snapshot.bat
if errorlevel 1 exit /b 1

call z-commit-push.bat
if errorlevel 1 exit /b 1

echo Deploy completed successfully.
exit