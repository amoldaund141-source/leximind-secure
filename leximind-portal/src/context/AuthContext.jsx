import React, { createContext, useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import * as api from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("Lexi Guard_secure_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const login = async (username, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const authedUser = await api.login(username, password);
      sessionStorage.setItem("Lexi Guard_secure_session", JSON.stringify(authedUser));
      const meData = await api.getMe();
      const fullUser = { ...authedUser, allowedPages: meData.allowedPages, permissions: meData.permissions };
      sessionStorage.setItem("Lexi Guard_secure_session", JSON.stringify(fullUser));
      setUser(fullUser);
      return fullUser;
    } catch (err) {
      setAuthError(err.message || "Login failed.");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  
  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const authedUser = await api.register(userData);
      sessionStorage.setItem("Lexi Guard_secure_session", JSON.stringify(authedUser));
      setUser(authedUser);
      return authedUser;
    } catch (err) {
      setAuthError(err.message || "Registration failed.");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      const raw = sessionStorage.getItem("Lexi Guard_secure_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.refresh) {
          await api.logout(parsed.refresh);
        }
      }
    } catch (e) {
      console.error("Backend logout failed", e);
    }
    sessionStorage.removeItem("Lexi Guard_secure_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, allowedPages: user?.allowedPages || [], login, register, logout, authLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Generic guard for pages that live outside PortalLayout's own checks.
export function ProtectedRoute({ pageId, children }) {
  const { user, allowedPages } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (pageId && !allowedPages.includes(pageId)) return <Navigate to="/unauthorized" replace />;
  return children;
}
