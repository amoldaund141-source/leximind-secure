import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cx } from "../ui";

/* Generic verified / warning / failed / processing status pill used across
   documents, evidence, blockchain and integrity screens. */
export function SecurityStatusBadge({ status }) {
  const map = {
    VERIFIED: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    AUTHENTIC: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ACTIVE: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    RESOLVED: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PROCESSING: { icon: Clock, cls: "bg-blue-50 text-blue-700 border-blue-200" },
    "UNDER REVIEW": { icon: ShieldAlert, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    WARNING: { icon: ShieldAlert, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    OPEN: { icon: ShieldAlert, cls: "bg-amber-50 text-amber-700 border-amber-200" },
    FAILED: { icon: ShieldX, cls: "bg-red-50 text-red-700 border-red-200" },
    COMPROMISED: { icon: ShieldX, cls: "bg-red-50 text-red-700 border-red-200" },
    CRITICAL: { icon: ShieldX, cls: "bg-red-50 text-red-700 border-red-200" },
    CLOSED: { icon: ShieldCheck, cls: "bg-slate-100 text-slate-600 border-slate-200" },
  };
  const conf = map[status] || { icon: ShieldCheck, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  const Icon = conf.icon;
  return (
    <span className={cx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", conf.cls)}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export function ClassificationBadge({ level }) {
  const map = {
    "TOP SECRET": "bg-red-600 text-white",
    SECRET: "bg-red-100 text-red-800 border border-red-200",
    CONFIDENTIAL: "bg-amber-100 text-amber-800 border border-amber-200",
    RESTRICTED: "bg-violet-100 text-violet-800 border border-violet-200",
  };
  return <span className={cx("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase", map[level] || "bg-slate-100 text-slate-700")}>{level}</span>;
}

export function RoleBadge({ role }) {
  const map = {
    "Investigation Officer": "bg-cyan-100 text-cyan-800",
    "Forensic Analyst": "bg-violet-100 text-violet-800",
    "Legal Officer": "bg-amber-100 text-amber-800",
    "Supervisory Officer": "bg-blue-100 text-blue-800",
    "System Administrator": "bg-slate-800 text-white",
    System: "bg-slate-100 text-slate-600",
  };
  return <span className={cx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", map[role] || "bg-slate-100 text-slate-700")}>{role}</span>;
}

/* Blockchain hash + status readout, reused on the document vault card,
   integrity passport and blockchain verification pages. */
export function BlockchainStatus({ status, txId, compact = false }) {
  const verified = status === "VERIFIED";
  return (
    <div className={cx("flex items-center gap-2", compact && "text-xs")}>
      <SecurityStatusBadge status={status} />
      {txId && !compact && <span className="font-mono-data text-[11px] text-slate-400 truncate max-w-[140px]" title={txId}>{txId}</span>}
    </div>
  );
}

/* Side-by-side / stacked hash comparison used in Blockchain Verification
   and Document Integrity pages. */
export function HashComparison({ currentHash, registeredHash, matched }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Current Document Hash (SHA-256)</div>
        <div className="font-mono-data text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 break-all text-slate-700">{currentHash}</div>
      </div>
      <div className="flex items-center justify-center">
        <div className={cx("w-0.5 h-6", matched ? "bg-emerald-300" : "bg-red-300")} />
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Registered Blockchain Hash</div>
        <div className={cx("font-mono-data text-xs border rounded-lg px-3 py-2 break-all", matched ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>{registeredHash}</div>
      </div>
      <div className={cx("flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-sm", matched ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>
        {matched ? (
          <>🟢 BLOCKCHAIN VERIFIED</>
        ) : (
          <>🔴 VERIFICATION FAILED — Possible Unauthorized Modification Detected</>
        )}
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, trend, tone = "cyan" }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start justify-between">
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-data">{value}</div>
        {trend && (
          <div className={cx("flex items-center gap-1 text-xs mt-1.5 font-medium", trend.up ? "text-emerald-600" : "text-red-600")}>
            {trend.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend.label}
          </div>
        )}
      </div>
      <div className={cx("w-11 h-11 rounded-lg flex items-center justify-center shrink-0", tones[tone])}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
