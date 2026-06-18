"use server";
import { importJWK, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { PUBLIC_JWK } from "./publicKey";

let _cachedKey: CryptoKey | Uint8Array | null = null;
async function getPublicKey() {
  if (!_cachedKey) _cachedKey = await importJWK(PUBLIC_JWK, "RS256");
  return _cachedKey;
}

import type { Career, Organization } from "./auth.types";

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

  let payload = token ? await verifyToken(token) : null;

  if (!payload) {
    // Token ausente, expirado o inválido — intentar refresh
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

      const setCookies = refresh.headers.getSetCookie();

      const newAccessCookie = setCookies.find((c) => c.startsWith("osuc_access="));
      if (!newAccessCookie) return null;

      const newToken = newAccessCookie.split(";")[0].split("=")[1];
      payload = await verifyToken(newToken);
      if (!payload) return null;

      for (const raw of setCookies) {
        const parts = raw.split(";").map((s) => s.trim());
        const [name, value] = parts[0].split("=");
        const attrs: Record<string, string | boolean> = {};
        for (let i = 1; i < parts.length; i++) {
          const eq = parts[i].indexOf("=");
          if (eq === -1) attrs[parts[i].toLowerCase()] = true;
          else attrs[parts[i].slice(0, eq).toLowerCase()] = parts[i].slice(eq + 1);
        }
        cookieStore.set(name, value, {
          httpOnly: attrs["httponly"] === true,
          secure: attrs["secure"] === true,
          path: (attrs["path"] as string) ?? "/",
          sameSite: (attrs["samesite"] as "strict" | "lax" | "none") ?? "lax",
          ...(attrs["max-age"] && { maxAge: parseInt(attrs["max-age"] as string) }),
          ...(attrs["expires"] && { expires: new Date(attrs["expires"] as string) }),
        });
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
