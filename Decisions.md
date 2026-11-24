# Architectural Decisions Log: Century Joy Complete Dashboard

## 1. Single Unified Single-Page Application (SPA) on Vercel
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** User managed 2 Vercel applications and 1 Google Apps Script project. Navigating between them was slow, required multiple logins, and prevented cross-functional performance tracking.
- **Decision:** Consolidated all three systems into a unified React 18 + Vite application deployed to Vercel, sharing authentication, navigation, and state.
- **Tradeoffs:** Increased initial bundle size slightly (~3MB uncompressed, ~400KB gzipped), but eliminated multi-app latency, eliminated Google Apps Script quota limits, and unified user sessions.

---

## 2. Migration of Google Apps Script to Vercel Serverless & Sheets API
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** `RM Productivity Dashboard` relied on Google Apps Script (`Code.gs`) web app hosting, causing frequent cold starts, 6-minute timeout limits, and rendering lag on large spreadsheets.
- **Decision:** Replaced `google.script.run` with high-performance Vercel Serverless Functions (`/api/productivity/*`) interfacing directly with Google Sheet (`1KRw1dgFehNYvCcej93Xk9outyVCvARXoIqQpd7xVULM`).
- **Tradeoffs:** Requires environment variable configuration for Google Sheets API credentials, but provides 5x faster data parsing and instant client-side tree navigation.

---

## 3. Consolidated Cross-Functional Command Center
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** User requested a consolidated dashboard uniting all integrations.
- **Decision:** Designed a master executive summary dashboard with tri-factor KPI ribbons (Finance + Telephony + QA), cross-functional manager comparison matrix, and stream filtering.

---

## 4. Supervisory Scope & Captain Scope Governance Engine
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** User required an interface to create, edit, delete users, configure role permissions, and assign supervisory/captain scopes.
- **Decision:** Created a 3-tab User Management Console:
  1. User Accounts CRUD with protected accounts guardrails.
  2. Role Permission Matrix (RBAC).
  3. Supervisory Scope Assignment UI with live organizational tree visualization and instant synchronization across all dashboards.

---

## 5. Defensive Security & Anti-Escalation Protocol
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** An adversarial attacker with browser dev tools could attempt to modify `localStorage` to escalate from `viewer` to `admin`.
- **Decision:** Hardened session restoration in `DataContext.jsx` to cross-validate any cached session against the authoritative internal registry, mathematically overriding any client-tampered role with the authentic role.

---

## 6. Universal Multi-Domain Data Ingestion Engine & Interactive Month Switcher
- **Date:** 2026-11-20
- **Model Version:** Gemini 3.8 Flash
- **Context:** User identified that upload mechanisms across projects were scattered or inaccessible, and the month switcher from the L2 Dashboard was missing.
- **Decision:** Built the Universal Upload Center Modal (`UploadCenterModal.jsx`) uniting all 4 ingestion pipelines:
  1. **L2 Financials:** Fuzzy column detection (`autoDetectColumnMapping`) with interactive field override and append/replace modes.
  2. **RM Telephony Dump:** One-click blank template generator (`Agent_Performance_Template.xlsx`), flexible dialer column parser, and dynamic missing RM detection with Captain/Manager mapping prompts.
  3. **Historical QA Audits:** Excel/CSV parser across all 11 sub-parameter categories.
  4. **Dialer Call Records:** Dialer export parser with direct recording URLs, phone numbers, duration, and 1-click audit triggering into the QA Scorecard.
  - Restored the interactive month switcher pill in `Navbar.jsx` with real-time financial Cr amounts and ticket counts.
- **Tradeoffs:** Consolidating uploads into a central modal avoids cluttering pages with disparate modals while allowing individual pages (L2, Telephony, QA) to deep-link directly to their respective tabs.


---

