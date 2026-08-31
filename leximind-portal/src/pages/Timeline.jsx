import React, { useState } from "react";
import { History, FileText, User } from "lucide-react";
import { SectionHeader, Card, inputCls } from "../components/ui";
import { CASES, TIMELINE_EVENTS } from "../data/mockData";

export default function TimelinePage() {
  const [caseId, setCaseId] = useState("CASE-2026-0142");
  const events = TIMELINE_EVENTS[caseId] || [];

  return (
    <div className="space-y-6">
      <SectionHeader icon={History} title="Investigation Timeline" subtitle="Chronological reconstruction of case events, drawn from linked documents." />

      <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={inputCls + " w-auto"}>
        {CASES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <Card>
        {events.length === 0 && <div className="text-sm text-slate-400 text-center py-6">No timeline events recorded for this case yet.</div>}
        <div className="relative pl-7">
          <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200" />
          <div className="space-y-7">
            {events.map((t, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-7 top-0.5 w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center ring-4 ring-cyan-100">
                  <span className="text-[10px] font-bold text-cyan-400">{i + 1}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-cyan-700 font-mono-data">{t.date}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">{t.event}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {t.source}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {t.relatedEntity}</span>
                    <span className="font-mono-data text-slate-400">{caseId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
