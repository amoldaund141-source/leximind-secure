/* ============================================================================
   Lexi Guard — CENTRALIZED MOCK DATA
   -----------------------------------------------------------------------
   Every demo entity used across the app lives here. Nothing is hardcoded
   inside individual pages/components. When a real Node/Express backend is
   ready, replace the exported constants below with data fetched through
   src/services/api.js — the shapes here are the contract each page expects.
============================================================================ */

export const ROLES = [
  "Investigation Officer",
  "Forensic Analyst",
  "Legal Officer",
  "Supervisory Officer",
  "System Administrator",
];

export const LANGUAGES = ["English", "Hindi", "Marathi"];

// URL prefix per role — mirrors the pattern of the original portal.
export const ROLE_PREFIX = {
  "Investigation Officer": "investigator",
  "Forensic Analyst": "forensic",
  "Legal Officer": "legal",
  "Supervisory Officer": "supervisor",
  "System Administrator": "admin",
};

export const ROLE_SHORT = {
  "Investigation Officer": "IO",
  "Forensic Analyst": "FA",
  "Legal Officer": "LO",
  "Supervisory Officer": "SO",
  "System Administrator": "SA",
};

// Which pageIds each role may open. Sidebar + route guard both read this.
export const ROLE_PAGE_ACCESS = {
  "Investigation Officer": [
    "dashboard", "vault", "upload", "ai-intelligence", "search", "compare",
    "cases", "evidence", "custody", "timeline", "qa", "knowledge-graph",
    "contradictions", "blockchain", "integrity", "alerts", "audit",
    "notifications", "settings",
  ],
  "Forensic Analyst": [
    "dashboard", "vault", "ai-intelligence", "evidence", "custody",
    "timeline", "qa", "knowledge-graph", "contradictions", "blockchain",
    "integrity", "notifications", "settings",
  ],
  "Legal Officer": [
    "dashboard", "vault", "ai-intelligence", "search", "compare", "cases",
    "timeline", "qa", "knowledge-graph", "contradictions", "blockchain",
    "notifications", "settings",
  ],
  "Supervisory Officer": [
    "dashboard", "vault", "cases", "evidence", "custody", "timeline",
    "qa", "knowledge-graph", "contradictions", "blockchain", "integrity",
    "alerts", "audit", "notifications", "settings",
  ],
  "System Administrator": [
    "dashboard", "users", "access-control", "system-settings", "alerts",
    "audit", "notifications", "settings",
  ],
};

// Action-level permission matrix used on the Access Control page.
export const PERMISSION_MATRIX = {
  actions: ["Upload", "Download", "Verify", "Custody Transfer", "Approve", "Manage"],
  rows: [
    { role: "Investigation Officer", perms: [true, true, true, true, false, false] },
    { role: "Forensic Analyst", perms: [false, true, true, false, false, false] },
    { role: "Legal Officer", perms: [false, true, true, false, false, false] },
    { role: "Supervisory Officer", perms: [false, true, true, true, true, false] },
    { role: "System Administrator", perms: [true, true, true, true, true, true] },
  ],
};

/* -------------------------------------------------------------------- */
/* AUTH — demo accounts (swap mockLogin() for POST /api/auth/login)      */
/* -------------------------------------------------------------------- */
export const MOCK_USERS = {
  "io.mehra": { password: "secure123", name: "Insp. Rohan Mehra", role: "Investigation Officer", department: "Cyber Crime Cell", badge: "IO-4471" },
  "fa.nandini": { password: "secure123", name: "Dr. Nandini Rao", role: "Forensic Analyst", department: "Forensic Sciences Lab", badge: "FA-2209" },
  "lo.kapoor": { password: "secure123", name: "Adv. Simran Kapoor", role: "Legal Officer", department: "Prosecution Wing", badge: "LO-1183" },
  "so.verma": { password: "secure123", name: "DCP Arvind Verma", role: "Supervisory Officer", department: "Investigation Division", badge: "SO-0091" },
  "admin.iyer": { password: "secure123", name: "Karthik Iyer", role: "System Administrator", department: "IT & Systems Security", badge: "SA-0007" },
};

