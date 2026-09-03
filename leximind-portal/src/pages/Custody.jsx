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

  const [formData, setFormData] = useState({ targetId: "", toCustodianRole: "", caseId: "CASE-2026-0071", reason: "" });

  const handleTransferSubmit = async () => {
    try {
      await api.requestCustodyTransfer({
        targetType: "document",
        targetId: formData.targetId,
        caseId: formData.caseId,
        toCustodianRole: formData.toCustodianRole
      });
      setTransferOpen(false);
      push?.("Custody transfer requested successfully! (Pending approval)", "success");
      load(); // reload events
    } catch (err) {
      push?.("Failed to request transfer: " + err.message, "error");
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
          <Field label="Case ID"><input className={inputCls} value={formData.caseId} onChange={(e) => setFormData({...formData, caseId: e.target.value})} placeholder="e.g. CASE-2026-0071" /></Field>
          <Field label="Document ID"><input className={inputCls} value={formData.targetId} onChange={(e) => setFormData({...formData, targetId: e.target.value})} placeholder="e.g. doc10" /></Field>
          <Field label="Transfer to Role"><input className={inputCls} value={formData.toCustodianRole} onChange={(e) => setFormData({...formData, toCustodianRole: e.target.value})} placeholder="e.g. Supervisory Officer" /></Field>
          <Field label="Reason"><textarea rows={2} className={inputCls} value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Reason for transfer…" /></Field>
          <Button variant="accent" className="w-full justify-center" onClick={handleTransferSubmit}>Confirm Transfer</Button>
        </div>
      </Modal>
    </div>
  );
}
