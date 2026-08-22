// =============================================================================
// MedVault — Crypto Utilities
//
// Shared utility functions for cryptographic operations.
// Implemented natively using the Web Crypto API to avoid external dependencies.
// =============================================================================

/**
 * Generates a SHA-256 hash of a file for integrity verification.
 * This is used to ensure that a medical record has not been tampered with
 * after decryption.
 *
 * @param file The file to hash
 * @returns A hex-encoded SHA-256 string
 */
export async function generateFileHash(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  // Hash the buffer natively using the Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  
  // Convert the ArrayBuffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  return hexString;
}