/* -------------------------------------------------------------------- */
/* USERS & ROLES (Administration)                                        */
/* -------------------------------------------------------------------- */
export const USERS = [
  { id: "u1", name: "Insp. Rohan Mehra", username: "io.mehra", role: "Investigation Officer", department: "Cyber Crime Cell", status: "Active", lastActive: "3 min ago" },
  { id: "u2", name: "Dr. Nandini Rao", username: "fa.nandini", role: "Forensic Analyst", department: "Forensic Sciences Lab", status: "Active", lastActive: "12 min ago" },
  { id: "u3", name: "Adv. Simran Kapoor", username: "lo.kapoor", role: "Legal Officer", department: "Prosecution Wing", status: "Active", lastActive: "1 hour ago" },
  { id: "u4", name: "DCP Arvind Verma", username: "so.verma", role: "Supervisory Officer", department: "Investigation Division", status: "Active", lastActive: "27 min ago" },
  { id: "u5", name: "Karthik Iyer", username: "admin.iyer", role: "System Administrator", department: "IT & Systems Security", status: "Active", lastActive: "Just now" },
  { id: "u6", name: "Insp. Divya Shetty", username: "io.shetty", role: "Investigation Officer", department: "Economic Offences Wing", status: "Active", lastActive: "2 hours ago" },
  { id: "u7", name: "Sub-Insp. Farhan Ali", username: "io.ali", role: "Investigation Officer", department: "Cyber Crime Cell", status: "Suspended", lastActive: "6 days ago" },
  { id: "u8", name: "Dr. Meera Joshi", username: "fa.joshi", role: "Forensic Analyst", department: "Digital Forensics Unit", status: "Active", lastActive: "45 min ago" },
];

/* -------------------------------------------------------------------- */
/* CASES                                                                  */
/* -------------------------------------------------------------------- */
export const CASES = [
  {
    id: "CASE-2026-0142",
    title: "State vs. Rakesh Bansal — Financial Fraud & Cyber Extortion",
    description: "Investigation into a coordinated online extortion scheme linked to unauthorized bank transfers from three corporate accounts.",
    classification: "CONFIDENTIAL",
    status: "ACTIVE",
    assignedOfficers: ["Insp. Rohan Mehra", "Dr. Nandini Rao", "Adv. Simran Kapoor"],
    createdDate: "2026-08-10",
    evidenceCount: 6,
    documentCount: 9,
    category: "Cyber Financial Crime",
  },
  {
    id: "CASE-2026-0117",
    title: "State vs. Unknown — Data Breach, TechNova Systems",
    description: "Unauthorized exfiltration of customer PII from TechNova Systems' internal servers; suspected insider involvement.",
    classification: "SECRET",
    status: "ACTIVE",
    assignedOfficers: ["Insp. Divya Shetty", "Dr. Meera Joshi"],
    createdDate: "2026-07-22",
    evidenceCount: 4,
    documentCount: 6,
    category: "Data Breach",
  },
  {
    id: "CASE-2026-0098",
    title: "State vs. Imran Qureshi — Property Document Forgery",
    description: "Alleged forgery of registered property title documents used to secure a fraudulent bank loan.",
    classification: "RESTRICTED",
    status: "UNDER REVIEW",
    assignedOfficers: ["Insp. Rohan Mehra", "Adv. Simran Kapoor"],
    createdDate: "2026-06-30",
    evidenceCount: 3,
    documentCount: 5,
    category: "Document Forgery",
  },
  {
    id: "CASE-2026-0071",
    title: "State vs. Sanjay Oberoi — Corporate Embezzlement",
    description: "Diversion of company funds through shell vendor invoices over an 18-month period.",
    classification: "CONFIDENTIAL",
    status: "CLOSED",
    assignedOfficers: ["DCP Arvind Verma", "Insp. Divya Shetty"],
    createdDate: "2026-04-02",
    evidenceCount: 5,
    documentCount: 7,
    category: "Financial Crime",
  },
];

