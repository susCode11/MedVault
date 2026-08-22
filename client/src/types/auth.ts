export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  principal: string;
  role: UserRole;
  displayName: string;
  email?: string;
  abhaId?: string;
  abhaLinked: boolean;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
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
