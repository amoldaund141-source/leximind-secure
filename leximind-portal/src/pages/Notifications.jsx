import React from "react";
import { Bell, ShieldAlert, Link2, Sparkles, ShieldCheck, CheckCheck } from "lucide-react";
import { SectionHeader, Card, Button, cx } from "../components/ui";

const ICONS = { alert: ShieldAlert, custody: Link2, ai: Sparkles, blockchain: ShieldCheck };

export default function NotificationsPage({ notifications, setNotifications }) {
  const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Bell}
        title="Notifications"
        subtitle="Security, custody, and AI processing updates."
        action={<Button variant="outline" icon={CheckCheck} onClick={markAllRead}>Mark all read</Button>}
      />

      <Card padded={false}>
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <div key={n.id} className={cx("flex items-start gap-3 p-4", !n.read && "bg-cyan-50/40")}>
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Icon className="w-4.5 h-4.5 text-slate-500" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{n.title}</span>
                    <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.desc}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0" />}
              </div>
            );
          })}
          {notifications.length === 0 && <div className="p-8 text-center text-sm text-slate-400">You're all caught up.</div>}
        </div>
      </Card>
    </div>
  );
}
