import React, { useState, useEffect } from "react";
import {
  Vault, ShieldCheck, FolderKanban, Siren, ArrowRight, Link2, FileText,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SectionHeader, Card } from "../components/ui";
import { MetricCard, SecurityStatusBadge } from "../components/shared/StatusComponents";
import { CaseCard, SecurityAlertCard } from "../components/shared/InvestigationComponents";
import api from "../services/api";

const VERIFICATION_TREND = [
  { day: "Mon", verified: 172 }, { day: "Tue", verified: 190 }, { day: "Wed", verified: 205 },
  { day: "Thu", verified: 188 }, { day: "Fri", verified: 224 }, { day: "Sat", verified: 141 },
  { day: "Sun", verified: 97 },
];

export default function CommandCenter({ role, userName, navigate }) {
  const [activeCases, setActiveCases] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentCustody, setRecentCustody] = useState([]);
  const [openAlerts, setOpenAlerts] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    api.getCases().then(res => setActiveCases((res || []).filter(c => c.status === "ACTIVE"))).catch(()=>{});
    api.getDocuments().then(res => setRecentDocs((res || []).slice(0, 5))).catch(()=>{});
    api.getCustodyEvents().then(res => setRecentCustody((res || []).slice(0, 5))).catch(()=>{});
    api.getSecurityAlerts().then(res => setOpenAlerts((res || []).filter(a => a.status !== "RESOLVED").slice(0, 3))).catch(()=>{});
    api.getAuditLog().then(res => setAuditLog((res || []).slice(0, 5))).catch(()=>{});
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ShieldCheck}
        title={`Security Command Center`}
        subtitle={`Welcome back, ${userName} — ${role}. Here is the current investigation & security posture.`}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Vault} label="Secure Documents" value="1,248" trend={{ up: true, label: "+34 this week" }} tone="cyan" />
        <MetricCard icon={ShieldCheck} label="Blockchain Verified" value="1,187" trend={{ up: true, label: "95.1% coverage" }} tone="emerald" />
        <MetricCard icon={FolderKanban} label="Active Investigations" value="42" trend={{ up: true, label: "+3 this month" }} tone="cyan" />
        <MetricCard icon={Siren} label="Security Alerts" value={openAlerts.length.toString().padStart(2, "0")} trend={{ up: false, label: `${openAlerts.length} critical, open` }} tone="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionHeader title="Blockchain Verification Activity" subtitle="Documents verified against on-chain hash, last 7 days" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VERIFICATION_TREND}>
                <defs>
                  <linearGradient id="verGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="verified" stroke="#0891b2" strokeWidth={2} fill="url(#verGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Security Alerts" action={<button onClick={() => navigate("alerts")} className="text-xs font-medium text-cyan-700 flex items-center gap-1">All alerts <ArrowRight className="w-3.5 h-3.5" /></button>} />
          <div className="space-y-3">
            {openAlerts.map((a) => <SecurityAlertCard key={a.id} a={a} />)}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Active Investigations" action={<button onClick={() => navigate("cases")} className="text-xs font-medium text-cyan-700 flex items-center gap-1">Case Management <ArrowRight className="w-3.5 h-3.5" /></button>} />
          <div className="grid sm:grid-cols-2 gap-3">
            {activeCases.map((c) => <CaseCard key={c.id || c.case_id} c={c} onOpen={() => navigate(`cases/${c.id || c.case_id}`)} />)}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Recent Secure Documents" action={<button onClick={() => navigate("vault")} className="text-xs font-medium text-cyan-700 flex items-center gap-1">Document Vault <ArrowRight className="w-3.5 h-3.5" /></button>} />
          <div className="divide-y divide-slate-100">
            {recentDocs.map((d) => (
              <button key={d.id} onClick={() => navigate("vault")} className="w-full text-left py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.case_id || d.caseId} · {d.upload_date ? d.upload_date.split("T")[0] : d.uploadedAt}</div>
                  </div>
                </div>
                <SecurityStatusBadge status={d.blockchain_status || d.blockchainStatus} />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Recent Chain-of-Custody Activity" action={<button onClick={() => navigate("custody")} className="text-xs font-medium text-cyan-700 flex items-center gap-1">Full timeline <ArrowRight className="w-3.5 h-3.5" /></button>} />
          <div className="divide-y divide-slate-100">
            {recentCustody.map((c) => (
              <button key={c.id} onClick={() => navigate("custody")} className="w-full text-left py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{c.action || "Custody Transferred"}</div>
                    <div className="text-xs text-slate-400 truncate">{c.object_id || c.targetName} · {c.user_name || c.user}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{c.timestamp ? new Date(c.timestamp).toLocaleDateString() : ""}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Recent Security Events" action={<button onClick={() => navigate("audit")} className="text-xs font-medium text-cyan-700 flex items-center gap-1">Audit ledger <ArrowRight className="w-3.5 h-3.5" /></button>} />
          <div className="divide-y divide-slate-100">
            {auditLog.map((l) => (
              <button key={l.id} onClick={() => navigate("audit")} className="w-full text-left py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{l.action || l.event}</div>
                  <div className="text-xs text-slate-400 truncate">{l.user_name || l.actor} · {l.target_str || l.target}</div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{l.timestamp ? new Date(l.timestamp).toLocaleDateString() : ""}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
