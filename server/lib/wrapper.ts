import { CanisterResponse, ApiError } from './types.js';

export function withResponse<T>(fn: () => T): CanisterResponse<T> {
    try {
        return { ok: fn() };
    } catch (e: any) {
        if (e.name === 'CanisterError') {
            return { error: { code: e.code, message: e.message, details: e.details } };
        }
        return { error: { code: 'UNKNOWN_ERROR', message: e.message || String(e) } };
    }
}
