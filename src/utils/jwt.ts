interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload?.exp) return null;
  
  return payload.exp * 1000;
}

export function isTokenExpired(token: string, bufferMs: number = 0): boolean {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return true;
  
  return Date.now() >= expiresAt - bufferMs;
}

export function getTimeUntilExpiry(token: string): number {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return 0;
  
  return Math.max(0, expiresAt - Date.now());
}
