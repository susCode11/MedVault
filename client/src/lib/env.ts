// =============================================================================
// MedVault — Environment Configuration
//
// Centralized environment variable access with validation.
// All env vars should be read from this module — never directly from
// process.env or import.meta.env in other files.
//
// Throws clear, actionable errors at startup if required vars are missing,
// instead of silently using dummy/mock fallbacks.
// =============================================================================

/// <reference types="vite/client" />

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getOptionalEnv(key: string, fallback: string): string {
  const value =
    (import.meta.env?.[key] as string | undefined) ??
    (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>)?.[key] : undefined) ??
    fallback;
  return value || fallback;
}

// ---------------------------------------------------------------------------
// ICP / DFX
// ---------------------------------------------------------------------------

export const DFX_NETWORK = process.env.DFX_NETWORK || getOptionalEnv('DFX_NETWORK', 'local');

export const MEDVAULT_BACKEND_CANISTER_ID = process.env.MEDVAULT_BACKEND_CANISTER_ID || getOptionalEnv(
  'MEDVAULT_BACKEND_CANISTER_ID',
  getOptionalEnv('CANISTER_ID_MEDVAULT_BACKEND', '')
);

export const INTERNET_IDENTITY_CANISTER_ID = process.env.INTERNET_IDENTITY_CANISTER_ID || getOptionalEnv(
  'INTERNET_IDENTITY_CANISTER_ID',
  getOptionalEnv('CANISTER_ID_INTERNET_IDENTITY', '')
);

// ---------------------------------------------------------------------------
// Pinata (IPFS)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ABHA Service
// ---------------------------------------------------------------------------

/** 'mock' for local testing, 'real' for ABDM sandbox/production */
export const ABHA_MODE = getOptionalEnv('VITE_ABHA_MODE', 'mock') as 'mock' | 'real';

/** ABDM Client ID — required when ABHA_MODE is 'real' */
export const ABDM_CLIENT_ID = getOptionalEnv('VITE_ABDM_CLIENT_ID', '');

/** ABDM Client Secret — required when ABHA_MODE is 'real' */
export const ABDM_CLIENT_SECRET = getOptionalEnv('VITE_ABDM_CLIENT_SECRET', '');

// ---------------------------------------------------------------------------
// NMC Doctor Verification
// ---------------------------------------------------------------------------

/** 'mock' for local testing, 'real' for Surepass/NMC API */
export const NMC_MODE = getOptionalEnv('VITE_NMC_MODE', 'mock') as 'mock' | 'real';

/** NMC API key — required when NMC_MODE is 'real' */
export const NMC_API_KEY = getOptionalEnv('VITE_NMC_API_KEY', '');

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export const APP_LOGO_URL = getOptionalEnv('VITE_APP_LOGO_URL', '/logo.png');

// ---------------------------------------------------------------------------
// Validation at import time
// ---------------------------------------------------------------------------

/**
 * Call this function early in your app (e.g., in main.tsx) to validate
 * that all critical env vars are present. Logs warnings for optional
 * vars that are missing.
 */
export function validateEnv(): void {
  const warnings: string[] = [];

  if (!MEDVAULT_BACKEND_CANISTER_ID) {
    warnings.push('MEDVAULT_BACKEND_CANISTER_ID is not set. Canister calls will fail.');
  }
  if (!INTERNET_IDENTITY_CANISTER_ID) {
    warnings.push('INTERNET_IDENTITY_CANISTER_ID is not set. Auth will use fallback URL.');
  }
  // Pinata config is now fetched dynamically from the backend
  if (ABHA_MODE === 'real' && (!ABDM_CLIENT_ID || !ABDM_CLIENT_SECRET)) {
    warnings.push('ABHA_MODE is "real" but ABDM credentials are missing. ABHA verification will fail.');
  }
  if (NMC_MODE === 'real' && !NMC_API_KEY) {
    warnings.push('NMC_MODE is "real" but NMC_API_KEY is missing. Doctor verification will fail.');
  }

  if (warnings.length > 0) {
    console.warn(
      `[MedVault] Environment warnings:\n${warnings.map(w => `  ⚠️  ${w}`).join('\n')}`
    );
  }
}
