import React, { useState, useEffect } from "react";
import { ShieldQuestion, AlertTriangle, FileText } from "lucide-react";
import { SectionHeader, Card, Badge, inputCls } from "../components/ui";
import { CASES } from "../data/mockData";
import api from "../services/api";

export default function ContradictionsPage() {
  const [caseId, setCaseId] = useState("CASE-2026-0142"); // Default to a specific case for API ease
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContradictions = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("Lexi Guard_secure_session") ? JSON.parse(sessionStorage.getItem("Lexi Guard_secure_session")).access : null;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/ai/cases/${caseId}/contradictions/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch contradictions");
        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContradictions();
  }, [caseId]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={ShieldQuestion} title="Contradiction & Anomaly Detection" subtitle="Cross-document inconsistencies flagged by AI — always subject to human review." />

      <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={inputCls + " w-auto"}>
        {CASES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <div className="space-y-4">
        {loading && <div className="text-center text-sm text-slate-400 py-10">Running AI contradiction analysis...</div>}
        {items.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900">⚠️ {c.title}</span>
                  <span className="font-mono-data text-xs text-slate-400">{c.caseId}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 mt-3">
                  {c.statements.map((s, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1"><FileText className="w-3 h-3" /> {s.source}</div>
                      <div className="text-sm text-slate-800">{s.claim}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">AI Finding</div>
                  <p className="text-sm text-amber-900">{c.finding}</p>
                </div>

                <div className="mt-2"><Badge tone="amber">Status: {c.status}</Badge></div>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-sm text-slate-400 py-10">No contradictions flagged for this case.</div>}
      </div>
    </div>
  );
}
