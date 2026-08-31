# LexiMind Secure — AI-Powered Secure Legal & Investigation Intelligence Platform

**Secure · Verify · Trace · Investigate**

A Vite + React + Tailwind frontend for a government-grade investigation
and cybersecurity platform: secure document handling, blockchain-backed
integrity verification, chain of custody, and AI-assisted investigation
intelligence. Built for SIH 2026, transformed from the original LexiMind
legal-portal codebase.

## Run it

```
npm install
npm run dev       # http://localhost:5173
npm run build      # production build to dist/
```

## Demo accounts (role-based login)

| Role | Username | Password |
|---|---|---|
| Investigation Officer | `io.mehra` | `secure123` |
| Forensic Analyst | `fa.nandini` | `secure123` |
| Legal Officer | `lo.kapoor` | `secure123` |
| Supervisory Officer | `so.verma` | `secure123` |
| System Administrator | `admin.iyer` | `secure123` |

Each role lands on its own URL prefix (`/investigator`, `/forensic`,
`/legal`, `/supervisor`, `/admin`) and sees only the sidebar sections and
routes it's permitted to access — enforced both in the sidebar and in
the route guard (`src/layout/PortalLayout.jsx`), so typing a URL
directly cannot bypass permissions.

## Project structure

```
src/
├── main.jsx, App.jsx           ← root + router
├── data/
│   ├── mockData.js             ← every demo entity (users, cases, documents, evidence,
│   │                              custody, blockchain, alerts, audit, AI insights, timeline,
│   │                              knowledge graph, contradictions) — single source of truth
│   └── navConfig.js             ← sidebar sections/items
├── services/api.js              ← API layer stubs — swap function bodies for fetch() calls
│                                    to a Node/Express backend; page code never changes
├── context/AuthContext.jsx      ← session state, mock login, role-based guard
├── layout/
│   ├── TopBar.jsx, Sidebar.jsx, PortalLayout.jsx
├── components/
│   ├── ui.jsx                   ← Button, Card, Badge, Modal, Tabs, Toasts, GlobalStyles…
│   └── shared/                  ← domain components: SecurityStatusBadge, ClassificationBadge,
│                                    BlockchainStatus, HashComparison, MetricCard, DocumentCard,
│                                    IntegrityPassport, SourceReference, CaseCard, EvidenceCard,
│                                    CustodyTimeline, AuditTimeline, EntityBadge, AIInsightCard,
│                                    SecurityAlertCard, RoleBadge
└── pages/                        ← one file per route (see below)
```

## Routes / pages

| Section | Pages |
|---|---|
| Overview | Command Center (dashboard) |
| Secure Documents | Secure Document Vault, Upload & Digitization, Document Comparison |
| Investigation | Case Management (+ case detail), Evidence Management, Chain of Custody, Investigation Timeline |
| AI Intelligence | AI Document Intelligence, Case Intelligence Q&A, Investigation Search, Knowledge Graph, Contradiction & Anomaly Detection |
| Blockchain & Security | Blockchain Verification, Document Integrity (with Simulate Tampering demo), Security Alerts, Immutable Audit Ledger |
| Administration | Users & Roles, Access Control, System Settings |

Plus: public landing page (`/`), login (`/login`), unauthorized (`/unauthorized`),
notifications and personal settings (via the top bar).

## Backend integration

Every page reads from `src/data/mockData.js` through `src/services/api.js`.
To connect the existing **Django backend** (`leximind-backend`):

1. The Django project already has corresponding apps (`accounts`, `cases`, `documents`, `evidence`, `blockchain`, `custody`, `audit`, `ai`). Ensure the endpoints in `src/services/api.js` map correctly to the Django REST framework URLs (e.g., `/api/auth/`, `/api/cases/`, etc.).
2. Replace each mock function body in `api.js` with a `fetch()` or `axios` call, keeping the same signature/return shape.
3. No page component needs to change.

## Pre-login cinematic experience

## Login page enhancements

`src/pages/Login.jsx` keeps the exact same authentication logic (`useAuth().login`, error
handling, demo accounts, redirect-if-already-signed-in) and only adds visual polish, using a
few more small pieces in `src/components/experience/`:

- `LoginStyles.jsx` — scoped entrance/tilt/shimmer/underline/overlay keyframes for this page only
- `SecurityPulseBadge.jsx` — the compact animated "Connection Integrity" indicator near the form, cycling through encryption/handshake/blockchain-sync status lines
- `WelcomeOverlay.jsx` — a brief (~1s) success transition shown after a successful login, before navigating to the dashboard — purely presentational, sitting in front of the same `navigate()` call that used to fire immediately
- Reused from the landing experience: `ParticleField` (fewer particles, subtle) and `CursorGlow`

Other additions: staggered entrance animation for the logo/heading/card, a subtle mouse-tilt on
the login card, a focus-triggered underline sweep on each input, a shimmer sweep on the submit
button, and a few low-opacity floating document/key glyphs in the background (desktop only). All
of it respects `prefers-reduced-motion` and none of it touches `AuthContext.jsx` or `services/api.js`.



The public landing page (`/`, `src/pages/Landing.jsx`) is a full-screen, scroll-driven
introduction shown before login — unrelated to and non-breaking of the login flow itself
(`/login` is unchanged). It's built from small, reusable pieces in
`src/components/experience/`:

- `ParticleField.jsx` — lightweight floating-particle background (CSS transforms only, fixed count, no per-frame JS)
- `CursorGlow.jsx` — a soft glow that eases toward the cursor via `requestAnimationFrame`, direct DOM update (no re-renders); disabled on touch devices and when `prefers-reduced-motion` is set
- `Reveal.jsx` — a one-shot `IntersectionObserver` scroll-reveal wrapper (`useReveal` hook + `<Reveal>` component), used to stage-reveal every section instead of showing everything at once
- `HeroVisual.jsx` — animated SVG "secure vault" core with orbiting document/hash/blockchain nodes
- `ProtectionJourney.jsx` — the "How LexiMind Protects a Document" six-step animated journey with a scroll-triggered progress line
- `FeatureStory.jsx` — the six capability sections (Secure Document Vault, AI-Powered Search & Analysis, Tamper Detection, Blockchain Audit Trail, Role-Based Access, Investigation Timeline), each with a bespoke mini animated visual, alternating layout
- `ExperienceStyles.jsx` — all keyframes/utility classes for this page only, with a `prefers-reduced-motion` kill-switch for every decorative animation

All animation uses CSS `transform`/`opacity` (GPU-friendly) and `IntersectionObserver` rather
than scroll-position listeners, so it stays smooth without extra dependencies — no animation
library was added.

## Notes

- The frontend currently utilizes demo/mock data by design.
- Demo-only interactions (Simulate Tampering, Verify Integrity, Transfer
  Custody, Create Case, Add Evidence, etc.) mutate in-memory state and
  show a toast; they do not persist across reloads until the Django backend is fully integrated.
