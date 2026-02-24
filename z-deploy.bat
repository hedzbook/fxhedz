@echo off
cd /d "%~dp0"

call z-zip-snapshot.bat
call z-commit-push.bat

exit