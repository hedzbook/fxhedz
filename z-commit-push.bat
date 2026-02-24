@echo off
cd /d "%~dp0"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set NOW=%%i

git branch -M main
git add .

git pull origin main --rebase >nul 2>&1

git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Update %NOW%"
    git push origin main
    echo Pushed successfully.
) else (
    echo No changes to commit.
)

exit