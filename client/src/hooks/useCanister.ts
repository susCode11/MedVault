// =============================================================================
// MedVault — useCanister Hook
// Workstream 3: Client State & Integration
// Phase 4a: Foundation Hook
//
// The base hook that provides the canister actor to all other hooks.
// Every data hook imports CANISTER_QUERY_KEYS from here for consistent
// cache key management.
//
// MOCK_CANISTER flag:
//   true  → returns mockCanister (Phase 3 in-memory implementation)
//   false → returns real actor built from lib/canister.ts + lib/agent.ts
//
// Toggle MOCK_CANISTER = false once W2 delivers lib/canister.ts.
// =============================================================================

import { useAuthStore } from '../store/authStore';



// ---------------------------------------------------------------------------
// Query Key Factories
// Centralised here so all hooks share identical cache keys.
// ---------------------------------------------------------------------------

export const CANISTER_QUERY_KEYS = {
  // Users
  users: {
    all:         () => ['users'] as const,
    byPrincipal: (p: string) => ['users', p] as const,
  },
  // Records
  records: {
    all:     () => ['records'] as const,
    lists:   () => ['records', 'list'] as const,
    list:    (filters: object) => ['records', 'list', filters] as const,
    byId:    (id: string) => ['records', id] as const,
    byOwner: (ownerId: string) => ['records', 'owner', ownerId] as const,
  },
  // Access grants
  access: {
    all:       () => ['access'] as const,
    lists:     () => ['access', 'list'] as const,
    list:      (role: string, callerId: string) => ['access', 'list', role, callerId] as const,
    byId:      (id: string) => ['access', id] as const,
    timeline:  (grantId: string) => ['access', 'timeline', grantId] as const,
  },
  // Emergency
  emergency: {
    all:   () => ['emergency'] as const,
    lists: () => ['emergency', 'list'] as const,
    list:  (role: string, callerId: string) => ['emergency', 'list', role, callerId] as const,
    byId:  (id: string) => ['emergency', id] as const,
  },
  // Reports
  reports: {
    all:   () => ['reports'] as const,
    lists: () => ['reports', 'list'] as const,
  },
  // Audit / Timeline
  audit: {
    all:      () => ['audit'] as const,
    byEntity: (entityId: string) => ['audit', 'entity', entityId] as const,
    byActor:  (actorId: string) => ['audit', 'actor', actorId] as const,
  },
  // ABHA
  abha: {
    verify: (id: string) => ['abha', 'verify', id] as const,
    lookup: (id: string) => ['abha', 'lookup', id] as const,
  },
} as const;

import { useState, useEffect } from 'react';
import { getBackendActor, MedVaultBackend } from '../lib/canister';

export type CanisterActor = MedVaultBackend;

export function useCanisterActor(): {
  actor: CanisterActor | null;
  isReady: boolean;
  principal: string | null;
} {
  const principal = useAuthStore((s) => s.principal);
  const identity = useAuthStore((s) => s.identity);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [actor, setActor] = useState<CanisterActor | null>(null);

  useEffect(() => {
    let mounted = true;
    if (isAuthenticated && identity) {
      getBackendActor().then(a => {
        if (mounted) setActor(a);
      }).catch(err => {
        console.error("Failed to initialize backend actor:", err);
      });
    } else {
      setActor(null);
    }
    return () => { mounted = false; };
  }, [isAuthenticated, identity]);

  const isReady = isAuthenticated && !!identity && !!principal && actor !== null;

  return { actor, isReady, principal };
}
