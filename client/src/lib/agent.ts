import { HttpAgent } from '@dfinity/agent';
import { getIdentity } from './nfid';
import { DFX_NETWORK } from './env';

let agentInstance: HttpAgent | null = null;

/**
 * Initializes and returns the HttpAgent for backend communication.
 */
export const getAgent = async (): Promise<HttpAgent> => {
  if (agentInstance) {
    return agentInstance;
  }

  const identity = getIdentity();
  
  // Use window.location.origin to route through Vite proxy in development (avoiding CORS/fetch errors)
  const host = DFX_NETWORK === 'ic' ? 'https://ic0.app' : window.location.origin;

  agentInstance = await HttpAgent.create({
    identity: identity || undefined,
    host,
    verifyQuerySignatures: false, // Force disable for local dev to avoid "Certification values not found"
  });

  // Fetch root key for local development
  if (DFX_NETWORK !== 'ic') {
    await agentInstance.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }

  return agentInstance;
};

/**
 * Force recreates the agent. Useful when identity changes (e.g., after login/logout).
 */
export const recreateAgent = async (): Promise<HttpAgent> => {
  agentInstance = null;
  return getAgent();
};
