import { MAX_FILE_SIZE_BYTES } from './constants';

/**
 * Validates the strict 14-digit ABHA format.
 */
export const isValidAbhaId = (id: string): boolean => {
  const formatRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  return formatRegex.test(id);
};

/**
 * Validates if a string is a valid ICP Principal.
 * Real principals are typically 53-63 characters, dash-separated.
 */
export const isValidPrincipal = (principal: string): boolean => {
  // A basic regex for typical principal string structure
  // e.g., r7inp-6aaaa-aaaaa-aaabq-cai
  const principalRegex = /^[a-z0-9-]+$/;
  return principal.length >= 27 && principalRegex.test(principal);
};

/**
 * Validates if a file is safe and under the maximum size.
 */
export const isValidFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds the 50MB size limit.' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  return { valid: true };
};

// TODO (Workstream 4): BLANK SPACE - Form Validation Hooks
// Workstream 4, you should integrate these validation functions into your React Hook Form 
// setup (e.g., inside `rules={{ validate: isValidAbhaId }}`) for real-time UI feedback.
