# Handover Document: Century Joy Complete Dashboard

## 1. System Status
* **Application Name:** Century Joy Complete Executive Operations Portal
* **Version:** 5.0.0 Unified Enterprise Release
* **Deployment Target:** Vercel (React 18 + Vite + Serverless Functions)
* **Build Status:** PASSED (`dist/` compiled with 0 errors)
* **Rule 19 DRM Watermark:** ACTIVE (`Crafted with ❤️ and Antigravity by KUSHAL KAR`)

## 2. What Was Done
1. **Full Integration:** Consolidated 3 independent projects:
   * `L2 Dashboard` (Vercel)
   * `RM Productivity Dashboard` (Google Apps Script)
   * `CenturyPly QA WebApp` (React/Flask)
2. **Consolidated Command Center:** Designed and built a master executive integration dashboard unifying Financial Disbursements (₹45.64 Cr), Calling Telephony (100K+ dials), and QA Auditing (41 sub-parameters).
3. **Exact QA Scorecard Restored:** Fully restored the official 11-parameter, 41-sub-parameter, 100-point scorecard with compact/expand states, 3-state evaluation (Pass/Missed/NA), proportional score scaling, and 3 fatal zero-overrides (Redemption, GTM, CRM).
4. **User, Role & Scope Governance Portal:** Added comprehensive User CRUD, Role Permission Matrix (RBAC), and interactive Supervisory Scope Assignment (Senior Managers › Pod Captains › RMs).
5. **Vercel Serverless Architecture:** Created `/api/users`, `/api/productivity`, `/api/send-otp` endpoints for zero-cold-start cloud execution.
6. **Adversarial Hardening:** Hardened against Broken Access Control, Privilege Escalation, XSS, and DRM tampering.
7. **Option 2 Scorecard Ribbon:** Upgraded the QA Scorecard sticky ribbon with the user-selected "Option 2: Minimalist Frosted Capsule" design (`[ ● 84.00% | COACHING ]`), eliminating the bulky orange block and integrating a smooth pass-ratio progress track.
8. **Universal Upload Center (Phase 1 Delivered):** Deployed `UploadCenterModal.jsx` uniting L2 Financials (fuzzy column mapping), RM Telephony (one-click blank template generator + missing RM mapping), Historical QA Audits, and Dialer Call Recordings Log.
9. **Header Month Switcher Restored:** Added the interactive month dropdown pill in `Navbar.jsx` with real-time financial Cr values, ticket counts, and one-click filtering.
10. **Dialer Call Queue & Audio Player:** Integrated 286 dialer records from SQLite with 1-click audit triggering into the QA Scorecard and active audio banner.
11. **Complete 7 QC Tools Analytics Suite:** Delivered all 7 Quality Control tools with dynamic mathematical calculation from 225 audits:
    * 1. Scatter Diagram (Duration vs Score, $r = +0.68$, optimal compliance quadrant)
    * 2. Pareto Analysis (Ranked failure frequencies + cumulative % line with 80% cutoff line)
    * 3. Ishikawa Fishbone Diagram (4 spines: Process & Scripting, Product & Pricing, Measurement & CRM, Environment & Tech)
    * 4. Score Distribution Histogram (Normal bell-curve across 4 compliance tiers)
    * 5. Statistical Process Control (Weekly stability run chart with UCL, Mean, LCL)
    * 6. Check Sheet (Defect tally matrix across regional franchises)
    * 7. Stratification (Cross-franchise average score & pass rate benchmarks)
    * Segmented tool navigation pill bar (`All 7 Tools`, `1. Scatter`, `2. Pareto`, etc.) + Interactive Filtered Drilldown Audits Table.
12. **Header & Subheader Layout Optimization:** Expanded navbar container to `max-w-[1600px]`, enforced `shrink-0 whitespace-nowrap` on brand title ("Century Joy") and user profile ("Kushal Kar"), and unified the QA subtabs with the "Upload QA / Dialer" button on a single row.
13. **Standard Call Threshold Definition (>= 2 Minutes / 120 Seconds):**
    * Standard Call duration threshold updated from 58s to **>= 2 minutes (120s)** across `QaDashboard.jsx` and `QaScorecard.jsx`.
    * **Queue Rebalance:** Standard Calls queue shifted from 119 to **82 calls** (all >= 00:02:00), while Short Calls shifted from 163 to **200 calls** (all < 00:02:00).
    * Sub-2-minute calls (e.g., `00:01:56` and `00:01:44`) are now properly filed under Short Calls.
    * Scorecard now triggers the Short Call N/A banner for any call under 2 minutes.
