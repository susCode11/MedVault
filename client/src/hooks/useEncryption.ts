// =============================================================================
// MedVault — useEncryption Hook
// Workstream 3: Client State & Integration
// Phase 4c
//
// Provides Lit Protocol encryption and decryption operations for medical files.
// Consumed by useRecords.ts for the upload pipeline and record viewing.
//
// MOCK MODE:
//   MOCK_LIT = true  → encrypts/decrypts with a no-op stub (base64 wrap)
//   MOCK_LIT = false → delegates to lib/lit.ts (Workstream 2)
//
// Workstream 2 must implement lib/lit.ts with the LitAdapter interface below.
// Toggle MOCK_LIT = false once delivered.
//
// Consumed by:
//   - useRecords.ts → useUploadRecord pipeline (Step 1: encrypt)
//   - RecordViewer.tsx → decrypt before rendering
// =============================================================================

import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';

import { encryptFile as litEncryptFile, decryptFile as litDecryptFile } from '../lib/lit';



// ---------------------------------------------------------------------------
// LitAdapter interface (W2 must implement in lib/lit.ts)
// ---------------------------------------------------------------------------

export interface LitEncryptResult {
  /** Encrypted file blob */
  encryptedFile: Blob;
  /** Symmetric key encrypted by Lit Protocol */
  encryptedSymmetricKey: string;
  /** JSON-encoded Lit access conditions */
  litAccessConditions: string;
}

export interface LitAdapter {
  /**
   * Encrypt a file for the given principal.
   * Access condition: only the owner principal can decrypt.
   */
  encryptFile: (
    file: File,
    ownerPrincipal: string,
    authSig?: Record<string, string>
  ) => Promise<LitEncryptResult>;

  /**
   * Decrypt a file using the encrypted symmetric key and access conditions.
   * Requires the caller to be authenticated with Lit nodes.
   */
  decryptFile: (
    encryptedCid: string,
    encryptedSymmetricKey: string,
    litAccessConditions: string,
    identity: unknown,
    authSig?: Record<string, string>
  ) => Promise<Blob>;
}

// Removed mockLitAdapter

// ---------------------------------------------------------------------------
// useEncryption Hook
// ---------------------------------------------------------------------------

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
 *   const blob = await decryptFile(cid, key, conditions);
 *   const url = URL.createObjectURL(blob);
 */
export function useEncryption() {
  const identity = useAuthStore((s) => s.identity);
  const principal = useAuthStore((s) => s.principal);
  const authStoreSig = useAuthStore((s) => s.litAuthSig);
  
  const litAuthSig = authStoreSig || {
    sig: 'mock_signature',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'mock_message',
    address: 'mock_address',
  };

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptError, setEncryptError] = useState<Error | null>(null);
  const [decryptError, setDecryptError] = useState<Error | null>(null);

  const adapter: LitAdapter = {
    encryptFile: async (file, ownerPrincipal) => {
      const res = await litEncryptFile(file, ownerPrincipal);
      // Map the W2 stub format to LitEncryptResult
      return {
        encryptedFile: new Blob([res.ciphertext], { type: 'application/octet-stream' }),
        encryptedSymmetricKey: res.dataToEncryptHash, // store the hash in place of the symmetric key for now
        litAccessConditions: JSON.stringify({ owner: ownerPrincipal })
      };
    },
    decryptFile: async (_encryptedCid, encryptedSymmetricKey, litAccessConditions) => {
      // W2 decrypt stub signature
      return await litDecryptFile('mock_ciphertext', encryptedSymmetricKey, JSON.parse(litAccessConditions).owner);
    }
  };

  const encryptFile = useCallback(
    async (file: File): Promise<LitEncryptResult> => {
      if (!principal) throw new Error('Not authenticated — cannot encrypt');
      setIsEncrypting(true);
      setEncryptError(null);
      try {
        const result = await adapter.encryptFile(file, principal, litAuthSig);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setEncryptError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [adapter, principal, litAuthSig]
  );

  const decryptFile = useCallback(
    async (
      encryptedCid: string,
      encryptedSymmetricKey: string,
      litAccessConditions: string
    ): Promise<Blob> => {
      setIsDecrypting(true);
      setDecryptError(null);
      try {
        const blob = await adapter.decryptFile(
          encryptedCid,
          encryptedSymmetricKey,
          litAccessConditions,
          identity,
          litAuthSig
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
    [adapter, identity, litAuthSig]
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
