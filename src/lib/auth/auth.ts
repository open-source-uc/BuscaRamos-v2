"use server";
import { importJWK, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { PUBLIC_JWK } from "./publicKey";

let _cachedKey: CryptoKey | Uint8Array | null = null;
async function getPublicKey() {
  if (!_cachedKey) _cachedKey = await importJWK(PUBLIC_JWK, "RS256");
  return _cachedKey;
}

interface Career {
  id: number;
  name: string;
}

interface Organization {
  id: number;
  name: string;
  display_name: string;
  role: string;
}

interface TokenPayload {
  userId: number;
  username: string;
  career: Career;
  permissions: string[];
  organizations: Organization[];
  sessionId: number;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  isAuthenticated: true;
  userId: string;
  username: string;
  career: Career | null;
  permissions: string[];
  organizations: Organization[];
}

export type { Career, Organization };

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const key = await getPublicKey();
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("osuc_access")?.value;

  if (!token) {
    return null;
  }

  let payload = await verifyToken(token);

  if (!payload) {
    // Token expirado o inválido — intentar refresh
    try {
      const allCookies = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const refresh = await fetch("https://auth.osuc.dev/api/refresh", {
        method: "POST",
        headers: { cookie: allCookies },
      });

      if (!refresh.ok) {
        return null;
      }

      // Leer el nuevo access token de las cookies de respuesta
      const newAccessCookie = refresh.headers
        .getSetCookie()
        .find((c) => c.startsWith("osuc_access="));

      if (!newAccessCookie) {
        return null;
      }

      const newToken = newAccessCookie.split("=")[1].split(";")[0];
      payload = await verifyToken(newToken);

      if (!payload) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return {
    isAuthenticated: true,
    userId: String(payload.userId),
    username: payload.username,
    career: payload.career ?? null,
    permissions: payload.permissions,
    organizations: payload.organizations,
  };
}
