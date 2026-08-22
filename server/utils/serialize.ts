export function generateUuid(): string {
    // A simple v4 UUID generator that works in Azle environment
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function paginateItems<T>(items: T[], page: number, limit: number): { data: T[], total: number, page: number, totalPages: number } {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
        data: items.slice(start, end),
        total,
        page,
        totalPages
    };
}
