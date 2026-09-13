// =============================================================================
// MedVault — useEncryption Hook
// Workstream 3: Client State & Integration
// Phase 4: Web Crypto API (AES-256-GCM)
//
// Provides native Web Crypto encryption and decryption operations for medical files.
// Completely replaces the Lit Protocol dependency.
//
// Consumed by:
//   - useRecords.ts → useUploadRecord pipeline (Step 1: encrypt)
//   - RecordViewer.tsx → decrypt before rendering
// =============================================================================

import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { encryptFile as cryptoEncryptFile, decryptFile as cryptoDecryptFile, EncryptedPayload } from '../lib/crypto';

export interface EncryptionResult {
  /** Encrypted file blob */
  encryptedFile: Blob;
  /** Base64 symmetric key + IV to store on the canister */
  encryptedSymmetricKey: string;
}

/**
 * Provides encrypt and decrypt operations for medical files.
 *
 * Usage (in upload pipeline):
 *   const { encryptFile, isEncrypting, encryptError } = useEncryption();
 *   const result = await encryptFile(file);
 *   // result.encryptedFile → upload to IPFS
 *   // result.encryptedSymmetricKey → store on canister
 *
 * Usage (in record viewer):
 *   const { decryptFile, isDecrypting } = useEncryption();
 *   const blob = await decryptFile(encryptedBlob, key);
 *   const url = URL.createObjectURL(blob);
 */
export function useEncryption() {
  const principal = useAuthStore((s) => s.principal);

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptError, setEncryptError] = useState<Error | null>(null);
  const [decryptError, setDecryptError] = useState<Error | null>(null);

  const encryptFile = useCallback(
    async (file: File | Blob): Promise<EncryptionResult> => {
      if (!principal) throw new Error('Not authenticated — cannot encrypt');
      setIsEncrypting(true);
      setEncryptError(null);
      try {
        const result: EncryptedPayload = await cryptoEncryptFile(file);
        return {
          encryptedFile: result.encryptedFile,
          encryptedSymmetricKey: result.symmetricKeyId, // Store this on the canister
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setEncryptError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [principal]
  );

  const decryptFile = useCallback(
    async (
      encryptedFile: Blob,
      encryptedSymmetricKey: string,
      explicitMimeType?: string
    ): Promise<Blob> => {
      setIsDecrypting(true);
      setDecryptError(null);
      try {
        const blob = await cryptoDecryptFile(
          encryptedFile,
          encryptedSymmetricKey,
          explicitMimeType
        );
        return blob;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setDecryptError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    []
  );

  return {
    encryptFile,
    decryptFile,
    isEncrypting,
    isDecrypting,
    encryptError,
    decryptError,
  };
}
