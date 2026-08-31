import React, { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import { SectionHeader, Card, Button, Modal, Field, inputCls } from "../components/ui";
import { RoleBadge } from "../components/shared/StatusComponents";
import api from "../services/api";
import { ROLES } from "../data/mockData";
import { useEffect } from "react";

export default function UsersRolesPage({ push }) {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setUsers(await api.getUsers());
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(
    (u) => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase()) || u.department.toLowerCase().includes(query.toLowerCase())
  );

  const toggleStatus = (id) => {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u)));
    push?.("User status updated.", "success");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Users & Roles"
        subtitle="Manage investigation personnel and their assigned roles."
        action={<Button variant="accent" icon={Plus} onClick={() => setAddOpen(true)}>Add User</Button>}
      />

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" className={inputCls + " pl-9"} />
      </div>

      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Active</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-400 font-mono-data">{u.username}</div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-slate-600">{u.department}</td>
                <td className="px-4 py-3">
                  <span className={u.status === "Active" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.lastActive}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleStatus(u.id)} className="text-xs font-medium text-cyan-700 hover:text-cyan-900">
                    {u.status === "Active" ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User" width="max-w-sm">
        <div className="space-y-3">
          <Field label="Full Name"><input className={inputCls} placeholder="e.g. Insp. Priya Nair" /></Field>
          <Field label="Username"><input className={inputCls} placeholder="e.g. io.nair" /></Field>
          <Field label="Role"><select className={inputCls}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Department"><input className={inputCls} placeholder="e.g. Cyber Crime Cell" /></Field>
          <Button variant="accent" className="w-full justify-center mt-2" onClick={() => { setAddOpen(false); push?.("User added (demo).", "success"); }}>Add User</Button>
        </div>
      </Modal>
    </div>
  );
}
