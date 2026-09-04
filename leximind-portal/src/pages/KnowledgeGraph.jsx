import React, { useMemo, useState, useEffect } from "react";
import { Waypoints, User, Building2, MapPin, Phone, FileText, Package, Hash } from "lucide-react";
import { SectionHeader, Card, inputCls } from "../components/ui";
import { CASES } from "../data/mockData";
import api from "../services/api";

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
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("Lexi Guard_secure_session") ? JSON.parse(sessionStorage.getItem("Lexi Guard_secure_session")).access : null;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"}/ai/cases/${caseId}/knowledge-graph/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch graph");
        const data = await res.json();
        setGraph(data || { nodes: [], edges: [] });
      } catch (err) {
        console.error(err);
        setGraph({ nodes: [], edges: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [caseId]);

  const positions = useMemo(() => {
    const cx0 = 400, cy0 = 300, r = 230;
    const map = {};
    if (graph.nodes) {
      graph.nodes.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / graph.nodes.length - Math.PI / 2;
        const isTopHalf = Math.sin(angle) < -0.1;
        map[n.id] = { 
          x: cx0 + r * Math.cos(angle), 
          y: cy0 + r * Math.sin(angle),
          textY: isTopHalf ? -38 : 42
        };
      });
    }
    return map;
  }, [graph]);

  const connected = useMemo(() => {
    if (!activeNode || !graph.edges) return null;
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
        {CASES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
      </select>

      <Card>
        {loading ? <div className="text-sm text-slate-400 text-center py-10">Generating knowledge graph via AI...</div> : (
        <div className="overflow-x-auto">
          <svg viewBox="0 0 800 600" className="w-full min-w-[750px] h-[550px]">
            {graph.edges && graph.edges.map((e, i) => {
              const a = positions[e.source], b = positions[e.target];
              if (!a || !b) return null;
              const dim = connected && !(connected.has(e.source) && connected.has(e.target));
              
              // Angle for rotating edge text so it reads left-to-right along the line
              const angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
              const readAngle = angleDeg > 90 || angleDeg < -90 ? angleDeg + 180 : angleDeg;

              return (
                <g key={i} opacity={dim ? 0.15 : 1}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={1.5} />
                  <g transform={`translate(${(a.x + b.x) / 2}, ${(a.y + b.y) / 2})`}>
                    <rect x="-30" y="-8" width="60" height="14" fill="white" opacity="0.8" rx="4" />
                    <text y="3" fontSize="9" fill="#64748b" textAnchor="middle" className="font-mono-data" transform={`rotate(${readAngle})`}>
                      {e.relation}
                    </text>
                  </g>
                </g>
              );
            })}
            {graph.nodes && graph.nodes.map((n) => {
              const p = positions[n.id];
              if (!p) return null;
              const meta = TYPE_META[n.type] || TYPE_META.case;
              const dim = connected && !connected.has(n.id);
              return (
                <g key={n.id} transform={`translate(${p.x},${p.y})`} className="cursor-pointer" opacity={dim ? 0.3 : 1} onClick={() => setActiveNode(activeNode === n.id ? null : n.id)}>
                  <circle r={activeNode === n.id ? 26 : 22} fill={meta.color} stroke="#fff" strokeWidth={3} />
                  <text y={p.textY} textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight={600}>{n.label.length > 20 ? n.label.slice(0, 18) + "..." : n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        )}

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
