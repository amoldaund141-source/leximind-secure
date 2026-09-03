"""
LexiMind Secure — Demo Data Seeder
python manage.py seed_demo_data

Recreates every row from src/data/mockData.js so the running app
looks identical to the current mock-data demo on first login.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
import datetime


class Command(BaseCommand):
    help = "Seed all demo data from mockData.js into the database."

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding LexiMind Secure demo data...")
        self._seed_users()
        self._seed_permissions()
        self._seed_cases()
        self._seed_documents()
        self._seed_evidence()
        self._seed_blockchain()
        self._seed_custody()
        self._seed_alerts()
        self._seed_audit()
        self._seed_ai()
        self._seed_notifications()
        self._seed_system_settings()
        self.stdout.write(self.style.SUCCESS("✅ Demo data seeded successfully!"))

    # ── Users ──────────────────────────────────────────────────────────────────
    def _seed_users(self):
        from apps.accounts.models import User, RoleCode, UserStatus, RolePageAccess

        USERS = [
            dict(username="io.mehra",    full_name="Insp. Rohan Mehra",      role=RoleCode.IO, department="Cyber Crime Cell",         badge_number="IO-4471", status=UserStatus.ACTIVE),
            dict(username="fa.nandini",  full_name="Dr. Nandini Rao",         role=RoleCode.FA, department="Forensic Sciences Lab",    badge_number="FA-2209", status=UserStatus.ACTIVE),
            dict(username="lo.kapoor",   full_name="Adv. Simran Kapoor",      role=RoleCode.LO, department="Prosecution Wing",         badge_number="LO-1183", status=UserStatus.ACTIVE),
            dict(username="so.verma",    full_name="DCP Arvind Verma",        role=RoleCode.SO, department="Investigation Division",   badge_number="SO-0091", status=UserStatus.ACTIVE),
            dict(username="admin.iyer",  full_name="Karthik Iyer",            role=RoleCode.SA, department="IT & Systems Security",   badge_number="SA-0007", status=UserStatus.ACTIVE),
            dict(username="io.shetty",   full_name="Insp. Divya Shetty",      role=RoleCode.IO, department="Economic Offences Wing",  badge_number="IO-5512", status=UserStatus.ACTIVE),
            dict(username="io.ali",      full_name="Sub-Insp. Farhan Ali",    role=RoleCode.IO, department="Cyber Crime Cell",         badge_number="IO-5513", status=UserStatus.SUSPENDED),
            dict(username="fa.joshi",    full_name="Dr. Meera Joshi",         role=RoleCode.FA, department="Digital Forensics Unit",  badge_number="FA-2210", status=UserStatus.ACTIVE),
        ]

        for data in USERS:
            user, created = User.objects.get_or_create(username=data["username"])
            for k, v in data.items():
                setattr(user, k, v)
            user.set_password("secure123")
            user.save()
            self.stdout.write(f"  {'Created' if created else 'Updated'} user: {data['username']}")

        # RolePageAccess
        ROLE_PAGE_ACCESS = {
            RoleCode.IO: ["dashboard","vault","upload","ai-intelligence","search","compare","cases","evidence","custody","timeline","qa","knowledge-graph","contradictions","blockchain","integrity","alerts","audit","notifications","settings"],
            RoleCode.FA: ["dashboard","vault","ai-intelligence","evidence","custody","timeline","qa","knowledge-graph","contradictions","blockchain","integrity","notifications","settings"],
            RoleCode.LO: ["dashboard","vault","ai-intelligence","search","compare","cases","timeline","qa","knowledge-graph","contradictions","blockchain","notifications","settings"],
            RoleCode.SO: ["dashboard","vault","cases","evidence","custody","timeline","qa","knowledge-graph","contradictions","blockchain","integrity","alerts","audit","notifications","settings"],
            RoleCode.SA: ["dashboard","users","access-control","system-settings","alerts","audit","notifications","settings"],
        }
        RolePageAccess.objects.all().delete()
        for role, pages in ROLE_PAGE_ACCESS.items():
            for page_id in pages:
                RolePageAccess.objects.get_or_create(role=role, page_id=page_id)
        self.stdout.write("  RolePageAccess seeded")

    # ── Permission Matrix ──────────────────────────────────────────────────────
    def _seed_permissions(self):
        from apps.accounts.models import PermissionMatrixEntry, RoleCode, ActionCode
        MATRIX = {
            RoleCode.IO: {"Upload": True,  "Download": True,  "Verify": True,  "Custody Transfer": True,  "Approve": False, "Manage": False},
            RoleCode.FA: {"Upload": False, "Download": True,  "Verify": True,  "Custody Transfer": False, "Approve": False, "Manage": False},
            RoleCode.LO: {"Upload": False, "Download": True,  "Verify": True,  "Custody Transfer": False, "Approve": False, "Manage": False},
            RoleCode.SO: {"Upload": False, "Download": True,  "Verify": True,  "Custody Transfer": True,  "Approve": True,  "Manage": False},
            RoleCode.SA: {"Upload": True,  "Download": True,  "Verify": True,  "Custody Transfer": True,  "Approve": True,  "Manage": True},
        }
        PermissionMatrixEntry.objects.all().delete()
        for role, actions in MATRIX.items():
            for action, allowed in actions.items():
                PermissionMatrixEntry.objects.create(role=role, action=action, allowed=allowed)
        self.stdout.write("  PermissionMatrix seeded")

    # ── Cases ──────────────────────────────────────────────────────────────────
    def _seed_cases(self):
        from apps.accounts.models import User
        from apps.cases.models import Case
        CASES = [
            dict(case_id="CASE-2026-0142", title="State vs. Rakesh Bansal — Financial Fraud & Cyber Extortion",
                 description="Investigation into a coordinated online extortion scheme linked to unauthorized bank transfers from three corporate accounts.",
                 classification="CONFIDENTIAL", status="ACTIVE", category="Cyber Financial Crime",
                 created_date=datetime.date(2026, 8, 10),
                 officers=["io.mehra", "fa.nandini", "lo.kapoor"]),
            dict(case_id="CASE-2026-0117", title="State vs. Unknown — Data Breach, TechNova Systems",
                 description="Unauthorized exfiltration of customer PII from TechNova Systems' internal servers; suspected insider involvement.",
                 classification="SECRET", status="ACTIVE", category="Data Breach",
                 created_date=datetime.date(2026, 7, 22),
                 officers=["io.shetty", "fa.joshi"]),
            dict(case_id="CASE-2026-0098", title="State vs. Imran Qureshi — Property Document Forgery",
                 description="Alleged forgery of registered property title documents used to secure a fraudulent bank loan.",
                 classification="RESTRICTED", status="UNDER REVIEW", category="Document Forgery",
                 created_date=datetime.date(2026, 6, 30),
                 officers=["io.mehra", "lo.kapoor"]),
            dict(case_id="CASE-2026-0071", title="State vs. Sanjay Oberoi — Corporate Embezzlement",
                 description="Diversion of company funds through shell vendor invoices over an 18-month period.",
                 classification="CONFIDENTIAL", status="CLOSED", category="Financial Crime",
                 created_date=datetime.date(2026, 4, 2),
                 officers=["so.verma", "io.shetty"]),
        ]
        for data in CASES:
            officers = data.pop("officers")
            case, created = Case.objects.get_or_create(case_id=data["case_id"], defaults=data)
            if not created:
                for k, v in data.items():
                    setattr(case, k, v)
                case.save()
            users = User.objects.filter(username__in=officers)
            case.assigned_officers.set(users)
            self.stdout.write(f"  Case: {case.case_id}")

    # ── Documents ─────────────────────────────────────────────────────────────
    def _seed_documents(self):
        from apps.accounts.models import User
        from apps.cases.models import Case
        from apps.documents.models import Document, IntegrityStatus, BlockchainStatus
        DOCS = [
            dict(short_id="doc1", name="FIR_2026_0142.pdf", type="First Information Report", case_id="CASE-2026-0142", classification="CONFIDENTIAL", uploader="io.mehra", version="1.0", sha256="A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A", custodian_role="Investigation Officer", size_pages=6),
            dict(short_id="doc2", name="Witness_Statement_02.pdf", type="Witness Statement", case_id="CASE-2026-0142", classification="CONFIDENTIAL", uploader="io.mehra", version="1.0", sha256="B3E9F1C5A7D2E8B4C1F6A9D3E7B2C5F8A1D4E9B6C3F0A7D2E5B8C1F4A9D6E3B0", custodian_role="Forensic Analyst", size_pages=3),
            dict(short_id="doc3", name="Bank_Transaction_Report_04.pdf", type="Financial Record", case_id="CASE-2026-0142", classification="SECRET", uploader="fa.nandini", version="1.1", sha256="C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0", custodian_role="Forensic Analyst", size_pages=11),
            dict(short_id="doc4", name="Witness_Statement_01.pdf", type="Witness Statement", case_id="CASE-2026-0142", classification="CONFIDENTIAL", uploader="io.mehra", version="1.0", sha256="D5A1B3E7C9F2D6A0B4E8F1C5A9D3B7E0F4A8C2D6B9E3F7A1C5D9B2E6F0A4C8D1", custodian_role="Investigation Officer", size_pages=2),
            dict(short_id="doc5", name="Call_Detail_Records_Bansal.xlsx", type="Digital Evidence Export", case_id="CASE-2026-0142", classification="SECRET", uploader="fa.nandini", version="1.0", sha256="E6B2C4F8A0D3E7B1C5F9A2D6B0E4F8C1A5D9E3B7F0A4C8D2E6B9F3A1C5D7E0B4", custodian_role="Forensic Analyst", size_pages=1),
            dict(short_id="doc6", name="Police_Report_Incident_142.pdf", type="Police Report", case_id="CASE-2026-0142", classification="CONFIDENTIAL", uploader="io.mehra", version="1.0", sha256="F7C3D5A9B1E4F8C2D6A0B4E8F1C5A9D3B7E0F4A8C2D6B9E3F7A1C5D9B2E6F0A4", custodian_role="Investigation Officer", size_pages=4),
            dict(short_id="doc7", name="Server_Access_Logs_TechNova.csv", type="Digital Evidence Export", case_id="CASE-2026-0117", classification="SECRET", uploader="io.shetty", version="1.0", sha256="A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9", custodian_role="Forensic Analyst", size_pages=1),
            dict(short_id="doc8", name="Sale_Deed_Forged_0098.pdf", type="Property Document", case_id="CASE-2026-0098", classification="RESTRICTED", uploader="io.mehra", version="1.0", sha256="B2C6D0E4F8A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0", custodian_role="Legal Officer", size_pages=8),
            dict(short_id="doc9", name="Vendor_Invoice_Ledger_0071.xlsx", type="Financial Record", case_id="CASE-2026-0071", classification="CONFIDENTIAL", uploader="io.shetty", version="1.2", sha256="C3D7E1F5A9B2C6D0E4F8A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1", custodian_role="Supervisory Officer", size_pages=22),
        ]
        for data in DOCS:
            case = Case.objects.get(case_id=data.pop("case_id"))
            uploader = User.objects.get(username=data.pop("uploader"))
            short_id = data.pop("short_id")
            sha = data.get("sha256")
            doc, created = Document.objects.get_or_create(
                short_id=short_id,
                defaults={
                    **data,
                    "case": case,
                    "uploaded_by": uploader,
                    "stored_hash": sha,
                    "blockchain_status": BlockchainStatus.VERIFIED,
                    "integrity_status": IntegrityStatus.AUTHENTIC,
                    "encryption": "AES-256",
                },
            )
            self.stdout.write(f"  Document: {short_id} — {doc.name}")

    # ── Evidence ──────────────────────────────────────────────────────────────
    def _seed_evidence(self):
        from apps.cases.models import Case
        from apps.evidence.models import Evidence
        EVIDENCE = [
            dict(evidence_id="EVID-3301", case_id="CASE-2026-0142", type="Digital", description="Mobile phone seized from suspect's residence — Samsung Galaxy S23", source="Site Search, 402 Marine Heights", custodian_role="Forensic Analyst", date_added=datetime.date(2026,8,11), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
            dict(evidence_id="EVID-3302", case_id="CASE-2026-0142", type="Document", description="Printed bank statements recovered from suspect's office desk", source="Site Search, Bansal Trading Co.", custodian_role="Investigation Officer", date_added=datetime.date(2026,8,11), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
            dict(evidence_id="EVID-3303", case_id="CASE-2026-0142", type="Digital", description="Laptop hard drive image (forensic clone), 512GB SSD", source="Bansal Trading Co. office", custodian_role="Forensic Analyst", date_added=datetime.date(2026,8,12), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
            dict(evidence_id="EVID-3304", case_id="CASE-2026-0142", type="Testimonial", description="Recorded witness interview — building security guard", source="Marine Heights Society office", custodian_role="Investigation Officer", date_added=datetime.date(2026,8,11), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
            dict(evidence_id="EVID-3305", case_id="CASE-2026-0117", type="Digital", description="Server access log export from TechNova production database", source="TechNova Systems Pvt. Ltd. DC-2", custodian_role="Forensic Analyst", date_added=datetime.date(2026,7,23), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
            dict(evidence_id="EVID-3306", case_id="CASE-2026-0098", type="Document", description="Original registered sale deed obtained from Sub-Registrar office", source="Sub-Registrar Office, Zone 4", custodian_role="Legal Officer", date_added=datetime.date(2026,7,1), integrity_status="AUTHENTIC", blockchain_status="VERIFIED"),
        ]
        for data in EVIDENCE:
            case = Case.objects.get(case_id=data.pop("case_id"))
            Evidence.objects.get_or_create(evidence_id=data["evidence_id"], defaults={**data, "case": case})
            self.stdout.write(f"  Evidence: {data['evidence_id']}")

    # ── Blockchain Records ────────────────────────────────────────────────────
    def _seed_blockchain(self):
        from apps.accounts.models import User
        from apps.documents.models import Document
        from apps.blockchain.models import BlockchainRecord
        RECORDS = [
            dict(doc_id="doc1", doc_hash="A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A", bc_hash="A8C7D8F8E21B4C9A3F0D5E7B1C6A9F3D2E8B7C4A1F9D6E3B0C7A4F1D8E5B2C9A", tx="0x7F3A9C2E1D8B4F6A0C3E7B9D2F5A8C1E4B7D0F3A6C9E2B5D8F1A4C7E0B3D6F9", actor="io.mehra", action="Registration", version="1.0"),
            dict(doc_id="doc3", doc_hash="C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0", bc_hash="C4F0A2D6B8E3F1A5C9D7B2E6F0A3C8D1E5B9F2A6D3C7E0B4F8A1D5E9B2C6F3A0", tx="0x2B6E9D4A7C1F5B8E0A3D6C9F2B5E8A1D4C7F0B3E6A9D2C5F8B1E4A7D0C3F6B9", actor="fa.nandini", action="Update", version="1.1"),
            dict(doc_id="doc7", doc_hash="A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9", bc_hash="A1B5C9D3E7F0A4B8C2D6E9F3A7B1C5D9E2F6A0B4C8D1E5F9A3B7C0D4E8F2A6B9", tx="0x9D3A6C0F4B7E1A5D8C2F6B9E3A7D0C4F8B1E5A9D2C6F0B3E7A1D4C8F2B6E9A3", actor="io.shetty", action="Registration", version="1.0"),
        ]
        for data in RECORDS:
            doc = Document.objects.get(short_id=data["doc_id"])
            actor = User.objects.get(username=data["actor"])
            BlockchainRecord.objects.get_or_create(
                tx_id=data["tx"],
                defaults=dict(document=doc, document_hash=data["doc_hash"], blockchain_hash=data["bc_hash"],
                              action=data["action"], actor=actor, version=data["version"], prev_tx_id="GENESIS"),
            )
            self.stdout.write(f"  Blockchain: {data['tx'][:20]}...")

    # ── Custody Events ────────────────────────────────────────────────────────
    def _seed_custody(self):
        from apps.accounts.models import User
        from apps.cases.models import Case
        from apps.documents.models import Document
        from apps.evidence.models import Evidence
        from apps.custody.models import CustodyEvent
        import pytz
        IST = pytz.timezone("Asia/Kolkata")

        def ts(s):
            from django.utils import timezone as tz
            naive = datetime.datetime.strptime(s, "%d %b %Y, %H:%M")
            return tz.make_aware(naive, IST)

        EVENTS = [
            dict(id="cc1", ttype="document", tid="doc1", case_id="CASE-2026-0142", uname="io.mehra",   action="Evidence Uploaded",          ts="10 Aug 2026, 09:14", fr="—",                    to="Investigation Officer", vs="VERIFIED"),
            dict(id="cc2", ttype="document", tid="doc1", case_id="CASE-2026-0142", uname=None,          action="SHA-256 Hash Generated",     ts="10 Aug 2026, 09:14", fr="Investigation Officer", to="Investigation Officer", vs="VERIFIED"),
            dict(id="cc3", ttype="document", tid="doc1", case_id="CASE-2026-0142", uname=None,          action="Blockchain Registered",      ts="10 Aug 2026, 09:15", fr="Investigation Officer", to="Investigation Officer", vs="VERIFIED"),
            dict(id="cc4", ttype="evidence", tid="EVID-3301", case_id="CASE-2026-0142", uname="fa.nandini", action="Evidence Accessed",      ts="11 Aug 2026, 15:20", fr="Investigation Officer", to="Forensic Analyst",     vs="VERIFIED"),
            dict(id="cc5", ttype="evidence", tid="EVID-3301", case_id="CASE-2026-0142", uname="fa.nandini", action="Forensic Analysis Submitted", ts="13 Aug 2026, 17:45", fr="Forensic Analyst", to="Forensic Analyst",   vs="VERIFIED"),
            dict(id="cc6", ttype="evidence", tid="EVID-3301", case_id="CASE-2026-0142", uname="fa.nandini", action="Custody Transferred",   ts="14 Aug 2026, 09:00", fr="Forensic Analyst",     to="Investigation Officer", vs="VERIFIED"),
            dict(id="cc7", ttype="document", tid="doc3", case_id="CASE-2026-0142", uname="lo.kapoor",   action="Document Accessed",         ts="15 Aug 2026, 11:12", fr="Forensic Analyst",     to="Forensic Analyst",     vs="VERIFIED"),
            dict(id="cc8", ttype="document", tid="doc3", case_id="CASE-2026-0142", uname="so.verma",    action="Integrity Verified",        ts="16 Aug 2026, 08:30", fr="Forensic Analyst",     to="Forensic Analyst",     vs="VERIFIED"),
        ]
        CustodyEvent.objects.all().delete()
        for ev in EVENTS:
            case = Case.objects.get(case_id=ev["case_id"])
            user = User.objects.get(username=ev["uname"]) if ev["uname"] else None

            if ev["ttype"] == "document":
                obj_id = Document.objects.get(short_id=ev["tid"]).id
            else:
                obj_id = Evidence.objects.get(evidence_id=ev["tid"]).id

            ce = CustodyEvent.objects.create(
                content_type_label=ev["ttype"],
                object_id=obj_id,
                case=case,
                user=user,
                action=ev["action"],
                from_custodian_role=ev["fr"],
                to_custodian_role=ev["to"],
                verification_status=ev["vs"],
            )
            # Force the timestamp to match seed
            CustodyEvent.objects.filter(pk=ce.pk).update(timestamp=ts(ev["ts"]))
            self.stdout.write(f"  Custody: {ev['action'][:30]}")

    # ── Security Alerts ───────────────────────────────────────────────────────
    def _seed_alerts(self):
        from apps.alerts.models import SecurityAlert
        import pytz
        IST = pytz.timezone("Asia/Kolkata")

        def ts(s):
            from django.utils import timezone as tz
            naive = datetime.datetime.strptime(s, "%d %b %Y, %H:%M")
            return tz.make_aware(naive, IST)

        ALERTS = [
            dict(severity="CRITICAL", title="Document integrity compromised", description="Hash mismatch detected on Sale_Deed_Forged_0098.pdf — recorded hash no longer matches stored file.", target="CASE-2026-0098", ts="29 Aug 2026, 22:40", status="OPEN"),
            dict(severity="WARNING",  title="Unauthorized access attempt detected", description="Access attempt to CASE-2026-0117 evidence vault by a user outside the assigned officer list.", target="CASE-2026-0117", ts="28 Aug 2026, 03:12", status="UNDER REVIEW"),
            dict(severity="WARNING",  title="Multiple failed login attempts", description="5 consecutive failed login attempts for account io.ali within 2 minutes.", target="User: io.ali", ts="27 Aug 2026, 19:05", status="UNDER REVIEW"),
            dict(severity="RESOLVED", title="Blockchain verification successful", description="Routine integrity sweep confirmed all CASE-2026-0142 documents match their registered blockchain hash.", target="CASE-2026-0142", ts="26 Aug 2026, 06:00", status="RESOLVED"),
            dict(severity="INFO",     title="New evidence registered", description="EVID-3305 added to CASE-2026-0117 and hashed to blockchain successfully.", target="CASE-2026-0117", ts="23 Jul 2026, 08:56", status="RESOLVED"),
        ]
        SecurityAlert.objects.all().delete()
        for data in ALERTS:
            alert = SecurityAlert.objects.create(
                severity=data["severity"], title=data["title"],
                description=data["description"], target=data["target"], status=data["status"],
            )
            SecurityAlert.objects.filter(pk=alert.pk).update(timestamp=ts(data["ts"]))
            self.stdout.write(f"  Alert: {data['title'][:40]}")

    # ── Audit Log ─────────────────────────────────────────────────────────────
    def _seed_audit(self):
        from apps.accounts.models import User
        from apps.audit.models import AuditLogEntry
        import pytz
        IST = pytz.timezone("Asia/Kolkata")

        def ts(s):
            from django.utils import timezone as tz
            naive = datetime.datetime.strptime(s, "%d %b %Y, %H:%M")
            return tz.make_aware(naive, IST)

        AUDIT = [
            dict(event="Document Uploaded",           actor_u="io.mehra",   role="Investigation Officer", ts="10 Aug 2026, 09:14", target="FIR_2026_0142.pdf — CASE-2026-0142",    tx_id="0x7F3A9C2E1D8B4F6A"),
            dict(event="SHA-256 Generated",           actor_u=None,         role="System",                ts="10 Aug 2026, 09:14", target="FIR_2026_0142.pdf",                      tx_id="—"),
            dict(event="Document Encrypted",          actor_u=None,         role="System",                ts="10 Aug 2026, 09:14", target="FIR_2026_0142.pdf (AES-256)",            tx_id="—"),
            dict(event="Blockchain Registered",       actor_u=None,         role="System",                ts="10 Aug 2026, 09:15", target="FIR_2026_0142.pdf",                      tx_id="0x7F3A9C2E1D8B4F6A"),
            dict(event="Custody Transferred",         actor_u="fa.nandini", role="Forensic Analyst",      ts="14 Aug 2026, 09:00", target="EVID-3301 → Investigation Officer",       tx_id="—"),
            dict(event="Integrity Verified",          actor_u="so.verma",   role="Supervisory Officer",   ts="16 Aug 2026, 08:30", target="Bank_Transaction_Report_04.pdf",         tx_id="0x2B6E9D4A7C1F5B8E"),
            dict(event="Unauthorized Access Attempt", actor_u=None,         role="—",                     ts="28 Aug 2026, 03:12", target="CASE-2026-0117 evidence vault",           tx_id="—"),
            dict(event="Integrity Verification Failed", actor_u=None,       role="System",                ts="29 Aug 2026, 22:40", target="Sale_Deed_Forged_0098.pdf",              tx_id="—"),
            dict(event="Permission Changed",          actor_u="admin.iyer", role="System Administrator",  ts="25 Aug 2026, 12:03", target="User: io.ali → Suspended",               tx_id="—"),
            dict(event="Document Accessed",           actor_u="lo.kapoor",  role="Legal Officer",         ts="15 Aug 2026, 11:12", target="Bank_Transaction_Report_04.pdf",         tx_id="—"),
        ]
        AuditLogEntry.objects.all().delete()
        for data in AUDIT:
            actor = User.objects.get(username=data["actor_u"]) if data["actor_u"] else None
            entry = AuditLogEntry.objects.create(
                event=data["event"], actor=actor,
                actor_role_snapshot=data["role"],
                target=data["target"], tx_id=data["tx_id"],
            )
            AuditLogEntry.objects.filter(pk=entry.pk).update(timestamp=ts(data["ts"]))
            self.stdout.write(f"  Audit: {data['event']}")

    # ── AI Data ───────────────────────────────────────────────────────────────
    def _seed_ai(self):
        from apps.documents.models import Document
        from apps.cases.models import Case
        from apps.ai.models import (
            DocumentInsight, Contradiction, TimelineEvent,
            KnowledgeGraphNode, KnowledgeGraphEdge, CaseQAThread, CaseQAMessage,
        )

        # AI Insights
        INSIGHTS = {
            "doc1": dict(
                summary="First Information Report registering a complaint of cyber extortion and unauthorized fund transfer filed against Rakesh Bansal. Names three corporate accounts affected and references an initial loss estimate of ₹42 lakh.",
                entities={"people": ["Rakesh Bansal", "Insp. Rohan Mehra", "Complainant: Vivek Chandra"], "organizations": ["Bansal Trading Co.", "Chandra Exports Pvt. Ltd."], "locations": ["Marine Heights, Mumbai", "Andheri Police Station"], "phones": ["+91 98XXX-44127"], "caseRefs": ["CASE-2026-0142"]},
                important_dates=[{"date": "08 Aug 2026", "event": "Extortion demand received via encrypted messaging app", "source": "FIR_2026_0142.pdf"}, {"date": "09 Aug 2026", "event": "Unauthorized transfer of ₹42,00,000 identified", "source": "FIR_2026_0142.pdf"}, {"date": "10 Aug 2026", "event": "FIR registered at Andheri Police Station", "source": "FIR_2026_0142.pdf"}],
                findings=["Complainant reports three separate transfer requests within a 36-hour window.", "Extortion communication references internal company data not publicly available, suggesting possible insider knowledge."],
                related_doc_names=["Witness_Statement_01.pdf", "Bank_Transaction_Report_04.pdf", "Police_Report_Incident_142.pdf"],
            ),
            "doc2": dict(
                summary="Witness statement from the building security guard describing an unfamiliar individual accessing the suspect's office after business hours on the night preceding the reported fund transfer.",
                entities={"people": ["Security Guard: Ramlal Yadav", "Rakesh Bansal"], "organizations": ["Bansal Trading Co."], "locations": ["Marine Heights Society, Mumbai"], "phones": [], "caseRefs": ["CASE-2026-0142"]},
                important_dates=[{"date": "08 Aug 2026", "event": "Unidentified individual seen entering office at 11:40 PM", "source": "Witness_Statement_02.pdf"}],
                findings=["Witness recalls the visitor carrying a laptop bag and departing within 20 minutes.", "Statement timing is broadly consistent with the extortion demand referenced in the FIR."],
                related_doc_names=["FIR_2026_0142.pdf", "Witness_Statement_01.pdf"],
            ),
            "doc3": dict(
                summary="Bank transaction report listing three outbound transfers from Bansal Trading Co.'s current account totalling ₹42,00,000, routed through two intermediary accounts before final withdrawal.",
                entities={"people": ["Rakesh Bansal"], "organizations": ["Bansal Trading Co.", "Intermediary: Silverline Traders", "Intermediary: Kunal Enterprises"], "locations": ["HDFC Bank, Andheri Branch"], "phones": [], "caseRefs": ["CASE-2026-0142"]},
                important_dates=[{"date": "09 Aug 2026", "event": "First transfer of ₹15,00,000 to Silverline Traders", "source": "Bank_Transaction_Report_04.pdf"}, {"date": "09 Aug 2026", "event": "Second transfer of ₹12,00,000 to Kunal Enterprises", "source": "Bank_Transaction_Report_04.pdf"}, {"date": "10 Aug 2026", "event": "Third transfer of ₹15,00,000 to Kunal Enterprises", "source": "Bank_Transaction_Report_04.pdf"}],
                findings=["Both intermediary accounts were opened within the preceding 30 days — a pattern consistent with mule accounts.", "Withdrawal activity on both intermediary accounts occurred within 4 hours of receipt."],
                related_doc_names=["FIR_2026_0142.pdf", "Call_Detail_Records_Bansal.xlsx"],
            ),
        }
        for doc_id, data in INSIGHTS.items():
            try:
                doc = Document.objects.get(short_id=doc_id)
                DocumentInsight.objects.update_or_create(document=doc, defaults=data)
                self.stdout.write(f"  AI Insight: {doc_id}")
            except Document.DoesNotExist:
                pass

        # Contradictions
        case142 = Case.objects.get(case_id="CASE-2026-0142")
        case117 = Case.objects.get(case_id="CASE-2026-0117")
        Contradiction.objects.all().delete()
        CONTRAS = [
            dict(case=case142, title="Potential Timeline Contradiction — Incident Time", statements=[{"source": "Witness_Statement_01.pdf", "claim": "Incident time — 8:00 PM"}, {"source": "Witness_Statement_02.pdf", "claim": "Incident time — 6:30 PM"}, {"source": "Police_Report_Incident_142.pdf", "claim": "Incident time — 7:45 PM"}], finding="Potential timeline inconsistency detected across witness statements and the police report.", status="Requires Human Review"),
            dict(case=case142, title="Possible Inconsistency — Transfer Amount", statements=[{"source": "FIR_2026_0142.pdf", "claim": "Total loss reported as ₹42,00,000"}, {"source": "Bank_Transaction_Report_04.pdf", "claim": "Sum of recorded transfers is ₹42,00,000 across three transactions"}], finding="AI detected matching totals but differing transaction breakdowns between the FIR narrative and the bank report line items.", status="Requires Human Review"),
            dict(case=case117, title="Possible Access Anomaly", statements=[{"source": "Server_Access_Logs_TechNova.csv", "claim": "Service account accessed database at 02:14 AM, outside scheduled window"}, {"source": "HR Roster (external)", "claim": "No scheduled maintenance recorded for that account on this date"}], finding="AI detected an out-of-window access event with no corresponding maintenance record. Requires correlation with duty roster.", status="Requires Human Review"),
        ]
        for c in CONTRAS:
            Contradiction.objects.create(**c)
            self.stdout.write(f"  Contradiction: {c['title'][:40]}")

        # Timeline events
        TimelineEvent.objects.all().delete()
        TIMELINE = {
            "CASE-2026-0142": [
                dict(date="08 Aug", event="Extortion demand received via encrypted messaging app", source="FIR_2026_0142.pdf", related_entity="Rakesh Bansal"),
                dict(date="08 Aug", event="Unidentified visitor seen entering office at 11:40 PM", source="Witness_Statement_02.pdf", related_entity="Unknown Individual"),
                dict(date="09 Aug", event="First and second unauthorized transfers executed", source="Bank_Transaction_Report_04.pdf", related_entity="Silverline Traders"),
                dict(date="10 Aug", event="Third unauthorized transfer executed", source="Bank_Transaction_Report_04.pdf", related_entity="Kunal Enterprises"),
                dict(date="10 Aug", event="FIR registered at Andheri Police Station", source="FIR_2026_0142.pdf", related_entity="CASE-2026-0142"),
                dict(date="11 Aug", event="Mobile phone and documents seized from residence & office", source="EVID-3301 / EVID-3302", related_entity="Rakesh Bansal"),
                dict(date="13 Aug", event="Forensic analysis of seized device submitted", source="EVID-3301", related_entity="Dr. Nandini Rao"),
            ],
            "CASE-2026-0117": [
                dict(date="18 Jul", event="Anomalous database export volume flagged by monitoring", source="Server_Access_Logs_TechNova.csv", related_entity="TechNova Systems"),
                dict(date="20 Jul", event="Service account accessed database outside scheduled window", source="Server_Access_Logs_TechNova.csv", related_entity="admin_backup_svc"),
                dict(date="22 Jul", event="Case registered following internal audit escalation", source="CASE-2026-0117", related_entity="TechNova Systems"),
            ],
        }
        for case_id, events in TIMELINE.items():
            case = Case.objects.get(case_id=case_id)
            for ev in events:
                TimelineEvent.objects.create(case=case, **ev)
        self.stdout.write("  Timeline events seeded")

        # --- SEED CASE-2026-0071 FOR SIH END-TO-END DEMO ---
        try:
            case71 = Case.objects.get(case_id="CASE-2026-0071")
            case71.status = "ACTIVE"
            case71.save()

            # Timeline
            events = [
                dict(date="15 Jan 2025", event="First anomalous shell vendor invoice submitted", source="Vendor_Invoice_Ledger_0071.xlsx", related_entity="Sanjay Oberoi"),
                dict(date="02 Apr 2026", event="Internal audit flags recurring identical invoice amounts", source="Audit_Report_Q1.pdf", related_entity="Finance Dept"),
                dict(date="04 Apr 2026", event="Corporate embezzlement case officially opened", source="CASE-2026-0071", related_entity="Sanjay Oberoi")
            ]
            for ev in events: TimelineEvent.objects.create(case=case71, **ev)

            # Contradictions
            Contradiction.objects.create(
                case=case71, 
                title="Invoice Discrepancy - Date vs Service Window", 
                statements=[
                    {"source": "Vendor_Invoice_Ledger_0071.xlsx", "claim": "Service window closed Dec 31st"}, 
                    {"source": "Invoice_5592_Scan.pdf", "claim": "Invoice dated Jan 15th for ongoing services"}
                ], 
                finding="AI detected billing for services outside the authorized contract window.", 
                status="Requires Human Review"
            )

            # Knowledge Graph
            NODES = [
                ("n71_1","person","Sanjay Oberoi"), ("n71_2","organization","Shell Vendor Corp"), 
                ("n71_3","document","Vendor_Invoice_Ledger_0071.xlsx"), ("n71_4","case","CASE-2026-0071")
            ]
            EDGES = [
                ("n71_1","n71_2","authorized payments to"), ("n71_2","n71_3","billed via"), 
                ("n71_3","n71_4","evidence in"), ("n71_1","n71_4","subject of")
            ]
            for node_id, ntype, label in NODES: KnowledgeGraphNode.objects.create(case=case71, node_id=node_id, type=ntype, label=label)
            for src, tgt, rel in EDGES: KnowledgeGraphEdge.objects.create(case=case71, source_node=src, target_node=tgt, relation=rel)

            # QA
            thread, _ = CaseQAThread.objects.get_or_create(case=case71)
            if not CaseQAMessage.objects.filter(thread=thread).exists():
                CaseQAMessage.objects.create(
                    thread=thread, role="assistant",
                    text="I am ready to answer questions about CASE-2026-0071 (Corporate Embezzlement).",
                    sources=[],
                )
            self.stdout.write("  Seeded CASE-2026-0071 AI data successfully for End-to-End Test")
        except Exception as e:
            self.stdout.write(f"  Warning: failed to seed CASE-2026-0071 AI data: {e}")

        # Knowledge graph
        KnowledgeGraphNode.objects.all().delete()
        KnowledgeGraphEdge.objects.all().delete()
        NODES = [
            ("n1","person","Rakesh Bansal"), ("n2","organization","Bansal Trading Co."), ("n3","location","Marine Heights, Mumbai"),
            ("n4","organization","Silverline Traders"), ("n5","organization","Kunal Enterprises"), ("n6","person","Ramlal Yadav (Witness)"),
            ("n7","evidence","EVID-3301 — Mobile Phone"), ("n8","document","FIR_2026_0142.pdf"), ("n9","phone","+91 98XXX-44127"), ("n10","case","CASE-2026-0142"),
        ]
        EDGES = [
            ("n1","n2","owns"), ("n1","n3","resides at"), ("n2","n4","transferred funds to"), ("n2","n5","transferred funds to"),
            ("n6","n3","witnessed at"), ("n1","n7","device seized from"), ("n1","n8","named in"), ("n1","n9","linked to number"),
            ("n8","n10","filed under"), ("n7","n10","evidence in"),
        ]
        for node_id, ntype, label in NODES:
            KnowledgeGraphNode.objects.create(case=case142, node_id=node_id, type=ntype, label=label)
        for src, tgt, rel in EDGES:
            KnowledgeGraphEdge.objects.create(case=case142, source_node=src, target_node=tgt, relation=rel)
        self.stdout.write("  Knowledge graph seeded (CASE-2026-0142)")

        # QA welcome message
        thread, _ = CaseQAThread.objects.get_or_create(case=case142)
        if not CaseQAMessage.objects.filter(thread=thread).exists():
            CaseQAMessage.objects.create(
                thread=thread, role="assistant",
                text="I'm ready to answer questions about CASE-2026-0142, grounded only in the authorized documents attached to this case. Ask about people, evidence, timelines, or connections.",
                sources=[],
            )
        self.stdout.write("  QA thread seeded")

    # ── Notifications ─────────────────────────────────────────────────────────
    def _seed_notifications(self):
        from apps.accounts.models import User
        from apps.notifications.models import Notification, NotificationType
        admin = User.objects.get(username="admin.iyer")
        so = User.objects.get(username="so.verma")
        Notification.objects.all().delete()
        NOTIFS = [
            dict(user=admin, type=NotificationType.ALERT, title="Critical Integrity Alert", description="Hash mismatch detected on Sale_Deed_Forged_0098.pdf in CASE-2026-0098.", read=False),
            dict(user=so,    type=NotificationType.CUSTODY, title="Custody Transfer Pending Approval", description="EVID-3303 transfer from Forensic Analyst to Investigation Officer awaits supervisory approval.", read=False),
            dict(user=admin, type=NotificationType.AI, title="AI Analysis Complete", description="Document Intelligence finished processing Bank_Transaction_Report_04.pdf.", read=True),
            dict(user=admin, type=NotificationType.BLOCKCHAIN, title="Blockchain Registration Confirmed", description="Server_Access_Logs_TechNova.csv successfully registered on-chain.", read=True),
        ]
        for data in NOTIFS:
            Notification.objects.create(**data)
        self.stdout.write(f"  Notifications seeded")

    # ── System Settings ───────────────────────────────────────────────────────
    def _seed_system_settings(self):
        from apps.settings_app.models import SystemSettings
        SystemSettings.objects.update_or_create(pk=1, defaults=dict(
            retention_period="10 years",
            blockchain_provider_label="Permissioned — Hyperledger Fabric (demo)",
            two_factor_required=False,
        ))
        self.stdout.write("  SystemSettings seeded")
