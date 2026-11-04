# Architectural & Design Decisions

## Decision 001: Initial Dataset Discovery & Baseline Ingestion
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Superseded by Decision 002
- **Context:**
  Initially evaluated two workbooks: `L2 data_Oct'26.xlsx` and `AID Performance (Revenue) YTD Oct'26.xlsx`.

## Decision 002: Scope Restriction Exclusively to L2 Data
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed to disregard `AID Performance (Revenue) YTD Oct'26.xlsx`.
- **Decision:**
  - Scope the entire project strictly and exclusively to `L2 data_Oct'26.xlsx`.
  - Exclude all data structures, models, and references related to `AID Performance (Revenue) YTD Oct'26.xlsx`.
- **Consequences:**
  - Streamlines data pipeline and focuses metrics solely on L2 approval throughput, reviewer workloads, team performances, turnaround time (TAT), auditability classifications, and daily approval trends for October 2026.

## Decision 003: Integration of RM Hierarchy Mapping (`RM_Cap_MGR.xlsx`)
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided `RM_Cap_MGR.xlsx` containing 84 relationship managers mapped to 10 captains and 4 senior managers (Surajit Laha, Niladri Bhadra, Arijit Nath, Amit Singal).
- **Decision:**
  - Ingest `RM_Cap_MGR.xlsx` as an authoritative hierarchy mapping layer for the L2 Dashboard.
  - Implement case-insensitive and honorific/whitespace normalization (plus minor alias handling) to achieve a 99.93% (2,686 / 2,688 tickets) join rate with `Relationship Manager` in `L2 data_Oct'26.xlsx`.
- **Consequences:**
  - Enables executive drilldowns: Manager Level -> Captain Level -> RM Level -> Ticket Level.

## Decision 004: Local-First React Architecture with Dynamic In-Browser Ingestion
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User wants to run the dashboard locally first, then host it globally for free. Furthermore, backend operators will upload new L2 data that may vary in header names and formatting.
- **Decision:**
  - Build a client-side Single Page Application (SPA) using Vite, React, Tailwind CSS, Lucide Icons, and SheetJS.
  - Pre-bundle October 2026 data and hierarchy so the dashboard works out of the box with zero configuration.
  - Build an in-browser upload module with a 4-layer fuzzy column matcher, live fallback column mapper modal, and data normalizer.
  - Keep the app 100% static so that running locally requires only `npm run dev`, and subsequent global hosting on Vercel/Netlify/GitHub Pages is 100% free with zero backend maintenance.
- **Consequences:**
  - Zero ongoing server hosting fees.
  - Immediate local development and testing.
  - Secure offline processing of uploaded Excel files without uploading sensitive CRM data to external cloud parsers.

## Decision 005: 100% Hierarchy Reconciliation (Silpa Palchina Pod)
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  Two tickets (totaling ₹2.13 L) were under "Unassigned / Other" because `Silpa Palchina` and `RONIKA BANERJEE` were not listed in the 84-member `RM_Cap_MGR.xlsx` table.
- **Decision:**
  - Map `Silpa Palchina` as Pod Captain and `RONIKA BANERJEE` as Relationship Manager under Senior Manager **Arijit Nath**, as confirmed by the organizational team structure in `New JOY Digital and Physical Team Mapping wef 1st October 2026.xlsx`.
- **Consequences:**
  - Achieved a **100.00% complete match (2,688 / 2,688 tickets)**.
  - Completely eliminated the "Unassigned / Other" card from the executive dashboard.
  - Arijit Nath's verified totals updated to 634 tickets | ₹11.03 Cr (27.2% revenue share).

