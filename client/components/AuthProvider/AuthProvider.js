"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { checkAuth } from "@/lib/analyticsApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    try {
      const { authenticated: isAuth } = await checkAuth();
      setAuthenticated(isAuth);
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = useCallback(async (password) => {
    const { apiAuth } = await import("@/lib/analyticsApi");
    const res = await apiAuth("/login", { method: "POST", body: { password } });
    if (res.json?.authenticated) {
      setAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: res.json?.error || "Login failed" };
  }, []);

  const logout = useCallback(async () => {
    const { apiAuth } = await import("@/lib/analyticsApi");
    await apiAuth("/logout", { method: "POST" });
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout, verifyAuth }}>
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