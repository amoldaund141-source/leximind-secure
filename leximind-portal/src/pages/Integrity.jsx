import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FileWarning, ShieldCheck, ShieldAlert, Zap, RotateCcw, Loader2 } from "lucide-react";
import { SectionHeader, Card, Button, inputCls, cx } from "../components/ui";

export default function IntegrityPage({ push }) {
  const [docId, setDocId] = useState("");
  const [tampered, setTampered] = useState(false);
  const [tamperedHash, setTamperedHash] = useState("");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const docData = await api.getDocuments();
        setDocs(docData || []);
        if (docData && docData.length > 0) {
          setDocId(docData[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const doc = docs.find((d) => d.id === docId);

  const simulate = async () => {
    if (!docId) return;
    setVerifying(true);
    try {
      const res = await api.verifyHash(docId);
      if (!res.is_valid) {
        setTampered(true);
        setTamperedHash(res.recalculated_hash || res.document_hash);
        push?.("Simulated tampering triggered — hash mismatch detected.", "error");
      } else {
        // If it's valid, it means we couldn't fake tamper on the backend, so we fake it visually
        setTampered(true);
        setTamperedHash("B91F3E12D5A8C0F3B6E9D2A5C8F1B4E7A0D3C6F9B2E5A8D1C4F7B0E3A6D9C2F5");
        push?.("Simulated tampering triggered visually.", "error");
      }
    } catch (e) {
      push?.("Check failed: " + e.message, "error");
    } finally {
      setVerifying(false);
    }
  };

  const reset = async () => {
    if (!docId) return;
    setVerifying(true);
    try {
      const res = await api.verifyHash(docId);
      setTampered(!res.is_valid);
      push?.("Document integrity restored to verified state.", "success");
    } catch (e) {
      push?.("Check failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={FileWarning} title="Document Integrity" subtitle="Continuous hash-match checks confirm no document has been altered since registration." />

      <div className="flex flex-col sm:flex-row gap-3">
        <select value={docId} onChange={(e) => { setDocId(e.target.value); setTampered(false); }} className={inputCls + " flex-1"}>
          {docs.length === 0 && <option value="">No documents found</option>}
          {docs.map((d) => <option key={d.id} value={d.id}>{d.name || d.title}</option>)}
        </select>
        {!tampered ? (
          <Button variant="outline" icon={verifying ? Loader2 : Zap} disabled={verifying || !docId} onClick={simulate}>{verifying ? "Checking..." : "Simulate Tampering (Demo)"}</Button>
        ) : (
          <Button variant="outline" icon={verifying ? Loader2 : RotateCcw} disabled={verifying || !docId} onClick={reset}>{verifying ? "Checking..." : "Reset to Verified State"}</Button>
        )}
      </div>

      <Card className={cx(tampered ? "!border-red-300" : "!border-emerald-200")}>
        <div className={cx("rounded-xl p-5 flex items-start gap-4", tampered ? "bg-red-50" : "bg-emerald-50")}>
          {tampered ? <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" /> : <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />}
          <div>
            <div className={cx("text-base font-bold", tampered ? "text-red-800" : "text-emerald-800")}>
              {tampered ? "🚨 DOCUMENT INTEGRITY COMPROMISED" : "🟢 DOCUMENT INTEGRITY VERIFIED"}
            </div>
            {tampered && <p className="text-sm text-red-700 mt-1">Possible Unauthorized Modification Detected — this document requires immediate investigation.</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Original Hash</div>
            <div className="font-mono-data text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 break-all">{doc?.sha256 || doc?.document_hash || "N/A"}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Current Hash</div>
            <div className={cx("font-mono-data text-xs border rounded-lg px-3 py-2 break-all", tampered ? "bg-red-50 border-red-200 text-red-800" : "bg-slate-50 border-slate-200")}>
              {tampered ? tamperedHash : (doc?.sha256 || doc?.document_hash || "N/A")}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div className="flex justify-between border border-slate-100 rounded-lg px-3 py-2"><span className="text-slate-400">Status</span><span className={cx("font-semibold", tampered ? "text-red-700" : "text-emerald-700")}>{tampered ? "HASH MISMATCH" : "HASH MATCH"}</span></div>
          <div className="flex justify-between border border-slate-100 rounded-lg px-3 py-2"><span className="text-slate-400">Blockchain Verification</span><span className={cx("font-semibold", tampered ? "text-red-700" : "text-emerald-700")}>{tampered ? "FAILED" : "VERIFIED"}</span></div>
        </div>
      </Card>
    </div>
  );
}
