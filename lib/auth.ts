// Better Auth Configuration for Owuan Commerce
// This is a client-side only auth setup for demo purposes

import { createAuthClient } from 'better-auth/react';

// Create auth client - for demo, we use a mock setup
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession
} = authClient;

// Demo user type
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
}

// Auth types
export interface Session {
  user: User | null;
  session: {
    id: string;
    expiresAt: Date;
  } | null;
}
