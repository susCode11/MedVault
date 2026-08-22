export interface AbhaProfile {
  abhaId: string;
  abhaAddress: string;
  name: string;
  yearOfBirth: number;
  gender: 'M' | 'F' | 'O';
  mobile: string;
  state: string;
  district: string;
  verified: boolean;
}

export interface AbhaLinkRequest {
  abhaId: string;
  otp?: string;
}

export interface AbhaVerifyResponse {
  success: boolean;
  profile?: AbhaProfile;
  error?: string;
}
