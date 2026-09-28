"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  permissions: string[];
}

interface PermissionsContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      // En una app real acá harías un fetch a /api/v1/auth/me
      // Simulamos que el usuario tiene un ID y email por ahora
      const storedUser = Cookies.get("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Dummy data if not found
        setUser({
          id: "1",
          email: "usuario@ejemplo.com",
          permissions: []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      Cookies.set("user", JSON.stringify(newUser));
    } else {
      Cookies.remove("user");
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("auth_token");
    Cookies.remove("user");
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <PermissionsContext.Provider
      value={{
        user,
        setUser: handleSetUser,
        isAuthenticated: !!user,
        hasPermission,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
