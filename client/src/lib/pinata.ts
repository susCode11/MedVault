import { PinataSDK } from 'pinata';

// TODO (Workstream 4): BLANK SPACE - Environment Variables
// Replace these mock values with real credentials from the Pinata dashboard.
// Generate a JWT and Gateway URL at https://app.pinata.cloud/developers/api-keys
// Then add them to client/.env.local as VITE_PINATA_JWT and VITE_PINATA_GATEWAY.
const pinataJwt = process.env.VITE_PINATA_JWT || 'mock-jwt';
const pinataGateway = process.env.VITE_PINATA_GATEWAY || 'mock-gateway.mypinata.cloud';

// --- Singleton SDK Instance ---

let pinataInstance: PinataSDK | null = null;

/**
 * Returns the singleton PinataSDK instance.
 * Initializes on first call with the configured JWT and gateway.
 */
export function getPinata(): PinataSDK {
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt,
      pinataGateway,
    });
  }
  return pinataInstance;
}

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

  const result = await pinata.upload.file(file).addMetadata({
    name: metadata.fileName || `medvault-${Date.now()}`,
    keyvalues,
  });

  return result.IpfsHash;
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
  const gateway = pinataGateway.startsWith('https://')
    ? pinataGateway
    : `https://${pinataGateway}`;

  const response = await fetch(`${gateway}/ipfs/${cid}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}
