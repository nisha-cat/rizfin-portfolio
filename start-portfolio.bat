@echo off
cd /d "%~dp0"
title Cinematic Portfolio

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Install failed. Make sure Node.js is installed from https://nodejs.org
    pause
    exit /b 1
  )
)

echo Preparing media...
call npm run prepare-media
if errorlevel 1 (
  echo.
  echo Media preparation failed.
  pause
  exit /b 1
)

echo.
echo Starting portfolio... Your browser will open automatically.
echo Keep this window open while you view the site.
echo.
call npm run dev
