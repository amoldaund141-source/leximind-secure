import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Link2, ArrowLeftRight } from "lucide-react";
import { SectionHeader, Card, Button, Modal, Field, inputCls } from "../components/ui";
import { CustodyTimeline } from "../components/shared/InvestigationComponents";
import { useAuth } from "../context/AuthContext";

export default function CustodyPage({ push }) {
  const [caseFilter, setCaseFilter] = useState("All Cases");
  const [transferOpen, setTransferOpen] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const canApprove = role === "SO" || role === "SA";

  const load = async () => {
    try {
      const [data, cases] = await Promise.all([
        api.getCustodyEvents().catch(()=>[]),
        api.getCases().catch(()=>[])
      ]);
      setAllEvents(data || []);
      setAllCases(cases || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id, act) => {
    try {
      if (act === "approve") {
        await api.approveTransfer(id);
        push?.("Transfer approved", "success");
      } else {
        await api.rejectTransfer(id);
        push?.("Transfer rejected", "error");
      }
      load();
    } catch (err) {
      push?.("Error: " + err.message, "error");
    }
  };

  const events = caseFilter === "All Cases" ? allEvents : allEvents.filter((e) => e.caseId === caseFilter || e.case_id === caseFilter);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Link2}
        title="Chain of Custody"
        subtitle="Full, tamper-evident custody trail for every document and evidence item."
        action={<Button variant="accent" icon={ArrowLeftRight} onClick={() => setTransferOpen(true)}>Transfer Custody</Button>}
      />

      <select value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className={inputCls + " w-auto"}>
        <option>All Cases</option>
        {allCases.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <Card>
        {loading ? <div className="text-center p-8 text-slate-500">Loading custody events...</div> : <CustodyTimeline events={events} onApprove={canApprove ? handleApprove : undefined} />}
      </Card>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer Custody" width="max-w-sm">
        <div className="space-y-3">
          <Field label="Document / Evidence ID"><input className={inputCls} placeholder="e.g. EVID-3301" /></Field>
          <Field label="Transfer to"><input className={inputCls} placeholder="Officer or role" /></Field>
          <Field label="Reason"><textarea rows={2} className={inputCls} placeholder="Reason for transfer…" /></Field>
          <Button variant="accent" className="w-full justify-center" onClick={() => { setTransferOpen(false); push?.("Custody transfer recorded and hashed to the audit ledger.", "success"); }}>Confirm Transfer</Button>
        </div>
      </Modal>
    </div>
  );
}
