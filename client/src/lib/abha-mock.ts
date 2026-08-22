/**
 * Mock implementation of the Ayushman Bharat Health Account (ABHA) API.
 * Simulates NDHM gateway interactions for local UI development.
 */

export interface MockAbhaPatient {
  abhaId: string;
  name: string;
  gender: 'M' | 'F' | 'O';
  yearOfBirth: number;
  mobile: string;
}

// 1. Define Mock Data
const mockDatabase: Record<string, MockAbhaPatient> = {
  '12-3456-7890-1234': {
    abhaId: '12-3456-7890-1234',
    name: 'Akhil Verma',
    gender: 'M',
    yearOfBirth: 1995,
    mobile: '9876543210',
  },
  '98-7654-3210-9876': {
    abhaId: '98-7654-3210-9876',
    name: 'Jane Doe',
    gender: 'F',
    yearOfBirth: 1988,
    mobile: '9123456780',
  }
};

/**
 * 2. Generates a random simulated 14-digit ABHA ID for testing UI flows.
 * Format: XX-XXXX-XXXX-XXXX
 */
export const generateMockAbhaId = (): string => {
  const p1 = Math.floor(10 + Math.random() * 90);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  const p4 = Math.floor(1000 + Math.random() * 9000);
  return `${p1}-${p2}-${p3}-${p4}`;
};

/**
 * 3. Verifies if an ABHA ID exists and is valid.
 * @param id The 14-digit ABHA ID to verify
 * @returns boolean indicating success
 */
export const verifyAbhaId = async (id: string): Promise<boolean> => {
  console.log(`[ABHA Mock] Verifying ID: ${id}...`);
  // Simulate network delay for UI loading states
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // TODO (Workstream 3): BLANK SPACE - NDHM API Integration
  // When deploying to production, replace this mock validation with a real backend call
  // to the NDHM verification endpoint. Ensure you map the response appropriately.
  
  const formatRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  return formatRegex.test(id);
};

/**
 * 4. Looks up patient demographics based on their ABHA ID.
 * @param id The ABHA ID
 * @returns The patient data, or null if not found
 */
export const lookupPatient = async (id: string): Promise<MockAbhaPatient | null> => {
  console.log(`[ABHA Mock] Looking up patient with ID: ${id}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // TODO (Workstream 3 & 4): BLANK SPACE - Doctor Portal Integration
  // Workstream 3 must wire this function to the TanStack Query hook `usePatientLookup`.
  // Workstream 4 will consume the returned `MockAbhaPatient` object in the UI card.
  
  if (mockDatabase[id]) {
    return mockDatabase[id];
  }
  
  // Return a randomly generated profile if it's a valid format but not in DB
  // This allows testers to input random valid IDs and still see the UI succeed.
  const formatRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
  if (formatRegex.test(id)) {
    return {
      abhaId: id,
      name: 'Simulated Patient',
      gender: Math.random() > 0.5 ? 'M' : 'F',
      yearOfBirth: 1960 + Math.floor(Math.random() * 50),
      mobile: '9999999999',
    };
  }
  
  return null;
};
