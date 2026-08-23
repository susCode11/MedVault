import { NMC_MODE, NMC_API_KEY } from './env';

export interface NmcDoctorProfile {
  licenseNumber: string;
  name: string;
  stateMedicalCouncil: string;
  registrationYear: string;
  status: 'Active' | 'Suspended' | 'Inactive';
}

export interface NmcService {
  verifyLicense(licenseNumber: string): Promise<NmcDoctorProfile>;
}

// ---------------------------------------------------------------------------
// Mock Service (for local development)
// ---------------------------------------------------------------------------

class MockNmcService implements NmcService {
  async verifyLicense(licenseNumber: string): Promise<NmcDoctorProfile> {
    console.log(`[MockNMC] Verifying license: ${licenseNumber}`);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Fail for specific test case
    if (licenseNumber === 'INVALID123') {
      throw new Error('Invalid NMC License Number');
    }
    
    // Fail for suspended case
    if (licenseNumber === 'SUSPENDED123') {
      throw new Error('This license is currently suspended');
    }

    // Success case
    return {
      licenseNumber,
      name: 'Dr. Test Physician',
      stateMedicalCouncil: 'Delhi Medical Council',
      registrationYear: '2015',
      status: 'Active'
    };
  }
}

// ---------------------------------------------------------------------------
// Real Surepass/NMC API Service (production)
// ---------------------------------------------------------------------------

class RealNmcService implements NmcService {
  private baseUrl = 'https://kyc-api.surepass.io/api/v1';

  async verifyLicense(licenseNumber: string): Promise<NmcDoctorProfile> {
    if (!NMC_API_KEY) {
      throw new Error('NMC API Key is missing. Check VITE_NMC_API_KEY.');
    }

    const res = await fetch(`${this.baseUrl}/medical-council/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NMC_API_KEY}`
      },
      body: JSON.stringify({
        id_number: licenseNumber
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to verify NMC license');
    }

    const data = await res.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid NMC license or doctor not found in registry');
    }

    return {
      licenseNumber: data.data.registration_number || licenseNumber,
      name: data.data.name,
      stateMedicalCouncil: data.data.state_medical_council,
      registrationYear: data.data.registration_date,
      status: data.data.status || 'Active' // Assume active if not specified, though API usually specifies
    };
  }
}

// Export the active service based on env
export const nmcService = NMC_MODE === 'real' ? new RealNmcService() : new MockNmcService();
