@echo off
cd /d "%~dp0"

echo Creating optimized backup...

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set NOW=%%i

set BACKUP_FOLDER=__backup__fxhedz
set ZIP_NAME=fxhedz_backup_%NOW%.zip
set TEMP_DIR=__backup_temp__

if not exist "%BACKUP_FOLDER%" mkdir "%BACKUP_FOLDER%"
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\fxhedz-android"
mkdir "%TEMP_DIR%\fxhedz-web"

REM ==========================
REM ANDROID SOURCE ONLY
REM ==========================

xcopy fxhedz-android\app "%TEMP_DIR%\fxhedz-android\app" /E /I /H /Y >nul
xcopy fxhedz-android\assets "%TEMP_DIR%\fxhedz-android\assets" /E /I /H /Y >nul
xcopy fxhedz-android\components "%TEMP_DIR%\fxhedz-android\components" /E /I /H /Y >nul
xcopy fxhedz-android\constants "%TEMP_DIR%\fxhedz-android\constants" /E /I /H /Y >nul
xcopy fxhedz-android\hooks "%TEMP_DIR%\fxhedz-android\hooks" /E /I /H /Y >nul
xcopy fxhedz-android\scripts "%TEMP_DIR%\fxhedz-android\scripts" /E /I /H /Y >nul
xcopy fxhedz-android\android "%TEMP_DIR%\fxhedz-android\android" /E /I /H /Y >nul

if exist "%TEMP_DIR%\fxhedz-android\android\app\build" rmdir /s /q "%TEMP_DIR%\fxhedz-android\android\app\build"
if exist "%TEMP_DIR%\fxhedz-android\android\.gradle" rmdir /s /q "%TEMP_DIR%\fxhedz-android\android\.gradle"

copy fxhedz-android\*.json "%TEMP_DIR%\fxhedz-android\" >nul
copy fxhedz-android\*.js "%TEMP_DIR%\fxhedz-android\" >nul
copy fxhedz-android\*.ts "%TEMP_DIR%\fxhedz-android\" >nul
copy fxhedz-android\*.d.ts "%TEMP_DIR%\fxhedz-android\" >nul
copy fxhedz-android\README.md "%TEMP_DIR%\fxhedz-android\" >nul

REM ==========================
REM WEB STRUCTURE
REM ==========================

xcopy fxhedz-web\app "%TEMP_DIR%\fxhedz-web\app" /E /I /H /Y >nul
xcopy fxhedz-web\components "%TEMP_DIR%\fxhedz-web\components" /E /I /H /Y >nul
xcopy fxhedz-web\lib "%TEMP_DIR%\fxhedz-web\lib" /E /I /H /Y >nul
xcopy fxhedz-web\public "%TEMP_DIR%\fxhedz-web\public" /E /I /H /Y >nul

copy fxhedz-web\*.json "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\*.js "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\*.ts "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\*.mjs "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\.env.local "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\GAS.txt "%TEMP_DIR%\fxhedz-web\" >nul
copy fxhedz-web\MT5.txt "%TEMP_DIR%\fxhedz-web\" >nul

REM ==========================
REM ZIP USING TAR
REM ==========================

tar -a -c -f "%BACKUP_FOLDER%\%ZIP_NAME%" -C "%TEMP_DIR%" fxhedz-android fxhedz-web

rmdir /s /q "%TEMP_DIR%"

echo Backup created.

echo Running snapshot script...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0snapshot.ps1"

echo Done.
