#!/usr/bin/env node

// index.js — Script de provisioning Firebase pour FT Events Pro
// ftep-setup
//
// Ce script cree et configure un projet Firebase pour une organisation cliente.
// Il est concu pour des utilisateurs novices en informatique.

import { writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  exec, execLive, checkCommand,
  slugify, randomSuffix,
  printStep, printError, printSuccess, printWarning,
  askQuestion
} from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// APIs Google Cloud a activer sur le projet client
const REQUIRED_APIS = [
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'firestore.googleapis.com',
  'storage.googleapis.com',
  'fcm.googleapis.com'
];

const BUNDLE_ID_DEFAULT = 'com.ftep.FTEventsPro';

// MARK: - Banner

function printBanner() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   FT Events Pro — Configuration Firebase      ║');
  console.log('║   Script de provisioning automatique          ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
}

// MARK: - Verification des prerequis

function checkPrerequisites() {
  printStep(1, 'Verification des prerequis...');

  const missing = [];

  if (!checkCommand('node')) {
    missing.push('Node.js — https://nodejs.org');
  } else {
    printSuccess(`Node.js ${exec('node --version')}`);
  }

  if (!checkCommand('firebase')) {
    missing.push('Firebase CLI — npm install -g firebase-tools');
  } else {
    printSuccess(`Firebase CLI ${exec('firebase --version')}`);
  }

  if (!checkCommand('gcloud')) {
    missing.push('Google Cloud CLI — https://cloud.google.com/sdk/docs/install');
  } else {
    printSuccess('Google Cloud CLI detecte');
  }

  if (missing.length > 0) {
    printError('Prerequis manquants :');
    missing.forEach(m => console.log(`  - ${m}`));
    console.log('\nInstallez les outils manquants puis relancez le script.');
    process.exit(1);
  }
}

// MARK: - Configuration utilisateur

async function askUserConfig() {
  printStep(2, 'Configuration du projet...');

  const orgName = await askQuestion('Nom de votre organisation');
  if (!orgName) {
    printError('Le nom de l\'organisation est obligatoire.');
    process.exit(1);
  }

  const slug = slugify(orgName);
  const projectId = `${slug}-${randomSuffix()}`;

  console.log(`  Identifiant du projet : ${projectId}`);

  const bundleId = await askQuestion(
    'Bundle ID de l\'application iOS',
    BUNDLE_ID_DEFAULT
  );

  return { orgName, projectId, bundleId };
}

// MARK: - Authentification Firebase + gcloud

async function ensureFirebaseLogin() {
  printStep(3, 'Connexion a Firebase et Google Cloud...');

  // 3a. Verifier/lancer Firebase login
  let firebaseEmail = null;
  try {
    const account = exec('firebase login:list --json 2>/dev/null');
    const parsed = JSON.parse(account);
    if (parsed.result && parsed.result.length > 0) {
      firebaseEmail = parsed.result[0].user.email;
      printSuccess(`Firebase : connecte en tant que ${firebaseEmail}`);
    }
  } catch {
    // Pas connecte
  }

  if (!firebaseEmail) {
    console.log('  Ouverture du navigateur pour la connexion Google...');
    console.log('  Connectez-vous avec votre compte Google puis revenez ici.');
    console.log('');

    try {
      execLive('firebase login');
      printSuccess('Firebase : connexion reussie');
    } catch {
      printError('Echec de la connexion Firebase.');
      printError('Verifiez votre connexion internet et reessayez.');
      process.exit(1);
    }
  }

  // 3b. Verifier/lancer gcloud login
  try {
    const gcloudAccount = exec('gcloud auth list --filter=status:ACTIVE --format=value(account)');
    if (gcloudAccount) {
      printSuccess(`Google Cloud : connecte en tant que ${gcloudAccount}`);
      return;
    }
  } catch {
    // Pas connecte
  }

  console.log('');
  console.log('  Google Cloud necessite aussi une connexion.');
  console.log('  Le navigateur va s\'ouvrir a nouveau...');
  console.log('');

  try {
    execLive('gcloud auth login');
    printSuccess('Google Cloud : connexion reussie');
  } catch {
    printError('Echec de la connexion Google Cloud.');
    printError('Executez manuellement : gcloud auth login');
    process.exit(1);
  }
}

// MARK: - Creation du projet Firebase

