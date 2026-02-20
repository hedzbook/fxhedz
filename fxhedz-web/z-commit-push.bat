@echo off
:: Move to the directory of the script, then go up one level
cd /d "%~dp0.."

REM =====================================
REM FXHEDZ — AUTO PUSH (PARENT FOLDER)
REM =====================================

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set NOW=%%i

git branch -M main
git add .

REM pull first to avoid conflicts
git pull origin main --rebase >nul 2>&1

git commit -m "Update %NOW%" >nul 2>&1
git push origin main >nul 2>&1

exit