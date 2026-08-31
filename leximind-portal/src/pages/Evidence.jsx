import React, { useMemo, useState, useEffect } from "react";
import { Boxes, Plus, History } from "lucide-react";
import { SectionHeader, Card, Button, Modal, Field, inputCls, Tabs } from "../components/ui";
import { EvidenceCard } from "../components/shared/InvestigationComponents";
import { SecurityStatusBadge } from "../components/shared/StatusComponents";
import api from "../services/api";

export default function EvidencePage({ push, navigate }) {
  const [caseFilter, setCaseFilter] = useState("All Cases");
  const [selected, setSelected] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [allEvidence, setAllEvidence] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [allCustody, setAllCustody] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getEvidence().catch(()=>[]),
      api.getCases().catch(()=>[]),
      api.getCustodyEvents().catch(()=>[])
    ]).then(([ev, cases, custody]) => {
      setAllEvidence(ev || []);
      setAllCases(cases || []);
      setAllCustody(custody || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (caseFilter === "All Cases" ? allEvidence : allEvidence.filter((e) => e.caseId === caseFilter || e.case_id === caseFilter)),
    [caseFilter, allEvidence]
  );
  const history = selected ? allCustody.filter((c) => c.targetId === selected.id || c.target_id === selected.id) : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Boxes}
        title="Evidence Management"
        subtitle="Physical and digital evidence linked to active investigations."
        action={<Button variant="accent" icon={Plus} onClick={() => setAddOpen(true)}>Add Evidence</Button>}
      />

      <select value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className={inputCls + " w-auto"}>
        <option>All Cases</option>
        {allCases.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <div className="col-span-full p-8 text-center text-slate-500">Loading evidence data...</div>}
        {!loading && filtered.map((e) => <EvidenceCard key={e.id} e={e} onOpen={setSelected} />)}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id} width="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-slate-400">Case</div><div className="font-mono-data">{selected.caseId}</div></div>
              <div><div className="text-xs text-slate-400">Source</div><div>{selected.source}</div></div>
              <div><div className="text-xs text-slate-400">Current Custodian</div><div>{selected.custodian}</div></div>
              <div><div className="text-xs text-slate-400">Date Added</div><div>{selected.dateAdded}</div></div>
            </div>
            <div className="flex gap-2"><SecurityStatusBadge status={selected.integrityStatus} /><SecurityStatusBadge status={selected.blockchainStatus} /></div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="accent" onClick={() => push?.(`Integrity verified for ${selected.id}.`, "success")}>Verify Integrity</Button>
              <Button size="sm" variant="outline" onClick={() => setTransferOpen(true)}>Transfer Custody</Button>
              <Button size="sm" variant="outline" icon={History} onClick={() => navigate("custody")}>Full Custody History</Button>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Access History</div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                {history.length ? history.map((h) => (
                  <div key={h.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-700">{h.action} — {h.user}</span>
                    <span className="text-slate-400">{h.timestamp}</span>
                  </div>
                )) : <div className="p-3 text-xs text-slate-400 text-center">No access history recorded.</div>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer Custody" width="max-w-sm">
        <div className="space-y-3">
          <Field label="Transfer to"><input className={inputCls} placeholder="e.g. Investigation Officer" /></Field>
          <Field label="Reason"><textarea rows={2} className={inputCls} placeholder="Reason for transfer…" /></Field>
          <Button variant="accent" className="w-full justify-center" onClick={() => { setTransferOpen(false); push?.(`Custody transfer request logged for ${selected?.id}.`, "success"); }}>Confirm Transfer</Button>
        </div>
      </Modal>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Evidence" width="max-w-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Evidence Type"><select className={inputCls}><option>Digital</option><option>Document</option><option>Testimonial</option><option>Physical</option></select></Field>
            <Field label="Case">
              <select className={inputCls}>{allCases.map((c) => <option key={c.id}>{c.id}</option>)}</select>
            </Field>
          </div>
          <Field label="Description"><textarea rows={3} className={inputCls} placeholder="Describe the evidence…" /></Field>
          <Field label="Source / Location"><input className={inputCls} placeholder="Where was this obtained?" /></Field>
          <Button variant="accent" className="w-full justify-center mt-2" onClick={() => { setAddOpen(false); push?.("Evidence added and hashed to blockchain (demo).", "success"); }}>Add Evidence</Button>
        </div>
      </Modal>
    </div>
  );
}