14. **Full Sync of L2 Dashboard Compliance & Authentication (Nov 23, 2026):**
    * **Audit Compliance Metrics:** Integrated Auditable % and Non-Auditable % with dual progress meters on KPI Cards 1 & 2, Senior Manager cards, Pod Captain cards, and Physical Team cards.
    * **Golden CRM Channel Rule:** `CenturyJoyApp` maps strictly to Physical Teams (`stream: 'Physical Team'`), `CenturyJoy` maps to Digital Pods.
    * **Invoice Type Compliance Driver:** `Inv Type` strictly drives Auditable vs Non-Auditable status across all datasets.
    * **Tanmoy Kar Pre-Seeded:** Added Tanmoy Kar (`tanmoykar.centuryply@gmail.com`) to `SEED_USERS` with resilient email matching for `tanmoy.centuryply@gmail.com`.
    * **Upload Persistence Across Refresh:** Ingested L2 tickets persist to `century_uploaded_tickets_v2` in `localStorage`, replacing only uploaded months and preserving existing months.
    * **Unmounted L2 Reviewer Operations:** Removed `L2ApproverOperations` from the dashboard canvas as per Decision 027.
    * **Navbar Breakpoint Gap Fixed:** Unified desktop navbar visibility with `hidden md:flex`, eliminating the 768px-1024px dead zone.
    * **Option 2 QA Scorecard & 7 QC Tools Verified:** Confirmed `0 of 10 Evaluated (1 N/A)` formula, Option 2 minimalist frosted capsule, and full 7 QC Tools suite intact.
15. **Scoped QA Auditor RBAC & Two-Tier Visibility (Decision 029, Nov 23, 2026):**
    * **Authorized Auditors Exclusively Enforced:** Only 4 individuals are authorized to perform call evaluations:
      1. `Nabonita Roy` (`nabonita.roy@centuryply.com`): Lead Quality and Backend — Global audit scope (`qaScope: 'all'`).
      2. `Arindam CenturyPly` (`arindam.centuryply@gmail.com`): Senior Quality Auditor — Global audit scope (`qaScope: 'all'`).
      3. `Sayan Banik` (`sayanbanik.centuryply@gmail.com`): Quality Auditor — Self-scoped audits only (`qaScope: 'self'`).
      4. `Arnab Chakladaar` (`arnabcenturyply2024@gmail.com`): Quality Auditor — Self-scoped audits only (`qaScope: 'self'`).
    * **Non-Auditors Blocked:** Senior Managers (e.g. Surajit Laha), Pod Captains, and Viewers cannot audit calls. "Audit Now" buttons in Pending Calls are replaced by locked `🔒 Auditor Only` badges, and the QA Scorecard renders a prominent amber restriction banner with a disabled Submit button (`Auditor Only (Locked)`).
    * **Auditor Name Binding:** The `Auditor Name` field in `QaScorecard.jsx` is locked (read-only) and pre-filled with the authenticated auditor's name, preventing misattribution.
    * **Scoped History Filtering:** History tab displays scoped views: self-scoped auditors see strictly their own audits (e.g., Sayan Banik sees 41 audits with `Scoped: Sayan Banik Only`), while Lead Quality and Super Admin view all 225 audits (`Lead Quality: All Audits`).
    * **Rapid Evaluation Login Presets:** Added 1-Click Role-Based Test Access buttons in `LoginPage.jsx` for instantaneous switching between Super Admin, Lead Quality, QA Auditor (Self-Scoped), and Senior Manager (Locked).
    * **Visual Verification Completed:** End-to-end verified with browser subagent across all scenarios, with screenshot evidence saved to the artifact repository.
16. **Software Factory & Anti-Slop Cleanup (Decision 10, Nov 24, 2026):**
    * **Pruned 10 Dead Components (~198 KB):** Deleted unreferenced legacy components in `src/components/L2Dashboard/` (`UserAccessPage.jsx`, `DeveloperUserModal.jsx`, `Navbar.jsx`, `LoginPage.jsx`, `UploadModal.jsx`, `TicketExplorer.jsx`, `UpdatePasswordModal.jsx`, `CaptainDrilldown.jsx`, `L2ApproverOperations.jsx`, `Watermark.jsx`).
    * **Pruned 4 Unused Dependencies:** Removed `chart.js`, `react-chartjs-2`, `clsx`, `tailwind-merge` from `package.json` and pruned `node_modules`.
    * **Cleaned Dead Logic:** Removed uncalled functions (`toTitleCase`, `formatDateNice`) from `formatters.js`, removed unconsumed keys (`setTickets`, `handleManagerSelect`, `setIsUploadModalOpen`, `setUploadModalTab`) from `DataContext.jsx`.
    * **Platform Baseline:** Explicitly pinned `"engines": { "node": ">=20.0.0" }` in `package.json` and `build.target: 'es2022'` in `vite.config.js`.
    * **Build Output Optimization:** CSS bundle size dropped from 79.87 KB to 68.86 KB (14% reduction); verified 0 build errors.