async function createProject(config) {
  printStep(4, 'Creation du projet Firebase...');

  try {
    exec(
      `firebase projects:create ${config.projectId} ` +
      `--display-name "${config.orgName}"`
    );
    printSuccess(`Projet ${config.projectId} cree`);
  } catch (err) {
    const fullError = `${err.message || ''} ${err.stderr || ''} ${err.stdout || ''}`;

    if (fullError.includes('already exists')) {
      printWarning('Ce projet existe deja. Utilisation du projet existant.');
    } else if (fullError.includes('Terms of Service')) {
      printError('Vous devez accepter les conditions d\'utilisation de Google Cloud.');
      console.log('');
      console.log('  Ouvrez ce lien dans votre navigateur :');
      console.log('  https://console.cloud.google.com/terms');
      console.log('');
      console.log('  Connectez-vous avec votre compte Google, acceptez les conditions,');
      console.log('  puis relancez ce script.');
      process.exit(1);
    } else if (fullError.includes('quota') || fullError.includes('maximum number')) {
      printError('Vous avez atteint le nombre maximum de projets Firebase.');
      console.log('');
      console.log('  Supprimez un ancien projet dans la console Firebase :');
      console.log('  https://console.firebase.google.com');
      console.log('');
      console.log('  Puis relancez ce script.');
      process.exit(1);
    } else {
      printError('Echec de la creation du projet.');
      console.log('');
      console.log('  Detail : ' + (err.stderr || err.message));
      process.exit(1);
    }
  }
}

// MARK: - Activation des APIs Google Cloud

async function enableApis(config) {
  printStep(5, 'Activation des services...');

  // Configurer gcloud pour le bon projet
  try {
    exec(`gcloud config set project ${config.projectId}`);
  } catch {
    printError('Echec de la configuration gcloud.');
    printError('Executez : gcloud auth login');
    process.exit(1);
  }

  const apiList = REQUIRED_APIS.join(' ');
  try {
    execLive(`gcloud services enable ${apiList}`);
    printSuccess('Services actives : Auth, Firestore, Storage, Messaging');
  } catch (err) {
    printError(`Echec de l'activation des services : ${err.message}`);
    printError('Verifiez que votre compte a les droits Owner sur le projet.');
    process.exit(1);
  }
}

// MARK: - Activation Email/Password Auth

async function enableEmailAuth(config) {
  printStep(6, 'Configuration de l\'authentification...');

  try {
    // Obtenir un token d'acces via gcloud
    const token = exec('gcloud auth print-access-token');

    // Activer le provider Email/Password via REST API Identity Platform v2
    const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${config.projectId}/defaultSupportedIdpConfigs/password`;

    const body = JSON.stringify({
      name: `projects/${config.projectId}/defaultSupportedIdpConfigs/password`,
      enabled: true
    });

    // Tenter PATCH d'abord (si deja configure), sinon POST
    try {
      exec(
        `curl -s -X PATCH "${url}" ` +
        `-H "Authorization: Bearer ${token}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${body}'`
      );
    } catch {
      exec(
        `curl -s -X POST ` +
        `"https://identitytoolkit.googleapis.com/admin/v2/projects/${config.projectId}/defaultSupportedIdpConfigs?idpId=password" ` +
        `-H "Authorization: Bearer ${token}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${body}'`
      );
    }

    printSuccess('Authentification Email/Mot de passe activee');
  } catch (err) {
    printWarning(`Activation Email/Password en echec : ${err.message}`);
    printWarning('Vous devrez peut-etre l\'activer manuellement dans la console Firebase.');
    // Non bloquant — continuer
  }
}

// MARK: - Creation app iOS + extraction credentials

