// =============================================================================
// MedVault — useTimeline Hook
// Workstream 3: Client State & Integration
// Phase 4d
//
// Hooks for the immutable audit timeline (audit log):
//   - useEntityTimeline — fetch timeline for a specific entity (e.g. a record)
//   - useActorTimeline  — fetch timeline for a specific user (admin/patient view)
//
// Consumed by (Workstream 4):
//   - RecordAuditTrail.tsx — useEntityTimeline
//   - GlobalAuditLog.tsx   — useActorTimeline
// =============================================================================

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useAuthStore } from '../store/authStore';

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// useEntityTimeline
// ---------------------------------------------------------------------------

/**
 * Fetch the infinite-scroll audit timeline for a specific entity (e.g., a record).
 * Used to show the history of a single record (uploaded, viewed, shared, etc.).
 *
 * Usage:
 *   const { entries, fetchNextPage } = useEntityTimeline('rec-001');
 */
export function useEntityTimeline(entityId: string | null) {
  const { actor, isReady } = useCanisterActor();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useInfiniteQuery({
    queryKey: CANISTER_QUERY_KEYS.audit.byEntity(entityId ?? ''),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await actor.listAuditEntries({
        entityId: entityId!,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isReady && isAuthenticated && !!entityId,
    staleTime: 15_000,
  });

  const entries = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total   = query.data?.pages[0]?.total ?? 0;

  return {
    entries,
    total,
    isFetching:         query.isFetching,
    isLoading:          query.isLoading,
    isError:            query.isError,
    error:              query.error,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch:            query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useActorTimeline
// ---------------------------------------------------------------------------

/**
 * Fetch the infinite-scroll audit timeline for a specific actor (user).
 * Used to see all actions performed by a specific principal.
 *
 * Usage:
 *   const { entries, fetchNextPage } = useActorTimeline('mock-doctor-001-...');
 */
export function useActorTimeline(actorId: string | null) {
  const { actor, isReady } = useCanisterActor();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useInfiniteQuery({
    queryKey: CANISTER_QUERY_KEYS.audit.byActor(actorId ?? ''),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await actor.listAuditEntries({
        actorId: actorId!,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isReady && isAuthenticated && !!actorId,
    staleTime: 30_000,
  });

  const entries = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total   = query.data?.pages[0]?.total ?? 0;

  return {
    entries,
    total,
    isFetching:         query.isFetching,
    isLoading:          query.isLoading,
    isError:            query.isError,
    error:              query.error,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch:            query.refetch,
  };
}
