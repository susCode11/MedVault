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

import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { mockCanister, type MockCanister } from './__mocks__/mockCanister';

// ---------------------------------------------------------------------------
// Mock flag — flip to false when W2 delivers lib/canister.ts
// ---------------------------------------------------------------------------

const MOCK_CANISTER = true;

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

// ---------------------------------------------------------------------------
// Actor type
// ---------------------------------------------------------------------------

export type CanisterActor = MockCanister;
// When MOCK_CANISTER=false, swap to:
// export type CanisterActor = import('../lib/canister').MedVaultActor;

// ---------------------------------------------------------------------------
// useCanisterActor Hook
// ---------------------------------------------------------------------------

/**
 * Returns the canister actor (mock or real) and whether it is ready.
 *
 * "Ready" means:
 *   - In mock mode: always true
 *   - In real mode: agent has been initialised with a valid identity
 *
 * Usage:
 *   const { actor, isReady } = useCanisterActor();
 *   if (!isReady) return;
 *   const res = await actor.getRecord(id);
 */
export function useCanisterActor(): {
  actor: CanisterActor;
  isReady: boolean;
  principal: string | null;
} {
  const principal   = useAuthStore((s) => s.principal);
  const identity    = useAuthStore((s) => s.identity);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const actor = useMemo((): CanisterActor => {
    if (MOCK_CANISTER) {
      return mockCanister;
    }

    // Real mode: build actor from W2's lib/canister.ts
    // import { buildActor } from '../lib/canister';
    // return buildActor(identity);
    //
    // Until W2 delivers lib/canister.ts, fall back to mock
    return mockCanister;
  }, [identity]);

  const isReady = MOCK_CANISTER
    ? true
    : isAuthenticated && !!identity && !!principal;

  return { actor, isReady, principal };
}
