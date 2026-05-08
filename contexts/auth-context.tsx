"use client";

import React, { createContext, useContext, ReactNode } from "react";

export type UserRole = "admin" | "hr_staff" | "finance" | "marketer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinDate: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextType = {
    user: null,
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
