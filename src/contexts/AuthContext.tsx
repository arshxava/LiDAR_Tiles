"use client";
 
import type { User, Role } from "@/types";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
 
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: Role) => void;
  logout: () => void;
  register: (email: string, role: Role) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}
 
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
 
const MOCK_USERS: User[] = [
  {
    id: "admin1",
    email: "admin@example.com",
    role: "SUPER_ADMIN",
    name: "Super Admin",
  },
  { id: "user1", email: "user@example.com", role: "USER", name: "End User" },
  {
    id: "user2",
    email: "kaurarshdeep1100@gmail.com",
    role: "SUPER_ADMIN",
    name: "kaurarshdeep1100",
  },
];
 
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
 
  useEffect(() => {
    const storedUser = localStorage.getItem("lidarUser");
    const storedToken = localStorage.getItem("lidarToken");
 
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
 
    if (storedToken) {
      setToken(storedToken);
    }
 
    setLoading(false);
  }, []);
  const setUserWithStorage = (user: User) => {
    localStorage.setItem("lidarUser", JSON.stringify(user));
    setUser(user);
  };
 
  const setTokenWithStorage = (token: string) => {
    localStorage.setItem("lidarToken", token);
    setToken(token);
  };
 
  useEffect(() => {
    if (loading) return;
 
    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.includes(pathname);
 
    if (!user && !isPublicPath) {
      router.push("/login");
    } else if (user && isPublicPath) {
      router.push(user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } else if (user && pathname === "/") {
      router.push(user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    }
  }, [user, loading, pathname, router]);
 
  const login = (email: string, role: Role) => {
    // In a real app, you'd validate credentials against a backend
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.role === role
    );
    if (foundUser) {
      localStorage.setItem("lidarUser", JSON.stringify(foundUser));
      setUser(foundUser);
      router.push(foundUser.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } else {
      // Simulate user not found or incorrect role for mock
      const potentialUser = MOCK_USERS.find((u) => u.email === email);
      if (potentialUser && potentialUser.role !== role) {
        throw new Error(
          `User found, but role mismatch. Expected ${potentialUser.role}.`
        );
      }
      throw new Error("Invalid credentials or role.");
    }
  };
 
  const register = (email: string, role: Role) => {
    // In a real app, you'd save the new user to a backend
    const newUser: User = {
      id: Date.now().toString(),
      email,
      role,
      name: email.split("@")[0],
    };
    MOCK_USERS.push(newUser); // Add to mock users for current session
    localStorage.setItem("lidarUser", JSON.stringify(newUser));
    setUser(newUser);
    router.push(newUser.role === "SUPER_ADMIN" ? "/admin" : "/dashboard");
  };
 
  const logout = () => {
    localStorage.removeItem("lidarUser");
    setUser(null);
    router.push("/login");
  };
 
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        setUser: setUserWithStorage,
        setToken: setTokenWithStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
 
 