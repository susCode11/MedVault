import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { LoginOptions } from '../types/auth';

// 7 days in nanoseconds
const DEFAULT_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1_000_000_000);

export const NFID_CONFIG = {
  appName: 'MedVault',
  // Note: Replace with actual deployed logo URL when moving to production
  appLogo: 'https://medvault.app/logo.png',
  nfidProviderUrl: 'https://nfid.one/authenticate',
  iiProviderUrl: process.env.DFX_NETWORK === 'ic'
    ? 'https://identity.ic0.app'
    : `http://${process.env.INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}.localhost:4943`,
  targets: process.env.MEDVAULT_BACKEND_CANISTER_ID ? [process.env.MEDVAULT_BACKEND_CANISTER_ID] : [],
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
  const isAuthenticated = await client.isAuthenticated();
  if (isAuthenticated) {
    return client.getIdentity();
  }
  return client.getIdentity(); // Returns AnonymousIdentity
};

/**
 * Triggers the login popup for NFID or Internet Identity.
 */
export const login = async (options?: LoginOptions): Promise<Identity> => {
  const client = await getAuthClient();

  const provider = options?.provider || 'nfid';
  let identityProvider = NFID_CONFIG.nfidProviderUrl;

  if (provider === 'nfid') {
    const params = new URLSearchParams({
      applicationName: NFID_CONFIG.appName,
      applicationLogo: NFID_CONFIG.appLogo,
    });
    identityProvider = `${NFID_CONFIG.nfidProviderUrl}?${params.toString()}`;
  } else if (provider === 'internet_identity') {
    identityProvider = NFID_CONFIG.iiProviderUrl;
  }

  return new Promise((resolve, reject) => {
    client.login({
      identityProvider,
      maxTimeToLive: options?.customTTL || DEFAULT_MAX_TIME_TO_LIVE,
      // If we have canister targets, specify them for ICRC-28 delegation
      // TODO: verify behavior on mainnet with exact canister IDs
      ...(NFID_CONFIG.targets.length > 0 ? { targets: NFID_CONFIG.targets } : {}),
      windowOpenerFeatures: "left=calc(50vw - 262.5px),top=calc(50vh - 352.5px),width=525,height=705",
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