/* -------------------------------------------------------------------- */
/* DOCUMENTS (Secure Document Vault)                                     */
/* -------------------------------------------------------------------- */
export const DOCUMENTS = [
  {
    id: "doc1",
    name: "FIR_2026_0142.pdf",
    type: "First Information Report",
    caseId: "CASE-2026-0142",
    classification: "CONFIDENTIAL",
    uploadedBy: "Insp. Rohan Mehra",
    uploadedAt: "10 Aug 2026, 09:14",
    version: "1.0",
    encryption: "AES-256",
    sha256: "A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Investigation Officer",
    sizePages: 6,
  },
  {
    id: "doc2",
    name: "Witness_Statement_02.pdf",
    type: "Witness Statement",
    caseId: "CASE-2026-0142",
    classification: "CONFIDENTIAL",
    uploadedBy: "Insp. Rohan Mehra",
    uploadedAt: "11 Aug 2026, 14:02",
    version: "1.0",
    encryption: "AES-256",
    sha256: "B3E9F1C5A7D2E8B4C1F6A9D3E7B2C5F8A1D4E9B6C3F0A7D2E5B8C1F4A9D6E3B0",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Forensic Analyst",
    sizePages: 3,
  },
  {
    id: "doc3",
    name: "Bank_Transaction_Report_04.pdf",
    type: "Financial Record",
    caseId: "CASE-2026-0142",
    classification: "SECRET",
    uploadedBy: "Dr. Nandini Rao",
    uploadedAt: "12 Aug 2026, 10:47",
    version: "1.1",
    encryption: "AES-256",
    sha256: "C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Forensic Analyst",
    sizePages: 11,
  },
  {
    id: "doc4",
    name: "Witness_Statement_01.pdf",
    type: "Witness Statement",
    caseId: "CASE-2026-0142",
    classification: "CONFIDENTIAL",
    uploadedBy: "Insp. Rohan Mehra",
    uploadedAt: "10 Aug 2026, 16:30",
    version: "1.0",
    encryption: "AES-256",
    sha256: "D5A1B3E7C9F2D6A0B4E8F1C5A9D3B7E0F4A8C2D6B9E3F7A1C5D9B2E6F0A4C8D1",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Investigation Officer",
    sizePages: 2,
  },
  {
    id: "doc5",
    name: "Call_Detail_Records_Bansal.xlsx",
    type: "Digital Evidence Export",
    caseId: "CASE-2026-0142",
    classification: "SECRET",
    uploadedBy: "Dr. Nandini Rao",
    uploadedAt: "14 Aug 2026, 11:05",
    version: "1.0",
    encryption: "AES-256",
    sha256: "E6B2C4F8A0D3E7B1C5F9A2D6B0E4F8C1A5D9E3B7F0A4C8D2E6B9F3A1C5D7E0B4",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Forensic Analyst",
    sizePages: 1,
  },
  {
    id: "doc6",
    name: "Police_Report_Incident_142.pdf",
    type: "Police Report",
    caseId: "CASE-2026-0142",
    classification: "CONFIDENTIAL",
    uploadedBy: "Insp. Rohan Mehra",
    uploadedAt: "10 Aug 2026, 09:40",
    version: "1.0",
    encryption: "AES-256",
    sha256: "F7C3D5A9B1E4F8C2D6A0B4E8F1C5A9D3B7E0F4A8C2D6B9E3F7A1C5D9B2E6F0A4",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Investigation Officer",
    sizePages: 4,
  },
  {
    id: "doc7",
    name: "Server_Access_Logs_TechNova.csv",
    type: "Digital Evidence Export",
    caseId: "CASE-2026-0117",
    classification: "SECRET",
    uploadedBy: "Insp. Divya Shetty",
    uploadedAt: "23 Jul 2026, 08:55",
    version: "1.0",
    encryption: "AES-256",
    sha256: "A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Forensic Analyst",
    sizePages: 1,
  },
  {
    id: "doc8",
    name: "Sale_Deed_Forged_0098.pdf",
    type: "Property Document",
    caseId: "CASE-2026-0098",
    classification: "RESTRICTED",
    uploadedBy: "Insp. Rohan Mehra",
    uploadedAt: "01 Jul 2026, 12:15",
    version: "1.0",
    encryption: "AES-256",
    sha256: "B2C6D0E4F8A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Legal Officer",
    sizePages: 8,
  },
  {
    id: "doc9",
    name: "Vendor_Invoice_Ledger_0071.xlsx",
    type: "Financial Record",
    caseId: "CASE-2026-0071",
    classification: "CONFIDENTIAL",
    uploadedBy: "Insp. Divya Shetty",
    uploadedAt: "05 Apr 2026, 09:20",
    version: "1.2",
    encryption: "AES-256",
    sha256: "C3D7E1F5A9B2C6D0E4F8A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1",
    blockchainStatus: "VERIFIED",
    integrityStatus: "AUTHENTIC",
    custodian: "Supervisory Officer",
    sizePages: 22,
  },
];

