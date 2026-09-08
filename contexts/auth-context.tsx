"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as authApi from "@/lib/api/auth";
import { getStoredToken, setStoredToken, onAuthExpired, type AuthRealm } from "@/lib/api/client";
import type { ManagementUser } from "@/lib/api/types";
import type { Role } from "@/lib/rbac";
import { getPagesForRole, canAccessPath } from "@/lib/rbac";

export type { Role };
export type User = ManagementUser;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User>;
  hasAccess: (pathname: string) => boolean;
  pages: ReturnType<typeof getPagesForRole>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Guards against a corrupted or outdated cached user (e.g. left over from an
 * earlier session shape, or a partial write) reaching the rest of the app as
 * if it were a real, fully-formed user — which crashes anything that assumes
 * fields like `name` are always present (see the "Cannot read properties of
 * undefined (reading 'split')" class of bug).
 */
function isValidCachedUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.id === "string" &&
    typeof u.firstName === "string" &&
    typeof u.lastName === "string" &&
    typeof u.email === "string" &&
    typeof u.role === "string"
  );
}

/**
 * `realm` scopes this provider to its own token + cached user, independent of any
 * other AuthProvider elsewhere in the tree. The root layout mounts one for
 * `realm="storefront"`; `app/(internal)/layout.tsx` nests a second one for
 * `realm="internal"` around the management + marketer route groups, which shadows
 * the outer provider for everything under them.
 */
export function AuthProvider({ realm, children }: { realm: AuthRealm; children: ReactNode }) {
  const userStorageKey = `el-moore-${realm}-user`;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken(realm);
    const cachedUser = window.localStorage.getItem(userStorageKey);
    if (token && cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        if (isValidCachedUser(parsed)) {
          setUser(parsed);
        } else {
          throw new Error("Cached user is missing required fields.");
        }
      } catch {
        setStoredToken(null, realm);
        window.localStorage.removeItem(userStorageKey);
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);

  // If a background request's silent token refresh fails (the refresh-token
  // cookie itself expired), drop the stale in-memory user right away instead of
  // leaving the UI looking signed in while every request keeps 401ing.
  useEffect(() => {
    return onAuthExpired((expiredRealm) => {
      if (expiredRealm !== realm) return;
      window.localStorage.removeItem(userStorageKey);
      setUser(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    setStoredToken(token, realm);
    window.localStorage.setItem(userStorageKey, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    await authApi.logout();
    setStoredToken(null, realm);
    window.localStorage.removeItem(userStorageKey);
    setUser(null);
  };

  const refreshProfile = async () => {
    const freshUser = await authApi.fetchProfile();
    window.localStorage.setItem(userStorageKey, JSON.stringify(freshUser));
    setUser(freshUser);
    return freshUser;
  };

  const hasAccess = (pathname: string) => canAccessPath(user?.role, pathname);
  const pages = getPagesForRole(user?.role);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshProfile,
    hasAccess,
    pages,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
