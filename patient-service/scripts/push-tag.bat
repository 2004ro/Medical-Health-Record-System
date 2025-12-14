@echo off
REM Usage: push-tag.bat REMOTE_URL [TAG]
SETLOCAL

if "%~1"=="" (
  echo Usage: push-tag.bat REMOTE_URL [TAG]
  exit /b 1
)

set "REMOTE=%~1"
set "TAG=%~2"
if "%TAG%"=="" set "TAG=v1.0.0"

git rev-parse --git-dir >nul 2>&1 || (echo Not a git repository & exit /b 1)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo Adding remote origin %REMOTE%...
  git remote add origin "%REMOTE%" || (echo Failed to add remote & exit /b 1)
) else (
  echo Remote origin already exists
)

echo Fetching from origin...
git fetch origin --tags || (echo Fetch failed & exit /b 1)

echo Pushing tag %TAG% to origin...
git push origin "%TAG%" || (echo Push failed & exit /b 1)

echo Done.
ENDLOCAL
