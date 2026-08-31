import {
  LayoutDashboard, Vault, UploadCloud, FolderSearch, GitCompare, FolderKanban,
  Boxes, Link2, History, BrainCircuit, MessagesSquare, Waypoints, ShieldQuestion,
  ShieldCheck, FileWarning, Siren, ScrollText, Users, KeyRound, SlidersHorizontal,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
    ],
  },
  {
    label: "Secure Documents",
    items: [
      { id: "vault", label: "Secure Document Vault", icon: Vault },
      { id: "upload", label: "Upload & Digitization", icon: UploadCloud },
      { id: "compare", label: "Document Comparison", icon: GitCompare },
    ],
  },
  {
    label: "Investigation",
    items: [
      { id: "cases", label: "Case Management", icon: FolderKanban },
      { id: "evidence", label: "Evidence Management", icon: Boxes },
      { id: "custody", label: "Chain of Custody", icon: Link2 },
      { id: "timeline", label: "Investigation Timeline", icon: History },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { id: "ai-intelligence", label: "AI Document Intelligence", icon: BrainCircuit },
      { id: "qa", label: "Case Intelligence Q&A", icon: MessagesSquare },
      { id: "search", label: "Investigation Search", icon: FolderSearch },
      { id: "knowledge-graph", label: "Knowledge Graph", icon: Waypoints },
      { id: "contradictions", label: "Contradiction Detection", icon: ShieldQuestion },
    ],
  },
  {
    label: "Blockchain & Security",
    items: [
      { id: "blockchain", label: "Blockchain Verification", icon: ShieldCheck },
      { id: "integrity", label: "Document Integrity", icon: FileWarning },
      { id: "alerts", label: "Security Alerts", icon: Siren },
      { id: "audit", label: "Immutable Audit Ledger", icon: ScrollText },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "users", label: "Users & Roles", icon: Users },
      { id: "access-control", label: "Access Control", icon: KeyRound },
      { id: "system-settings", label: "System Settings", icon: SlidersHorizontal },
    ],
  },
];

export default NAV_SECTIONS;
