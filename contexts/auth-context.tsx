"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "hr_staff" | "finance" | "marketer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinDate: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: "user-001",
    name: "John Doe",
    email: "john.doe@elmoore.com",
    role: "admin",
    joinDate: "2024-01-15",
    avatar: "/assets/avatar.jpg",
  });

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({
        ...user,
        role,
      });
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    switchRole,
    isAdmin: user?.role === "admin",
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
