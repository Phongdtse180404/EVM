// Simple JWT decoder utility
export interface JWTPayload {
  sub?: string;
  email?: string;
  role?: string;
  roleId?: number;
  roleName?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

export function getUserRoleFromToken(token: string): { roleId?: number; roleName?: string; role?: string } {
  const payload = decodeJWT(token);
  
  // Map roles to roleId for backward compatibility
  let roleId: number | undefined;
  if (payload?.role === 'ROLE_ADMIN') {
    roleId = 2;
  } else if (payload?.role === 'ROLE_EVMSTAFF') {
    roleId = 3;
  } else if (payload?.role === 'ROLE_USER') {
    roleId = 1;
  }
  
  return {
    roleId,
    roleName: payload?.role,
    role: payload?.role
  };
}