@echo off
chcp 65001 >nul

REM ftep-setup.bat — Lanceur Windows pour le provisioning Firebase
REM FT Events Pro

echo.
echo ========================================
echo    FT Events Pro — Setup Firebase
echo ========================================
echo.

REM Se placer dans le repertoire du script
cd /d "%~dp0"

REM 1. Verifier Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js non detecte. Installation via winget...
    echo.
    winget install OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% neq 0 (
        echo.
        echo Echec de l'installation automatique de Node.js.
        echo Installez-le manuellement depuis : https://nodejs.org
        echo Puis relancez ce script.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Node.js installe. Fermez et rouvrez ce terminal, puis relancez le script.
    echo.
    pause
    exit /b 0
) else (
    echo Node.js detecte.
)

REM 2. Verifier Firebase CLI
where firebase >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Firebase CLI non detecte. Installation...
    call npm install -g firebase-tools
    if %ERRORLEVEL% neq 0 (
        echo Echec de l'installation de Firebase CLI.
        pause
        exit /b 1
    )
    echo Firebase CLI installe.
) else (
    echo Firebase CLI detecte.
)

REM 3. Verifier gcloud CLI
where gcloud >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo Google Cloud CLI ^(gcloud^) non detecte.
    echo.
    echo Ce logiciel est necessaire pour activer les services Firebase.
    echo.
    echo Installation :
    echo   https://cloud.google.com/sdk/docs/install#windows
    echo.
    echo Apres installation, relancez ce script.
    echo.
    pause
    exit /b 1
) else (
    echo Google Cloud CLI detecte.
)

REM 4. Installer les dependances npm (si necessaire)
if not exist "node_modules" (
    echo.
    echo Installation des dependances...
    call npm install --silent
    echo Dependances installees.
)

REM 5. Lancer le script de provisioning
echo.
node setup/index.js

echo.
pause
