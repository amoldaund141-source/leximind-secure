import React, { useState } from "react";
import { Siren } from "lucide-react";
import { SectionHeader, Tabs } from "../components/ui";
import { SecurityAlertCard } from "../components/shared/InvestigationComponents";
import { SECURITY_ALERTS } from "../data/mockData";

export default function AlertsPage() {
  const [tab, setTab] = useState("All");
  const items = tab === "All" ? SECURITY_ALERTS : SECURITY_ALERTS.filter((a) => a.severity === tab);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Siren} title="Security Alerts" subtitle="Real-time detection of tampering, unauthorized access, and system security events." />

      <Tabs tabs={[{ id: "All", label: "All" }, { id: "CRITICAL", label: "Critical" }, { id: "WARNING", label: "Warning" }, { id: "RESOLVED", label: "Resolved" }]} active={tab} onChange={setTab} />

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((a) => <SecurityAlertCard key={a.id} a={a} />)}
        {items.length === 0 && <div className="col-span-full text-center text-sm text-slate-400 py-10">No alerts in this category.</div>}
      </div>
    </div>
  );
}
