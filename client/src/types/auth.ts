export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  principal: string;
  name: string;
  role: string; // 'patient' | 'doctor' | 'admin'
  abhaId: string;
  createdAt: bigint;
  updatedAt: bigint;
  avatarUrl: [string] | [];
  email: [string] | [];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;     // JWT token
  principal: string | null;
  role: UserRole | null;
  error: string | null;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface DelegationChain {
  delegations: Array<{
    delegation: { pubkey: Uint8Array; expiration: bigint; targets?: string[] };
    signature: Uint8Array;
  }>;
  publicKey: Uint8Array;
}
export interface LoginOptions {
  provider?: 'nfid' | 'internet_identity';
  customTTL?: bigint;
  onSuccess?: (identity: any) => void;
  onError?: (error: Error) => void;
}