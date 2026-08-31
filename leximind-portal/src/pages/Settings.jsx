import React from "react";
import { SettingsIcon, User, Globe, ShieldHalf, KeyRound } from "lucide-react";
import { SectionHeader, Card, Button, Field, inputCls } from "../components/ui";
import { RoleBadge } from "../components/shared/StatusComponents";
import { LANGUAGES } from "../data/mockData";

export default function SettingsPage({ role, userName, badge, language, setLanguage, push }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={SettingsIcon} title="Settings" subtitle="Your account, security, and display preferences." />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Account" icon={User} />
          <div className="space-y-3">
            <Field label="Name"><input value={userName} disabled className={inputCls + " bg-slate-50 text-slate-500"} /></Field>
            <Field label="Role"><div className="pt-1"><RoleBadge role={role} /></div></Field>
            {badge && <Field label="Badge ID"><input value={badge} disabled className={inputCls + " bg-slate-50 text-slate-500 font-mono-data"} /></Field>}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Preferences" icon={Globe} />
          <div className="space-y-3">
            <Field label="Language">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Button variant="accent" onClick={() => push?.("Preferences saved.", "success")}>Save Preferences</Button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Security" icon={ShieldHalf} />
          <div className="space-y-3">
            <Field label="Password"><input type="password" value="••••••••••••" disabled className={inputCls + " bg-slate-50 text-slate-500"} /></Field>
            <Button variant="outline" icon={KeyRound} onClick={() => push?.("Password reset link sent (demo).", "info")}>Reset Password</Button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Two-Factor Authentication" icon={ShieldHalf} />
          <p className="text-sm text-slate-500 mb-3">Two-factor authentication is enforced for all officer accounts on this platform.</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">Enabled</span>
        </Card>
      </div>
    </div>
  );
}
