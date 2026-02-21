#!/usr/bin/env bash
set -euo pipefail

# ftep-setup.sh — Lanceur Mac/Linux pour le provisioning Firebase
# FT Events Pro

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
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
echo -e "${BOLD}[1/5]${NC} Verification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "       ${YELLOW}Node.js non detecte.${NC}"
    echo -e "       Installation automatique via nvm..."
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
    echo -e "       ${GREEN}OK — Node.js $(node --version) installe.${NC}"
else
    echo -e "       ${GREEN}OK — Node.js $(node --version)${NC}"
fi

# 2. Verifier Firebase CLI
echo -e "${BOLD}[2/5]${NC} Verification de Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo -e "       ${YELLOW}Firebase CLI non detecte.${NC}"
    echo -e "       Installation en cours via npm..."
    echo ""
    npm install -g firebase-tools
    echo ""
    echo -e "       ${GREEN}OK — Firebase CLI installe.${NC}"
else
    echo -e "       ${GREEN}OK — Firebase CLI $(firebase --version 2>/dev/null)${NC}"
fi

# 3. Verifier gcloud CLI
echo -e "${BOLD}[3/5]${NC} Verification de Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    echo ""
    echo -e "  ${RED}ERREUR : Google Cloud CLI (gcloud) non detecte.${NC}"
    echo ""
    echo "  Ce logiciel est necessaire pour activer les services Firebase."
    echo "  Copiez-collez cette commande dans votre terminal :"
    echo ""
    echo -e "    ${BLUE}curl https://sdk.cloud.google.com | bash${NC}"
    echo ""
    echo "  Puis fermez et rouvrez le terminal, et lancez :"
    echo ""
    echo -e "    ${BLUE}gcloud init${NC}"
    echo ""
    echo "  Ensuite relancez ce script."
    exit 1
else
    GC_VER=$(gcloud version 2>/dev/null | head -1 | awk '{print $4}' || echo "")
    echo -e "       ${GREEN}OK — Google Cloud SDK ${GC_VER}${NC}"
fi

# 4. Installer les dependances npm (si necessaire)
echo -e "${BOLD}[4/5]${NC} Verification des dependances..."
if [ ! -d "node_modules" ]; then
    echo -e "       Premiere execution — telechargement des modules npm..."
    npm install --silent
    echo -e "       ${GREEN}OK — Dependances installees.${NC}"
else
    echo -e "       ${GREEN}OK — Dependances deja presentes.${NC}"
fi

# 5. Lancer le script de provisioning
echo -e "${BOLD}[5/5]${NC} Lancement du script de configuration..."
echo ""
echo "────────────────────────────────────────"
echo "  Le script va maintenant vous guider"
echo "  pour configurer votre projet Firebase."
echo "────────────────────────────────────────"
echo ""

node setup/index.js
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║  Configuration terminee avec succes ! ║"
    echo "╚══════════════════════════════════════╝"
    echo ""
else
    echo ""
    echo -e "  ${RED}Le script s'est termine avec une erreur.${NC}"
    echo "  Consultez les messages ci-dessus pour plus de details."
    echo ""
fi
