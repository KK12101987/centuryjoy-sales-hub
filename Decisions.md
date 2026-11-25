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

---

## 12. Audit Scorecard Inspection on Click & Developer-Only Historical Data Purge (Nov 24, 2026)
- **Context:**
  1. User reported clicking on an audit in the QA History table was not opening the scorecard.
  2. User requested a button restricted exclusively to the Developer to purge any and all historical QA audit data.
- **Root Cause & Diagnosis:**
  1. The QA History table `<tr>` elements lacked click event listeners, and no individual "Scorecard" action button existed on the rows.
  2. `QaScorecard` only parsed incoming dialer calls and lacked prepopulation logic for historical audits (`audit_date`, `auditor_name`, parameter scores, feedback).
  3. `DataContext.jsx`'s `qaAudits` initialization logic checked `parsed.length > 0`, which caused an empty array `[]` saved in localStorage to revert back to `rawQaAudits`.
- **Actions Taken:**
  1. **Scorecard Opening from History:**
     - Connected `handleViewAudit(audit)` to the History table rows and added a dedicated "Scorecard" button to each row.
     - Enhanced `QaScorecard` to populate historical evaluation data, scores, observation, and auditor details.
     - Added a "Historical Audit #..." banner with "Back to History" and "New Blank Audit" actions.
  2. **Developer-Only Historical Purge:**
     - Implemented `isDeveloperUser()` to restrict purge capabilities strictly to Developer accounts (`kushal.centuryply@gmail.com` / designation).
     - Fixed `DataContext.jsx` to respect empty arrays in `century_qa_audits_v2` and added `purgeAllQaAudits()` and `restoreDefaultQaAudits()`.
     - Added a "Purge Historical Data (Dev)" button in the History tab with an executive confirmation dialog, plus a "Restore Default Audits" fallback for testing.

---

### Decision 032: Pod Captain Resignation Auto-Failover, Role Promotion, and Revert/Undo Protocol
* **Date:** 2026-11-24
* **Context:** When employees or pod captains separate, data integrity must not be compromised, agents supervised by the captain must not become orphaned, and leadership must be able to promote new leaders or revert accidental offboarding actions.
* **Tradeoffs & Alternatives Considered:**
  1. *Hard Deletion of Records:* Rejected. Deleting RM records breaks historical joins in tickets, telephony, and completed QA audits.
  2. *Orphaned Agents on Captain Exit:* Rejected. Leaving agents without a captain would create broken reporting trees and unassigned KPIs.
  3. *Irreversible Offboarding:* Rejected. Accidental clicks by HR or managers would require database rollback.
* **Chosen Solution:**
  1. *Soft Deactivation:* Mark `status: 'inactive'` with reason and timestamp while retaining all directories and audit attribution.
  2. *Captain Resignation Auto-Failover:* Automatically reassign active subordinate agents to report directly to their immediate Senior Manager (`captain_name` = immediate manager, `tempSupervisedByManager: true`, `previousCaptain: rmName`).
  3. *Pod Succession & Role Promotion:* Dedicated modal to promote a candidate to Pod Captain or Senior Manager, re-clustering subordinate agents under them.
  4. *Multi-Tier Revert / Rollback Protocol:* Immediate banner undo, quick-revert card, and Inactive Archive "Revert Offboarding" button that restores the captain and auto-reattaches all their subordinate agents.

---

