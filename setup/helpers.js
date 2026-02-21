// helpers.js — Utilitaires pour le script de provisioning
// ftep-setup

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import chalk from 'chalk';

// MARK: - Execution de commandes

/**
 * Execute une commande shell et retourne stdout
 * @param {string} cmd - Commande a executer
 * @param {object} options - Options supplementaires pour execSync
 * @returns {string} stdout
 */
export function exec(cmd, options = {}) {
  return execSync(cmd, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...options
  }).trim();
}

/**
 * Execute une commande shell et affiche la sortie en temps reel
 * @param {string} cmd - Commande a executer
 */
export function execLive(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

/**
 * Verifie si une commande est disponible dans le PATH
 * @param {string} cmd - Nom de la commande
 * @returns {boolean}
 */
export function checkCommand(cmd) {
  try {
    const check = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${check} ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// MARK: - Texte et slugs

/**
 * Convertit un nom en project-id Firebase valide
 * Lowercase, max 30 chars, alphanumerique + tirets, pas de tiret final
 * @param {string} name - Nom a convertir
 * @returns {string}
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9-]/g, '-')     // Remplacer chars invalides par tirets
    .replace(/-+/g, '-')              // Dedupliquer tirets
    .replace(/^-|-$/g, '')            // Supprimer tirets debut/fin
    .slice(0, 24);                    // Laisser place au suffixe
}

/**
 * Genere un suffixe aleatoire de 5 caracteres
 * @returns {string}
 */
export function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

// MARK: - Affichage

const TOTAL_STEPS = 8;

/**
 * Affiche un indicateur d'etape
 * @param {number} n - Numero d'etape
 * @param {string} message - Description de l'etape
 */
export function printStep(n, message) {
  console.log(chalk.blue(`\n[${n}/${TOTAL_STEPS}] ${message}`));
}

/**
 * Affiche un message d'erreur
 * @param {string} message
 */
export function printError(message) {
  console.log(chalk.red(`\n✗ ${message}`));
}

/**
 * Affiche un message de succes
 * @param {string} message
 */
export function printSuccess(message) {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Affiche un avertissement
 * @param {string} message
 */
export function printWarning(message) {
  console.log(chalk.yellow(`⚠ ${message}`));
}

// MARK: - Questions interactives

/**
 * Pose une question a l'utilisateur et retourne la reponse
 * @param {string} prompt - Question a afficher
 * @param {string} defaultValue - Valeur par defaut
 * @returns {Promise<string>}
 */
export function askQuestion(prompt, defaultValue = '') {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${prompt}${suffix} : `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}
