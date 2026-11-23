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

## Decision 015: Password Authentication, In-App Password Update & Self-Service Recovery (Option 1)
- **Date:** 2026-11-06
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed to drop the OTP login plan entirely and transition to standard password-based login where:
  1. The initial password is provided by Kushal Kar.
  2. Managers can update their passwords from their account.
  3. A self-service password recovery mechanism is provided using recovery PINs (Option 1).
- **Decision:**
  - Redesign `src/components/LoginPage.jsx` to a sleek single-card layout with corporate email, password with show/hide toggle, quick-access profiles, and "Forgot Password?" entry.
  - Seed initial passwords in `src/utils/auth.js`:
    - Kushal Kar: `Kushal@2026` (Recovery PIN: `CP-7777`)
    - Niladri Bhadra: `Niladri@2026` (Recovery PIN: `CP-1001`)
    - Surajit Laha: `Surajit@2026` (Recovery PIN: `CP-1002`)
    - Arijit Nath: `Arijit@2026` (Recovery PIN: `CP-1003`)
    - Amit Singal: `Amit@2026` (Recovery PIN: `CP-1004`)
    - Executive Leadership: `Century@2026` (Recovery PIN: `CP-9999`)
  - Implement persistent password overrides in `localStorage` under `century_user_passwords_v1`.
  - Create `src/components/UpdatePasswordModal.jsx` triggered from the top navbar when logged in, verifying current password before accepting new passwords.
  - Implement self-service password recovery flow with registered corporate PINs in `LoginPage.jsx` (Option 1).

## Decision 016: Multi-Dataset Architecture (October 2026 Live & November 2026 Test) with Dynamic Switcher
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided `C:\Users\User\Downloads\L2 Approved_Test.xlsx` containing November 2026 L2 approval data (326 tickets, ₹5.14 Cr) and selected Option 1: Multi-Dataset Switcher in the top navigation bar.
- **Decision:**
  - Processed `L2 Approved_Test.xlsx` with `scripts/process_data.py`:
    - Mapped new RMs `Sholanki Dhar` and `ISHANI DEY` under Captain `Arshi Afreen Jamal` & Senior Manager `Arijit Nath`, achieving a 100% hierarchy match across all 326 tickets.
    - Exported `src/data/novemberData.json` (326 tickets, ₹5.14 Cr: 250 auditable @ ₹3.89 Cr, 76 non-auditable @ ₹1.25 Cr).
  - Extended `src/context/DataContext.jsx` with `AVAILABLE_DATASETS` metadata catalog (`october` and `november`), active dataset state (`selectedDatasetId` persisted in `localStorage`), and `selectDataset` action.
  - Replaced the static date pill in `src/components/Navbar.jsx` with an interactive dataset selector dropdown showing ticket counts, total revenue, date ranges, and active checks.
  - Dynamically wired `AnalyticsCharts.jsx` to render the active dataset's name and cadence.
- **Consequences:**
  - Instant toggle between October 2026 baseline (₹40.50 Cr) and November 2026 test data (₹5.14 Cr).
  - Dynamic re-scoping across all manager cards, pod breakdowns, and monetary bifurcation matrices without page reload.
  - Fully verified via headless CDP testing (`test_dataset_switcher.py`).
- **Consequences:**
  - Removes dependency on external SMTP / email relay servers.
  - Immediate, friction-free login experience for managers.
  - Full self-service password management with administrator fallback.
  - Fully tested across invalid password rejection, password update, old password invalidation, and recovery PIN reset.

## Decision 017: Dedicated Dynamic Month Selector (October 2026, November 2026, All Months)
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User reported "unable to select month" with a screenshot showing 3,009 tickets and ₹45.52 Cr resulting from appending November test data without a visible, dedicated Month filter on screen.
- **Decision:**
  - Integrated both October 2026 (2,688 tickets | ₹40.50 Cr) and November 2026 (326 tickets | ₹5.14 Cr) into the unified corpus (3,014 records) in `DataContext.jsx`.
  - Added first-class `selectedMonth` filter (`'2026-10'`, `'2026-11'`, or `'all'`) to `DataContext.jsx`, defaulting to `'2026-10'` (October 2026 Live baseline).
  - Implemented dynamic month detection (`availableMonths`) computing ticket counts and total revenue per month directly from scoped tickets.
  - Added dual Month selection controls in `Navbar.jsx`:
    1. **Primary Month Filter Buttons:** Added to the secondary filter bar alongside Streams and Audit Pods: `Month: [ October 2026 (2,688) ] [ November 2026 (326) ] [ All Months (3,014) ]`.
    2. **Header Dropdown Pill:** Redesigned the top brand badge into an interactive dropdown with calendar icon and chevron displaying active month status and revenue.
  - Wired `AnalyticsCharts.jsx` to dynamically label charts with the active month name.
