import React from "react";
import { X, ShieldHalf, ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_SECTIONS } from "../data/navConfig";
import { cx } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ page, setPage, role, mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { allowedPages } = useAuth();
  const content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((sec) => {
          const items = sec.items.filter((it) => (allowedPages || []).includes(it.id));
          if (items.length === 0) return null;
          return (
            <div key={sec.label}>
              {!collapsed && <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">{sec.label}</div>}
              <div className="space-y-0.5">
                {items.map((it) => {
                  const Icon = it.icon;
                  const active = page === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => { setPage(it.id); setMobileOpen(false); }}
                      title={collapsed ? it.label : undefined}
                      className={cx(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className={cx("w-4.5 h-4.5 shrink-0", active ? "text-cyan-400" : "text-slate-400")} />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-200 hidden lg:block">
        <button onClick={() => setCollapsed((c) => !c)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg py-2">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cx("hidden lg:flex flex-col shrink-0 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] transition-all duration-200", collapsed ? "w-[76px]" : "w-64")}>
        {content}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-slideinleft">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center"><ShieldHalf className="w-4 h-4 text-cyan-400" /></div>
                <span className="font-bold text-slate-900">LexiMind Secure</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
