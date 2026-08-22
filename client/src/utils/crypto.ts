/**
 * Generates a SHA-256 hash for a given file Blob.
 * Used for verifying file integrity before/after Lit Protocol encryption.
 */
export const generateFileHash = async (file: Blob): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // Convert buffer to byte array, then to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

// TODO (Workstream 3): BLANK SPACE - Hash Integration
// Workstream 3, you should call `generateFileHash` inside your TanStack `useUploadRecord` hook
// immediately BEFORE you pass the file to `lit.ts` for encryption. Save this hash in the 
// recordStore, and then pass it to the Azle backend so it can be verified on download.
