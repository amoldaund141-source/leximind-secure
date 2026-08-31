import React, { useMemo, useState, useEffect } from "react";
import api from "../services/api";
import {
  FolderKanban, Plus, Users, Calendar, FileText, Boxes, History, Waypoints,
  BrainCircuit, Link2, ShieldCheck, ScrollText, ArrowLeft,
} from "lucide-react";
import { SectionHeader, Card, Button, Modal, Field, inputCls, Tabs } from "../components/ui";
import { ClassificationBadge, SecurityStatusBadge } from "../components/shared/StatusComponents";
import { CaseCard } from "../components/shared/InvestigationComponents";
import {
  CASES, DOCUMENTS, EVIDENCE, CUSTODY_EVENTS, TIMELINE_EVENTS, AUDIT_LOG,
} from "../data/mockData";

export function CasesListPage({ navigate, push }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [casesList, setCasesList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newClass, setNewClass] = useState("RESTRICTED");
  const [newCat, setNewCat] = useState("");

  const loadCases = async () => {
    try {
      const data = await api.getCases();
      setCasesList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreate = async () => {
    try {
      await api.createCase({
        title: newTitle,
        description: newDesc,
        classification: newClass,
        category: newCat || "General",
        status: "OPEN"
      });
      setCreateOpen(false);
      push?.("Case created successfully.", "success");
      loadCases(); // reload list
    } catch (e) {
      push?.(e.message || "Error creating case", "error");
    }
  };

  const filtered = statusFilter === "All" ? casesList : casesList.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FolderKanban}
        title="Case Management"
        subtitle="Investigation cases, classification, and assigned officers."
        action={<Button variant="accent" icon={Plus} onClick={() => setCreateOpen(true)}>New Investigation Case</Button>}
      />

      <Tabs tabs={[{ id: "All", label: "All" }, { id: "ACTIVE", label: "Active" }, { id: "UNDER REVIEW", label: "Under Review" }, { id: "CLOSED", label: "Closed" }]} active={statusFilter} onChange={setStatusFilter} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => <CaseCard key={c.id} c={c} onOpen={() => navigate(`cases/${c.id}`)} />)}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Investigation Case" width="max-w-lg">
        <div className="space-y-3">
          <Field label="Case Title"><input className={inputCls} placeholder="e.g. State vs. Unknown" value={newTitle} onChange={e=>setNewTitle(e.target.value)} /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} placeholder="Brief summary..." value={newDesc} onChange={e=>setNewDesc(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Classification">
              <select className={inputCls} value={newClass} onChange={e=>setNewClass(e.target.value)}><option>RESTRICTED</option><option>CONFIDENTIAL</option><option>SECRET</option></select>
            </Field>
            <Field label="Category"><input className={inputCls} placeholder="e.g. Financial Crime" value={newCat} onChange={e=>setNewCat(e.target.value)} /></Field>
          </div>
          <Button variant="accent" className="w-full justify-center mt-2" onClick={handleCreate}>Create Case</Button>
        </div>
      </Modal>
    </div>
  );
}

const CASE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "evidence", label: "Evidence" },
  { id: "timeline", label: "Timeline" },
  { id: "entities", label: "People/Entities" },
  { id: "ai", label: "AI Intelligence" },
  { id: "custody", label: "Chain of Custody" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit History" },
];

