// auth/context.tsx
"use client";

import { AuthenticatedUser, authenticateUser } from "@/lib/auth/auth";
import { hasPermission, OsucPermissions } from "@/lib/auth/permissions";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  isRoot: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
  isRoot: false,
});

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: AuthenticatedUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const alreadyResolved = initialUser !== undefined;
  const [user, setUser] = useState<AuthenticatedUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!alreadyResolved);
  const [isRoot, setIsRoot] = useState(
    initialUser ? hasPermission(initialUser, OsucPermissions.userIsRoot) : false
  );

  const refreshAuth = async () => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authenticateUser();
      setIsRoot(
        authenticatedUser ? hasPermission(authenticatedUser, OsucPermissions.userIsRoot) : false
      );
      setUser(authenticatedUser);
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alreadyResolved) return;
    const frame = requestAnimationFrame(() => refreshAuth());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isRoot: isRoot,
    refreshAuth,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export { AuthContext };
