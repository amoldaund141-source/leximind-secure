import React, { useState } from "react";
import { SlidersHorizontal, Save } from "lucide-react";
import { SectionHeader, Card, Button, Field, inputCls } from "../components/ui";

export default function SystemSettingsPage({ push }) {
  const [retention, setRetention] = useState("10 years");
  const [chain, setChain] = useState("Permissioned — Hyperledger Fabric (demo)");
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader icon={SlidersHorizontal} title="System Settings" subtitle="Platform-wide configuration for storage, security and blockchain policy." />

      <Card className="max-w-xl space-y-4">
        <Field label="Evidence Retention Period">
          <select value={retention} onChange={(e) => setRetention(e.target.value)} className={inputCls}>
            <option>5 years</option><option>10 years</option><option>Permanent</option>
          </select>
        </Field>
        <Field label="Blockchain Network">
          <input value={chain} onChange={(e) => setChain(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Encryption Standard">
          <input value="AES-256" disabled className={inputCls + " bg-slate-50 text-slate-400"} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="w-4 h-4 accent-cyan-600" />
          Require two-factor authentication for all officers
        </label>
        <Button variant="accent" icon={Save} onClick={() => push?.("System settings saved.", "success")}>Save Settings</Button>
      </Card>
    </div>
  );
}
