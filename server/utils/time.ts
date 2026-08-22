import { time } from 'azle';

export function nowNanos(): bigint {
    return time();
}

export function nanosToMillis(nanos: bigint): number {
    return Number(nanos / 1_000_000n);
}

export function nanosToDate(nanos: bigint): Date {
    return new Date(nanosToMillis(nanos));
}

export function hoursToNanos(hours: number): bigint {
    return BigInt(hours) * 3_600_000_000_000n;
}

export function isExpired(expiresAt: bigint): boolean {
    return nowNanos() > expiresAt;
}