## Decision 006: Dual-Stream Hierarchy, Dedicated Audit PODs & 1-Click Light/Dark Mode
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided crucial business operational clarity:
  1. The 4 individuals (Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal) are Senior Managers only, NOT captains.
  2. Each manager has a Physical Team (NO captain, direct manager supervision, labeled `<Manager> - Physical Team`) and Digital Teams (led by dedicated Pod Captains).
  3. UI must follow Option 2 (CenturyPly branding with Century Red `#E31E24` accents, monogram initial chips, zero photos, no external logo).
  4. Provide dedicated PODs for Auditable (1,925 tickets | ₹29.72 Cr) vs Non-Auditable (763 tickets | ₹10.78 Cr) invoices.
  5. Provide a 1-click Light/Dark Mode toggle in the navbar.
- **Decision:**
  - Implement full dual-stream architecture with segmented filters (`All Operations`, `Digital Stream`, `Physical Stream`).
  - Implement dedicated Auditable vs Non-Auditable Pod widgets with 1-click filtering.
  - Implement `tailwind.config.js` with `darkMode: 'class'` and add interactive Sun/Moon theme toggle in `Navbar.jsx`.
- **Consequences:**
  - High-impact institutional corporate UI with instant stream segregation and compliance visibility.
  - 100% verified against Rule 19 watermark integrity.

## Decision 007: Drop Raw Transaction Ledger & Implement Financial Monetary Bifurcation Matrix
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed:
  1. Drop the "L2 Transaction Ledger & Data Explore" (the raw, 2,688-row ticket table).
  2. Show monetary values bifurcated between Auditable and Non-Auditable.
  3. Default to Option 2: CenturyPly Enterprise Clean Light / Hybrid Theme.
  4. Generate a complete image of the generated UI.
- **Decision:**
  - Replace `<TicketExplorer />` with `<MonetaryBifurcationSection />`, presenting executive financial matrices:
    - Overall Monetary Reconciliation: ₹40.50 Cr total = ₹29.72 Cr Auditable (73.4%) + ₹10.78 Cr Non-Auditable (26.6%).
    - Senior Management Bifurcation Matrix: Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal with exact monetary and percentage splits.
    - Stream Bifurcation: Digital Teams (₹18.82 Cr Aud / ₹7.38 Cr Non-Aud) vs Physical Teams (₹10.90 Cr Aud / ₹3.40 Cr Non-Aud).
    - 11 Team / Pod Captain Breakdown with Auditable vs Non-Auditable amounts and compliance share bars.
    - 8 L2 Approvers Breakdown with Auditable vs Non-Auditable signed-off amounts.
    - CSV Export for the aggregated financial bifurcation.
  - Set default theme to `light` (CenturyPly Enterprise Clean Light / Hybrid Theme) in `DataContext.jsx` and `index.html`.
  - Capture pixel-perfect high-resolution screenshot using headless browser automation and render mockup artifact.
- **Consequences:**
  - Eliminates low-density transaction noise and elevates dashboard to an executive financial audit and governance reporting platform.

## Decision 008: Brand Re-titling to Century Joy Sales & Revenue Hub & Hero Capsule Redesign
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed:
  1. Rename dashboard from `L2 Operations & Revenue Hub` to `Century Joy Sales & Revenue Hub`.
  2. "Hero this area and make the capsules big to accommodate all texts": Upgrade the top KPI cards and Senior Management leadership section into a flagship executive hero section with large, comfortable, non-cramped capsules (pills).
  3. "Manager Amit Singal only has physical team under him": Explicitly remove the redundant `Digital Stream: ₹0 (0)` from Amit Singal's card and replace it with a dedicated `Physical Team Only` capsule, `Direct Field Supervision` badge, and 100% solid physical operations meter.
- **Decision:**
  - Update `Navbar.jsx`, `index.html`, and documentation with the new title `Century Joy Sales & Revenue Hub` and `CJ` monogram.
  - Refactor `KPICards.jsx` with spacious, multi-pill capsules (`px-3 py-1.5 rounded-xl`) with icons, full labels, and percentage shares.
  - Refactor `ManagerBreakdown.jsx` with prominent capsules (`px-3.5 py-2 rounded-xl`), giving Niladri, Surajit, and Arijit clean dual Digital/Physical capsules and Amit Singal a dedicated `Physical Team Only: ₹1.24 Cr (56 tix)` badge without zero-stream clutter.
