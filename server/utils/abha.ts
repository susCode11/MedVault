export function isValidAbhaNumber(id: string): boolean {
    const stripped = id.replace(/[-\s]/g, '');
    return /^\d{14}$/.test(stripped);
}

export function formatAbhaDisplay(id: string): string {
    const stripped = id.replace(/[-\s]/g, '');
    if (stripped.length !== 14) return id;
    
    return `${stripped.slice(0, 2)}-${stripped.slice(2, 6)}-${stripped.slice(6, 10)}-${stripped.slice(10, 14)}`;
}
