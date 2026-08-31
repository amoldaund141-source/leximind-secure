import React from "react";
import { GitCompare, FileText } from "lucide-react";
import { SectionHeader, Card, cx } from "../components/ui";
import { COMPARE_DOC_A, COMPARE_DOC_B } from "../data/mockData";

function Line({ l }) {
  const styles = {
    same: "text-slate-700",
    added: "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-400 pl-2",
    removed: "bg-red-50 text-red-800 border-l-4 border-red-400 pl-2 line-through decoration-red-300",
    modified: "bg-amber-50 text-amber-900 border-l-4 border-amber-400 pl-2",
  };
  return <p className={cx("text-sm rounded px-2 py-1.5", styles[l.type])}>{l.text}</p>;
}

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={GitCompare} title="Document Comparison" subtitle="Highlighting matches, differences and possible contradictions between two documents." />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-slate-500" /><span className="text-sm font-semibold text-slate-900">{COMPARE_DOC_A.name}</span></div>
          <div className="space-y-1.5">{COMPARE_DOC_A.lines.map((l, i) => <Line key={i} l={l} />)}</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-slate-500" /><span className="text-sm font-semibold text-slate-900">{COMPARE_DOC_B.name}</span></div>
          <div className="space-y-1.5">{COMPARE_DOC_B.lines.map((l, i) => <Line key={i} l={l} />)}</div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Common Case Reference</div>
          <p className="text-sm text-slate-700">Both statements describe the events of 8th August 2026 at Marine Heights Society and reference the same complainant.</p>
        </Card>
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">Different Statement</div>
          <p className="text-sm text-slate-700">Reported departure time differs — 8:00 PM vs. 6:30 PM — a possible contradiction requiring human review.</p>
        </Card>
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">Added Detail</div>
          <p className="text-sm text-slate-700">Statement 02 adds a new detail: an unidentified visitor entering the premises at 11:40 PM.</p>
        </Card>
      </div>
    </div>
  );
}