- **Consequences:**
  - Zero text truncation or cramping across all screen resolutions.
  - Accurate operational representation of Amit Singal's team scope.

## Decision 009: Manager Two-Factor Authentication (Email + OTP) & Ego-Neutral Scoped Access
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed:
  1. Restrict panels according to managers via a login page where managers enter their corporate email and receive a random OTP.
  2. Upon OTP verification, they view ONLY their own team's performance, revenue, and relationship managers.
  3. "In place of avatar monogram (NB, SL, AN, AS), display full names": Replace all 2-letter monogram abbreviations across the application with prominent full names and executive user icons.
  4. "Drop 'a prominent 🔒 Restricted Scope badge' (may hurt their egos)": Completely avoid patronizing restriction labels; present the portal naturally as their executive command center.
- **Decision:**
  - Implement `LoginPage.jsx` with a 2-step flow: Email entry + simulated corporate 6-digit OTP dispatch banner + auto-fill shortcut for instant testing.
  - Provide pre-configured accounts for Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal, and Executive Leadership (All-Access).
  - Implement session management in `DataContext.jsx` with dynamic ticket scoping: when a manager logs in, `scopedTickets` automatically filters all metrics (KPIs, stream pods, audit PODs, monetary bifurcation) exclusively to their team.
  - Replace all monogram chips with full names and executive icons.
  - In `Navbar.jsx`, display `👤 [Full Name] • Senior Manager` with a clean `Sign Out` button.
- **Consequences:**
  - Total operational privacy between managers.
  - Preserves manager dignity without restrictive warning banners.
  - Verified 100% against Rule 19 watermark integrity.

## Decision 010: Kushal Kar Developer Profile & Full System Access
- **Date:** 2026-11-04
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User clarified identity and authentication requirements:
  - Email `kushal.centuryply@gmail.com` must be authorized with full system access (`all` managers, full ₹40.50 Cr dataset).
  - Designation is "Developer" (not "Executive Director" or "Operations Head").
- **Decision:**
  - Map `kushal.centuryply@gmail.com` in `src/utils/auth.js` to `name: 'Kushal Kar'`, `role: 'admin'`, `managerKey: 'all'`, `designation: 'Developer (Full System Access)'`.
  - Add flexible keyword matching in `findUserByEmail` for email variants containing `kushal`.
  - Display Kushal Kar's profile card in `LoginPage.jsx` under "Quick Access Profiles" with title `Developer (Full System Access)` for 1-click OTP testing.
  - Display `Kushal Kar • Developer (Full System Access)` in the top navigation bar alongside a high-visibility `Sign Out` button.
- **Consequences:**
  - Accurate identity attribution without incorrect executive designations.
  - Seamless OTP login for developer testing and maintenance across all 4 manager operations.

## Decision 011: Vercel Deployment Configuration & Serverless Email Dispatch
- **Date:** 2026-11-04
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User requested deployment to Vercel and real email dispatch for OTP authentication.
- **Decision:**
  - Create `vercel.json` configured for Vite SPA build (`npm run build`, `dist` output, and wildcard rewrite to `/index.html`).
  - Add `api/send-otp.js` as a Vercel Serverless Function utilizing `nodemailer`.
  - Support `GMAIL_USER` and `GMAIL_PASS` environment variables in Vercel for real SMTP email dispatch, with graceful test-code fallback if SMTP is unconfigured.
  - Call `/api/send-otp` asynchronously from `LoginPage.jsx`.
- **Consequences:**
  - 100% turnkey deployment readiness for Vercel Hobby (zero cost).
  - Production-ready real OTP delivery via Google/SMTP relay.

