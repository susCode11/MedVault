import { CONSTANTS } from './constants';

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidAbhaId = (abhaId: string): boolean => {
  if (!abhaId) return false;
  const cleaned = abhaId.replace(/[^0-9]/g, '');
  return cleaned.length === 14;
};

export const isValidFileType = (file: File): boolean => {
  return CONSTANTS.SUPPORTED_FILE_TYPES.includes(file.type);
};

export const isValidFileSize = (file: File): boolean => {
  return file.size <= CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024;
};
