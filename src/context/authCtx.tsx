// auth/context.tsx
"use client";

import { AuthenticatedUser, authenticateUser } from "@/lib/auth/auth";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthenticatedUser | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authenticateUser();
      setUser(authenticatedUser);
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar si no hay usuario inicial
  useEffect(() => {
    if (!initialUser && !user) {
      refreshAuth();
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshAuth,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export { AuthContext };
