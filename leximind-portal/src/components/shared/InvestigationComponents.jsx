import React from "react";
import {
  FolderKanban, Boxes, Users, FileText, ArrowRight, User, Sparkles, Siren,
  Package, MapPin, Building2, Phone, Hash as HashIcon,
} from "lucide-react";
import { cx } from "../ui";
import { ClassificationBadge, SecurityStatusBadge, RoleBadge } from "./StatusComponents";

export function CaseCard({ c, onOpen }) {
  return (
    <button onClick={() => onOpen?.(c)} className="text-left bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all p-5 flex flex-col gap-3 w-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-mono-data text-xs text-slate-400">
          <FolderKanban className="w-4 h-4 text-cyan-500" /> {c.id}
        </div>
        <ClassificationBadge level={c.classification} />
      </div>
      <div className="text-sm font-semibold text-slate-900 leading-snug">{c.title}</div>
      <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
        <SecurityStatusBadge status={c.status} />
        <span className="text-slate-300">·</span>
        <span>{c.documentCount} docs</span>
        <span className="text-slate-300">·</span>
        <span>{c.evidenceCount} evidence</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500 border-t border-slate-100 pt-2.5 mt-1">
        <Users className="w-3.5 h-3.5 text-slate-400" />
        <span className="truncate">{c.assignedOfficers.join(", ")}</span>
      </div>
    </button>
  );
}

export function EvidenceCard({ e, onOpen }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-mono-data text-xs text-cyan-700 bg-cyan-50 rounded-lg px-2 py-1">
          <Package className="w-3.5 h-3.5" /> {e.id}
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{e.type}</span>
      </div>
      <p className="text-sm text-slate-800">{e.description}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600">
        <div className="text-slate-400">Case</div><div className="font-mono-data truncate">{e.caseId}</div>
        <div className="text-slate-400">Source</div><div className="truncate">{e.source}</div>
        <div className="text-slate-400">Custodian</div><div className="truncate">{e.custodian}</div>
        <div className="text-slate-400">Added</div><div>{e.dateAdded}</div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <SecurityStatusBadge status={e.integrityStatus} />
        <SecurityStatusBadge status={e.blockchainStatus} />
      </div>
      {onOpen && (
        <button onClick={() => onOpen(e)} className="text-xs font-medium text-cyan-700 hover:text-cyan-900 flex items-center gap-1 mt-1">
          View details <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function CustodyTimeline({ events }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-slate-200" />
      <div className="space-y-6">
        {events.map((ev, i) => (
          <div key={ev.id} className="relative">
            <div className={cx("absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full border-2 border-white ring-2", ev.verificationStatus === "VERIFIED" ? "bg-emerald-500 ring-emerald-200" : "bg-amber-500 ring-amber-200")} style={{ width: 18, height: 18 }} />
            <div className="bg-white rounded-lg border border-slate-200 p-3.5">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-slate-900">{ev.action}</span>
                <span className="text-xs text-slate-400">{ev.timestamp}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{ev.targetName}</div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <RoleBadge role={ev.role} />
                <span className="text-slate-400">by {ev.user}</span>
              </div>
              {ev.fromCustodian !== ev.toCustodian && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <span className="font-medium">{ev.fromCustodian}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-medium">{ev.toCustodian}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditTimeline({ logs }) {
  return (
    <div className="divide-y divide-slate-100">
      {logs.map((l) => (
        <div key={l.id} className="py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-900">{l.event}</span>
              <span className="text-xs text-slate-400">{l.timestamp}</span>
            </div>
            <div className="text-xs text-slate-500 truncate">{l.target}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RoleBadge role={l.role} />
              <span className="text-xs text-slate-400">{l.actor}</span>
              {l.txId !== "—" && <span className="text-[11px] font-mono-data text-slate-300 truncate max-w-[160px]">{l.txId}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ENTITY_ICON = { person: User, organization: Building2, location: MapPin, phone: Phone, caseRef: HashIcon };
export function EntityBadge({ type, label }) {
  const Icon = ENTITY_ICON[type] || User;
  const tones = {
    person: "bg-cyan-50 text-cyan-800 border-cyan-200",
    organization: "bg-violet-50 text-violet-800 border-violet-200",
    location: "bg-emerald-50 text-emerald-800 border-emerald-200",
    phone: "bg-amber-50 text-amber-800 border-amber-200",
    caseRef: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1 font-medium", tones[type] || tones.caseRef)}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

export function AIInsightCard({ title, children, icon: Icon = Sparkles }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-cyan-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-600" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export function SecurityAlertCard({ a }) {
  const sev = {
    CRITICAL: { dot: "🔴", cls: "border-red-200 bg-red-50" },
    WARNING: { dot: "🟠", cls: "border-amber-200 bg-amber-50" },
    RESOLVED: { dot: "🟢", cls: "border-emerald-200 bg-emerald-50" },
    INFO: { dot: "🔵", cls: "border-blue-200 bg-blue-50" },
  };
  const conf = sev[a.severity] || sev.INFO;
  return (
    <div className={cx("rounded-xl border p-4", conf.cls)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>{conf.dot}</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{a.severity}</span>
        </div>
        <span className="text-xs text-slate-400">{a.timestamp}</span>
      </div>
      <div className="text-sm font-semibold text-slate-900 mt-1.5">{a.title}</div>
      <p className="text-xs text-slate-600 mt-1">{a.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] font-mono-data text-slate-500">{a.target}</span>
        <SecurityStatusBadge status={a.status} />
      </div>
    </div>
  );
}