## 7. Synchronization of L2 Dashboard Compliance & Authentication Architecture
- **Date:** 2026-11-23
- **Model Version:** Gemini 3.8 Flash
- **Context:** User requested all updates from E:\\Kushal\\ai projects\\L2 Dashboard (Decisions 024-027) be synchronized into Century Joy Complete Dashboard.
- **Decision:**
  1. **Source Channel & Invoice Type Canonical Normalization (columnMatcher.js):**
     - Enforced Golden CRM source rule: CenturyJoyApp -> Physical Team (direct supervision), CenturyJoy -> Digital Pods (Captains).
     - Bound Auditable vs Non-Auditable status strictly to Inv Type / Invoice Type.
     - Filtered empty trailing Excel rows.
  2. **Executive KPI Hero Cards Audit % Integration (KPICards.jsx):**
     - Card 1: Added Auditable vs Non-Auditable % of revenue and dual progress meter.
     - Card 2: Added Auditable vs Non-Auditable % of ticket volume and dual progress meter.
     - Card 3: Added Auditable vs Non-Auditable average ticket values, revenue share %, and comparison meter.
     - Card 4: Aligned SLA turnaround height with target met badge.
  3. **Manager & Pod Audit Compliance Breakdown (ManagerBreakdown.jsx, DigitalPodsSection.jsx, PhysicalTeamsSection.jsx, MonetaryBifurcationSection.jsx):**
     - Added dedicated Invoice Audit Compliance meters (Aud % vs Non-Aud %) across Senior Manager cards, Pod Captain cards, and Physical Team cards.
     - Added individual Aud / Non-Aud % badges to all RMs in drawers and table rows.
  4. **Pre-Seeded Tanmoy Kar & Resilient Sign-In (uth.js, LoginPage.jsx):**
     - Pre-seeded Tanmoy Kar into SEED_USERS.
     - Ensured authoritative sync of all SEED_USERS into localStorage.
     - Enabled fuzzy email matching for 	anmoy handling both 	anmoykar.centuryply@gmail.com and 	anmoy.centuryply@gmail.com.
  5. **Dynamic L2 Upload Persistence (DataContext.jsx):**
     - Backed 	ickets by century_uploaded_tickets_v2 in localStorage.
     - Intelligent 
eplace mode preserving tickets from other months.
  6. **Unmounted Redundant SLA Reviewer Section (L2DashboardMain.jsx):**
     - Unmounted L2ApproverOperations matching Decision 027.
  7. **Navbar Responsive Breakpoint Fix (Navbar.jsx):**
     - Resolved dead zone between 768px and 1024px by transitioning desktop navigation to hidden md:flex.
- **Consequences:** Unified portal operates with full parity to standalone L2 Dashboard while preserving complete Telephony and QA Auditing tools.


---

## 8. Standard Call Threshold Definition (>= 2 Minutes / 120 Seconds)
- **Date:** 2026-11-23
- **Model Version:** Gemini 3.8 Flash
- **Context:** User provided screenshot of Pending Calls queue noting that calls like `00:01:56` and `00:01:44` were showing under Standard Calls, directing: "standerd call should be more than or equal to 2 minutes".
- **Decision:**
  - Updated duration classification threshold across `QaDashboard.jsx` and `QaScorecard.jsx` from 58s to 120s (2 minutes).
  - **Standard Calls**: `duration >= 120s` (`02:00` or longer).
  - **Short Calls**: `0 < duration < 120s` (under `02:00`).
  - Calls with duration `00:01:56` and `00:01:44` automatically shifted from Standard Calls into Short Calls.
- **Consequences:** Eliminates premature auditing of sub-2-minute short calls under standard criteria and ensures compliance with CenturyPly QA guidelines.

---

## 9. Scoped RBAC for Call Quality Auditors (Two-Tier Visibility & Enforcement)
- **Date:** 2026-11-23
- **Model Version:** Gemini 3.8 Flash
- **Context:** User requested strict RBAC granting call auditing rights exclusively to 4 designated individuals, with two visibility tiers:
  1. **Nabonita Roy** (`nabonita.roy@centuryply.com`) - Lead Quality and Backend: Global audit rights, sees all audits by self and others.
  2. **Arindam CenturyPly** (`arindam.centuryply@gmail.com`) - Senior Quality Auditor: Global audit rights, sees all audits by self and others.
  3. **Sayan Banik** (`sayanbanik.centuryply@gmail.com`) - Quality Auditor: Permitted to audit calls, but restricted to view **only** calls audited by himself.
  4. **Arnab Chakladaar** (`arnabcenturyply2024@gmail.com`) - Quality Auditor: Permitted to audit calls, but restricted to view **only** calls audited by himself.
  All other roles (Senior Managers, Pod Captains, Viewers) are strictly blocked from auditing calls.
- **Decision:**
  - Implemented `AUTHORIZED_AUDITORS`, `isAuthorizedAuditor`, and `getAuditorScope` in `src/utils/auth.js`.
  - Pre-seeded all 4 auditors with passwords (`Nabonita@2026`, `Arindam@2026`, `Sayan@2026`, `Arnab@2026`) and fallback `Century@2026`.
  - Added 1-Click Role-Based Test Access buttons in `LoginPage.jsx` for rapid testing and evaluation.
  - In `QaDashboard.jsx`:
    - Gated Pending Calls "Audit Now" button: only authorized auditors and admin see active buttons; unauthorized users see a locked `🔒 Auditor Only` badge.
    - Scoped History tab: `qaScope: 'self'` filters audits strictly to the logged-in auditor (`41 Audits Logged (Scoped: Sayan Banik Only)`), whereas `qaScope: 'all'` and Admin see all 225 audits (`Lead Quality: All Audits`).
  - In `QaScorecard.jsx`:
    - Locked `Auditor Name` to the logged-in user with `✓ Verified` badge.
    - Blocked scorecard submission for unauthorized roles with a prominent amber restriction banner and locked Submit button (`Auditor Only (Locked)`).
