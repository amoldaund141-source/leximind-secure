import React from "react";
import { FileText, Lock, User, Calendar, GitBranch, Fingerprint, ShieldCheck, Eye, History, Link2 } from "lucide-react";
import { cx, Button } from "../ui";
import { ClassificationBadge, SecurityStatusBadge } from "./StatusComponents";

export function DocumentCard({ doc, onOpen }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate" title={doc.name}>{doc.name}</div>
            <div className="text-xs text-slate-500">{doc.type} · v{doc.version}</div>
          </div>
        </div>
        <ClassificationBadge level={doc.classification} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-600">
        <div className="text-slate-400">Case</div><div className="font-mono-data text-slate-700 truncate">{doc.caseId}</div>
        <div className="text-slate-400">Uploaded by</div><div className="truncate">{doc.uploadedBy}</div>
        <div className="text-slate-400">Timestamp</div><div>{doc.uploadedAt}</div>
        <div className="text-slate-400">Custodian</div><div className="truncate">{doc.custodian}</div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
        <Lock className="w-3.5 h-3.5" /> Encryption: {doc.encryption} ✓
      </div>

      <div className="text-[11px] text-slate-400 font-mono-data truncate" title={doc.sha256}>SHA-256: {doc.sha256.slice(0, 16)}…</div>

      <div className="flex items-center gap-2 flex-wrap">
        <SecurityStatusBadge status={doc.blockchainStatus} />
        <SecurityStatusBadge status={doc.integrityStatus} />
      </div>

      <Button variant="outline" size="sm" icon={Eye} onClick={() => onOpen?.(doc)} className="mt-1 w-full justify-center">
        View Integrity Passport
      </Button>
    </div>
  );
}

export function IntegrityPassport({ doc, onVerify, onViewBlockchain, onViewCustody, onViewAudit }) {
  if (!doc) return null;
  const rows = [
    { label: "Document", value: doc.name, icon: FileText },
    { label: "Encryption", value: doc.encryption, icon: Lock },
    { label: "SHA-256", value: doc.sha256, icon: Fingerprint, mono: true },
    { label: "Custodian", value: doc.custodian, icon: User },
    { label: "Version", value: doc.version, icon: GitBranch },
    { label: "Upload Time", value: doc.uploadedAt, icon: Calendar },
  ];
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold tracking-wide">Evidence Integrity Passport</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 relative">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              <r.icon className="w-3 h-3" /> {r.label}
            </div>
            <div className={cx("text-sm text-slate-100 break-all", r.mono && "font-mono-data text-xs")}>{r.value}</div>
          </div>
        ))}
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Blockchain</div>
          <SecurityStatusBadge status={doc.blockchainStatus} />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Integrity</div>
          <SecurityStatusBadge status={doc.integrityStatus} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-5 relative">
        <Button variant="accent" size="sm" icon={ShieldCheck} onClick={onVerify}>Verify Integrity</Button>
        <Button variant="subtle" size="sm" icon={Link2} onClick={onViewBlockchain} className="!bg-white/10 !text-white hover:!bg-white/20">View Blockchain</Button>
        <Button variant="subtle" size="sm" icon={History} onClick={onViewCustody} className="!bg-white/10 !text-white hover:!bg-white/20">View Custody</Button>
        <Button variant="subtle" size="sm" icon={FileText} onClick={onViewAudit} className="!bg-white/10 !text-white hover:!bg-white/20">Audit History</Button>
      </div>
    </div>
  );
}

export function SourceReference({ name }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg px-2.5 py-1 font-medium">
      <FileText className="w-3.5 h-3.5" /> {name}
    </span>
  );
}