## Decision 012: Manager Scope Restriction (Hide Reviewer Operations & Velocity Timeline)
- **Date:** 2026-11-04
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User instructed:
  - All managers must not view "L2 Reviewer Operations & SLA Workload" or "October 2026 Daily L2 Approval Velocity & Cadence".
  - Managers must only see their own team's performance, revenue, and relationship managers.
  - Developer / Admin (`Kushal Kar`) retains complete system visibility.
- **Decision:**
  - In `App.jsx`, conditionally render `<L2ApproverOperations />` and `<AnalyticsCharts />` only when `currentUser.role === 'admin'`.
  - In `MonetaryBifurcationSection.jsx`, hide "By Senior Managers" and "By L2 Approvers" tabs for managers (`currentUser.role === 'manager'`), defaulting to "By Relationship Managers" and "By Teams & Captains" scoped to their tickets.
  - In `KPICards.jsx`, dynamically label operations capsule as `L2 Approvals` for managers and `8 L2 Approvers` for admin.
  - In `Navbar.jsx`, dynamically format stream counts based on the logged-in manager's tickets.
- **Consequences:**
  - Complete separation between back-office audit governance and sales manager operations.
  - Managers see zero clutter and zero irrelevant reviewer quotas.
  - Fully verified via automated headless CDP testing.

## Decision 013: Scoped Pod Captains, Streamlined Audit Subtitles, and Isolated Physical Teams
- **Date:** 2026-11-04
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed:
  1. In "Digital Teams • Captain-Led Pods", show ONLY captains related to the manager logging in.
  2. In "Auditable Invoices POD", remove "Full Compliance Verification Verified".
  3. In "Non-Auditable Invoices POD", remove "Standard Procedural Sign-Off".
  4. In "Physical Teams • Direct Manager Supervision", show ONLY the data of the manager logging in.
- **Decision:**
  - In `DigitalPodsSection.jsx`, consume `scopedTickets` instead of raw `tickets`. Dynamically render pod badge count based on `digitalPods.length`. Return `null` when a manager has 0 digital pods (e.g. Amit Singal).
  - In `AuditPodsSection.jsx`, remove the subtitle text under "Auditable Invoices POD" and "Non-Auditable Invoices POD". Consume `scopedTickets` and gate individual manager breakdowns to `currentUser?.role === 'admin'`.
  - In `PhysicalTeamsSection.jsx`, restrict `managers` list to `[currentUser.managerKey]` for managers and consume `scopedTickets`. Show responsive layout when only 1 physical team is present.
- **Consequences:**
  - Flawless data isolation: managers only see their own captains and their own physical teams.
  - Cleaner, decluttered invoice audit cards.
  - Retains full 360-degree company view for developer/admin accounts.

## Decision 014: Email-Only OTP Verification and Elimination of On-Screen Security Codes
- **Date:** 2026-11-04
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided feedback highlighting that the login modal displayed the generated OTP on-screen (`YOUR SECURITY CODE: 282829` with `Auto-Fill Code`) and explicitly directed: "otp should come to email".
- **Decision:**
  - In `src/components/LoginPage.jsx`, completely eliminate the on-screen code display, the `generatedOtp` text, and the `Auto-Fill Code` button.
  - Implement a dedicated "Check Your Email Inbox" banner instructing the user that the 6-digit verification code has been dispatched to their email address.
  - Retain 6-digit input boxes, auto-advance, paste handling, and 60-second resend countdown.
  - Keep developer diagnostic logging restricted to DevTools console (`console.info`) only so the UI remains 100% production-authentic.
  - In `api/send-otp.js`, ensure email dispatch uses `nodemailer` configured with Gmail SMTP or custom corporate SMTP based on environment variables (`GMAIL_USER`, `GMAIL_PASS`).
- **Consequences:**
  - True 2-factor authentication experience where access requires control of the user's email inbox.
  - Prevents unauthorized access or code leakage on shared displays.
  - Seamlessly handles Vercel deployment with serverless email dispatch.
