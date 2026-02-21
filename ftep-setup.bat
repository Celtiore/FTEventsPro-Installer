@echo off
chcp 65001 > nul 2>&1

cd /d "%~dp0"

echo.
echo ========================================
echo    FT Events Pro - Setup Firebase
echo ========================================
echo.

echo [1/5] Verification de Node.js...
where node > nul 2>&1
if errorlevel 1 goto INSTALL_NODE
for /f "tokens=*" %%v in ('node --version') do echo        OK - Node.js %%v
goto CHECK_FIREBASE

:INSTALL_NODE
echo        Node.js non detecte.
echo        Installation automatique via winget...
echo.
winget install OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto NODE_FAIL
echo.
echo        Node.js installe avec succes.
echo        IMPORTANT : Fermez ce terminal, rouvrez-le, puis relancez le script.
echo.
pause
exit /b 0

:NODE_FAIL
echo.
echo        ERREUR : Echec de l'installation de Node.js.
echo        Installez-le manuellement depuis : https://nodejs.org
echo        Puis relancez ce script.
echo.
pause
exit /b 1

:CHECK_FIREBASE
echo [2/5] Verification de Firebase CLI...
where firebase > nul 2>&1
if errorlevel 1 goto INSTALL_FIREBASE
for /f "tokens=*" %%v in ('firebase --version') do echo        OK - Firebase CLI %%v
goto CHECK_GCLOUD

:INSTALL_FIREBASE
echo        Firebase CLI non detecte.
echo        Installation en cours via npm...
echo.
call npm install -g firebase-tools
if errorlevel 1 goto FIREBASE_FAIL
echo.
echo        OK - Firebase CLI installe.
goto CHECK_GCLOUD

:FIREBASE_FAIL
echo.
echo        ERREUR : Echec de l'installation de Firebase CLI.
echo.
pause
exit /b 1

:CHECK_GCLOUD
echo [3/5] Verification de Google Cloud CLI...
where gcloud > nul 2>&1
if errorlevel 1 goto GCLOUD_MISSING
echo        OK - Google Cloud CLI detecte.
goto CHECK_DEPS

:GCLOUD_MISSING
echo.
echo        ERREUR : Google Cloud CLI (gcloud) non detecte.
echo.
echo        Telechargez l'installateur ici :
echo        https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
echo.
echo        Lancez l'installateur, puis relancez ce script.
echo.
pause
exit /b 1

:CHECK_DEPS
echo [4/5] Verification des dependances...
if not exist "node_modules" goto INSTALL_DEPS
echo        OK - Dependances deja presentes.
goto RUN_SCRIPT

:INSTALL_DEPS
echo        Premiere execution - telechargement des modules npm...
call npm install --silent
if errorlevel 1 goto DEPS_FAIL
echo        OK - Dependances installees.
goto RUN_SCRIPT

:DEPS_FAIL
echo.
echo        ERREUR : Echec de l'installation des dependances npm.
echo.
pause
exit /b 1

:RUN_SCRIPT
echo [5/5] Lancement du script de configuration...
echo.
echo ----------------------------------------
echo   Le script va maintenant vous guider
echo   pour configurer votre projet Firebase.
echo ----------------------------------------
echo.

node setup/index.js
if errorlevel 1 goto SCRIPT_FAIL

echo.
echo ========================================
echo   Configuration terminee avec succes !
echo ========================================
echo.
pause
exit /b 0

:SCRIPT_FAIL
echo.
echo        Le script s'est termine avec une erreur.
echo        Consultez les messages ci-dessus.
echo.
pause
exit /b 1
