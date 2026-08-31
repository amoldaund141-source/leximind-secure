import React, { useState } from "react";
import { MessagesSquare, Send, Sparkles, ShieldCheck } from "lucide-react";
import { SectionHeader, Card, Button, inputCls, cx } from "../components/ui";
import { SourceReference } from "../components/shared/DocumentComponents";
import { CASES, QA_SEED, QA_SUGGESTED } from "../data/mockData";
import * as api from "../services/api";

export default function CaseQAPage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const [messages, setMessages] = useState(QA_SEED);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const ask = async (q) => {
    const question = (q ?? input).trim();
    if (!question) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: question, sources: [] }]);
    setThinking(true);
    const res = await api.askCaseQuestion(caseId, question);
    setThinking(false);
    setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", text: res.answer, sources: res.sources }]);
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={MessagesSquare} title="Case Intelligence Q&A" subtitle="Ask questions about an authorized investigation. Every answer is grounded in case documents." />

      <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={inputCls + " w-auto"}>
        {CASES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <Card padded={false} className="flex flex-col h-[560px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[85%] rounded-2xl px-4 py-3", m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-200")}>
                {m.role === "assistant" && <div className="flex items-center gap-1.5 text-xs text-cyan-700 font-medium mb-1.5"><Sparkles className="w-3.5 h-3.5" /> Case Intelligence</div>}
                <p className={cx("text-sm leading-relaxed", m.role === "user" ? "text-white" : "text-slate-800")}>{m.text}</p>
                {m.sources?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5"><ShieldCheck className="w-3 h-3" /> Sources</div>
                    <div className="flex flex-wrap gap-1.5">{m.sources.map((s) => <SourceReference key={s} name={s} />)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {thinking && <div className="text-xs text-slate-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Searching authorized case documents…</div>}
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {QA_SUGGESTED.map((q) => (
              <button key={q} onClick={() => ask(q)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-3 py-1.5">{q}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="Ask about people, evidence, or connections in this case…" className={inputCls} />
            <Button variant="accent" icon={Send} onClick={() => ask()}>Ask</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
