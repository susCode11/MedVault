import { ApiErrorCode } from './types.js';

export class CanisterError extends Error {
    constructor(public code: ApiErrorCode, message: string, public details?: Record<string, any>) {
        super(message);
        this.name = 'CanisterError';
    }
}
