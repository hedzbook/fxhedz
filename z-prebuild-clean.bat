@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo FXHEDZ ANDROID CLEAN PREBUILD (CI MODE)
echo ============================================
echo.

cd /d %~dp0

IF NOT EXIST fxhedz-android (
    echo ERROR: fxhedz-android folder not found.
    exit /b 1
)

cd fxhedz-android

echo Project directory: %cd%
echo.

echo Stopping Gradle (if running)...
IF EXIST android\gradlew.bat (
    pushd android
    call gradlew.bat --stop >nul 2>&1
    popd
)

echo.
echo Clearing Expo caches...
IF EXIST .expo rmdir /s /q .expo
IF EXIST node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Running Expo prebuild (clean)...

set OLD_CI=%CI%
set CI=1

call npx expo prebuild --clean
set RESULT=%ERRORLEVEL%

set CI=%OLD_CI%

IF %RESULT% NEQ 0 (
    echo.
    echo ============================================
    echo ERROR: Expo prebuild failed.
    echo ============================================
    exit /b 1
)

echo.
echo ============================================
echo CLEAN PREBUILD COMPLETED SUCCESSFULLY
echo ============================================

exit /b 0