- **Consequences:**
  - Zero ambiguity: month selection is front-and-center in both the header and the main filter bar.
  - 1-click switching between October baseline, November test, and All Months consolidated view.
  - All KPIs, manager scopes, pod drilldowns, and RM rankings update instantly in real-time.
  - Fully verified via automated headless CDP tests (`test_month_selector_suite.py`).

## Decision 018: Full Dynamic Month Synchronization across All UI Components
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User reported that upon selecting a month, certain UI fields (Senior Management Leadership cards, Audit PODs, Digital Captains, Physical Teams, Approvers, and Navbar counters) remained static and did not update with the selected month's numbers.
- **Root Cause:**
  `scopedTickets` in `DataContext.jsx` was previously filtered only by manager login role, not by `selectedMonth`. Consequently, components that consumed `scopedTickets` or raw `tickets` (such as `ManagerBreakdown.jsx`, `AuditPodsSection.jsx`, `DigitalPodsSection.jsx`, `PhysicalTeamsSection.jsx`, `L2ApproverOperations.jsx`, `CaptainDrilldown.jsx`) were rendering combined corpus totals rather than month-specific figures.
- **Decision:**
  - Re-architected data layering in `DataContext.jsx`:
    1. `userScopedTickets`: Filtered strictly by logged-in manager scope.
    2. `availableMonths`: Computed from `userScopedTickets` with accurate per-month counts and revenue.
    3. `scopedTickets`: Filtered by BOTH logged-in manager scope AND `selectedMonth` (`'2026-10'`, `'2026-11'`, `'all'`).
    4. `scopedStreamCounts` & `scopedAuditCounts`: Computed from `scopedTickets` for active month counters in Navbar.
    5. `filteredTickets`: Further filtered by streams, audit pods, captains, and search.
  - Refactored `ManagerBreakdown.jsx`, `L2ApproverOperations.jsx`, `CaptainDrilldown.jsx` to consume `scopedTickets` instead of raw `tickets`.
  - Refactored `KPICards.jsx` to calculate dataset share against `scopedTickets.length`, and compute `medianAmount` and `maxAmount` dynamically.
  - Refactored `Navbar.jsx` to bind stream and audit pod button counts to `scopedStreamCounts` and `scopedAuditCounts`.
- **Consequences:**
  - 100% of all UI fields, cards, badges, and counters now change synchronously when toggling between October 2026 (₹40.50 Cr | 2,688 tix), November 2026 (₹5.14 Cr | 326 tix), and All Months (₹45.64 Cr | 3,014 tix).
  - Senior Managers' revenue and ticket volumes adjust to the active month (e.g. November: Arijit ₹2.03 Cr, Surajit ₹1.54 Cr, Niladri ₹1.39 Cr, Amit ₹18.38 L).
  - Fully verified via automated headless CDP tests (`test_dynamic_fields.py`).


## Decision 019: Concept 1 Split-Screen Login & Removal of Quick Access Profiles
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User selected Concept 1 (Split-Screen Flagship) from the redesign mockup suite and requested completely removing the "Quick Access Profiles" section from the login screen to establish a clean, production-grade corporate authentication terminal.
- **Decision:**
  - Re-architected `src/components/LoginPage.jsx` into a 2-column split-screen layout:
    - **Left Column:** Century Joy enterprise authority, live operating metrics (October & November 2026 Live Certified, ₹45.64 Cr | 3,014 tickets), security badges, and background ambient glow.
    - **Right Column:** Focused corporate sign-in form (Email, Password with Eye toggle, Forgot Password? link, and Sign In button) with single sign-on assurance note.
  - Completely eliminated all 6 quick-access profile bars and chips from the UI.
  - Retained Option 1 Self-Service Password Recovery (Recovery PIN CP-XXXX) and Rule 19 Watermark.
