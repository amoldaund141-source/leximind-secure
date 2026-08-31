import React, { useState } from "react";
import { BrainCircuit, Sparkles, CalendarClock, Lightbulb, Link2, FileText } from "lucide-react";
import { SectionHeader, Card, inputCls } from "../components/ui";
import { AIInsightCard, EntityBadge } from "../components/shared/InvestigationComponents";
import { DOCUMENTS, AI_INSIGHTS } from "../data/mockData";

export default function AIIntelligencePage() {
  const [docId, setDocId] = useState(DOCUMENTS[0].id);
  const doc = DOCUMENTS.find((d) => d.id === docId);
  const insight = AI_INSIGHTS[docId];

  return (
    <div className="space-y-6">
      <SectionHeader icon={BrainCircuit} title="AI Document Intelligence" subtitle="Summarization, entity extraction and cross-referencing for a selected document." />

      <select value={docId} onChange={(e) => setDocId(e.target.value)} className={inputCls + " w-auto"}>
        {DOCUMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      {!insight ? (
        <Card><p className="text-sm text-slate-400 text-center py-8">AI analysis is not yet available for this document. Try FIR_2026_0142.pdf, Witness_Statement_02.pdf, or Bank_Transaction_Report_04.pdf.</p></Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <AIInsightCard title="AI Summary" icon={Sparkles}>
            <p className="text-sm text-slate-700 leading-relaxed">{insight.summary}</p>
          </AIInsightCard>

          <AIInsightCard title="Important Findings" icon={Lightbulb}>
            <ul className="space-y-2">
              {insight.findings.map((f, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-cyan-600 shrink-0">•</span>{f}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 mt-2">AI-identified — requires human review.</p>
          </AIInsightCard>

          <AIInsightCard title="Extracted Entities" icon={FileText}>
            <div className="space-y-3">
              {Object.entries(insight.entities).filter(([, v]) => v.length).map(([key, values]) => (
                <div key={key}>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">{key}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((v) => <EntityBadge key={v} type={key === "people" ? "person" : key === "organizations" ? "organization" : key === "locations" ? "location" : key === "phones" ? "phone" : "caseRef"} label={v} />)}
                  </div>
                </div>
              ))}
            </div>
          </AIInsightCard>

          <AIInsightCard title="Important Dates" icon={CalendarClock}>
            <div className="space-y-2.5">
              {insight.importantDates.map((d, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-mono-data text-xs text-cyan-700 shrink-0 w-16">{d.date}</span>
                  <div><div className="text-slate-800">{d.event}</div><div className="text-xs text-slate-400">{d.source}</div></div>
                </div>
              ))}
            </div>
          </AIInsightCard>

          <AIInsightCard title="Related Documents" icon={Link2}>
            <div className="flex flex-wrap gap-2">
              {insight.relatedDocs.map((d) => (
                <button key={d} onClick={() => { const target = DOCUMENTS.find((x) => x.name === d); if (target) setDocId(target.id); }} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {d}
                </button>
              ))}
            </div>
          </AIInsightCard>
        </div>
      )}
    </div>
  );
}
