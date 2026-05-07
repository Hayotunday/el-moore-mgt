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

// Mock profiles for different roles
const mockProfiles: Record<UserRole, User> = {
  admin: {
    id: "admin-001",
    name: "Chioma Okafor",
    email: "chioma.okafor@elmoore.com",
    role: "admin",
    joinDate: "2023-06-10",
    avatar: "/assets/avatar.jpg",
  },
  hr_staff: {
    id: "hr-001",
    name: "Emeka Udoka",
    email: "emeka.udoka@elmoore.com",
    role: "hr_staff",
    joinDate: "2023-08-22",
    avatar: "/assets/avatar.jpg",
  },
  finance: {
    id: "fin-001",
    name: "Amara Mensah",
    email: "amara.mensah@elmoore.com",
    role: "finance",
    joinDate: "2023-09-05",
    avatar: "/assets/avatar.jpg",
  },
  marketer: {
    id: "mark-001",
    name: "Kwame Boateng",
    email: "kwame.boateng@elmoore.com",
    role: "marketer",
    joinDate: "2024-02-14",
    avatar: "/assets/avatar.jpg",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockProfiles.admin);

  const switchRole = (role: UserRole) => {
    setUser(mockProfiles[role]);
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
