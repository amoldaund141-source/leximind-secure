import React, { useMemo, useState, useEffect } from "react";
import { Vault as VaultIcon, Search, Filter } from "lucide-react";
import { SectionHeader, Modal, inputCls } from "../components/ui";
import { DocumentCard, IntegrityPassport } from "../components/shared/DocumentComponents";
import api from "../services/api";

export default function VaultPage({ navigate, push }) {
  const [query, setQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState("All Cases");
  const [selected, setSelected] = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDocuments().catch(()=>[]), api.getCases().catch(()=>[])])
      .then(([docs, cases]) => {
        setAllDocs(docs || []);
        setAllCases(cases || []);
        setLoading(false);
      });
  }, []);

  const docs = useMemo(() => {
    return allDocs.filter((d) => {
      const matchesQuery = !query || (d.name || d.title || "").toLowerCase().includes(query.toLowerCase()) || (d.type || "").toLowerCase().includes(query.toLowerCase());
      const matchesCase = caseFilter === "All Cases" || d.caseId === caseFilter || d.case_id === caseFilter;
      return matchesQuery && matchesCase;
    });
  }, [query, caseFilter, allDocs]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={VaultIcon}
        title="Secure Document Vault"
        subtitle="Encrypted, hash-verified, blockchain-registered case documents."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents by name or type…" className={inputCls + " pl-9"} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className={inputCls + " w-auto"}>
            <option>All Cases</option>
            {allCases.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <div className="col-span-full text-center text-sm text-slate-400 py-10">Loading vault documents...</div>}
        {!loading && docs.map((d) => <DocumentCard key={d.id} doc={d} onOpen={setSelected} />)}
        {!loading && docs.length === 0 && <div className="col-span-full text-center text-sm text-slate-400 py-10">No documents match your search.</div>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Evidence Integrity Passport" width="max-w-xl">
        {selected && (
          <IntegrityPassport
            doc={selected}
            onVerify={() => { push?.(`Integrity verification confirmed for ${selected.name}.`, "success"); }}
            onViewBlockchain={() => { setSelected(null); navigate("blockchain"); }}
            onViewCustody={() => { setSelected(null); navigate("custody"); }}
            onViewAudit={() => { setSelected(null); navigate("audit"); }}
          />
        )}
      </Modal>
    </div>
  );
}