/* -------------------------------------------------------------------- */
/* EVIDENCE                                                               */
/* -------------------------------------------------------------------- */
export const EVIDENCE = [
  { id: "EVID-3301", caseId: "CASE-2026-0142", type: "Digital", description: "Mobile phone seized from suspect's residence — Samsung Galaxy S23", source: "Site Search, 402 Marine Heights", custodian: "Forensic Analyst", dateAdded: "11 Aug 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
  { id: "EVID-3302", caseId: "CASE-2026-0142", type: "Document", description: "Printed bank statements recovered from suspect's office desk", source: "Site Search, Bansal Trading Co.", custodian: "Investigation Officer", dateAdded: "11 Aug 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
  { id: "EVID-3303", caseId: "CASE-2026-0142", type: "Digital", description: "Laptop hard drive image (forensic clone), 512GB SSD", source: "Bansal Trading Co. office", custodian: "Forensic Analyst", dateAdded: "12 Aug 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
  { id: "EVID-3304", caseId: "CASE-2026-0142", type: "Testimonial", description: "Recorded witness interview — building security guard", source: "Marine Heights Society office", custodian: "Investigation Officer", dateAdded: "11 Aug 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
  { id: "EVID-3305", caseId: "CASE-2026-0117", type: "Digital", description: "Server access log export from TechNova production database", source: "TechNova Systems Pvt. Ltd. DC-2", custodian: "Forensic Analyst", dateAdded: "23 Jul 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
  { id: "EVID-3306", caseId: "CASE-2026-0098", type: "Document", description: "Original registered sale deed obtained from Sub-Registrar office", source: "Sub-Registrar Office, Zone 4", custodian: "Legal Officer", dateAdded: "01 Jul 2026", integrityStatus: "AUTHENTIC", blockchainStatus: "VERIFIED" },
];

/* -------------------------------------------------------------------- */
/* CHAIN OF CUSTODY                                                       */
/* -------------------------------------------------------------------- */
export const CUSTODY_EVENTS = [
  { id: "cc1", targetId: "doc1", targetName: "FIR_2026_0142.pdf", caseId: "CASE-2026-0142", user: "Insp. Rohan Mehra", role: "Investigation Officer", action: "Evidence Uploaded", timestamp: "10 Aug 2026, 09:14", fromCustodian: "—", toCustodian: "Investigation Officer", verificationStatus: "VERIFIED" },
  { id: "cc2", targetId: "doc1", targetName: "FIR_2026_0142.pdf", caseId: "CASE-2026-0142", user: "System", role: "System", action: "SHA-256 Hash Generated", timestamp: "10 Aug 2026, 09:14", fromCustodian: "Investigation Officer", toCustodian: "Investigation Officer", verificationStatus: "VERIFIED" },
  { id: "cc3", targetId: "doc1", targetName: "FIR_2026_0142.pdf", caseId: "CASE-2026-0142", user: "System", role: "System", action: "Blockchain Registered", timestamp: "10 Aug 2026, 09:15", fromCustodian: "Investigation Officer", toCustodian: "Investigation Officer", verificationStatus: "VERIFIED" },
  { id: "cc4", targetId: "EVID-3301", targetName: "Mobile Phone — Samsung Galaxy S23", caseId: "CASE-2026-0142", user: "Dr. Nandini Rao", role: "Forensic Analyst", action: "Evidence Accessed", timestamp: "11 Aug 2026, 15:20", fromCustodian: "Investigation Officer", toCustodian: "Forensic Analyst", verificationStatus: "VERIFIED" },
  { id: "cc5", targetId: "EVID-3301", targetName: "Mobile Phone — Samsung Galaxy S23", caseId: "CASE-2026-0142", user: "Dr. Nandini Rao", role: "Forensic Analyst", action: "Forensic Analysis Submitted", timestamp: "13 Aug 2026, 17:45", fromCustodian: "Forensic Analyst", toCustodian: "Forensic Analyst", verificationStatus: "VERIFIED" },
  { id: "cc6", targetId: "EVID-3301", targetName: "Mobile Phone — Samsung Galaxy S23", caseId: "CASE-2026-0142", user: "Dr. Nandini Rao", role: "Forensic Analyst", action: "Custody Transferred", timestamp: "14 Aug 2026, 09:00", fromCustodian: "Forensic Analyst", toCustodian: "Investigation Officer", verificationStatus: "VERIFIED" },
  { id: "cc7", targetId: "doc3", targetName: "Bank_Transaction_Report_04.pdf", caseId: "CASE-2026-0142", user: "Adv. Simran Kapoor", role: "Legal Officer", action: "Document Accessed", timestamp: "15 Aug 2026, 11:12", fromCustodian: "Forensic Analyst", toCustodian: "Forensic Analyst", verificationStatus: "VERIFIED" },
  { id: "cc8", targetId: "doc3", targetName: "Bank_Transaction_Report_04.pdf", caseId: "CASE-2026-0142", user: "DCP Arvind Verma", role: "Supervisory Officer", action: "Integrity Verified", timestamp: "16 Aug 2026, 08:30", fromCustodian: "Forensic Analyst", toCustodian: "Forensic Analyst", verificationStatus: "VERIFIED" },
];

/* -------------------------------------------------------------------- */
/* BLOCKCHAIN RECORDS                                                     */
/* -------------------------------------------------------------------- */
export const BLOCKCHAIN_RECORDS = [
  { id: "bc1", documentId: "doc1", documentName: "FIR_2026_0142.pdf", documentHash: "A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A", blockchainHash: "A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A", timestamp: "10 Aug 2026, 09:15", version: "1.0", action: "Registration", actor: "Insp. Rohan Mehra", txId: "0x7F3A9C2E1D8B4F6A0C3E7B9D2F5A8C1E4B7D0F3A6C9E2B5D8F1A4C7E0B3D6F9" },
  { id: "bc2", documentId: "doc3", documentName: "Bank_Transaction_Report_04.pdf", documentHash: "C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0", blockchainHash: "C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0", timestamp: "12 Aug 2026, 10:48", version: "1.1", action: "Update", actor: "Dr. Nandini Rao", txId: "0x2B6E9D4A7C1F5B8E0A3D6C9F2B5E8A1D4C7F0B3E6A9D2C5F8B1E4A7D0C3F6B9" },
  { id: "bc3", documentId: "doc7", documentName: "Server_Access_Logs_TechNova.csv", documentHash: "A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9", blockchainHash: "A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9", timestamp: "23 Jul 2026, 08:56", version: "1.0", action: "Registration", actor: "Insp. Divya Shetty", txId: "0x9D3A6C0F4B7E1A5D8C2F6B9E3A7D0C4F8B1E5A9D2C6F0B3E7A1D4C8F2B6E9A3" },
];

/* -------------------------------------------------------------------- */
/* SECURITY ALERTS                                                        */
/* -------------------------------------------------------------------- */
export const SECURITY_ALERTS = [
  { id: "al1", severity: "CRITICAL", title: "Document integrity compromised", description: "Hash mismatch detected on Sale_Deed_Forged_0098.pdf — recorded hash no longer matches stored file.", target: "CASE-2026-0098", timestamp: "29 Aug 2026, 22:40", status: "OPEN" },
  { id: "al2", severity: "WARNING", title: "Unauthorized access attempt detected", description: "Access attempt to CASE-2026-0117 evidence vault by a user outside the assigned officer list.", target: "CASE-2026-0117", timestamp: "28 Aug 2026, 03:12", status: "UNDER REVIEW" },
  { id: "al3", severity: "WARNING", title: "Multiple failed login attempts", description: "5 consecutive failed login attempts for account io.ali within 2 minutes.", target: "User: io.ali", timestamp: "27 Aug 2026, 19:05", status: "UNDER REVIEW" },
  { id: "al4", severity: "RESOLVED", title: "Blockchain verification successful", description: "Routine integrity sweep confirmed all CASE-2026-0142 documents match their registered blockchain hash.", target: "CASE-2026-0142", timestamp: "26 Aug 2026, 06:00", status: "RESOLVED" },
  { id: "al5", severity: "INFO", title: "New evidence registered", description: "EVID-3305 added to CASE-2026-0117 and hashed to blockchain successfully.", target: "CASE-2026-0117", timestamp: "23 Jul 2026, 08:56", status: "RESOLVED" },
];

/* -------------------------------------------------------------------- */
/* AUDIT LEDGER                                                           */
/* -------------------------------------------------------------------- */
export const AUDIT_LOG = [
  { id: "a1", event: "Document Uploaded", actor: "Insp. Rohan Mehra", role: "Investigation Officer", timestamp: "10 Aug 2026, 09:14", target: "FIR_2026_0142.pdf — CASE-2026-0142", txId: "0x7F3A9C2E1D8B4F6A" },
  { id: "a2", event: "SHA-256 Generated", actor: "System", role: "System", timestamp: "10 Aug 2026, 09:14", target: "FIR_2026_0142.pdf", txId: "—" },
  { id: "a3", event: "Document Encrypted", actor: "System", role: "System", timestamp: "10 Aug 2026, 09:14", target: "FIR_2026_0142.pdf (AES-256)", txId: "—" },
  { id: "a4", event: "Blockchain Registered", actor: "System", role: "System", timestamp: "10 Aug 2026, 09:15", target: "FIR_2026_0142.pdf", txId: "0x7F3A9C2E1D8B4F6A" },
  { id: "a5", event: "Custody Transferred", actor: "Dr. Nandini Rao", role: "Forensic Analyst", timestamp: "14 Aug 2026, 09:00", target: "EVID-3301 → Investigation Officer", txId: "—" },
  { id: "a6", event: "Integrity Verified", actor: "DCP Arvind Verma", role: "Supervisory Officer", timestamp: "16 Aug 2026, 08:30", target: "Bank_Transaction_Report_04.pdf", txId: "0x2B6E9D4A7C1F5B8E" },
  { id: "a7", event: "Unauthorized Access Attempt", actor: "unknown", role: "—", timestamp: "28 Aug 2026, 03:12", target: "CASE-2026-0117 evidence vault", txId: "—" },
  { id: "a8", event: "Integrity Verification Failed", actor: "System", role: "System", timestamp: "29 Aug 2026, 22:40", target: "Sale_Deed_Forged_0098.pdf", txId: "—" },
  { id: "a9", event: "Permission Changed", actor: "Karthik Iyer", role: "System Administrator", timestamp: "25 Aug 2026, 12:03", target: "User: io.ali → Suspended", txId: "—" },
  { id: "a10", event: "Document Accessed", actor: "Adv. Simran Kapoor", role: "Legal Officer", timestamp: "15 Aug 2026, 11:12", target: "Bank_Transaction_Report_04.pdf", txId: "—" },
];

/* -------------------------------------------------------------------- */
/* AI DOCUMENT INTELLIGENCE                                               */
/* -------------------------------------------------------------------- */
export const AI_INSIGHTS = {
  doc1: {
    summary: "First Information Report registering a complaint of cyber extortion and unauthorized fund transfer filed against Rakesh Bansal. Names three corporate accounts affected and references an initial loss estimate of ₹42 lakh.",
    entities: {
      people: ["Rakesh Bansal", "Insp. Rohan Mehra", "Complainant: Vivek Chandra"],
      organizations: ["Bansal Trading Co.", "Chandra Exports Pvt. Ltd."],
      locations: ["Marine Heights, Mumbai", "Andheri Police Station"],
      phones: ["+91 98XXX-44127"],
      caseRefs: ["CASE-2026-0142"],
    },
    importantDates: [
      { date: "08 Aug 2026", event: "Extortion demand received via encrypted messaging app", source: "FIR_2026_0142.pdf" },
      { date: "09 Aug 2026", event: "Unauthorized transfer of ₹42,00,000 identified", source: "FIR_2026_0142.pdf" },
      { date: "10 Aug 2026", event: "FIR registered at Andheri Police Station", source: "FIR_2026_0142.pdf" },
    ],
    findings: [
      "Complainant reports three separate transfer requests within a 36-hour window.",
      "Extortion communication references internal company data not publicly available, suggesting possible insider knowledge.",
    ],
    relatedDocs: ["Witness_Statement_01.pdf", "Bank_Transaction_Report_04.pdf", "Police_Report_Incident_142.pdf"],
  },
  doc2: {
    summary: "Witness statement from the building security guard describing an unfamiliar individual accessing the suspect's office after business hours on the night preceding the reported fund transfer.",
    entities: {
      people: ["Security Guard: Ramlal Yadav", "Rakesh Bansal"],
      organizations: ["Bansal Trading Co."],
      locations: ["Marine Heights Society, Mumbai"],
      phones: [],
      caseRefs: ["CASE-2026-0142"],
    },
    importantDates: [
      { date: "08 Aug 2026", event: "Unidentified individual seen entering office at 11:40 PM", source: "Witness_Statement_02.pdf" },
    ],
    findings: [
      "Witness recalls the visitor carrying a laptop bag and departing within 20 minutes.",
      "Statement timing is broadly consistent with the extortion demand referenced in the FIR.",
    ],
    relatedDocs: ["FIR_2026_0142.pdf", "Witness_Statement_01.pdf"],
  },
  doc3: {
    summary: "Bank transaction report listing three outbound transfers from Bansal Trading Co.'s current account totalling ₹42,00,000, routed through two intermediary accounts before final withdrawal.",
    entities: {
      people: ["Rakesh Bansal"],
      organizations: ["Bansal Trading Co.", "Intermediary: Silverline Traders", "Intermediary: Kunal Enterprises"],
      locations: ["HDFC Bank, Andheri Branch"],
      phones: [],
      caseRefs: ["CASE-2026-0142"],
    },
    importantDates: [
      { date: "09 Aug 2026", event: "First transfer of ₹15,00,000 to Silverline Traders", source: "Bank_Transaction_Report_04.pdf" },
      { date: "09 Aug 2026", event: "Second transfer of ₹12,00,000 to Kunal Enterprises", source: "Bank_Transaction_Report_04.pdf" },
      { date: "10 Aug 2026", event: "Third transfer of ₹15,00,000 to Kunal Enterprises", source: "Bank_Transaction_Report_04.pdf" },
    ],
    findings: [
      "Both intermediary accounts were opened within the preceding 30 days — a pattern consistent with mule accounts.",
      "Withdrawal activity on both intermediary accounts occurred within 4 hours of receipt.",
    ],
    relatedDocs: ["FIR_2026_0142.pdf", "Call_Detail_Records_Bansal.xlsx"],
  },
};

/* -------------------------------------------------------------------- */
/* CASE INTELLIGENCE Q&A — seed conversation + source grounding           */
/* -------------------------------------------------------------------- */
export const QA_SEED = [
  { id: 1, role: "assistant", text: "I'm ready to answer questions about CASE-2026-0142, grounded only in the authorized documents attached to this case. Ask about people, evidence, timelines, or connections.", sources: [] },
];

export const QA_SUGGESTED = [
  "What evidence connects Person A and Person B?",
  "Summarize the sequence of transactions in this case.",
  "Which witnesses mention the night of 8 August?",
  "What is the relationship between the two intermediary accounts?",
];

/* -------------------------------------------------------------------- */
/* INVESTIGATION SEARCH                                                   */
/* -------------------------------------------------------------------- */
export const SEARCH_QUICK_PROMPTS = [
  "Show all documents mentioning this suspect.",
  "What evidence connects Person A and Person B?",
  "What events occurred between 10 January and 15 January?",
  "Show all documents related to this location.",
  "Which documents refer to the same phone number?",
];

export const SEARCH_RESULTS_SEED = [
  { document: "FIR_2026_0142.pdf", caseId: "CASE-2026-0142", entity: "Rakesh Bansal", context: "…complaint registered against Rakesh Bansal regarding unauthorized transfer of company funds…", date: "10 Aug 2026", type: "FIR", source: "Andheri Police Station" },
  { document: "Bank_Transaction_Report_04.pdf", caseId: "CASE-2026-0142", entity: "Silverline Traders", context: "…₹15,00,000 transferred to Silverline Traders on 09 Aug 2026, withdrawn within 4 hours…", date: "09 Aug 2026", type: "Financial Record", source: "HDFC Bank Andheri" },
  { document: "Witness_Statement_02.pdf", caseId: "CASE-2026-0142", entity: "Ramlal Yadav", context: "…security guard reports unidentified visitor entering the office at 11:40 PM carrying a laptop bag…", date: "08 Aug 2026", type: "Witness Statement", source: "Marine Heights Society" },
  { document: "Server_Access_Logs_TechNova.csv", caseId: "CASE-2026-0117", entity: "admin_backup_svc", context: "…service account admin_backup_svc accessed customer database outside scheduled backup window…", date: "20 Jul 2026", type: "Digital Evidence", source: "TechNova DC-2" },
];

/* -------------------------------------------------------------------- */
/* DOCUMENT COMPARISON                                                    */
/* -------------------------------------------------------------------- */
export const COMPARE_DOC_A = {
  name: "Witness_Statement_01.pdf",
  lines: [
    { type: "same", text: "On the night of 8th August 2026, I was on duty at the main gate of Marine Heights Society." },
    { type: "modified", text: "At approximately 8:00 PM, I observed the complainant Rakesh Bansal leave the premises." },
    { type: "same", text: "I did not observe any unfamiliar visitors entering the building that evening." },
    { type: "removed", text: "No unusual activity was recorded at the entrance during my shift." },
  ],
};
export const COMPARE_DOC_B = {
  name: "Witness_Statement_02.pdf",
  lines: [
    { type: "same", text: "On the night of 8th August 2026, I was on duty at the main gate of Marine Heights Society." },
    { type: "modified", text: "At approximately 6:30 PM, I observed the complainant Rakesh Bansal leave the premises." },
    { type: "same", text: "I did not observe any unfamiliar visitors entering the building that evening." },
    { type: "added", text: "At around 11:40 PM, an unidentified individual carrying a laptop bag entered and exited within 20 minutes." },
  ],
};

/* -------------------------------------------------------------------- */
/* CONTRADICTION & ANOMALY DETECTION                                      */
/* -------------------------------------------------------------------- */
export const CONTRADICTIONS = [
  {
    id: "cx1",
    caseId: "CASE-2026-0142",
    title: "Potential Timeline Contradiction — Incident Time",
    statements: [
      { source: "Witness_Statement_01.pdf", claim: "Incident time — 8:00 PM" },
      { source: "Witness_Statement_02.pdf", claim: "Incident time — 6:30 PM" },
      { source: "Police_Report_Incident_142.pdf", claim: "Incident time — 7:45 PM" },
    ],
    finding: "Potential timeline inconsistency detected across witness statements and the police report.",
    status: "Requires Human Review",
  },
  {
    id: "cx2",
    caseId: "CASE-2026-0142",
    title: "Possible Inconsistency — Transfer Amount",
    statements: [
      { source: "FIR_2026_0142.pdf", claim: "Total loss reported as ₹42,00,000" },
      { source: "Bank_Transaction_Report_04.pdf", claim: "Sum of recorded transfers is ₹42,00,000 across three transactions" },
    ],
    finding: "AI detected matching totals but differing transaction breakdowns between the FIR narrative and the bank report line items.",
    status: "Requires Human Review",
  },
  {
    id: "cx3",
    caseId: "CASE-2026-0117",
    title: "Possible Access Anomaly",
    statements: [
      { source: "Server_Access_Logs_TechNova.csv", claim: "Service account accessed database at 02:14 AM, outside scheduled window" },
      { source: "HR Roster (external)", claim: "No scheduled maintenance recorded for that account on this date" },
    ],
    finding: "AI detected an out-of-window access event with no corresponding maintenance record. Requires correlation with duty roster.",
    status: "Requires Human Review",
  },
];

/* -------------------------------------------------------------------- */
/* INVESTIGATION TIMELINE                                                 */
/* -------------------------------------------------------------------- */
export const TIMELINE_EVENTS = {
  "CASE-2026-0142": [
    { date: "08 Aug", event: "Extortion demand received via encrypted messaging app", source: "FIR_2026_0142.pdf", relatedEntity: "Rakesh Bansal" },
    { date: "08 Aug", event: "Unidentified visitor seen entering office at 11:40 PM", source: "Witness_Statement_02.pdf", relatedEntity: "Unknown Individual" },
    { date: "09 Aug", event: "First and second unauthorized transfers executed", source: "Bank_Transaction_Report_04.pdf", relatedEntity: "Silverline Traders" },
    { date: "10 Aug", event: "Third unauthorized transfer executed", source: "Bank_Transaction_Report_04.pdf", relatedEntity: "Kunal Enterprises" },
    { date: "10 Aug", event: "FIR registered at Andheri Police Station", source: "FIR_2026_0142.pdf", relatedEntity: "CASE-2026-0142" },
    { date: "11 Aug", event: "Mobile phone and documents seized from residence & office", source: "EVID-3301 / EVID-3302", relatedEntity: "Rakesh Bansal" },
    { date: "13 Aug", event: "Forensic analysis of seized device submitted", source: "EVID-3301", relatedEntity: "Dr. Nandini Rao" },
  ],
  "CASE-2026-0117": [
    { date: "18 Jul", event: "Anomalous database export volume flagged by monitoring", source: "Server_Access_Logs_TechNova.csv", relatedEntity: "TechNova Systems" },
    { date: "20 Jul", event: "Service account accessed database outside scheduled window", source: "Server_Access_Logs_TechNova.csv", relatedEntity: "admin_backup_svc" },
    { date: "22 Jul", event: "Case registered following internal audit escalation", source: "CASE-2026-0117", relatedEntity: "TechNova Systems" },
  ],
};

/* -------------------------------------------------------------------- */
/* INVESTIGATION KNOWLEDGE GRAPH                                          */
/* -------------------------------------------------------------------- */
export const KNOWLEDGE_GRAPH = {
  "CASE-2026-0142": {
    nodes: [
      { id: "n1", type: "person", label: "Rakesh Bansal" },
      { id: "n2", type: "organization", label: "Bansal Trading Co." },
      { id: "n3", type: "location", label: "Marine Heights, Mumbai" },
      { id: "n4", type: "organization", label: "Silverline Traders" },
      { id: "n5", type: "organization", label: "Kunal Enterprises" },
      { id: "n6", type: "person", label: "Ramlal Yadav (Witness)" },
      { id: "n7", type: "evidence", label: "EVID-3301 — Mobile Phone" },
      { id: "n8", type: "document", label: "FIR_2026_0142.pdf" },
      { id: "n9", type: "phone", label: "+91 98XXX-44127" },
      { id: "n10", type: "case", label: "CASE-2026-0142" },
    ],
    edges: [
      { source: "n1", target: "n2", relation: "owns" },
      { source: "n1", target: "n3", relation: "resides at" },
      { source: "n2", target: "n4", relation: "transferred funds to" },
      { source: "n2", target: "n5", relation: "transferred funds to" },
      { source: "n6", target: "n3", relation: "witnessed at" },
      { source: "n1", target: "n7", relation: "device seized from" },
      { source: "n1", target: "n8", relation: "named in" },
      { source: "n1", target: "n9", relation: "linked to number" },
      { source: "n8", target: "n10", relation: "filed under" },
      { source: "n7", target: "n10", relation: "evidence in" },
    ],
  },
};

/* -------------------------------------------------------------------- */
/* NOTIFICATIONS                                                          */
/* -------------------------------------------------------------------- */
export const NOTIFICATIONS_SEED = [
  { id: "n1", type: "alert", title: "Critical Integrity Alert", desc: "Hash mismatch detected on Sale_Deed_Forged_0098.pdf in CASE-2026-0098.", time: "8 min ago", read: false },
  { id: "n2", type: "custody", title: "Custody Transfer Pending Approval", desc: "EVID-3303 transfer from Forensic Analyst to Investigation Officer awaits supervisory approval.", time: "1 hour ago", read: false },
  { id: "n3", type: "ai", title: "AI Analysis Complete", desc: "Document Intelligence finished processing Bank_Transaction_Report_04.pdf.", time: "3 hours ago", read: true },
  { id: "n4", type: "blockchain", title: "Blockchain Registration Confirmed", desc: "Server_Access_Logs_TechNova.csv successfully registered on-chain.", time: "1 day ago", read: true },
];

export default {
  ROLES, LANGUAGES, ROLE_PREFIX, ROLE_SHORT, ROLE_PAGE_ACCESS, PERMISSION_MATRIX,
  MOCK_USERS, USERS, CASES, DOCUMENTS, EVIDENCE, CUSTODY_EVENTS, BLOCKCHAIN_RECORDS,
  SECURITY_ALERTS, AUDIT_LOG, AI_INSIGHTS, QA_SEED, QA_SUGGESTED, SEARCH_QUICK_PROMPTS,
  SEARCH_RESULTS_SEED, COMPARE_DOC_A, COMPARE_DOC_B, CONTRADICTIONS, TIMELINE_EVENTS,
  KNOWLEDGE_GRAPH, NOTIFICATIONS_SEED,
};
