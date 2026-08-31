import React, { useState } from "react";
import { FolderSearch, Search } from "lucide-react";
import { SectionHeader, Card, Button, inputCls } from "../components/ui";
import { SEARCH_QUICK_PROMPTS, SEARCH_RESULTS_SEED } from "../data/mockData";

export default function InvestigationSearchPage({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [ran, setRan] = useState(!!initialQuery);

  const results = ran
    ? SEARCH_RESULTS_SEED.filter((r) =>
        !query || r.context.toLowerCase().includes(query.toLowerCase()) || r.entity.toLowerCase().includes(query.toLowerCase()) || r.document.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      <SectionHeader icon={FolderSearch} title="Investigation Intelligence Search" subtitle='e.g. "Show all documents mentioning the transaction on 14 August."' />

      <div className="flex items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setRan(true)} placeholder="Search across documents, cases, entities…" className={inputCls} />
        <Button variant="accent" icon={Search} onClick={() => setRan(true)}>Search</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEARCH_QUICK_PROMPTS.map((q) => (
          <button key={q} onClick={() => { setQuery(q); setRan(true); }} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1.5">{q}</button>
        ))}
      </div>

      {ran && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-semibold text-slate-900">{r.document}</span>
                <span className="text-xs font-mono-data text-slate-400">{r.caseId}</span>
              </div>
              <p className="text-sm text-slate-600">…{r.context}…</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                <span>Entity: <span className="text-slate-600 font-medium">{r.entity}</span></span>
                <span>{r.date}</span>
                <span>{r.type}</span>
                <span>{r.source}</span>
              </div>
            </Card>
          ))}
          {results.length === 0 && <div className="text-center text-sm text-slate-400 py-10">No matches. Try a different search term or one of the quick prompts above.</div>}
        </div>
      )}
    </div>
  );
}
