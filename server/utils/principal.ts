import { msgCaller } from 'azle';

export function getCallerString(): string {
    return msgCaller().toText();
}

export function isAnonymous(principalStr: string): boolean {
    return principalStr === "2vxsx-fae";
}

export function truncatePrincipal(principalStr: string): string {
    if (principalStr.length <= 11) return principalStr;
    return `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`;
}
