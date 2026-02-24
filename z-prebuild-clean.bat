@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo FXHEDZ ANDROID CLEAN PREBUILD (CI MODE)
echo ============================================
echo.

REM Move to repo root (where this bat lives)
cd /d %~dp0

REM Ensure fxhedz-android folder exists
IF NOT EXIST fxhedz-android (
    echo ERROR: fxhedz-android folder not found.
    echo Make sure you are running this from repo root.
    echo.
    pause
    exit /b 1
)

REM Move into android project
cd fxhedz-android

echo Project directory: %cd%
echo.

REM Stop Gradle daemon if exists
echo Stopping Gradle (if running)...
IF EXIST android\gradlew.bat (
    pushd android
    call gradlew.bat --stop
    popd
)

echo.
echo Clearing Expo caches...
IF EXIST .expo rmdir /s /q .expo
IF EXIST node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Running Expo prebuild (clean)...

REM Save old CI value
set OLD_CI=%CI%

REM Force CI mode to avoid prompts
set CI=1

call npx expo prebuild --clean

REM Restore CI variable
set CI=%OLD_CI%

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo ERROR: Expo prebuild failed.
    echo ============================================
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo CLEAN PREBUILD COMPLETED SUCCESSFULLY
echo ============================================
echo.

pause
exit /b 0