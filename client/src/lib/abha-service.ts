import { ABHA_MODE, ABDM_CLIENT_ID, ABDM_CLIENT_SECRET } from './env';
import { AbhaProfile } from '../types/abha';

export interface AbhaService {
  sendOtp(abhaId: string): Promise<{ txnId: string; maskedMobile: string }>;
  verifyOtp(txnId: string, otp: string): Promise<{ token: string; profile: AbhaProfile }>;
}

// ---------------------------------------------------------------------------
// Mock Service (for local development)
// ---------------------------------------------------------------------------

class MockAbhaService implements AbhaService {
  async sendOtp(abhaId: string) {
    console.log(`[MockABHA] Sending OTP for ${abhaId}`);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    
    return {
      txnId: 'mock-txn-' + Date.now(),
      maskedMobile: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000).toString(),
    };
  }

  async verifyOtp(txnId: string, otp: string) {
    console.log(`[MockABHA] Verifying OTP ${otp} for txn ${txnId}`);
    await new Promise(r => setTimeout(r, 1500));
    
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Use 123456 for testing.');
    }

    // Return a mock profile
    const profile: AbhaProfile = {
      abhaId: '12-3456-7890-1234',
      name: 'Test Patient',
      gender: 'M',
      dob: '1990-01-01',
      address: '123 Mock Street, New Delhi',
      state: 'Delhi',
      pincode: '110001',
      mobile: '9876543210'
    };

    return {
      token: 'mock-auth-token',
      profile
    };
  }
}

// ---------------------------------------------------------------------------
// Real ABDM Service (sandbox/production)
// ---------------------------------------------------------------------------

class RealAbhaService implements AbhaService {
  private baseUrl = 'https://healthidsbx.abdm.gov.in/api/v1'; // Sandbox URL

  private async getSessionToken(): Promise<string> {
    if (!ABDM_CLIENT_ID || !ABDM_CLIENT_SECRET) {
      throw new Error('ABDM credentials missing. Check VITE_ABDM_CLIENT_ID and VITE_ABDM_CLIENT_SECRET.');
    }
    
    // In a real production app, this session token generation should happen on the backend
    // to keep the client secret secure. For this client-side demo, we do it here.
    const res = await fetch('https://dev.abdm.gov.in/gateway/v0.5/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: ABDM_CLIENT_ID, clientSecret: ABDM_CLIENT_SECRET })
    });
    
    if (!res.ok) throw new Error('Failed to get ABDM session token');
    const data = await res.json();
    return data.accessToken;
  }

  async sendOtp(abhaId: string) {
    const token = await this.getSessionToken();
    const res = await fetch(`${this.baseUrl}/auth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        authMethod: 'MOBILE_OTP',
        healthid: abhaId
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send OTP');
    }

    const data = await res.json();
    return {
      txnId: data.txnId,
      maskedMobile: 'XXXXXX' + (data.mobileNumber ? data.mobileNumber.slice(-4) : 'XXXX')
    };
  }

  async verifyOtp(txnId: string, otp: string) {
    const token = await this.getSessionToken();
    const res = await fetch(`${this.baseUrl}/auth/confirmWithMobileOTP`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        txnId,
        otp
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid OTP');
    }

    const data = await res.json();
    
    // In a real implementation, you'd then call /account/profile with the X-Token
    // For this boilerplate, we'll return a stubbed profile indicating success
    const profile: AbhaProfile = {
      abhaId: 'ABHA-VERIFIED',
      name: 'Verified Patient',
      gender: 'U',
      dob: 'Unknown',
      address: '',
      state: '',
      pincode: '',
      mobile: ''
    };

    return {
      token: data.token, // The X-Token
      profile
    };
  }
}

// Export the active service based on env
export const abhaService = ABHA_MODE === 'real' ? new RealAbhaService() : new MockAbhaService();