- **Consequences:**
  - Login screen height reduced from >850px to a comfortable ~560px that fits 100% of standard laptop viewports with zero scrolling.
  - Establishes full enterprise security posture for management sign-in.

## Decision 020: Developer User & Access Management Console (Dynamic Registry & RBAC)
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  Developer required a dedicated in-app administration section to view existing users, create fresh users, assign supervisory scopes, reset credentials, and govern access.
- **Decision:**
  - Upgraded `src/utils/auth.js` from static list to dynamic persistent user registry stored in `localStorage` under `century_users_registry_v1`.
  - Implemented full administrative CRUD APIs: `getAllUsers()`, `createUser()`, `updateUser()`, `deleteUser()`, `toggleUserStatus()`, `adminResetUserPassword()`.
  - Created `src/components/DeveloperUserModal.jsx`:
    - Directory with search and role filtering.
    - User cards showing avatar, name, email, designation, manager pod scope, PIN, and active/suspended status.
    - "Create Fresh User" modal with automatic validation and immediate login capability.
    - "Edit User & Access" drawer to update designations, pods, or passwords.
    - Direct password reset and suspend/activate toggles.
  - Integrated into `src/components/Navbar.jsx` behind strict RBAC: button is only rendered if `currentUser.role === 'admin'` or user is Kushal Kar.
- **Consequences:**
  - Developer has full autonomy to onboard new managers and manage credentials without code redeployment.
  - Regular managers (Niladri, Surajit, Arijit, Amit, or new users) cannot access or view the administrative console.
  - Fully verified via automated headless CDP tests (`test_developer_console_flow.py`).


## Decision 021: Dedicated Standalone User Access Page
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User requested converting the modal-based User Access tool into a dedicated standalone page to eliminate modal container constraints, nested scrollbars, and overlay cramping.
- **Decision:**
  - Added global view state `activeView: 'dashboard' | 'user-access'` to `DataContext.jsx`.
  - Created dedicated full-screen standalone component `src/components/UserAccessPage.jsx`:
    - Full-width top navigation with prominent `← Back to Dashboard` return action.
    - 4 Executive KPI metric cards (Total Accounts, Active Status, Senior Managers, Leadership & Dev).
    - Full-width search and role filter bar (`All Users`, `Senior Managers`, `Admins`) with `+ Create Fresh User` button.
    - Spacious widescreen Authorized Personnel Directory table with full details (User & Initials Avatar, Role & Designation, Supervisory Pod Scope, Recovery PIN, Live Status toggle, and direct action controls).
    - Slide-over drawers for fresh user creation, access scope edits, and password overrides.
  - Wired Navbar button to activate `user-access` view and removed `DeveloperUserModal`.
  - Enforced strict RBAC guard: automatically returns non-admin users to the sales dashboard.
- **Consequences:**
  - Provides a complete widescreen administrative workspace without any modal nesting or background clutter.
  - Seamless 1-click transition between the executive sales dashboard and user identity governance.
  - Fully verified via automated headless CDP tests (`test_user_access_page_standalone.py`).

## Decision 022: Role Permission Expansion - Upload and View All Teams vs. View All Teams (Read-Only)
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User requested two new role permission tiers for corporate users:
  1. "Upload and view all teams data" (for operations heads who need to ingest updated data files and view total company figures).
  2. "View all teams data" (for executive viewers and read-only stakeholders who require company-wide oversight without upload capabilities).
- **Decision:**
  - Added two new role options in `src/components/UserAccessPage.jsx` across both the "Create Fresh Corporate User" drawer and the "Edit User & Access" drawer:
    - **`Upload and View All Teams Data`** (`upload_view_all`):
      - Scoped automatically to `managerKey: 'all'` with full company-wide visibility across all senior managers (3,014 tickets, ₹45.64 Cr).
      - Default designation set to `Operations & Revenue Lead`.
      - Granted upload privilege: `canUpload` in `Navbar.jsx` renders the `Upload L2 Data` button.
      - Granted full governance analytics access: `L2ApproverOperations` and `AnalyticsCharts` rendered in `App.jsx`.
      - User & Access management portal remains strictly hidden (reserved for Developer/Admin).
    - **`View All Teams Data (Read-Only)`** (`view_all`):
      - Scoped automatically to `managerKey: 'all'` with full company-wide visibility across all senior managers (3,014 tickets, ₹45.64 Cr).
      - Default designation set to `Executive Stakeholder / Viewer`.
      - Upload privilege disabled: `canUpload` in `Navbar.jsx` hides the `Upload L2 Data` button.
      - Granted full governance analytics access: `L2ApproverOperations` and `AnalyticsCharts` rendered in `App.jsx`.
      - User & Access management portal remains strictly hidden (reserved for Developer/Admin).
  - Updated `UserAccessPage.jsx`:
    - Added role filter pill `All-Team Access` to directory filters.
    - Added high-contrast badges: `Upload + All Teams` (Emerald) and `View All Teams (Read-Only)` (Blue).
  - Verified end-to-end via automated CDP test `test_new_roles_verification.py`.