async function createAppAndExtractCredentials(config) {
  printStep(7, 'Creation de l\'application et export des credentials...');

  let appId;

  // Creer l'app iOS dans le projet Firebase
  try {
    const result = exec(
      `firebase apps:create IOS "${config.orgName}" ` +
      `--bundle-id ${config.bundleId} ` +
      `-P ${config.projectId} --json`
    );
    const parsed = JSON.parse(result);
    appId = parsed.result?.appId;

    if (!appId) {
      throw new Error('appId non retourne par Firebase');
    }
    printSuccess(`Application iOS creee (${appId})`);
  } catch (err) {
    // Si l'app existe deja, lister les apps pour trouver l'appId
    try {
      const list = exec(
        `firebase apps:list IOS -P ${config.projectId} --json`
      );
      const parsed = JSON.parse(list);
      const app = parsed.result?.find(a => a.bundleId === config.bundleId);
      if (app) {
        appId = app.appId;
        printWarning('Application existante detectee, recuperation des credentials...');
      } else {
        throw new Error('Aucune app trouvee');
      }
    } catch {
      printError(`Echec de la creation de l'application : ${err.message}`);
      process.exit(1);
    }
  }

  // Extraire les credentials via la config Web (JSON natif, plus simple que base64 plist)
  // On cree aussi une app Web pour obtenir les credentials en JSON
  try {
    let webAppId;

    // Creer une app Web temporaire pour obtenir les credentials en JSON
    try {
      const webResult = exec(
        `firebase apps:create WEB ` +
        `--display-name "${config.orgName} Web Config" ` +
        `-P ${config.projectId} --json`
      );
      const parsed = JSON.parse(webResult);
      webAppId = parsed.result?.appId;
    } catch {
      // App Web existe deja — la recuperer
      const webList = exec(
        `firebase apps:list WEB -P ${config.projectId} --json`
      );
      const parsed = JSON.parse(webList);
      webAppId = parsed.result?.[0]?.appId;
    }

    if (!webAppId) {
      throw new Error('Impossible de creer/trouver l\'app Web');
    }

    // Extraire la config SDK Web (retourne du JSON natif)
    const sdkConfigRaw = exec(
      `firebase apps:sdkconfig WEB ${webAppId} -P ${config.projectId} --json`
    );
    const sdkConfig = JSON.parse(sdkConfigRaw);
    const webConfig = sdkConfig.result?.sdkConfig;

    if (!webConfig) {
      throw new Error('sdkConfig vide');
    }

    // Mapper vers le format attendu par FTEPAdmin (FirebaseCredentials)
    const credentials = {
      apiKey: webConfig.apiKey || '',
      projectID: webConfig.projectId || '',
      googleAppID: appId || '', // L'appId iOS, pas le Web
      gcmSenderID: webConfig.messagingSenderId || '',
      storageBucket: webConfig.storageBucket || '',
      databaseURL: webConfig.databaseURL || null
    };

    // Ecrire le fichier credentials
    const outputPath = path.join(ROOT_DIR, 'ftep-credentials.json');
    writeFileSync(outputPath, JSON.stringify(credentials, null, 2), 'utf-8');
    printSuccess(`Credentials exportees dans : ftep-credentials.json`);

    config.credentialsPath = outputPath;
    config.credentials = credentials;
  } catch (err) {
    printError(`Echec de l'extraction des credentials : ${err.message}`);
    printError('Vous devrez peut-etre les recuperer manuellement dans la console Firebase.');
    process.exit(1);
  }
}

// MARK: - Deploiement des Security Rules

async function deployRules(config) {
  printStep(8, 'Deploiement des regles de securite...');

  try {
    execLive(
      `firebase deploy --only firestore:rules,storage ` +
      `--project ${config.projectId} ` +
      `--config ${path.join(ROOT_DIR, 'firebase.json')}`
    );
    printSuccess('Regles de securite deployees (Firestore + Storage)');
  } catch (err) {
    printWarning(`Deploiement des regles en echec : ${err.message}`);
    printWarning('Les regles pourront etre deployees manuellement plus tard.');
    // Non bloquant — les credentials sont deja exportees
  }
}

// MARK: - Resume final

function printFinalSummary(config) {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║         Provisioning termine !                ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Organisation : ${config.orgName}`);
  console.log(`  Projet Firebase : ${config.projectId}`);
  console.log(`  Bundle ID : ${config.bundleId}`);
  console.log('');

  if (config.credentials) {
    console.log('  Credentials exportees :');
    console.log(`    API Key       : ${config.credentials.apiKey}`);
    console.log(`    Project ID    : ${config.credentials.projectID}`);
    console.log(`    Google App ID : ${config.credentials.googleAppID}`);
    console.log(`    GCM Sender ID : ${config.credentials.gcmSenderID}`);
    console.log(`    Storage Bucket: ${config.credentials.storageBucket}`);
    console.log('');
  }

  console.log('  Prochaine etape :');
  console.log('  Envoyez le fichier ftep-credentials.json a votre administrateur.');
  console.log('  Il l\'importera dans FT Events Pro pour finaliser la configuration.');
  console.log('');
}

// MARK: - Main

async function main() {
  printBanner();
  checkPrerequisites();

  const config = await askUserConfig();

  await ensureFirebaseLogin();
  await createProject(config);
  await enableApis(config);
  await enableEmailAuth(config);
  await createAppAndExtractCredentials(config);
  await deployRules(config);

  printFinalSummary(config);
}

main().catch((err) => {
  printError(`Erreur inattendue : ${err.message}`);
  console.log('');
  console.log('Si le probleme persiste, ouvrez une issue sur le depot GitHub');
  console.log('en incluant le message d\'erreur ci-dessus.');
  process.exit(1);
});
