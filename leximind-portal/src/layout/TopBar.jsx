import React, { useState } from "react";
import {
  ShieldHalf, Search, Globe, Bell, User, Settings as SettingsIcon, LogOut, Menu,
} from "lucide-react";
import { LANGUAGES } from "../data/mockData";
import { cx } from "../components/ui";

export default function TopBar({ role, userName, badge, onLogout, language, setLanguage, onMenu, onSearch, onNotif, unread, onProfile }) {
  const [searchVal, setSearchVal] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800">
      <div className="flex items-center gap-3 px-3 sm:px-5 h-16">
        <button onClick={onMenu} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
          <Menu className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-2.5 shrink-0" onClick={() => onProfile("dashboard")}>
          <div className="w-9 h-9 rounded-lg bg-cyan-500 flex items-center justify-center">
            <ShieldHalf className="w-5 h-5 text-slate-950" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-bold leading-tight tracking-wide">LexiMind Secure</div>
            <div className="text-[10px] text-slate-400 leading-tight">Secure · Verify · Trace · Investigate</div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 ml-2 text-xs font-medium text-cyan-300 shrink-0">
          <ShieldHalf className="w-3.5 h-3.5" />
          {role}
        </div>

        <div className="flex-1 hidden md:flex items-center bg-white/10 rounded-lg px-3 h-10 gap-2 max-w-xl mx-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(searchVal)}
            placeholder="Search cases, documents, evidence, entities…"
            className="bg-transparent outline-none text-sm placeholder:text-slate-400 flex-1 min-w-0"
          />
          <button onClick={() => onSearch(searchVal)} className="shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent outline-none text-white text-xs cursor-pointer [&>option]:text-slate-900"
            >
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button onClick={onNotif} title="Notifications" className="relative w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-slate-950" />}
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen((o) => !o)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:ring-2 hover:ring-cyan-500/50">
              <User className="w-4.5 h-4.5" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 animate-popin">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-sm font-semibold">{userName}</div>
                  <div className="text-xs text-slate-500">{role}{badge ? ` · ${badge}` : ""}</div>
                </div>
                <button onClick={() => { setProfileOpen(false); onProfile("settings"); }} className="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Settings</button>
                <button onClick={() => { setProfileOpen(false); onProfile("notifications"); }} className="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</button>
                <button onClick={() => { setProfileOpen(false); onLogout(); }} className="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"><LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center gap-2 px-3 pb-3">
        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2.5 py-1 text-[11px] font-medium text-cyan-300 shrink-0">
          <ShieldHalf className="w-3 h-3" /> {role}
        </div>
        <div className="flex-1 flex items-center bg-white/10 rounded-lg px-2.5 h-8 gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input value={searchVal} onChange={(e) => setSearchVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch(searchVal)} placeholder="Search…" className="bg-transparent outline-none text-xs placeholder:text-slate-400 flex-1 min-w-0" />
        </div>
      </div>
    </header>
  );
}
