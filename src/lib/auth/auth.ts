"use server";
import { cookies } from "next/headers";

interface Organization {
  id: number;
  name: string;
  role: string;
}

interface AuthUserData {
  message: string;
  permissions: string[];
  userId: string;
  organizations: Organization[];
}

export interface AuthenticatedUser {
  isAuthenticated: true;
  userId: string;
  permissions: string[];
  organizations: Organization[];
  message: string;
}

export async function authenticateUser(): Promise<AuthenticatedUser | null> {
  // Lógica para autenticar al usuario
  const cookieStore = await cookies();
  const token = cookieStore.get("osucookie")?.value;

  if (!token) {
    return null; // Usuario no autenticado
  }

  // Verificar el token y obtener la información del usuario
  try {
    const response = await fetch("https://auth.osuc.dev/api", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData: AuthUserData = await response.json();
      return {
        isAuthenticated: true,
        userId: userData.userId,
        permissions: userData.permissions,
        organizations: userData.organizations,
        message: userData.message,
      };
    } else {
      // Token inválido o expirado
      console.error("Token validation failed:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
