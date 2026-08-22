import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: number | Date | string, pattern = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), pattern);
};

export const formatRelativeTime = (date: number | Date | string) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncatePrincipal = (principal: string, length = 6): string => {
  if (!principal) return '';
  if (principal.length <= length * 2) return principal;
  return `${principal.substring(0, length)}...${principal.substring(principal.length - length)}`;
};

export const formatAbhaId = (abhaId: string): string => {
  if (!abhaId) return '';
  const cleaned = abhaId.replace(/[^0-9]/g, '');
  if (cleaned.length !== 14) return abhaId;
  return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}-${cleaned.substring(10)}`;
};
