export interface Career {
  id: number;
  name: string;
}

export interface Organization {
  id: number;
  name: string;
  display_name: string;
  role: string;
}

export interface TokenPayload {
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
