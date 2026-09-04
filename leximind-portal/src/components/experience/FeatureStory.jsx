import React from "react";
import {
  Vault, Search, ShieldAlert, Link2, KeyRound, History, CheckCircle2, XCircle,
  Sparkles, Lock,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { cx } from "../ui";

export const FEATURES = [
  {
    id: "vault",
    icon: Vault,
    title: "Secure Document Vault",
    tag: "AES-256 · Encrypted at rest",
    desc: "Every document is sealed the moment it enters LexiMind — AES-256 encrypted, hash-fingerprinted, and stored behind role-gated access. Nothing leaves the vault unlogged.",
  },
  {
    id: "ai",
    icon: Search,
    title: "AI-Powered Search & Analysis",
    tag: "Entity extraction · Summarization",
    desc: "Ask a question in plain language and LexiMind reads across every authorized document — surfacing people, dates, locations and connections in seconds, always with cited sources.",
  },
  {
    id: "tamper",
    icon: ShieldAlert,
    title: "Tamper Detection",
    tag: "SHA-256 hash comparison",
    desc: "Every access silently re-verifies a document's cryptographic hash against its blockchain record. The instant a byte changes, the mismatch is flagged — no exceptions.",
  },
  {
    id: "audit",
    icon: Link2,
    title: "Blockchain Audit Trail",
    tag: "Immutable · Timestamped",
    desc: "Uploads, verifications, transfers and access events are anchored to an append-only ledger. What happened, who did it, and when — permanently provable.",
  },
  {
    id: "access",
    icon: KeyRound,
    title: "Role-Based Access",
    tag: "Officer · Analyst · Legal · Admin",
    desc: "Investigation Officers, Forensic Analysts, Legal Officers, Supervisors and Administrators each see exactly what their clearance allows — enforced at every layer.",
  },
  {
    id: "timeline",
    icon: History,
    title: "Investigation Timeline",
    tag: "Auto-reconstructed",
    desc: "LexiMind stitches dates and events extracted from case documents into a single chronological narrative — turning scattered paperwork into an investigative story.",
  },
];

function FeatureVisual({ id }) {
  if (id === "vault") {
    return (
      <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 scan-sweep bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-1/2" />
        <div className="relative w-24 h-24 rounded-2xl border-2 border-cyan-400/50 bg-slate-950 flex items-center justify-center animate-glow-pulse">
          <Lock className="w-9 h-9 text-cyan-300" />
        </div>
        <span className="absolute bottom-4 right-4 text-[10px] font-mono-data text-cyan-300/80 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-2.5 py-1">AES-256 ✓</span>
        <span className="absolute top-4 left-4 text-[10px] font-mono-data text-slate-400">FIR_2026_0142.pdf</span>
      </div>
    );
  }
  if (id === "ai") {
    return (
      <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 overflow-hidden p-5">
        <div className="space-y-2">
          {[85, 65, 92, 50].map((w, i) => (
            <div key={i} className="h-2.5 rounded-full bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="absolute inset-x-5 top-5 h-0.5 bg-cyan-400/70 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)] scan-sweep" />
        <div className="flex flex-wrap gap-1.5 mt-5">
          {["Rakesh Bansal", "09 Aug 2026", "₹42,00,000"].map((chip) => (
            <span key={chip} className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 rounded-full px-2 py-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />{chip}</span>
          ))}
        </div>
      </div>
    );
  }
  if (id === "tamper") {
    return (
      <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-5 flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono-data text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> A8C7D8F8…E5B2C9A
        </div>
        <div className="text-center text-[10px] text-slate-500">vs. registered blockchain hash</div>
        <div className="flex items-center gap-2 text-[11px] font-mono-data text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 animate-glow-pulse">
          <XCircle className="w-3.5 h-3.5 shrink-0" /> B91F3E12…D9C2F5
        </div>
      </div>
    );
  }
  if (id === "audit") {
    return (
      <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 flex items-center justify-center gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="w-12 h-12 rounded-xl border border-cyan-400/40 bg-slate-950 flex items-center justify-center shrink-0">
              <Link2 className="w-4.5 h-4.5 text-cyan-300" />
            </div>
            {i < 3 && <div className="w-6 h-px bg-cyan-400/30 relative overflow-hidden"><div className="absolute inset-y-0 w-2 bg-cyan-300 flow-right" /></div>}
          </React.Fragment>
        ))}
      </div>
    );
  }
  if (id === "access") {
    const roles = ["IO", "FA", "LO", "SO", "SA"];
    return (
      <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/50 bg-slate-950 flex items-center justify-center animate-glow-pulse z-10">
          <KeyRound className="w-6 h-6 text-cyan-300" />
        </div>
        {roles.map((r, i) => {
          const angle = (i / roles.length) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * 85, y = Math.sin(angle) * 60;
          return (
            <span key={r} className="absolute text-[10px] font-bold text-cyan-300 bg-slate-950 border border-cyan-400/30 rounded-full w-8 h-8 flex items-center justify-center" style={{ transform: `translate(${x}px, ${y}px)` }}>{r}</span>
          );
        })}
      </div>
    );
  }
  // timeline
  return (
    <div className="relative w-full h-56 rounded-2xl border border-cyan-400/20 bg-slate-900/60 flex items-center px-8">
      <div className="w-full h-px bg-white/10 relative">
        {[10, 32, 55, 78, 95].map((left, i) => (
          <span key={i} className="absolute -top-1.5 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.6)] animate-glow-pulse" style={{ left: `${left}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function FeatureStory() {
  return (
    <div className="space-y-28 lg:space-y-36">
      {FEATURES.map((f, i) => {
        const reverse = i % 2 === 1;
        return (
          <div key={f.id} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal delay={0} className={reverse ? "lg:order-2" : "lg:order-1"}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-data text-cyan-300/80 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-4">{f.tag}</span>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-cyan-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{f.title}</h3>
              <p className="text-slate-400 mt-3 leading-relaxed max-w-md">{f.desc}</p>
            </Reveal>
            <Reveal delay={150} className={reverse ? "lg:order-1" : "lg:order-2"}>
              <FeatureVisual id={f.id} />
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
