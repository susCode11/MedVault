import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export type UserRole = 'patient' | 'doctor' | 'emergency';
export type AuthProvider = 'nfid' | 'internet_identity';

export interface NFIDConfig {
  appName: string;
  appLogo: string;
  providerUrl: string;
  derivationOrigin?: string;
  maxTimeToLive: bigint;
  windowOpenerFeatures?: string;
  targets?: string[];
}

// TODO (Workstream 1): BLANK SPACE - Type Sync
// Workstream 1 must verify this `UserProfile` matches the final Azle backend Candid type definition.
export interface UserProfile {
  id: string; // The principal ID as a string
  role: UserRole;
  name: string;
  abhaId?: string; // Optional for doctors, required for patients
  createdAt: bigint;
  updatedAt: bigint;
}

export interface AuthState {
  identity: Identity | null;
  principal: Principal | null;
  principalText: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  error: string | null;
  profile: UserProfile | null;
}

export interface LoginOptions {
  provider?: AuthProvider;
  customTTL?: bigint;
  onSuccess?: (identity: Identity) => void;
  onError?: (error: Error) => void;
}
