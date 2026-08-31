import React, { useMemo, useState } from "react";
import { Waypoints, User, Building2, MapPin, Phone, FileText, Package, Hash } from "lucide-react";
import { SectionHeader, Card, inputCls, cx } from "../components/ui";
import { CASES, KNOWLEDGE_GRAPH } from "../data/mockData";

const TYPE_META = {
  person: { color: "#0891b2", icon: User, label: "Person" },
  organization: { color: "#7c3aed", icon: Building2, label: "Organization" },
  location: { color: "#059669", icon: MapPin, label: "Location" },
  phone: { color: "#d97706", icon: Phone, label: "Phone Number" },
  document: { color: "#334155", icon: FileText, label: "Document" },
  evidence: { color: "#be123c", icon: Package, label: "Evidence" },
  case: { color: "#475569", icon: Hash, label: "Case" },
};

export default function KnowledgeGraphPage() {
  const [caseId, setCaseId] = useState("CASE-2026-0142");
  const [activeNode, setActiveNode] = useState(null);
  const graph = KNOWLEDGE_GRAPH[caseId] || { nodes: [], edges: [] };

  const positions = useMemo(() => {
    const cx0 = 300, cy0 = 230, r = 175;
    const map = {};
    graph.nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
      map[n.id] = { x: cx0 + r * Math.cos(angle), y: cy0 + r * Math.sin(angle) };
    });
    return map;
  }, [graph]);

  const connected = useMemo(() => {
    if (!activeNode) return null;
    const set = new Set([activeNode]);
    graph.edges.forEach((e) => {
      if (e.source === activeNode) set.add(e.target);
      if (e.target === activeNode) set.add(e.source);
    });
    return set;
  }, [activeNode, graph]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Waypoints} title="Investigation Knowledge Graph" subtitle="How fragmented documents become interconnected intelligence." />

      <select value={caseId} onChange={(e) => { setCaseId(e.target.value); setActiveNode(null); }} className={inputCls + " w-auto"}>
        {Object.keys(KNOWLEDGE_GRAPH).map((id) => <option key={id} value={id}>{id}</option>)}
      </select>

      <Card>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 600 460" className="w-full min-w-[560px] h-[460px]">
            {graph.edges.map((e, i) => {
              const a = positions[e.source], b = positions[e.target];
              if (!a || !b) return null;
              const dim = connected && !(connected.has(e.source) && connected.has(e.target));
              return (
                <g key={i} opacity={dim ? 0.15 : 1}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={1.5} />
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} fontSize="9" fill="#64748b" textAnchor="middle" className="font-mono-data">{e.relation}</text>
                </g>
              );
            })}
            {graph.nodes.map((n) => {
              const p = positions[n.id];
              const meta = TYPE_META[n.type] || TYPE_META.case;
              const dim = connected && !connected.has(n.id);
              return (
                <g key={n.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer" opacity={dim ? 0.3 : 1} onClick={() => setActiveNode(activeNode === n.id ? null : n.id)}>
                  <circle r={activeNode === n.id ? 26 : 22} fill={meta.color} stroke="#fff" strokeWidth={3} />
                  <text y={40} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight={600}>{n.label.length > 20 ? n.label.slice(0, 18) + "…" : n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
          {Object.entries(TYPE_META).map(([type, meta]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} /> {meta.label}
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-slate-400">Click a node to highlight its direct connections. This graph is generated from entities automatically extracted by AI Document Intelligence — always cross-check against source documents.</p>
    </div>
  );
}
