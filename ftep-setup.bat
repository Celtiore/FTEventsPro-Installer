@echo off
chcp 65001 > nul 2>&1

REM ftep-setup.bat — Lanceur Windows pour le provisioning Firebase
REM FT Events Pro

echo.
echo ========================================
echo    FT Events Pro — Setup Firebase
echo ========================================
echo.

REM Se placer dans le repertoire du script
cd /d "%~dp0"

echo [1/5] Verification de Node.js...
where node > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo        Node.js non detecte.
    echo        Installation automatique via winget...
    echo.
    winget install OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% neq 0 (
        echo.
        echo   ERREUR : Echec de l'installation automatique de Node.js.
        echo   Installez-le manuellement depuis : https://nodejs.org
        echo   Puis relancez ce script.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo   Node.js installe avec succes.
    echo   IMPORTANT : Fermez ce terminal, rouvrez-le, puis relancez le script.
    echo.
    pause
    exit /b 0
) else (
    for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
    echo        OK — Node.js %NODE_VER%
)

echo [2/5] Verification de Firebase CLI...
where firebase > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo        Firebase CLI non detecte.
    echo        Installation en cours via npm...
    echo.
    call npm install -g firebase-tools
    if %ERRORLEVEL% neq 0 (
        echo.
        echo   ERREUR : Echec de l'installation de Firebase CLI.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo        OK — Firebase CLI installe.
) else (
    for /f "tokens=*" %%v in ('firebase --version') do set FB_VER=%%v
    echo        OK — Firebase CLI %FB_VER%
)

echo [3/5] Verification de Google Cloud CLI...
where gcloud > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo   ERREUR : Google Cloud CLI ^(gcloud^) non detecte.
    echo.
    echo   Ce logiciel est necessaire pour activer les services Firebase.
    echo   Telechargez l'installateur ici :
    echo.
    echo     https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
    echo.
    echo   Lancez l'installateur, puis relancez ce script.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=4" %%v in ('gcloud version 2^>nul ^| findstr "SDK"') do set GC_VER=%%v
    echo        OK — Google Cloud SDK %GC_VER%
)

echo [4/5] Installation des dependances...
if not exist "node_modules" (
    echo        Premiere execution — telechargement des modules npm...
    call npm install --silent
    if %ERRORLEVEL% neq 0 (
        echo.
        echo   ERREUR : Echec de l'installation des dependances npm.
        echo.
        pause
        exit /b 1
    )
    echo        OK — Dependances installees.
) else (
    echo        OK — Dependances deja presentes.
)

echo [5/5] Lancement du script de configuration...
echo.
echo ----------------------------------------
echo   Le script va maintenant vous guider
echo   pour configurer votre projet Firebase.
echo ----------------------------------------
echo.

node setup/index.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo   Le script s'est termine avec une erreur.
    echo   Consultez les messages ci-dessus pour plus de details.
    echo.
) else (
    echo.
    echo ========================================
    echo   Configuration terminee avec succes !
    echo ========================================
    echo.
)

pause