## 3. How to Run Locally & Deploy
### Local Development
```bash
npm run dev
# Opens on http://localhost:5173
```

### Production Build
```bash
npm run build
# Compiles to dist/ ready for Vercel deployment
```

### Deploying to Vercel
Connect repository to Vercel or run:
```bash
vercel --prod
```
The application will automatically detect Vite and the serverless functions under `api/`.

---

## 17. Live Vercel Production Deployment Status (Nov 24, 2026)
- **Deployment Status:** `READY` (Built and deployed successfully).
- **Project ID:** `prj_fzvHym222XheRPSsIHCkNSofgW3E` (`centuryjoy-sales-hub`)
- **Team ID:** `team_E6YrD1KMTzXjQr29ulAXJlCy` (`kk12101987s-projects`)
- **Latest Deployment ID:** `dpl_APgLtmZpYS6rX5vbXZFTZAx2rkLo`
- **GitHub Repository:** `https://github.com/KK12101987/centuryjoy-sales-hub.git` (branch `master`)
- **Production URL:** [https://centuryjoy-sales-hub.vercel.app](https://centuryjoy-sales-hub.vercel.app)
- **Preview Deployment URL:** [https://centuryjoy-sales-c6p0w7ej4-kk12101987s-projects.vercel.app](https://centuryjoy-sales-c6p0w7ej4-kk12101987s-projects.vercel.app)
- **Bypass / Shareable URL (SSO Authenticated):** [https://centuryjoy-sales-hub.vercel.app/?_vercel_share=930IKTh2rjzhQJ15JvBroZNWIumMEnAR](https://centuryjoy-sales-hub.vercel.app/?_vercel_share=930IKTh2rjzhQJ15JvBroZNWIumMEnAR)
- **Key Modules Deployed:**
  1. Consolidated Command Center
  2. L2 Approvals (Executive Financial Reconciliation)
  3. RM Telephony Operations
  4. QA & 7 QC Analytics Suite (with Standard Calls >= 2 min filter & 4-Auditor RBAC)
  5. User Management & Scope Control
  6. Rule 22 Watermark & Anti-Tamper protocol (`#antigravity-watermark-kushalkar` with `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`)

---

## 18. Audit Click-to-Scorecard & Developer Data Purge (Nov 24, 2026)
- **Scorecard Opening from History:** Clicking any row or the dedicated "Scorecard" button in the QA History table immediately opens that audit's evaluation scorecard with all historical parameters, scores, feedback, and auditor attribution prepopulated.
- **Scorecard Navigation Banner:** A top banner displays historical audit context (Audit #, Agent, Score, Auditor) with convenient "Back to History" and "New Blank Audit" actions.
- **Developer-Only Historical Purge:** An exclusive "Purge Historical Data (Dev)" button is available strictly to developer accounts (`kushal.centuryply@gmail.com`). Includes a two-step confirmation modal to prevent accidental data loss, persistent storage purging, and a "Restore Default Audits" capability.

---

## 19. Dedicated Captain Resignation & Succession Tab, Auto-Failover & Revert Protocol (Nov 24, 2026)
- **First-Class Captain Resignation & Succession Tab:** Created a dedicated, prominent tab in `UserManagement.jsx` navigation bar: **"Captain Resignation & Succession"** styled with amber accent and live failover indicators.
- **Pod Leadership Status & Failover Health Grid:** Live cards for all 5 operational pods (Unity-II, Catlyst-II, Catlyst-I, SoarZone-II, SoarZone-I) showing active Captain, Senior Manager, supervised RM count, and real-time failover state.
- **Console 1: Captain Resignation & Manager Failover:** Select any active Pod Captain, view supervised RMs in real-time, select separation reason, and execute instant failover to their Senior Manager (`Arijit Nath`, `Surajit Laha`, or `Niladri Bhadra`) with zero lost records.
- **Console 2: Leadership Succession & Role Promotion:** Select candidate RM, choose promotion tier (Pod Captain or Senior Manager), select target pod, and assign designated team members.
- **Accidental Resignation & Offboarding Revert Center:** 1-click restore table with instant green "Revert Resignation" button to reinstate the employee and reconnect their subordinate pod hierarchy.
- **Offboarding Tab Deep-Link Banner:** Added guidance banner in the "Remove / Offboard Employee" tab with a 1-click button to jump directly to the Captain Resignation tab.
- **Zero Database Impact:** Inactive employees remain preserved across all historical L2 disbursements, call logs, and completed QA scorecards.