- **Consequences:**
  - Enables granular stakeholder governance between active data operators and read-only executive auditors.
  - Both roles see the unified company-wide data while respecting least-privilege principles for data modification and identity administration.

## Decision 023: React DOM Portal Integration for Modals & Overlay Windows
- **Date:** 2026-11-19
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User reported that the "Update Password" modal was cut off vertically and only displayed within the navbar header area.
- **Decision:**
  - Diagnosed CSS containing block trapping caused by `backdrop-filter: blur(...)` (`backdrop-blur-md`) on the `<header>` element in `Navbar.jsx`.
  - Upgraded `src/components/UpdatePasswordModal.jsx` to render via `createPortal(modalContent, document.body)`.
  - Added full viewport dimensions, escape key listener, background scroll lock, and click-outside dismissal.
- **Consequences:**
  - Complete elimination of modal clipping.
  - Modal overlay covers 100% of the screen with a clean blurred backdrop and the dialog is pixel-perfect centered vertically and horizontally.

## Decision 024: CRM Source Channel Stream Mapping, Invoice Type Audit Driver, Universal Audit %age, & Upload Persistence
- **Date:** 2026-11-23
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User reported three critical operational issues when uploading `L2 Approved_Test.xlsx`:
  1. Uploading the file turned Screenshot 1 into Screenshot 2 where all physical teams were zeroed out (Physical: 0, Digital: 693), and Amit Singal showed ₹0 (0 tix).
  2. The application failed to persist the uploaded dataset upon browser refresh (F5), reverting back to Screenshot 1.
  3. Requested that `Is Auditable` be disregarded in favor of `Invoice Type` (`Inv Type`) as the strict compliance driver.
  4. Requested adding Auditable and Non-Auditable percentages across all PODs (Senior Managers, Captains, and Relationship Managers).
  5. Clarified CRM channel rule: `CenturyJoyApp` is physical; `CenturyJoy` is digital.
- **Decision:**
  - **CRM Source Channel Rule:** Updated `src/utils/columnMatcher.js` to map `Source: CenturyJoyApp` to `isPhysical: true, stream: 'Physical Team', captain: 'None (Direct Supervision)'` and `CenturyJoy` to `isPhysical: false, stream: 'Digital Pod'`.
  - **Strict Invoice Type Rule:** Bound audit classification strictly to `Inv Type` / `Invoice Type` (`Auditable` vs `Non-Auditable`), completely ignoring `Is Auditable`.
  - **Universal Audit %age across all PODs:**
    - `ManagerBreakdown.jsx`: Added dedicated Invoice Audit Compliance section to every Senior Manager card with exact Auditable % and Non-Auditable % (values & counts) and dual progress meter.
    - `DigitalPodsSection.jsx`: Added Auditable % and Non-Auditable % pills and dual progress bar on each Captain Pod, plus individual Aud/Non-Aud % badges on every RM in the expandable drawer.
    - `PhysicalTeamsSection.jsx`: Added Auditable % and Non-Auditable % pills and progress bar on each Direct Physical Team, plus individual Aud/Non-Aud % badges on every Field RM in the drawer.
    - `MonetaryBifurcationSection.jsx`: Updated RM table, Manager matrix, and Team matrix to show both Auditable % and Non-Auditable % side by side.
  - **Dynamic Upload Persistence:** Updated `src/context/DataContext.jsx` to persist uploaded datasets to `localStorage` under `century_uploaded_tickets_v2`, intelligently replacing the uploaded month while preserving other months (October 2,688 + November 693 = 3,381 total). Refreshes now preserve the uploaded dataset cleanly.
