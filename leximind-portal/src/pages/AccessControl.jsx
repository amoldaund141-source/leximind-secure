import React from "react";
import { KeyRound, Check, Minus } from "lucide-react";
import { SectionHeader, Card } from "../components/ui";
import { PERMISSION_MATRIX } from "../data/mockData";

export default function AccessControlPage() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={KeyRound} title="Access Control" subtitle="Role-based permission matrix for sensitive actions across the platform." />

      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Role</th>
              {PERMISSION_MATRIX.actions.map((a) => <th key={a} className="px-4 py-3 font-medium text-center">{a}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PERMISSION_MATRIX.rows.map((row) => (
              <tr key={row.role}>
                <td className="px-4 py-3 font-medium text-slate-800">{row.role}</td>
                {row.perms.map((allowed, i) => (
                  <td key={i} className="px-4 py-3 text-center">
                    {allowed
                      ? <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto"><Check className="w-3.5 h-3.5" /></span>
                      : <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-300 items-center justify-center mx-auto"><Minus className="w-3.5 h-3.5" /></span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="text-xs text-slate-400">This matrix reflects the current RBAC configuration used by the route guard and sidebar. Changing it here is a demo-only preview until connected to the backend's permission store.</p>
    </div>
  );
}
