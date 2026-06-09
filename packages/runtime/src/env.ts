import * as fs from 'node:fs';
import * as path from 'node:path';
import { getSkillspacePath, ensureSkillspaceDir } from './config.js';

const ENV_FILE = path.join(getSkillspacePath(), 'env.json');

export interface EnvStore {
  global: Record<string, string>;
  packages: Record<string, Record<string, string>>;
}

const DEFAULT_STORE: EnvStore = {
  global: {},
  packages: {}
};

/**
 * Load the environment variable store securely.
 */
export function loadEnvStore(): EnvStore {
  ensureSkillspaceDir();
  try {
    if (!fs.existsSync(ENV_FILE)) {
      return DEFAULT_STORE;
    }
    const raw = fs.readFileSync(ENV_FILE, 'utf-8');
    return JSON.parse(raw) as EnvStore;
  } catch (err) {
    console.error('Failed to load env config:', err);
    return DEFAULT_STORE;
  }
}

/**
 * Save the environment variable store securely.
 * Applies strict OS-level permissions so only the owner can read it.
 */
export function saveEnvStore(store: EnvStore): void {
  ensureSkillspaceDir();
  fs.writeFileSync(ENV_FILE, JSON.stringify(store, null, 2), { mode: 0o600, encoding: 'utf-8' });
}

/**
 * Set a global environment variable.
 */
export function setGlobalEnv(key: string, value: string): void {
  const store = loadEnvStore();
  if (!store.global) store.global = {};
  store.global[key] = value;
  saveEnvStore(store);
}

/**
 * Get a global environment variable.
 */
export function getGlobalEnv(key: string): string | undefined {
  const store = loadEnvStore();
  return store.global?.[key];
}

/**
 * Delete a global environment variable.
 */
export function deleteGlobalEnv(key: string): void {
  const store = loadEnvStore();
  if (store.global?.[key]) {
    delete store.global[key];
    saveEnvStore(store);
  }
}

/**
 * Set a package-scoped environment variable.
 */
export function setPackageEnv(pkgName: string, key: string, value: string): void {
  const store = loadEnvStore();
  if (!store.packages) store.packages = {};
  if (!store.packages[pkgName]) store.packages[pkgName] = {};
  store.packages[pkgName][key] = value;
  saveEnvStore(store);
}

/**
 * Get a package-scoped environment variable.
 */
export function getPackageEnv(pkgName: string, key: string): string | undefined {
  const store = loadEnvStore();
  return store.packages?.[pkgName]?.[key];
}

/**
 * Delete a package-scoped environment variable.
 */
export function deletePackageEnv(pkgName: string, key: string): void {
  const store = loadEnvStore();
  if (store.packages?.[pkgName]?.[key]) {
    delete store.packages[pkgName][key];
    saveEnvStore(store);
  }
}

/**
 * Aggregate environment variables for a specific package, falling back to global variables.
 * Returns a record that can be safely merged into process.env.
 */
export function resolveEnvForPackage(pkgName: string): Record<string, string> {
  const store = loadEnvStore();
  const globalEnv = store.global || {};
  const pkgEnv = store.packages?.[pkgName] || {};
  
  // Package-specific vars override global vars
  return {
    ...globalEnv,
    ...pkgEnv
  };
}
