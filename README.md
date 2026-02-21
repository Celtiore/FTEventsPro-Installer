# FT Events Pro — Configuration Firebase

Ce script configure automatiquement votre projet Firebase pour FT Events Pro.
Il cree le projet, active les services necessaires, deploie les regles de securite
et genere un fichier de configuration a transmettre a votre administrateur.

## Prerequis

- **Un compte Google** (adresse Gmail ou Google Workspace)
- **Une connexion internet**
- **Google Cloud CLI** (le script installe automatiquement les autres outils)

### Installer Google Cloud CLI

Ouvrez votre terminal et copiez-collez la commande correspondant a votre systeme :

**Mac :**

```bash
curl https://sdk.cloud.google.com | bash
```

Fermez puis rouvrez le Terminal. Tapez ensuite :

```bash
gcloud init
```

Suivez les instructions : connectez-vous avec votre compte Google quand le navigateur s'ouvre.

**Windows :**

Telechargez et lancez l'installateur : [Google Cloud SDK Installer](https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe)

L'installateur fait tout automatiquement. A la fin, cochez **Run gcloud init** et connectez-vous avec votre compte Google.

> **Important :** Apres l'installation, **fermez et rouvrez votre terminal** (ou Invite de commandes) avant de lancer le script. Sinon gcloud ne sera pas detecte car le PATH n'est pas encore mis a jour.

**Linux (Debian/Ubuntu) :**

```bash
curl https://sdk.cloud.google.com | bash
```

Fermez puis rouvrez le terminal. Tapez ensuite :

```bash
gcloud init
```

Suivez les instructions : connectez-vous avec votre compte Google quand le navigateur s'ouvre.

## Installation rapide

### Mac

1. Telechargez ce dossier : cliquez sur le bouton vert **Code** puis **Download ZIP**
2. Decompressez le fichier ZIP (double-clic)
3. Ouvrez le **Terminal** : Applications > Utilitaires > Terminal
4. Tapez `cd ` (avec un espace apres), puis glissez le dossier `ftep-setup` dans le Terminal
5. Appuyez sur **Entree**
6. Tapez la commande suivante et appuyez sur **Entree** :

```
chmod +x ftep-setup.sh && ./ftep-setup.sh
```

### Windows

1. Telechargez ce dossier : cliquez sur le bouton vert **Code** puis **Download ZIP**
2. Decompressez le fichier ZIP (clic droit > Extraire tout)
3. Ouvrez le dossier `ftep-setup`
4. Double-cliquez sur **ftep-setup.bat**

### Linux

1. Telechargez ce dossier
2. Ouvrez un terminal dans le dossier `ftep-setup`
3. Tapez la commande suivante et appuyez sur **Entree** :

```
chmod +x ftep-setup.sh && ./ftep-setup.sh
```

## Que fait le script ?

Le script effectue automatiquement les etapes suivantes :

1. **Verifie les outils** — Installe Node.js et Firebase CLI si necessaire
2. **Vous connecte** — Ouvre votre navigateur pour vous connecter a Google
3. **Cree un projet Firebase** — Un projet dedie a votre organisation
4. **Active les services** — Authentification, base de donnees, stockage, notifications
5. **Configure la securite** — Deploie des regles qui isolent vos donnees
6. **Exporte la configuration** — Genere le fichier `ftep-credentials.json`

## Apres l'installation

Un fichier `ftep-credentials.json` a ete cree dans le dossier `ftep-setup`.

**Envoyez ce fichier a votre administrateur FT Events Pro.**

Il l'importera dans l'application pour finaliser la configuration de votre espace.

> **Important** : Ne partagez pas ce fichier publiquement. Il contient les cles
> d'acces a votre projet Firebase.

## En cas de probleme

### "Google Cloud CLI non detecte"

Suivez les instructions de la section **Installer Google Cloud CLI** ci-dessus, puis relancez le script.
Apres l'installation, n'oubliez pas de fermer et rouvrir votre terminal avant de relancer.

### "Echec de la connexion Firebase"

Verifiez votre connexion internet. Si le navigateur ne s'ouvre pas, essayez de lancer
`firebase login` manuellement dans le terminal.

### "Nombre maximum de projets Firebase atteint"

Les comptes Google gratuits sont limites a environ 10-12 projets Firebase.
Supprimez un ancien projet dans la [console Firebase](https://console.firebase.google.com)
puis relancez le script.

### Autre probleme

Ouvrez une **issue** sur ce depot GitHub en decrivant :
- Votre systeme (Mac, Windows, Linux)
- L'etape ou le probleme se produit
- Le message d'erreur affiche

## Structure du projet

```
ftep-setup/
├── setup/
│   ├── index.js          — Script de provisioning principal
│   └── helpers.js         — Fonctions utilitaires
├── rules/
│   ├── firestore.rules    — Regles de securite Firestore
│   └── storage.rules      — Regles de securite Storage
├── ftep-setup.sh          — Lanceur Mac/Linux
├── ftep-setup.bat         — Lanceur Windows
├── firebase.json          — Configuration Firebase minimale
├── package.json           — Dependances Node.js
└── README.md              — Ce fichier
```

## Licence

Usage reserve aux clients FT Events Pro.
