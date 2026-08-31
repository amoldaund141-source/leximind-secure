import React, { useState, useCallback } from "react";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";

export const cx = (...a) => a.filter(Boolean).join(" ");

export function Button({ children, variant = "primary", size = "md", className = "", icon: Icon, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500";
  const sizes = { sm: "text-xs px-2.5 py-1.5", md: "text-sm px-4 py-2", lg: "text-sm px-5 py-2.5" };
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    accent: "bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm font-semibold",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...props}>
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", padded = true }) {
  return (
    <div className={cx("bg-white rounded-xl border border-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-md h-full", padded && "p-5", className)}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "slate", className = "" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    cyan: "bg-cyan-100 text-cyan-800",
    violet: "bg-violet-100 text-violet-700",
    navy: "bg-slate-900 text-white",
  };
  return <span className={cx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function SectionHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cx("animate-pulse bg-slate-200 rounded", className)} />;
}

export function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadein" onClick={onClose} />
      <div className={cx("relative bg-white rounded-2xl shadow-2xl w-full animate-popin max-h-[88vh] overflow-y-auto", width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
            active === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, dark = false }) {
  return (
    <label className="block">
      <span className={cx("block text-xs font-medium mb-1.5", dark ? "text-slate-300" : "text-slate-600")}>{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500";

/* ---- Toasts -------------------------------------------------------- */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, dismiss };
}

export function ToastStack({ toasts, dismiss }) {
  const icon = { success: CheckCircle2, error: XCircle, info: Info };
  const tone = { success: "border-emerald-200 bg-emerald-50 text-emerald-800", error: "border-red-200 bg-red-50 text-red-800", info: "border-blue-200 bg-blue-50 text-blue-800" };
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm">
      {toasts.map((t) => {
        const Icon = icon[t.type];
        return (
          <div key={t.id} className={cx("flex items-start gap-2 border rounded-lg px-4 py-3 shadow-lg animate-slidein text-sm", tone[t.type])}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{t.msg}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}

export function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
      @keyframes popin { from { opacity: 0; transform: scale(0.96) translateY(4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      @keyframes slidein { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: translateX(0) } }
      @keyframes slideinleft { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      @keyframes scanline { 0% { transform: translateY(-100%) } 100% { transform: translateY(100%) } }
      @keyframes pulseDot { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
      .animate-fadein { animation: fadein .15s ease-out; }
      .animate-popin { animation: popin .18s ease-out; }
      .animate-slidein { animation: slidein .2s ease-out; }
      .animate-slideinleft { animation: slideinleft .22s ease-out; }
      .animate-pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
      .font-mono-data { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      ::selection { background: #a5f3fc; }
    `}</style>
  );
}
