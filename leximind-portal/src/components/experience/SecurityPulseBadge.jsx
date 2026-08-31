import React, { useEffect, useState } from "react";
import { ShieldCheck, Fingerprint, Lock, Link2 } from "lucide-react";

const STATUSES = [
  { icon: Lock, text: "Establishing secure session…" },
  { icon: Fingerprint, text: "Verifying device fingerprint…" },
  { icon: ShieldCheck, text: "AES-256 handshake complete" },
  { icon: Link2, text: "Blockchain ledger synced ✓" },
];

export default function SecurityPulseBadge({ className = "" }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const id = setInterval(() => setI((n) => (n + 1) % STATUSES.length), 2400);
    return () => clearInterval(id);
  }, []);

  const Current = STATUSES[i].icon;

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 ${className}`}>
      <div className="relative w-8 h-8 shrink-0">
        <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full login-ring-spin">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#164e63" strokeWidth="1.4" strokeDasharray="2 6" />
        </svg>
        <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full login-ring-spin-rev">
          <circle cx="18" cy="18" r="12" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="1 8" />
        </svg>
        <div className="absolute inset-[6px] rounded-full bg-slate-950 border border-cyan-400/40 flex items-center justify-center login-ring-pulse">
          <Current className="w-3.5 h-3.5 text-cyan-300" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Connection Integrity</div>
        <div key={i} className="login-status-line text-xs text-cyan-200 font-medium truncate">{STATUSES[i].text}</div>
      </div>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 login-ring-pulse" />
    </div>
  );
}
