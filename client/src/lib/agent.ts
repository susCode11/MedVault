import { HttpAgent } from '@dfinity/agent';
import { getIdentity } from './nfid';

let agentInstance: HttpAgent | null = null;

/**
 * Initializes and returns the HttpAgent for backend communication.
 */
export const getAgent = async (): Promise<HttpAgent> => {
  if (agentInstance) {
    return agentInstance;
  }

  const identity = getIdentity();
  
  // TODO (Workstream - Environment Config): Handle local vs mainnet host
  const host = process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://127.0.0.1:4943';

  agentInstance = await HttpAgent.create({
    identity: identity || undefined, // undefined uses anonymous identity
    host,
  });

  // Fetch root key for local development
  if (process.env.DFX_NETWORK !== 'ic') {
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

// TODO (Workstream - Agent Interceptors): Add request/response interceptors here for logging or metric tracing if needed in future
