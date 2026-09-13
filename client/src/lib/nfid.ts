import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { LoginOptions } from '../types/auth';
import {
  MEDVAULT_BACKEND_CANISTER_ID,
  INTERNET_IDENTITY_CANISTER_ID,
  APP_LOGO_URL,
  DFX_NETWORK
} from './env';

// 7 days in nanoseconds
const DEFAULT_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1_000_000_000);

// ---------------------------------------------------------------------------
// Configuration — no more hardcoded fallbacks
// ---------------------------------------------------------------------------

export const NFID_CONFIG = {
  appName: 'MedVault',
  appLogo: APP_LOGO_URL,
  iiProviderUrl: DFX_NETWORK === 'local' 
    ? `http://127.0.0.1:4943/?canisterId=${INTERNET_IDENTITY_CANISTER_ID}#authorize`
    : 'https://identity.ic0.app/#authorize',
  targets: MEDVAULT_BACKEND_CANISTER_ID ? [MEDVAULT_BACKEND_CANISTER_ID] : [],
};

// Singleton AuthClient instance
let authClientInstance: AuthClient | null = null;

/**
 * Initializes and returns the AuthClient singleton.
 */
export const getAuthClient = async (): Promise<AuthClient> => {
  if (!authClientInstance) {
    authClientInstance = await AuthClient.create({
      idleOptions: {
        disableIdle: false,
        idleTimeout: 1000 * 60 * 30, // 30 minutes
      }
    });
  }
  return authClientInstance;
};

/**
 * Initializes the NFID client and returns the current identity (or anonymous if not logged in).
 */
export const initNFID = async (): Promise<Identity> => {
  const client = await getAuthClient();
  return client.getIdentity();
};

/**
 * Triggers the login popup for Internet Identity.
 * On devices with biometric sensors (fingerprint/face), WebAuthn will
 * automatically prompt for biometric authentication.
 */
export const login = async (options?: LoginOptions): Promise<Identity> => {
  const client = await getAuthClient();

  // Always use Internet Identity (biometric/passkey based)
  const identityProvider = NFID_CONFIG.iiProviderUrl;

  if (!identityProvider) {
    throw new Error(
      '[MedVault] Cannot login: INTERNET_IDENTITY_CANISTER_ID is not set.\n' +
      'Run `dfx deploy` first, then check your .env file.'
    );
  }

  return new Promise((resolve, reject) => {
    client.login({
      identityProvider,
      maxTimeToLive: options?.customTTL || DEFAULT_MAX_TIME_TO_LIVE,
      ...(NFID_CONFIG.targets.length > 0 ? { targets: NFID_CONFIG.targets } : {}),
      onSuccess: () => {
        const identity = client.getIdentity();
        if (options?.onSuccess) options.onSuccess(identity);
        resolve(identity);
      },
      onError: (err: any) => {
        const error = new Error(err || 'Login failed');
        if (options?.onError) options.onError(error);
        reject(error);
      }
    });
  });
};

/**
 * Logs out the user, clearing the delegation cache.
 */
export const logout = async (): Promise<void> => {
  const client = await getAuthClient();
  await client.logout();
};

/**
 * Synchronously retrieves the current active identity. 
 * Will return AnonymousIdentity if not logged in or initialized yet.
 */
export const getIdentity = (): Identity | null => {
  if (!authClientInstance) return null;
  return authClientInstance.getIdentity();
};

/**
 * Synchronously retrieves the current active principal.
 */
export const getPrincipal = (): Principal | null => {
  const identity = getIdentity();
  return identity ? identity.getPrincipal() : null;
};

/**
 * Checks if there is a valid, unexpired delegation session active.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const client = await getAuthClient();
  return client.isAuthenticated();
};

import { AuthAdapter } from '../store/authStore';

/**
 * The real auth adapter using Internet Identity (biometric/passkey).
 * Injected into the auth store in main.tsx.
 */
export const nfidAuthAdapter: AuthAdapter = {
  login: async () => {
    const identity = await login({ provider: 'internet_identity' });
    const principal = identity.getPrincipal().toText();
    
    const expiresAt = Date.now() + Number(DEFAULT_MAX_TIME_TO_LIVE / 1_000_000n);

    return {
      principal,
      identity,
      expiresAt,
    };
  },

  logout: async () => {
    await logout();
  },

  checkAuth: async () => {
    const client = await getAuthClient();
    const isAuth = await client.isAuthenticated();
    if (!isAuth) return null;

    const identity = client.getIdentity();
    const principal = identity.getPrincipal().toText();
    
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return {
      principal,
      identity,
      expiresAt,
    };
  }
};
