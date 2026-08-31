import React, { useState, useEffect } from "react";
import api from "../services/api";
import { ScrollText, Search } from "lucide-react";
import { SectionHeader, Card, inputCls } from "../components/ui";
import { AuditTimeline } from "../components/shared/InvestigationComponents";

export default function AuditLedgerPage() {
  const [query, setQuery] = useState("");
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAuditLog();
        setAuditLog(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const logs = auditLog.filter((l) => !query || (l.event || "").toLowerCase().includes(query.toLowerCase()) || (l.actor || "").toLowerCase().includes(query.toLowerCase()) || (l.target || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <SectionHeader icon={ScrollText} title="Immutable Audit Ledger" subtitle="Every security-relevant action, permanently and verifiably logged." />

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by event, actor, or document/case…" className={inputCls + " pl-9"} />
      </div>

      <Card>
        {loading ? <div className="text-center py-8 text-slate-500">Loading audit ledger...</div> : <AuditTimeline logs={logs} />}
        {logs.length === 0 && <div className="text-center text-sm text-slate-400 py-10">No matching audit entries.</div>}
      </Card>
    </div>
  );
}