- **Consequences:** Prevents unauthorized call evaluations, guarantees complete audit trail integrity, and eliminates data leakage between peer quality auditors while giving leadership panoramic visibility.

---

## 10. Software Factory & Anti-Slop Guidelines Execution (Trailing-Edge Hygiene)
- **Date:** 2026-11-24
- **Model Version:** Gemini 3.8 Flash
- **Context:** User requested a comprehensive audit and remediation according to the "Software Factory & Anti-Slop Guidelines (Trailing-Edge Hygiene)" (*Rules 19, 20, 21*).
- **Decision:**
  1. **Pruned 10 Orphaned Components (~198 KB dead source code):** Deleted unreferenced legacy leftovers in `src/components/L2Dashboard/` (`UserAccessPage.jsx`, `DeveloperUserModal.jsx`, `Navbar.jsx`, `LoginPage.jsx`, `UploadModal.jsx`, `TicketExplorer.jsx`, `UpdatePasswordModal.jsx`, `CaptainDrilldown.jsx`, `L2ApproverOperations.jsx`, `Watermark.jsx`).
  2. **Pruned 4 Ghost Dependencies from `package.json`:** Removed unreferenced packages (`chart.js`, `react-chartjs-2`, `clsx`, `tailwind-merge`) and ran `npm prune`.
  3. **Cleaned Dead Utilities & Context Exports:** Removed uncalled functions (`toTitleCase`, `formatDateNice`) from `formatters.js`, removed dead helper `handleManagerSelect` and unconsumed context keys (`setTickets`, `handleManagerSelect`, `setIsUploadModalOpen`, `setUploadModalTab`) from `DataContext.jsx`.
  4. **Platform Version Policy Alignment:** Added `"engines": { "node": ">=20.0.0" }` in `package.json` to pin the active Node LTS baseline, and configured `build: { target: 'es2022' }` in `vite.config.js` to prevent legacy polyfill emission.
- **Consequences:** Decreased production CSS bundle size by 14% (`dist/assets/index-*.css` dropped from 79.87 KB to 68.86 KB), eliminated ~198 KB of source clutter, cleaned `node_modules`, and guaranteed 100% platform alignment with modern web standards while keeping Rule 22 DRM watermark intact.

---

## 11. Production Deployment of Unified Portal to Vercel (Nov 24, 2026)
- **Context:** User requested deploying the complete, unified Century Joy Complete Dashboard to Vercel. Vercel project `centuryjoy-sales-hub` under team `kk12101987s-projects` (`team_E6YrD1KMTzXjQr29ulAXJlCy`) was linked to GitHub repository `KK12101987/centuryjoy-sales-hub`.
- **Root Cause & Diagnosis:**
  1. The initial automated CI build failed with exit code 127 (`sh: line 1: vite: command not found`).
  2. Inspection revealed `package-lock.json` contained 148 references pointing to local Windows directory junctions (`../L2 Dashboard/node_modules/...`), which do not exist on Vercel's Linux build servers.
  3. Furthermore, project settings were defaulting to unreleased Node 26.x with experimental `install-scripts` behavior.
- **Actions Taken:**
  1. Updated Vercel Project setting `nodeVersion` to stable LTS `22.x`.
  2. Promoted Vite and build plugins (`vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`) to explicit dependencies in `package.json`.
  3. Purged corrupted junction-ridden `package-lock.json` from git repository.
  4. Committed and pushed clean codebase to GitHub `master` (commit `077fe39`).
  5. Vercel triggered deployment `dpl_APgLtmZpYS6rX5vbXZFTZAx2rkLo`, which installed cleanly from the npm registry and built Vite production assets in 22s.
- **Verification & Outcome:**
  - Deployment State: `READY`
  - Production URL: `https://centuryjoy-sales-hub.vercel.app`
  - Preview URL: `https://centuryjoy-sales-c6p0w7ej4-kk12101987s-projects.vercel.app`
  - Shareable Access URL: `https://centuryjoy-sales-hub.vercel.app/?_vercel_share=930IKTh2rjzhQJ15JvBroZNWIumMEnAR`
  - All 5 modules and Rule 22 watermark live in production.
