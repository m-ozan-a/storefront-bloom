"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { signIn as apiSignIn, signUp as apiSignUp, getMe } from "@/actions";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function restoreSession(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("owuan-user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => restoreSession());
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await apiSignIn(email, password);
      const userData: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      };
      setUser(userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("owuan-user", JSON.stringify(userData));
        localStorage.setItem("owuan-auth-token", result.token);
      }
    } catch (e) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("owuan-user");
        localStorage.removeItem("owuan-auth-token");
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        const result = await apiSignUp(email, password, name);
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        };
        setUser(userData);
        if (typeof window !== "undefined") {
          localStorage.setItem("owuan-user", JSON.stringify(userData));
          localStorage.setItem("owuan-auth-token", result.token);
        }
      } catch (e) {
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("owuan-user");
      localStorage.removeItem("owuan-auth-token");
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
