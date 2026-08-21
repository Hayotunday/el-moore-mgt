"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import { getStoredToken, setStoredToken } from "@/lib/api/client";
import type { ManagementUser } from "@/lib/api/types";
import type { Role } from "@/lib/rbac";
import { getPagesForRole, canAccessPath } from "@/lib/rbac";

export type { Role };
export type User = ManagementUser;

const USER_STORAGE_KEY = "el-moore-user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasAccess: (pathname: string) => boolean;
  pages: ReturnType<typeof getPagesForRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const cachedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (token && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser) as User);
      } catch {
        setStoredToken(null);
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    setStoredToken(token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    setStoredToken(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const hasAccess = (pathname: string) => canAccessPath(user?.role, pathname);
  const pages = getPagesForRole(user?.role);

  const value: AuthContextType = { user, isLoading, login, logout, hasAccess, pages };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
