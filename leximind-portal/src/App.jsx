import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROLE_PREFIX } from "./data/mockData";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import UnauthorizedPage from "./pages/Unauthorized";
import PortalLayout from "./layout/PortalLayout";

/* Sends "/" and any unknown URL to the right place: logged out -> /login,
   logged in -> their own role's dashboard. */
function RootRedirect() {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${ROLE_PREFIX[role]}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/:rolePrefix" element={<PortalLayout />} />
          <Route path="/:rolePrefix/:pageId" element={<PortalLayout />} />
          <Route path="/:rolePrefix/:pageId/:subId" element={<PortalLayout />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
