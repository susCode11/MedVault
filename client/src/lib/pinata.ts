import { PinataSDK } from 'pinata';

// TODO (Workstream 4): BLANK SPACE - Environment Variables
// You must ensure that VITE_PINATA_JWT and VITE_PINATA_GATEWAY are added to your local .env file.
// We are using fallback mock values here so the app doesn't crash during your UI development.
const pinataJwt = process.env.VITE_PINATA_JWT || 'mock-jwt';
const pinataGateway = process.env.VITE_PINATA_GATEWAY || 'mock-gateway.mypinata.cloud';

let pinataInstance: PinataSDK | null = null;

/**
 * Initializes and returns the PinataSDK instance.
 * Uses a singleton pattern to avoid multiple SDK initializations.
 */
export const getPinata = () => {
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt,
      pinataGateway,
    });
  }
  return pinataInstance;
};

/**
 * Uploads an encrypted Blob to IPFS via Pinata.
 * @param blob The encrypted file blob
 * @param metadata Metadata describing the file (e.g., owner, original name)
 * @returns The IPFS CID of the uploaded file
 */
export const uploadEncryptedBlob = async (blob: Blob, metadata: any): Promise<string> => {
  const pinata = getPinata();

  // Create a File object from the Blob for uploading
  const file = new File([blob], metadata.name || 'encrypted_record.enc', { type: blob.type });

  try {
    console.log('[Pinata] Uploading file to IPFS...', metadata);
    
    // TODO (Workstream 3): BLANK SPACE - Upload Progress Tracking
    // If your UI requires a progress bar for large medical records, you will need to 
    // integrate Axios or another HTTP client directly, as the basic PinataSDK upload 
    // method might not expose progress events. Handle that state via your Zustand store here.

    const upload = await pinata.upload.file(file).addMetadata({
      name: metadata.name,
      keyvalues: {
        owner: metadata.ownerPrincipal,
        timestamp: Date.now().toString(),
      }
    });

    // Handle v1 SDK return type dynamically for the scaffolding
    return (upload as any).IpfsHash || (upload as any).cid || 'mock-cid-123';
  } catch (error) {
    console.error('Pinata upload failed:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Fetches data from IPFS via the Pinata Gateway.
 * @param cid The IPFS CID of the file to fetch
 * @returns The fetched Blob
 */
export const fetchFromIPFS = async (cid: string): Promise<Blob> => {
  try {
    console.log(`[Pinata] Fetching CID ${cid} from IPFS...`);
    const gatewayUrl = `https://${pinataGateway}/ipfs/${cid}`;
    
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Failed to fetch from Pinata:', error);
    throw new Error(`Failed to fetch CID ${cid}`);
  }
};
