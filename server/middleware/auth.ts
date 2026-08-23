import { getCallerString, isAnonymous } from '../utils/principal.js';
import { usersStorage } from '../lib/storage.js';
import { CanisterError } from '../lib/error.js';

export function requireAuth(): string {
    const caller = getCallerString();
    if (isAnonymous(caller)) {
        throw new CanisterError('UNAUTHENTICATED', "Unauthorized: Anonymous access not allowed");
    }
    return caller;
}

export function requireRole(role: string): string {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    if (!user || (user.role !== role && user.role !== 'admin')) {
        throw new CanisterError('UNAUTHORIZED', `Forbidden: Requires ${role} role`);
    }
    return caller;
}
