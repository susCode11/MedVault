// Basic JWT decoder without verification (verification is server-side)
export const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  // Check if expiration time is before current time
  return decoded.exp * 1000 < Date.now();
};

// TODO (Workstream 2): Implement DelegationChain serialization here
export const serializeDelegationChain = (chain: any): string => {
  // Placeholder for Workstream 2 where @dfinity/identity is available
  return JSON.stringify(chain);
};
