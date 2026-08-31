import React, { useEffect } from "react";
import { ShieldHalf } from "lucide-react";

export default function WelcomeOverlay({ name, role, onDone, holdMs = 1000 }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(onDone, reduceMotion ? 150 : holdMs);
    return () => clearTimeout(t);
  }, [onDone, holdMs]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center welcome-overlay-in">
      <div className="flex flex-col items-center text-center px-6">
        <div className="relative w-20 h-20 mb-5">
          <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="22" cy="22" r="20" fill="none" stroke="#164e63" strokeWidth="2" />
            <circle cx="22" cy="22" r="20" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" className="welcome-ring-draw" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center welcome-check-in">
            <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center">
              <ShieldHalf className="w-5 h-5 text-slate-950" />
            </div>
          </div>
        </div>
        <div className="welcome-check-in text-sm text-cyan-300 font-medium tracking-wide">Access Granted</div>
        <div className="welcome-check-in text-lg font-bold text-white mt-1">Welcome, {name.split(" ")[0]}</div>
        <div className="welcome-check-in text-xs text-slate-400 mt-1">{role} · Redirecting to Command Center…</div>
      </div>
    </div>
  );
}
