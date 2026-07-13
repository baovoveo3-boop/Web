@echo off
setlocal enabledelayedexpansion

echo [1/3] Tim kiem Git.exe tu GitHub Desktop...
set "GIT_PATH="
for /d %%d in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
    if exist "%%d\resources\app\git\cmd\git.exe" (
        set "GIT_PATH=%%d\resources\app\git\cmd\git.exe"
    )
)

if "!GIT_PATH!"=="" (
    echo Khong tim thay Git. Vui long cai dat hoac mo GitHub Desktop.
    pause
    exit /b
)

echo [2/3] Dang dong goi code...
"!GIT_PATH!" add .

echo [3/3] Dang luu lich su va day len GitHub...
"!GIT_PATH!" commit -m "Auto deploy update tu deploy.bat"
"!GIT_PATH!" push origin main

echo Hoan tat! Vercel dang tien hanh Build.
pause
