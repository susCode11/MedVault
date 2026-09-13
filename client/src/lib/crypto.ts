// =============================================================================
// MedVault — Web Crypto Service (AES-256-GCM)
// Phase 4: Encryption Layer
//
// Replaces Lit Protocol with a native, robust AES-256-GCM implementation using 
// the browser's built-in Web Crypto API. 
//
// Workflow:
// 1. Generate a random symmetric key (AES-256-GCM) per file.
// 2. Encrypt the file data using the symmetric key and a random IV.
// 3. The symmetric key is then returned (encoded as base64) to be stored 
//    securely on the ICP backend, bound to the specific record/access grant.
// =============================================================================

export interface EncryptedPayload {
  /** The encrypted file data as a Blob */
  encryptedFile: Blob;
  /** 
   * The base64 encoded AES symmetric key + IV.
   * Format: "base64(key):base64(iv)"
   */
  symmetricKeyId: string;
}

/**
 * Generates a new AES-256-GCM symmetric key.
 */
async function generateSymmetricKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable so we can store it on backend
    ["encrypt", "decrypt"]
  );
}

/**
 * Exports a CryptoKey to a base64 string.
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

/**
 * Imports a CryptoKey from a base64 string.
 */
async function importKey(base64Key: string): Promise<CryptoKey> {
  const rawKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

// ---------------------------------------------------------------------------
// Main Methods
// ---------------------------------------------------------------------------

/**
 * Encrypts a File using AES-256-GCM.
 * Returns the encrypted Blob and the base64-encoded key+IV to store on ICP.
 */
export async function encryptFile(file: File | Blob): Promise<EncryptedPayload> {
  const arrayBuffer = await file.arrayBuffer();
  
  const key = await generateSymmetricKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is standard for GCM

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  const keyBase64 = await exportKey(key);
  const ivBase64 = arrayBufferToBase64(iv.buffer);
  
  const symmetricKeyId = `${keyBase64}:${ivBase64}`;

  return {
    encryptedFile: new Blob([encryptedBuffer], { type: 'application/octet-stream' }),
    symmetricKeyId
  };
}

/**
 * Decrypts a Blob using AES-256-GCM.
 * Requires the base64-encoded key+IV retrieved from ICP.
 */
export async function decryptFile(encryptedBlob: Blob, symmetricKeyId: string, explicitMimeType?: string): Promise<Blob> {
  // Handle mock data from the prototype seed data
  if (symmetricKeyId.startsWith('enc-key-')) {
    console.warn("[Mock] Bypassing decryption for mock seed data.");
    return new Blob(["This is a mock medical record for demonstration purposes. In a production environment, this would be the decrypted file content."], { type: 'text/plain' });
  }

  const [keyBase64, ivBase64] = symmetricKeyId.split(':');
  if (!keyBase64 || !ivBase64) {
    throw new Error("Invalid symmetric key format");
  }

  const arrayBuffer = await encryptedBlob.arrayBuffer();
  
  const key = await importKey(keyBase64);
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  let mimeType = explicitMimeType || 'application/octet-stream';

  // Only sniff magic bytes if we don't have a specific explicit mime type or if it's octet-stream
  if (!explicitMimeType || explicitMimeType === 'application/octet-stream') {
    const arr = new Uint8Array(decryptedBuffer).subarray(0, 4);
    const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    if (header.startsWith('25504446')) { // %PDF
      mimeType = 'application/pdf';
    } else if (header.startsWith('FFD8FF')) {
      mimeType = 'image/jpeg';
    } else if (header.startsWith('89504E47')) {
      mimeType = 'image/png';
    } else if (header.startsWith('504B0304')) {
      mimeType = 'application/zip';
    }
  }

  return new Blob([decryptedBuffer], { type: mimeType });
}

// ---------------------------------------------------------------------------
// ArrayBuffer <-> Base64 Utilities
// ---------------------------------------------------------------------------

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
