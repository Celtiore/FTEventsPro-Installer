#!/usr/bin/env bash
set -euo pipefail

# ftep-setup.sh — Lanceur Mac/Linux pour le provisioning Firebase
# FT Events Pro

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Se placer dans le repertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   FT Events Pro — Setup Firebase     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Verifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js non detecte. Installation via nvm...${NC}"
    echo ""

    # Installer nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

    # Charger nvm dans la session courante
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

    # Installer Node.js LTS
    nvm install --lts
    nvm use --lts

    echo ""
    echo -e "${GREEN}Node.js installe avec succes.${NC}"
else
    echo -e "${GREEN}Node.js detecte : $(node --version)${NC}"
fi

# 2. Verifier Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI non detecte. Installation...${NC}"
    npm install -g firebase-tools
    echo -e "${GREEN}Firebase CLI installe.${NC}"
else
    echo -e "${GREEN}Firebase CLI detecte.${NC}"
fi

# 3. Verifier gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo ""
    echo -e "${RED}Google Cloud CLI (gcloud) non detecte.${NC}"
    echo ""
    echo "Ce logiciel est necessaire pour activer les services Firebase."
    echo ""
    echo "Installation :"
    echo "  Mac    : https://cloud.google.com/sdk/docs/install#mac"
    echo "  Linux  : https://cloud.google.com/sdk/docs/install#linux"
    echo ""
    echo "Apres installation, relancez ce script."
    exit 1
else
    echo -e "${GREEN}Google Cloud CLI detecte.${NC}"
fi

# 4. Installer les dependances npm (si necessaire)
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installation des dependances..."
    npm install --silent
    echo -e "${GREEN}Dependances installees.${NC}"
fi

# 5. Lancer le script de provisioning
echo ""
node setup/index.js
