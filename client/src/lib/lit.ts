import { LitNodeClient } from '@lit-protocol/lit-node-client';

let litNodeClient: LitNodeClient | null = null;

/**
 * Initializes and returns the LitNodeClient.
 * This connects to the Lit test network (datil-dev).
 */
export const getLitNodeClient = async (): Promise<LitNodeClient> => {
  if (litNodeClient) {
    return litNodeClient;
  }

  litNodeClient = new LitNodeClient({
    litNetwork: 'datil-dev',
    debug: false,
  });

  await litNodeClient.connect();
  return litNodeClient;
};

/**
 * Creates access control conditions for a specific ICP principal.
 * This ensures that only the specified principal can decrypt the file.
 */
export const createAccessControlConditions = (ownerPrincipal: string) => {
  console.log(`Creating access conditions for ICP Principal: ${ownerPrincipal}`);
  
  // TODO (Workstream 3): Finalize how ICP principals map to Lit Protocol conditions.
  // Because Lit natively uses EVM wallets (MetaMask), integrating ICP Principals (Internet Identity/NFID)
  // requires either a custom Lit Action or mapping the user's ICP Principal to an EVM address (AuthSig).
  // This is left as a blank space for you to wire up during state/hook integration.
  
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: {
        comparator: '>=',
        value: '0', // Placeholder condition that passes trivially for scaffolding
      },
    },
  ];
};

/**
 * Encrypts a file using Lit Protocol.
 * @param file The file to encrypt (e.g., medical record)
 * @param ownerPrincipal The ICP principal of the owner granting access
 * @returns Object containing the ciphertext and dataToEncryptHash
 */
export const encryptFile = async (file: File, ownerPrincipal: string) => {
  const client = await getLitNodeClient();
  const conditions = createAccessControlConditions(ownerPrincipal);

  // TODO (Workstream 3): Provide the actual AuthSig from the wallet integration.
  // Since we are mocking the ICP-to-EVM bridge for this phase, this dummy signature is used.
  // Replace this object with the real signature obtained from the user's wallet when wiring up the UI.
  const mockAuthSig = {
    sig: '0xmock_signature',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'mock_message',
    address: '0xmock_address',
  };

  console.log(`[Lit Mock] Encrypting file for ${ownerPrincipal}...`, { client, conditions, mockAuthSig, file });

  // In a real implementation, you would call:
  // const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptFile({ ... })
  
  return {
    ciphertext: 'mock_ciphertext_blob',
    dataToEncryptHash: 'mock_data_hash',
  };
};

/**
 * Decrypts a file using Lit Protocol.
 * @param ciphertext The encrypted ciphertext string/blob
 * @param dataToEncryptHash The hash of the encrypted data
 * @param ownerPrincipal The ICP principal of the owner trying to decrypt
 * @returns The decrypted Blob
 */
export const decryptFile = async (
  ciphertext: string,
  dataToEncryptHash: string,
  ownerPrincipal: string
): Promise<Blob> => {
  const client = await getLitNodeClient();
  const conditions = createAccessControlConditions(ownerPrincipal);

  // TODO (Workstream 3): Provide the actual AuthSig from the wallet integration.
  // Like in encryptFile, replace this with the real AuthSig when integrating with TanStack hooks.
  const mockAuthSig = {
    sig: '0xmock_signature',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'mock_message',
    address: '0xmock_address',
  };

  console.log(`[Lit Mock] Decrypting file for ${ownerPrincipal}...`, { client, conditions, mockAuthSig, ciphertext, dataToEncryptHash });

  // In a real implementation, you would call:
  // const decryptedFile = await LitJsSdk.decryptToZip({ ... })
  
  return new Blob(['Mock decrypted medical record content'], { type: 'text/plain' });
};