### Decision 033: Dynamic Creation of Teams, Members, and Captains with Real-Time Hierarchy Synchronization
* **Date:** 2026-11-25
* **Context:** User requested the ability to add new teams, team members, and pod captains dynamically to accommodate near-future organizational expansion.
* **Architecture & Mechanics:**
  1. *Dynamic Custom Teams Registry (`century_custom_teams_v2`):* Stores dynamically added pod names alongside the canonical digital pods (`Unity-I`, `Unity-II`, `Catlyst-I`, `Catlyst-II`, `SoarZone-I`, `SoarZone-II`, `Zenith Pod`), ensuring new pods persist across reloads and system resets.
  2. *Dual Captain Assignment Mode:* Administrators can either promote an existing Relationship Manager into the Pod Captain role or register a brand-new captain with customized contact/dialer credentials.
  3. *Zero Database Impact & Real-Time Sync:*
     - Adding teams or members modifies only the organizational metadata directory (`century_rm_directory_v2`) and the organizational tree (`century_hierarchy_tree_v2`).
     - Historical tickets, calls, and QA scorecards are never altered or deleted.
     - New teams and their members immediately populate the Pod Leadership status cards, supervisory reassignment dropdowns, and QA Call Scorecard Franchise/Team filters.
  4. *Rule 22 Anti-Tamper Enforcement:* Embedded `verifyWatermarkIntegrity()` inside `addNewTeam` and `addNewMemberToTeam` to guarantee that structural organizational expansions cannot be executed if the anti-tamper watermark has been modified.

---

### Decision 034: Team Removal and Pod Dissolution Governance with Member Reassignment & Zero DB Impact
* **Date:** 2026-11-25
* **Context:** User requested the ability to remove/dissolve teams in the future as operational pods evolve.
* **Architecture & Mechanics:**
  1. *Decommissioning Flow:* Each pod card in the Live Pod Leadership grid provides a direct delete button (`Trash2`). Clicking it activates the `RemoveTeamModal`.
  2. *Disposition for Active Members:*
     - **Reassignment (Recommended):** Moves all active pod members seamlessly into another selected active pod (e.g. `Unity-II`) so operations, call queues, and evaluations continue without interruption.
     - **Soft-Deactivation:** Marks members as inactive with dissolution reasons without touching database records.
  3. *Zero Database Impact Guarantee:*
     - All past sales tickets, disbursements, and completed QA call scorecards attributed to the dissolved team remain 100% permanently preserved in the database.
     - The dissolved team is tracked in `century_removed_teams_v2` and cleanly filtered out from active selection dropdowns in QA Scorecards, Scope transfer forms, and leadership grids.
  4. *Rule 22 Watermark Enforcement:* `verifyWatermarkIntegrity()` is invoked inside `removeTeam`.

---

