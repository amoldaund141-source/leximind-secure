import React, { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GlobalStyles, ToastStack, useToasts } from "../components/ui";
import { ROLE_PREFIX, NOTIFICATIONS_SEED } from "../data/mockData";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

import CommandCenter from "../pages/CommandCenter";
import VaultPage from "../pages/Vault";
import UploadPage from "../pages/Upload";
import ComparePage from "../pages/Compare";
import { CasesListPage, CaseDetailPage } from "../pages/Cases";
import EvidencePage from "../pages/Evidence";
import CustodyPage from "../pages/Custody";
import TimelinePage from "../pages/Timeline";
import AIIntelligencePage from "../pages/AIIntelligence";
import CaseQAPage from "../pages/CaseQA";
import InvestigationSearchPage from "../pages/InvestigationSearch";
import KnowledgeGraphPage from "../pages/KnowledgeGraph";
import ContradictionsPage from "../pages/Contradictions";
import BlockchainPage from "../pages/Blockchain";
import IntegrityPage from "../pages/Integrity";
import AlertsPage from "../pages/Alerts";
import AuditLedgerPage from "../pages/AuditLedger";
import UsersRolesPage from "../pages/UsersRoles";
import AccessControlPage from "../pages/AccessControl";
import SystemSettingsPage from "../pages/SystemSettings";
import NotificationsPage from "../pages/Notifications";
import SettingsPage from "../pages/Settings";

const VALID_PREFIXES = Object.values(ROLE_PREFIX);

export default function PortalLayout() {
  const { user, role, allowedPages, logout } = useAuth();
  const { rolePrefix, pageId: rawPageId, subId } = useParams();
  const pageId = rawPageId || "dashboard";
  const location = useLocation();
  const rrNavigate = useNavigate();

  const [language, setLanguage] = useState("English");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const { toasts, push, dismiss } = useToasts();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!VALID_PREFIXES.includes(rolePrefix) || rolePrefix !== ROLE_PREFIX[role]) {
    return <Navigate to="/unauthorized" replace />;
  }
  const allowed = allowedPages || [];
  if (!allowed.includes(pageId)) return <Navigate to="/unauthorized" replace />;

  const unread = notifications.filter((n) => !n.read).length;
  const navigate = (path) => { rrNavigate(`/${rolePrefix}/${path}`); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSearch = (q) => { setSearchQuery(q); navigate("search"); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <GlobalStyles />

      <TopBar
        role={role} userName={user.name} badge={user.badge}
        onLogout={() => { logout(); rrNavigate("/login", { replace: true }); }}
        language={language} setLanguage={setLanguage}
        onMenu={() => setMobileOpen(true)} onSearch={handleSearch}
        onNotif={() => navigate("notifications")} unread={unread} onProfile={navigate}
      />

      <div className="flex">
        <Sidebar page={pageId} setPage={navigate} role={role} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} collapsed={collapsed} setCollapsed={setCollapsed} />

        <main key={`${pageId}-${subId || ""}`} className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full animate-fadein">
          {pageId === "dashboard" && <CommandCenter role={role} userName={user.name} navigate={navigate} push={push} />}
          {pageId === "vault" && <VaultPage navigate={navigate} push={push} />}
          {pageId === "upload" && <UploadPage push={push} />}
          {pageId === "compare" && <ComparePage />}
          {pageId === "cases" && (subId ? <CaseDetailPage caseId={subId} navigate={navigate} /> : <CasesListPage navigate={navigate} push={push} />)}
          {pageId === "evidence" && <EvidencePage push={push} navigate={navigate} />}
          {pageId === "custody" && <CustodyPage push={push} />}
          {pageId === "timeline" && <TimelinePage />}
          {pageId === "ai-intelligence" && <AIIntelligencePage />}
          {pageId === "qa" && <CaseQAPage />}
          {pageId === "search" && <InvestigationSearchPage initialQuery={searchQuery} />}
          {pageId === "knowledge-graph" && <KnowledgeGraphPage />}
          {pageId === "contradictions" && <ContradictionsPage />}
          {pageId === "blockchain" && <BlockchainPage push={push} />}
          {pageId === "integrity" && <IntegrityPage push={push} />}
          {pageId === "alerts" && <AlertsPage />}
          {pageId === "audit" && <AuditLedgerPage />}
          {pageId === "users" && <UsersRolesPage push={push} />}
          {pageId === "access-control" && <AccessControlPage />}
          {pageId === "system-settings" && <SystemSettingsPage push={push} />}
          {pageId === "notifications" && <NotificationsPage notifications={notifications} setNotifications={setNotifications} />}
          {pageId === "settings" && <SettingsPage role={role} userName={user.name} badge={user.badge} language={language} setLanguage={setLanguage} push={push} />}
        </main>
      </div>

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
