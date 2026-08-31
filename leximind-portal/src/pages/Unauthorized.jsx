import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GlobalStyles, Card, Button } from "../components/ui";
import { ROLE_PREFIX } from "../data/mockData";

export default function UnauthorizedPage() {
  const { role } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <GlobalStyles />
      <Card className="max-w-md w-full text-center py-10">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-xs mx-auto">
          Your {role || "current"} account doesn't have clearance to view that page.
        </p>
        <Link to={role ? `/${ROLE_PREFIX[role]}/dashboard` : "/login"}>
          <Button variant="accent" className="mt-5" icon={ArrowLeft}>Back to my dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