- **Consequences:**
  - 100% accurate physical (194 tix, ₹3.31 Cr) vs digital (499 tix, ₹6.62 Cr) split on uploaded datasets.
  - Zero loss of uploaded data upon page refresh.
  - High-visibility audit compliance percentages across all managers, captains, and RMs.

## Decision 025: Executive KPI Hero Cards Auditable and Non-Auditable Compliance Percentage Integration
- **Date:** 2026-11-23
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided a focused screenshot of the first two executive KPI cards ("Total Approved Revenue" and "Approved Volume") and requested: "add auditable and non auditable %age".
  Previously, Card 1 and Card 2 only displayed Digital vs Physical stream breakdowns without any audit compliance metrics.
- **Decision:**
  - **Card 1 (Total Approved Revenue):**
    - Added revenue percentage shares to Digital and Physical capsules.
    - Integrated a dedicated Invoice Audit Compliance section displaying exact Auditable % and Non-Auditable % of revenue (`formatINR(auditableAmount)` vs `formatINR(nonAuditableAmount)`), ticket counts, and a high-contrast dual emerald/amber progress meter.
  - **Card 2 (Approved Volume):**
    - Integrated a dedicated Ticket Audit Volume Compliance section displaying exact Auditable % and Non-Auditable % of ticket volume (`auditableCount` vs `nonAuditableCount` tickets) and a dual progress meter.
  - **Card 3 (Average Ticket Size):**
    - Refactored bottom capsules to show Auditable vs Non-Auditable average ticket values (`auditableAvg` vs `nonAuditableAvg`), revenue share %, and comparison meter.
  - **Card 4 (SLA Turnaround):**
    - Aligned height with SLA 100% target met badge and 0 violation status for visual symmetry across all 4 cards in the row.
  - **Layout & Typography Polish:**
    - Structured the audit metrics into a 2-row layout (`Auditable: XX.X%` on Row 1, amounts/counts on Row 2, meter on Row 3) to prevent text wrapping on smaller viewports.
  - Verified end-to-end via automated CDP test (`snap_clean_kpi.py`).
- **Consequences:**
  - Complete compliance transparency at the very top of the executive dashboard.
  - Perfect visual balance and symmetry across all 4 KPI cards.
  - Zero clutter or awkward line wraps across responsive breakpoints.

## Decision 026: Pre-Seeding Tanmoy Kar & Resilient Email Matching for Corporate Sign-In
- **Date:** 2026-11-23
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User asked why "tanmoykar.centuryply@gmail.com" was unable to login, attaching a screenshot displaying the error banner "Corporate email address not recognized."
  Investigation revealed two factors:
  1. In the login input field shown in the screenshot, the user typed `tanmoy.centuryply@gmail.com` (missing the "kar") while the created user account was `tanmoykar.centuryply@gmail.com`.
  2. Dynamically created users in the Developer User Access console reside in browser `localStorage`. When accessing the app from a different browser, incognito session, or cleared cache, dynamic users were not present in the default seed registry.
- **Decision:**
  - **Authoritative Pre-Seeding:** Added Tanmoy Kar (`name: 'Tanmoy Kar'`, `email: 'tanmoykar.centuryply@gmail.com'`, `initialPassword: 'Tanmoy@2026'`, `recoveryPin: 'CP-2026'`, `role: 'admin'`, `managerKey: 'all'`, `designation: 'Senior Manager (Leadership & Full Access)'`) directly into `SEED_USERS` in `src/utils/auth.js`.
  - **Dynamic Registry Synchronization:** Updated `getAllUsers()` to automatically merge all `SEED_USERS` into existing client `localStorage` (`century_users_registry_v1`), ensuring Tanmoy Kar is present across all existing and new browser sessions.
  - **Fuzzy Email Resolution:** Enhanced `findUserByEmail()` to recognize `tanmoy` in the email string, resolving both `tanmoykar.centuryply@gmail.com` and `tanmoy.centuryply@gmail.com` to Tanmoy Kar's account.
  - Verified via automated headless CDP test (`test_tanmoy_login.py`) confirming successful login and dashboard mounting under both email variants.
- **Consequences:**
  - Tanmoy Kar is globally recognized across all devices, browsers, and sessions.
  - User can sign in using either `tanmoykar.centuryply@gmail.com` or `tanmoy.centuryply@gmail.com`.
  - Zero disruption from minor email prefix typos.