export function CaseDetailPage({ caseId, navigate }) {
  const [tab, setTab] = useState("overview");
  const [c, setC] = useState(null);
  const [docs, setDocs] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [custody, setCustody] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [caseData, docsData, evData, custData] = await Promise.all([
          api.getCase(caseId).catch(() => null),
          api.getDocuments({ caseId }).catch(() => []),
          api.getEvidence({ caseId }).catch(() => []),
          api.getCustodyEvents({ caseId }).catch(() => []),
        ]);
        setC(caseData);
        setDocs(docsData || []);
        setEvidence(evData || []);
        setCustody(custData || []);
        setTimeline(TIMELINE_EVENTS[caseId] || []); // Mock until timeline API is wired
      } catch (e) {
        console.error("Failed to load case details", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  if (!c) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm">Case {caseId} was not found.</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate("cases")}>Back to Case Management</Button>
      </div>
    );
  }

  const entities = Array.from(new Set(docs.flatMap((d) => [d.uploadedBy, d.custodian])));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("cases")} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Back to Case Management</button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono-data text-sm text-cyan-700">{c.id} <ClassificationBadge level={c.classification} /></div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{c.title}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{c.description}</p>
        </div>
        <SecurityStatusBadge status={c.status} />
      </div>

      <Tabs tabs={CASE_TABS} active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><div className="text-xs text-slate-400 uppercase tracking-wide">Created</div><div className="text-sm font-semibold text-slate-800 mt-1">{c.createdDate}</div></Card>
          <Card><div className="text-xs text-slate-400 uppercase tracking-wide">Category</div><div className="text-sm font-semibold text-slate-800 mt-1">{c.category}</div></Card>
          <Card><div className="text-xs text-slate-400 uppercase tracking-wide">Documents</div><div className="text-sm font-semibold text-slate-800 mt-1">{c.documentCount}</div></Card>
          <Card><div className="text-xs text-slate-400 uppercase tracking-wide">Evidence Items</div><div className="text-sm font-semibold text-slate-800 mt-1">{c.evidenceCount}</div></Card>
          <Card className="sm:col-span-2 lg:col-span-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Assigned Officers</div>
            <div className="flex flex-wrap gap-2">
              {c.assignedOfficers.map((o) => <span key={o} className="text-xs bg-slate-100 text-slate-700 rounded-full px-3 py-1 flex items-center gap-1.5"><Users className="w-3 h-3" />{o}</span>)}
            </div>
          </Card>
        </div>
      )}

      {tab === "documents" && (
        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
          {docs.map((d) => (
            <button key={d.id} onClick={() => navigate("vault")} className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-medium text-slate-800 truncate">{d.name}</div><div className="text-xs text-slate-400">{d.type} · {d.uploadedAt}</div></div>
              </div>
              <SecurityStatusBadge status={d.integrityStatus} />
            </button>
          ))}
          {docs.length === 0 && <div className="p-6 text-sm text-slate-400 text-center">No documents linked to this case yet.</div>}
        </div>
      )}

      {tab === "evidence" && (
        <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
          {evidence.map((e) => (
            <button key={e.id} onClick={() => navigate("evidence")} className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <Boxes className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-medium text-slate-800 truncate">{e.id} — {e.description}</div><div className="text-xs text-slate-400">{e.type} · Custodian: {e.custodian}</div></div>
              </div>
              <SecurityStatusBadge status={e.integrityStatus} />
            </button>
          ))}
          {evidence.length === 0 && <div className="p-6 text-sm text-slate-400 text-center">No evidence linked to this case yet.</div>}
        </div>
      )}

      {tab === "timeline" && (
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-slate-200" />
          <div className="space-y-5">
            {timeline.map((t, i) => (
              <button key={i} onClick={() => navigate("timeline")} className="w-full text-left relative group">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-cyan-100" />
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 group-hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-900">{t.event}</span><span className="text-xs text-slate-400 font-mono-data">{t.date}</span></div>
                  <div className="text-xs text-slate-500 mt-1">Source: {t.source} · Entity: {t.relatedEntity}</div>
                </div>
              </button>
            ))}
            {timeline.length === 0 && <div className="text-sm text-slate-400">No timeline events recorded yet.</div>}
          </div>
        </div>
      )}

      {tab === "entities" && (
        <div className="flex flex-wrap gap-2">
          {entities.map((p) => <span key={p} className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-cyan-600" />{p}</span>)}
        </div>
      )}

      {tab === "ai" && (
        <Card>
          <div className="flex items-center gap-2 mb-2"><BrainCircuit className="w-4 h-4 text-cyan-600" /><span className="text-sm font-semibold text-slate-900">Open full AI Document Intelligence</span></div>
          <p className="text-sm text-slate-500 mb-3">Select a document from this case in AI Document Intelligence for entity extraction, findings and related documents.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("ai-intelligence")}>Go to AI Document Intelligence</Button>
        </Card>
      )}

      {tab === "custody" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          {custody.length ? custody.map((ev) => (
            <button key={ev.id} onClick={() => navigate("custody")} className="w-full text-left py-2.5 border-b last:border-0 border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
              <div className="min-w-0"><div className="text-sm font-medium text-slate-800">{ev.action}</div><div className="text-xs text-slate-400">{ev.targetName} · {ev.user}</div></div>
              <span className="text-xs text-slate-400 shrink-0">{ev.timestamp}</span>
            </button>
          )) : <div className="text-sm text-slate-400 text-center py-4">No custody events for this case yet.</div>}
          <Button variant="outline" size="sm" className="mt-3" icon={Link2} onClick={() => navigate("custody")}>Open full Chain of Custody</Button>
        </div>
      )}

      {tab === "security" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card><div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /><span className="text-sm font-semibold">Blockchain Status</span></div><p className="text-xs text-slate-500">All {docs.length} documents in this case are hash-registered on-chain.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("blockchain")}>View Blockchain Verification</Button></Card>
          <Card><div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-cyan-600" /><span className="text-sm font-semibold">Document Integrity</span></div><p className="text-xs text-slate-500">Run an integrity sweep across all documents attached to this case.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("integrity")}>Open Document Integrity</Button></Card>
        </div>
      )}

      {tab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          {AUDIT_LOG.filter((l) => l.target.includes(caseId) || docs.some((d) => l.target.includes(d.name))).map((l) => (
            <button key={l.id} onClick={() => navigate("audit")} className="w-full text-left py-2.5 border-b last:border-0 border-slate-100 flex items-center justify-between gap-2 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
              <div className="min-w-0"><div className="text-sm font-medium text-slate-800">{l.event}</div><div className="text-xs text-slate-400">{l.actor} · {l.target}</div></div>
              <span className="text-xs text-slate-400 shrink-0">{l.timestamp}</span>
            </button>
          ))}
          <Button variant="outline" size="sm" className="mt-3" icon={ScrollText} onClick={() => navigate("audit")}>Open full Audit Ledger</Button>
        </div>
      )}
    </div>
  );
}
