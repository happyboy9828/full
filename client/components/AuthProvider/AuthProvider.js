"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authApi, ApiError } from "@/lib/adminApi";

/**
 * Admin authentication context.
 *
 * Exposes the signed-in identity, its RBAC role and the effective permission
 * set. `hasPermission()` mirrors the server matrix so the UI can hide
 * controls the signed-in admin cannot use — but every action is re-checked
 * server-side, so hiding a button is a convenience, not enforcement.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyAuth = useCallback(async () => {
    try {
      const result = await authApi.me();
      if (result?.authenticated && result.user) {
        setUser(result.user);
        setError(null);
        return { authenticated: true, user: result.user };
      }
      setUser(null);
      return { authenticated: false, user: null };
    } catch (err) {
      // A 401 simply means "not signed in" — anything else is surfaced.
      if (err instanceof ApiError && err.isUnauthenticated) {
        setUser(null);
        return { authenticated: false, user: null };
      }
      setError(err?.message || "Could not verify the session");
      setUser(null);
      return { authenticated: false, user: null };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const result = await authApi.login(email, password);
      if (result?.success) {
        setUser(result.user || null);
        return { success: true, user: result.user };
      }
      return { success: false, error: result?.error || "Login failed" };
    } catch (err) {
      if (err instanceof ApiError && err.isRateLimited) {
        return {
          success: false,
          error: err.message || "Too many login attempts. Please try again later.",
        };
      }
      return { success: false, error: err?.message || "Login failed. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* the cookie is cleared client-side by the server response; ignore errors */
    } finally {
      setUser(null);
    }
  }, []);

  const permissions = useMemo(() => user?.permissions || [], [user]);

  const hasPermission = useCallback(
    (permission) => permissions.includes(permission),
    [permissions]
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      roleLabel: user?.roleLabel || null,
      permissions,
      hasPermission,
      authenticated: Boolean(user),
      loading,
      error,
      login,
      logout,
      verifyAuth,
      setUser,
    }),
    [user, permissions, hasPermission, loading, error, login, logout, verifyAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Permission constants — mirrors `backend/config/roles.js`.
 */
export { PERMISSIONS } from "@/lib/permissions";