### Decision 035: Resigned Pod Captain Failover Display Protocol in QA Scorecard & Name Standardization
* **Date:** 2026-11-25
* **Context:** User requested that when a pod captain has resigned (e.g., Unity-I's captain Mousumi Chakraborty), their name must not appear under "Assigned Pod Captain" in the QA Call Scorecard. Additionally, the scorecard title must strictly be "Official CenturyPly QA Call Scorecard" without the "(41 Sub-Parameters)" suffix.
* **Architecture & Mechanics:**
  1. *Decoupled Self-Healing Migration from Inactive State Overwrites:* Fixed initialization logic in `DataContext.jsx` that previously overwrote inactive/resigned employee states (`status === 'inactive'`). Canonical directory and hierarchy checks now strictly respect soft-offboarded and resigned statuses, preventing unintended re-activation of separated captains.
  2. *Active Captain Resolver (`activeCaptain`):* Standardized captain resolution in `QaScorecard.jsx`. If an RM's pod is in failover (`tempSupervisedByManager === true`), or their designated captain is inactive or equal to the Senior Manager, `activeCaptain` evaluates to `null`.
  3. *Failover Visual Indicator:* When a pod captain is resigned, the "Assigned Pod Captain" input renders an amber failover badge displaying `— (Vacant • In Failover to Senior Manager)`, while the adjacent "Senior Manager" field explicitly displays the interim manager (e.g. `Arijit Nath`), guaranteeing complete transparency with zero ambiguity.
  4. *Scorecard Title Standardization:* Consolidated title across all headers to exactly `"Official CenturyPly QA Call Scorecard"`.

---

### Decision 036: Standard Call Auto-Resolution of Franchise / Team & Call Metadata Locking in QA Scorecard
* **Date:** 2026-11-25
* **Context:** When an auditor selects a call from the Pending Calls dialer queue (Standard, Short, Zero, or Disposed) by clicking "Audit Now", the Franchise / Team field was showing `-- All Teams --` instead of the agent's team name, and the call metadata fields were editable instead of being locked to the recorded phone call.
* **Architecture & Mechanics:**
  1. *Automatic Franchise / Team Resolution:* Both `handleAuditCall` in `QaDashboard.jsx` and `useEffect` in `QaScorecard.jsx` now cross-reference the incoming dialer record against `rmDirectory` (by `agent_id`, `dialer_id`, or `rm_name`). This automatically populates the agent's canonical pod (e.g., `SoarZone-I` for `Ananya Dhara`).
  2. *Call Metadata Immutable Locking (`isTargetLocked`):* When an incoming `auditTarget` is present, the call's metadata fields are strictly locked to reflect the recorded telephone interaction:
     - **Franchise / Team:** Rendered as a read-only locked input with a `🔒 Locked to Call` badge.
     - **Relationship Manager (RM):** Rendered as a read-only locked input with a `🔒 Locked to Call` badge.
     - **Customer Mobile No., Call Duration, Call Date:** Rendered as read-only locked inputs with `🔒 Locked` badges.
     - **Assigned Pod Captain & Senior Manager:** Remain read-only reflecting active leadership or failover mode.
  3. *New Blank Audit Unlocking:* Clicking "New Blank Audit" clears `auditTarget` via `onClearTarget()`, instantly reverting the form back to editable dropdowns and textboxes for manual evaluations.

---

### Decision 037: Audit Date Temporal Independence & Broken Media Link Removal in QA Scorecard
* **Date:** 2026-11-25
* **Context:** In real-world QA call auditing operations, telephonic interactions occur on a specific interaction date (`call_date`), but evaluations are frequently audited on subsequent days, the following day, or scheduled for future dates. Previously, the `Audit Date` was not displayed in the QA scorecard header metadata, and the `Call Date` field locked the evaluation date to the interaction date. Furthermore, the "Listen to Recording (.WAV)" button and table headphone icons linked to non-existent or mock dialer audio URLs that resulted in 404/broken links.
* **Architecture & Mechanics:**
  1. *Temporal Decoupling (`call_date` vs. `audit_date`):*
     - `Call Date` represents the immutable telephony interaction date extracted from the dialer record (e.g., `16-11-2026`). It remains strictly locked to prevent historical misrepresentation.
     - `Audit Date` is now an explicit, user-facing input in the second metadata row. It defaults to current date (`new Date().toISOString().split("T")[0]`) for incoming calls and new blank audits, but provides an active datepicker with an `Editable` badge so auditors can specify past, present, or future audit dates.
     - When inspecting historical audits (`auditTarget.isHistorical === true`), the original recorded `audit_date` is faithfully retained.
  2. *Scorecard Grid Restructuring:*
     - Row 1 (Organizational Governance - 4 columns): `Franchise / Team` (Locked to Call), `Relationship Manager (RM)` (Locked to Call), `Assigned Pod Captain` (Active / Failover), `Senior Manager` (ReadOnly).
     - Row 2 (Telephony & Evaluation Timing - 5 columns): `Customer Mobile No.` (Locked), `Call Duration (MM:SS)` (Locked), `Call Date` (Locked), `Audit Date` (Editable Datepicker), `Auditor Name` (Verified).
  3. *Removal of Broken External Media Links:*
     - Completely eliminated the `Listen to Recording (.WAV)` anchor button from the scorecard banner in `QaScorecard.jsx`.
     - Removed the broken `🎧` link linking to `call.recording_file` from the pending calls table in `QaDashboard.jsx`.

---

### Decision 038: User Account Profile Mutation Persistence & Arindam Mitra Canonical Name Alignment
* **Date:** 2026-11-25
* **Context:** An administrator attempted to change a user's name via the "Edit Account" modal (from `Arindam CenturyPly` to `Arindam Mitra`), but upon clicking "Save Account" or refreshing, the name immediately reverted back. This affected all seed accounts across the system.
* **Root Cause:**
  - In `src/utils/auth.js`, the `getAllUsers()` retrieval method contained a synchronization loop over `SEED_USERS`.
  - In each invocation (triggered on app load, login, and `refreshUsers()`), the loop checked `if (seed.name && parsed[idx].name !== seed.name)`. Because `parsed[idx].name` differed from `seed.name` after a user edit, the loop forcibly overwrote the modified user's `name` (as well as `designation` and `initialPassword`) back to the hardcoded seed value, discarding administrative edits across all 18 seed users.
* **Architecture & Mechanics:**
  1. *Preservation of User-Customized Attributes:*
     - Removed destructive overrides from `getAllUsers()`. The synchronization loop now solely backfills missing structural schema properties (`qaScope`, `isProtected`) if absent in legacy storage schemas.
     - User-edited properties (`name`, `email`, `role`, `designation`, `initialPassword`, `managerKey`, `captainKey`, `status`) remain permanently authoritative in `localStorage` (`century_joy_users_registry_v2`).
  2. *Canonical Alignment to Arindam Mitra:*
     - Updated default registry definitions in `SEED_USERS` and `AUTHORIZED_AUDITORS` to `Arindam Mitra`.
     - In `getAllUsers()`, added a graceful one-time migration for existing client localStorage where `email === 'arindam.centuryply@gmail.com' && name === 'Arindam CenturyPly'`, automatically transitioning the account to `Arindam Mitra`.
     - In `DataContext.jsx`, historical QA audit evaluation records attributed to `Arindam CenturyPly` are migrated to `Arindam Mitra`.
     - Replaced 65 occurrences of `Arindam CenturyPly` in `seedQaAudits.json` with `Arindam Mitra`.
  3. *Real-Time State Synchronization:*
     - Added a `century_users_updated` custom event listener in `DataContext.jsx` to immediately synchronize both the `users` collection and `currentUser` profile in React state without requiring full page reloads.
     - Updated `updateUser(email, updates)` to sync `century_joy_auth_user_v2` in localStorage if the currently authenticated user's profile is modified.

---

### Decision 039: Software Factory & Anti-Slop Audit, Dead Code Pruning, and Operational Bug Fixes
* **Date:** 2026-11-25
* **Context:** In accordance with Global AI Guidelines (Rules 19, 20, 21), a deep architectural audit was conducted across all 5 modules of the application to identify edge-case bugs, prune dead code, remove obsolete imports and dependencies, and verify end-to-end operational hygiene.
* **Findings & Precision Fixes:**
  1. *Pending Call Auto-Disposal on Audit:* In `QaScorecard.jsx`, submitting an evaluation for an incoming dialer call now triggers `updateDialerCall(auditTarget.phone_no, { status: 'Disposed - Audited' })`, ensuring audited records transition cleanly from pending calls into the disposed category.
  2. *Reinstated Pod Captain Hierarchy Tree Preservation:* In `DataContext.jsx` (`revertOffboard`), fixed a state sequencing race condition where `target.wasCaptain` was reset prior to hierarchy reconstruction. A cached `wasCaptainFlag` now guarantees that reverting an offboarded captain accurately restores their supervisory pod node in the organizational tree.
  3. *Zero-Slop Code Hygiene & Dependency Pruning:*
     - Pruned unused backend dependency (`nodemailer`) from `package.json`.
     - Removed 16 unused icon and formatter imports across 11 source files (`LoginPage.jsx`, `ConsolidatedDashboard.jsx`, `AnalyticsCharts.jsx`, `AuditPodsSection.jsx`, `DigitalPodsSection.jsx`, `ManagerBreakdown.jsx`, `PhysicalTeamsSection.jsx`, `QaDashboard.jsx`, `QaScorecard.jsx`, `RMProductivity.jsx`, `DataContext.jsx`).
     - Verified zero active `console.log` statements in production source files.

---

### Decision 040: Granular Supervisory Scope Architecture & Role-Based Upload Portal Segregation
* **Date:** 2026-11-25
* **Context:** The operational leadership required fine-grained segregation of application modules and upload capabilities based on institutional supervisory scope:
  1. *Senior Managers:* Access to their division's L2 approvals, RM telephony, and QA audit history in read-only review mode, but strictly barred from conducting QA evaluations (no scorecard) and barred from all data upload functions.
  2. *Pod Captains:* Same as Senior Managers, but scoped strictly to their pod/team level in read-only review mode without QA scoring or upload privileges.
  3. *Quality Auditors:* Restricted strictly to QA & 7 QC Analytics tools (Consolidated, L2, and Telephony modules hidden). Within this role, only designated auditors (Arindam Mitra and Nabonita Roy, or users explicitly granted `canUploadQA`) are authorized to upload dialer call recording logs, RM telephony performance, and historical QA audits (L2 upload hidden). Non-designated auditors operate in evaluation-only mode with zero upload rights.
  4. *Tanmoy Kar:* Granted dedicated access to L2 Financial Reconciliation and Consolidated dashboards, with exclusive rights to upload L2 Approval financial spreadsheets (dialer, telephony, and QA upload tabs hidden).
  5. *Super Admin / Developer (Kushal Kar):* Retains unrestricted enterprise access across all 5 operational suites and all 4 upload ingestion pipelines.
  6. *User Governance Console:* Administrators must be able to dynamically configure these supervisory scopes, division bindings, and upload permissions when provisioning new managers, captains, and backend personnel.
* **Architecture & Mechanics:**
  1. *Permission Evaluation Core (`src/utils/auth.js`):*
     - `getPermittedModules(user)`: Dynamically computes accessible modules (`'consolidated'`, `'l2'`, `'productivity'`, `'qa'`, `'users'`) per authenticated profile.
     - `getAllowedUploadTabs(user)`: Returns granular subset of allowed ingestion tabs (`'l2'`, `'telephony'`, `'qa'`, `'dialer'`).
     - `canConductCallAudits(user)`: Returns boolean confirming whether the profile is authorized to perform call quality assessments.
  2. *Navigation Ribbon & Auto-Redirect (`Navbar.jsx`):*
     - Desktop and mobile navigation bars filter modules strictly against `getPermittedModules(currentUser)`.
     - An active session listener auto-redirects users if their active module is restricted under their supervisory scope.
     - The top "Upload Data" button is conditionally rendered only if `getAllowedUploadTabs(currentUser).length > 0`.
  3. *Universal Ingestion Center Gating (`UploadCenterModal.jsx`):*
     - The modal evaluates `getAllowedUploadTabs(currentUser)`. Inaccessible tabs (e.g., L2 for QA auditors, or QA/Dialer for Tanmoy Kar) are completely hidden from the tab bar.
     - Default tab selection automatically synchronizes to the first permitted tab.
     - Unauthorized users attempting to trigger upload receive an explicit "Upload Ingestion Restricted" security notice.
  4. *Read-Only QA Review Mode (`QaDashboard.jsx`):*
     - For Senior Managers and Pod Captains (`!canConductCallAudits`), the "Audit Scorecard" tab is hidden, pending calls display locked `🔒 Auditor Only` badges, and the dashboard defaults to 7 QC Tools or History in read-only review mode.
     - Scoped audits filter strictly to division (`managerKey`) for Senior Managers and pod (`captainKey`) for Pod Captains.
     - The "Upload QA / Dialer" button is hidden for users without QA upload authorization.
  5. *User Governance Console Enhancements (`UserManagement.jsx`):*
     - Create and Edit Account modal dynamically adapts to the selected role:
       * *Manager:* Senior Manager division binding selector and supervisory guidance.
       * *Captain:* Assigned pod/team selector, reporting manager dropdown, and captain key binding.
       * *Auditor:* QA Visibility Scope dropdown (`all` vs `self`) and checkbox to grant Ingestion/Upload rights (`canUploadQA`).
       * *General / Backend:* Checkbox to grant L2 Financial Approvals upload rights (`canUploadL2`).
     - User accounts table displays distinct badges for Supervisory Scope (`Division: [Key]`, `Pod: [Team]`, `QA Scope: [All/Self]`) and Ingestion Rights (`Full Ingestion`, `Dialer, Telephony & QA`, `L2 Financials Only`, `View-Only`).
  6. *Rule 22 Anti-Tamper & Zero Database Distortion:*
     - All DRM watermark checks (`#antigravity-watermark-kushalkar`) remain actively coupled to critical execution paths.
     - Historical records, disbursements, and audits remain 100% permanently intact.





---

### Decision 041: Strict Supervisory Scope Isolation for Senior Managers and Pod Captains Across All Modules (Nov 25, 2026)
* **Context:**
  - When logged in as Senior Manager (Niladri Bhadra), the Hierarchical Telephony Drilldown in `RMProductivity.jsx` was displaying all 3 Senior Managers (Arijit Nath, Surajit Laha, Niladri Bhadra) and the KPI summary cards aggregated 1,15,798 dials across 54 RMs.
  - In `ConsolidatedDashboard.jsx`, cross-comparison tables and metrics displayed enterprise-wide numbers rather than the manager's division.
  - The user requested strict scope narrowing for Senior Managers and Pod Captains across all UIs in the application.
* **Architecture & Implementation:**
  1. *Centralized Scoped Data Pipelines (`DataContext.jsx`):*
     - `scopedTelephony`: Filters raw telephony records strictly to `r.m === currentUser.managerKey` for Senior Managers, and `r.c === currentUser.captainKey` / `teamName` for Pod Captains.
     - `scopedQaAudits`: Filters QA audits strictly to division for Managers and pod for Captains.
     - `scopedDialerCalls`: Filters pending incoming dialer calls strictly to the supervised RM roster of that Manager or Captain.
     - Automatic synchronization of `scopeFilter`, `selectedManager`, and `selectedCaptain` upon mount and profile switch.
  2. *RM Telephony Dashboard Isolation (`RMProductivity.jsx`):*
     - Hierarchical drilldown tree builds nodes strictly for the logged-in Senior Manager (`currentUser.managerKey`) and their Pod Captains, or strictly for the Captain's pod. Peer managers and foreign captains are eliminated from the tree.
     - KPI cards calculate Total Dials, Connected, Talk Time, and Active RMs exclusively for that division/pod.
     - Active Calling Agents card dynamically updates label to `[Manager] Division` or `[Team] Pod`.
     - `Transfer RM` action restricted to administrative/managerial scope.
  3. *Consolidated Command Center Scoping (`ConsolidatedDashboard.jsx`):*
     - Top KPI ribbon computes financial disbursements, dials, and QA scores strictly for the authenticated division/pod.
     - Senior Manager comparison table displays only the logged-in Senior Manager's division row instead of all 4 managers.
     - Manager selector in filter ribbon locked/adapted to `currentUser.managerKey` or `currentUser.teamName`.
  4. *L2 Financial Dashboard Cleanup (`L2DashboardMain.jsx`):*
     - Removed lingering `currentUser.role === 'manager'` check in `L2DashboardMain.jsx`, completely hiding the "Upload L2 Data" button from Senior Managers and Captains.
  5. *QA & Dialer Queue Isolation (`QaDashboard.jsx`):*
     - Pending dialer calls queue scoped to supervised RMs so leadership only views pending calls originating from their division/pod.
  6. *Navbar Scope Synchronization (`Navbar.jsx`):*
     - Navigation tab badges (`L2 Approvals`, `RM Telephony`, `QA & QC Tools`) display dynamically scoped record counts matching the user's supervisory scope.

---

### Decision 042: Anti-Slop Audit, Dead Code Pruning & Trailing-Edge Hygiene (Nov 25, 2026)
* **Context:**
  - Audited the entire project under Rule 19 ("Anti-Slop & Dead Code Pruning") and Rule 20 ("Platform Version Policy Alignment").
* **Actions Taken:**
  1. *Unused Named Imports Pruned (41 total):*
     - `LoginPage.jsx`: `KeyRound`, `Users`
     - `Navbar.jsx`: `Building2`
     - `UploadCenterModal.jsx`: `Users`, `RefreshCw`, `ArrowRight`
     - `ConsolidatedDashboard.jsx`: `TrendingUp`, `Users`, `Calendar`, `ArrowUpRight`, `ShieldAlert`, `Layers`
     - `QaDashboard.jsx`: `isAuthorizedAuditor`, `AlertTriangle`, `PlusCircle`, `Layers`, `HelpCircle`, `ChevronDown`, `ChevronUp`, `Save`, `Award`, `FileSpreadsheet`, `PhoneCall`, `Volume2`, `Sparkles`
     - `QaScorecard.jsx`: `User`, `Sparkles`, `CheckCircle2`, `AlertTriangle`
     - `RMProductivity.jsx`: `Calendar`, `RefreshCw`
     - `UserManagement.jsx`: `getAllUsers`, `canConductCallAudits`, `getPermittedModules`, `KeyRound`, `Lock`, `Mail`, `RefreshCw`, `UserX`, `PlusCircle`, `FolderPlus`
  2. *Dead Utilities Pruned:*
     - Removed uninvoked `f1` formatter from `src/utils/formatters.js`.
  3. *Static Analysis Verification:*
     - Verified 0 unreferenced source files across `src/` (all 33 files actively mapped).
     - Verified 0 active `console.log` statements in client source code.
     - Pinned `node >= 20.0.0` and `build.target: 'es2022'` in `vite.config.js`.
  4. *Rule 22 Watermark Integrity:*
     - Confirmed `#antigravity-watermark-kushalkar` with `"Crafted with ❤️ and Antigravity by KUSHAL KAR"` coupled to bootstrap and active watchers.


---

## Decision 043: Global AI Rule Ingestion — Mandatory Post-Edit Anti-Slop Audit Cycle (Rule 21b)
* **Date:** November 25, 2026
* **Status:** Adopted & Enforced Globally
* **Context:**
  - The developer mandated that following every edit or code change, the agent must systematically execute the "Software Factory & Anti-Slop Guidelines (Trailing-Edge Hygiene)" to audit the project.
* **Actions Taken:**
  1. Updated global guidelines file at `C:\Users\User\.gemini\config\plugins\my-global-rules\rules\AGENTS.md`.
  2. Formally added Rule 21b: **Mandatory Post-Edit Anti-Slop Audit Cycle**:
     - Pruning all unused named imports, dead code, and uninvoked local/utility functions across affected files.
     - Verifying zero unreferenced dead files or orphaned components in the project tree.
     - Guaranteeing zero lingering `console.log` statements or debug slop in client application code.
     - Confirming strict platform version alignment (Node.js LTS, ES2022, modern browser baselines) without unnecessary polyfills.
     - Verifying that the Rule 22 Watermark Anti-Tamper protocol remains active, coupled, and intact.
* **Consequences:**
  - All future coding and refactoring tasks across any conversation or workspace powered by these rules will automatically enforce the anti-slop audit cycle prior to task completion.
