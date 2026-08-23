import { PinataSDK } from 'pinata';

// Replace these mock values with real credentials from the Pinata dashboard.
// Generate a JWT and Gateway URL at https://app.pinata.cloud/developers/api-keys
// Then add them to client/.env.local as VITE_PINATA_JWT and VITE_PINATA_GATEWAY.
const pinataJwt = import.meta.env?.VITE_PINATA_JWT;
const pinataGateway = import.meta.env?.VITE_PINATA_GATEWAY;

if (!pinataJwt || !pinataGateway) {
  console.warn("VITE_PINATA_JWT or VITE_PINATA_GATEWAY is not defined. File uploads/downloads will fail.");
}
// --- Singleton SDK Instance ---

let pinataInstance: PinataSDK | null = null;

/**
 * Returns the singleton PinataSDK instance.
 * Initializes on first call with the configured JWT and gateway.
 */
export function getPinata(): PinataSDK {
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt: pinataJwt === 'your_pinata_jwt_here' ? '' : pinataJwt,
      pinataGateway: pinataGateway === 'your_pinata_gateway_here' ? '' : pinataGateway,
    });
  }
  return pinataInstance;
}

// --- Mock Storage for Prototyping ---
// If the user hasn't set up Pinata yet, we store the encrypted blobs in memory
// so they can still test the upload/download flows in the UI.
const mockStorage = new Map<string, Blob>();

// --- Upload ---

export interface UploadMetadata {
  ownerPrincipal: string;
  recordType?: string;
  fileName?: string;
  [key: string]: string | undefined;
}

/**
 * Uploads an encrypted blob to IPFS via Pinata.
 * Converts the blob to a File, attaches searchable metadata, and returns the CID.
 *
 * @param blob - The encrypted file data as a Blob
 * @param metadata - Searchable metadata (owner principal, record type, etc.)
 * @returns The IPFS CID string for the uploaded file
 *
 * // TODO (Workstream 3): Import and call this function from your useUploadRecord
 * // TanStack Query mutation hook. Example:
 * //   const cid = await uploadEncryptedBlob(encryptedBlob, {
 * //     ownerPrincipal: user.principal,
 * //     recordType: 'lab_report',
 * //     fileName: file.name,
 * //   });
 */
export async function uploadEncryptedBlob(
  blob: Blob,
  metadata: UploadMetadata
): Promise<string> {
  if (!pinataJwt || pinataJwt === 'your_pinata_jwt_here') {
    console.warn("[Mock] Pinata JWT is missing. Simulating upload to local memory.");
    const cid = `mock-cid-${Date.now()}`;
    mockStorage.set(cid, blob);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    return cid;
  }

  const pinata = getPinata();

  // Convert Blob to File (Pinata SDK expects a File object)
  const file = new File(
    [blob],
    metadata.fileName || `medvault-record-${Date.now()}.enc`,
    { type: blob.type || 'application/octet-stream' }
  );

  // Build key-value pairs for Pinata metadata (filter out undefined values)
  const keyvalues: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined) {
      keyvalues[key] = value;
    }
  }

  const result = await pinata.upload.public.file(file)
    .name(metadata.fileName || `medvault-${Date.now()}`)
    .keyvalues(keyvalues);

  return result.cid;
}

// --- Fetch ---

/**
 * Downloads a file from IPFS by its CID using the configured Pinata gateway.
 * Returns the file contents as a Blob.
 *
 * @param cid - The IPFS CID to fetch
 * @returns The file data as a Blob
 *
 * // TODO (Workstream 3): Import and call this function from your useRecords /
 * // useDownloadRecord TanStack Query hook. Example:
 * //   const blob = await fetchFromIPFS(record.ipfsCid);
 * //   const decryptedBlob = await decryptBlob(blob, encryptionKey);
 */
export async function fetchFromIPFS(cid: string): Promise<Blob> {
  if (cid.startsWith('mock-cid-')) {
    console.warn("[Mock] Simulating fetch from local memory.");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    const blob = mockStorage.get(cid);
    if (!blob) throw new Error("Mock file not found in current session memory.");
    return blob;
  }

  if (!pinataGateway || pinataGateway === 'your_pinata_gateway_here') {
    console.warn("[Mock] Pinata Gateway not configured. Returning dummy encrypted blob.");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return new Blob(["dummy encrypted data"]);
  }

  const gateway = pinataGateway.startsWith('https://')
    ? pinataGateway
    : `https://${pinataGateway}`;

  const response = await fetch(`${gateway}/ipfs/${cid}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}
