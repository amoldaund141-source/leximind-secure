import React, { useState, useEffect } from "react";
import api from "../services/api";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { SectionHeader, Card, Button, Badge, inputCls } from "../components/ui";
import { HashComparison } from "../components/shared/StatusComponents";

export default function BlockchainPage({ push }) {
  const [docId, setDocId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState("idle"); 
  const [chain, setChain] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [chainData, docData] = await Promise.all([
        api.getBlockchainRecords().catch(()=>[]),
        api.getDocuments().catch(()=>[])
      ]);
      setChain(chainData || []);
      setDocs(docData || []);
      if (docData && docData.length > 0 && !docId) {
        setDocId(docData[0].id);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doc = docs.find((d) => d.id === docId);
  const record = chain.find((r) => r.document_id === docId || r.documentId === docId);
  const matched = record ? (record.documentHash === record.blockchainHash) || (record.document_hash === record.blockchain_hash) : true;

  const runCheck = async () => {
    if (!docId) return;
    setChecking(true);
    setResult("idle");
    try {
      const res = await api.verifyHash(docId);
      setResult("done");
      const isValid = res.is_valid;
      push?.(isValid ? "Blockchain verification successful." : "Verification failed — hash mismatch detected.", isValid ? "success" : "error");
    } catch (e) {
      push?.("Verification failed: " + e.message, "error");
      setResult("done");
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading ledger data...</div>;

  return (
    <div className="space-y-6">
      <SectionHeader icon={ShieldCheck} title="Blockchain Verification" subtitle="Compare a document's current hash against its immutable, on-chain registration." />

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <select value={docId} onChange={(e) => { setDocId(e.target.value); setResult("idle"); }} className={inputCls + " flex-1"}>
          {docs.length === 0 && <option value="">No documents found</option>}
          {docs.map((d) => <option key={d.id} value={d.id}>{d.name || d.title}</option>)}
        </select>
        <Button variant="accent" icon={checking ? RefreshCw : ShieldCheck} disabled={checking || !docId} onClick={runCheck}>{checking ? "Comparing hashes…" : "Compare Hashes"}</Button>
        <div className="flex items-center gap-3 ml-auto">
          <Badge variant="warning" className="uppercase text-[10px]">Hyperledger Fabric Node</Badge>
          <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Ledger
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Document Record" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Document ID</span><span className="font-mono-data">{doc?.id || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Case</span><span className="font-mono-data">{doc?.caseId || doc?.case_id || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Version</span><span>{doc?.version || "1"}</span></div>
            {record && (
              <>
                <div className="flex justify-between"><span className="text-slate-400">Timestamp</span><span>{record.timestamp}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Action</span><span>{record.action}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Actor</span><span>{record.actor}</span></div>
                <div className="flex justify-between items-center gap-2"><span className="text-slate-400 shrink-0">Transaction ID</span><span className="font-mono-data text-xs text-right break-all">{record.txId || record.tx_id}</span></div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Hash Comparison" />
          {record ? (
            <HashComparison currentHash={record.documentHash || record.document_hash} registeredHash={record.blockchainHash || record.blockchain_hash} matched={result === "done" ? matched : true} />
          ) : (
            <p className="text-sm text-slate-400">No blockchain record found for this document.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
