import { PinataSDK } from 'pinata';
import { getBackendActor } from './canister';

let pinataJwt = '';
let pinataGateway = '';
let isConfigFetched = false;

async function ensureConfigFetched() {
  if (isConfigFetched) return;
  try {
    const actor = await getBackendActor();
    const result = await actor.getPinataConfig();
    if ('ok' in result) {
      pinataJwt = result.ok.jwt;
      pinataGateway = result.ok.gateway;
    }
    isConfigFetched = true;
  } catch (err) {
    console.error("Failed to fetch Pinata config from backend", err);
  }
}

let pinataInstance: PinataSDK | null = null;

export async function getPinata(): Promise<PinataSDK> {
  await ensureConfigFetched();
  
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt: pinataJwt === 'your_pinata_jwt_here' ? '' : pinataJwt,
      pinataGateway: pinataGateway === 'your_pinata_gateway_here' ? '' : pinataGateway,
    });
  }
  return pinataInstance;
}

const mockStorage = new Map<string, Blob>();

export interface UploadMetadata {
  ownerPrincipal: string;
  recordType?: string;
  fileName?: string;
  [key: string]: string | undefined;
}

export async function uploadEncryptedBlob(
  blob: Blob,
  metadata: UploadMetadata
): Promise<string> {
  await ensureConfigFetched();

  if (!pinataJwt || pinataJwt === 'your_pinata_jwt_here') {
    console.warn("[Mock] Pinata JWT is missing. Simulating upload to local memory.");
    const cid = `mock-cid-${Date.now()}`;
    mockStorage.set(cid, blob);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return cid;
  }

  const pinata = await getPinata();

  const file = new File(
    [blob],
    metadata.fileName || `medvault-record-${Date.now()}.enc`,
    { type: blob.type || 'application/octet-stream' }
  );

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

export async function fetchFromIPFS(cid: string): Promise<Blob> {
  await ensureConfigFetched();

  if (cid.startsWith('mock-cid-')) {
    console.warn("[Mock] Simulating fetch from local memory.");
    await new Promise(resolve => setTimeout(resolve, 800));
    const blob = mockStorage.get(cid);
    if (!blob) throw new Error("Mock file not found in current session memory.");
    return blob;
  }

  if (!pinataGateway || pinataGateway === 'your_pinata_gateway_here') {
    console.warn("[Mock] Pinata Gateway not configured. Returning dummy encrypted blob.");
    await new Promise(resolve => setTimeout(resolve, 800));
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
