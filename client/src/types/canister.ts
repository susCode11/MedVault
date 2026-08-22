export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  performerName: string;
  targetId: string;
  targetType: 'record' | 'access' | 'user' | 'emergency';
  details: string;
  timestamp: number;
  ipAddress?: string;
}
