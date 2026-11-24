# System Flow & Data Journey

## 1. Authentication & Scope Initialization Flow
```
User visits app
  │
  ├─► Check session in localStorage ('century_joy_auth_user_v2')
  │     ├── Present ──► Cross-verify against getAllUsers() registry
  │     │                 ├── Match & Active ──► Load User & Enforce Scopes
  │     │                 └── Mismatch/Suspended ──► Clear & Show LoginPage
  │     └── Missing ──► Default to Super Admin (Dev Mode) or Render LoginPage
  │
  └─► Initialize Rule 19 Anti-Tamper Watcher
        ├── Attach MutationObserver to document.body
        └── Start 1,200ms background interval checking watermark integrity
```

## 2. Module Execution & Navigation Flow
```
User clicks module tab in Navbar
  │
  ├── 'consolidated' ──► ConsolidatedDashboard.jsx
  │                        ├── Filter by stream (All / Digital / Physical)
  │                        ├── Filter by Senior Manager
  │                        └── Render Tri-Factor KPIs & Manager Matrix
  │
  ├── 'l2' ───────────► L2DashboardMain.jsx
  │                        ├── Load scopedTickets (October 2,688 / November 326)
  │                        ├── Calculate Auditable vs Non-Auditable split
  │                        └── Render ManagerBreakdown & Monetary Bifurcation
  │
  ├── 'productivity' ─► RMProductivity.jsx
  │                        ├── Aggregate 1,868 telephony records
  │                        ├── Calculate Dials, Connected, Talk Time (HH:MM:SS)
  │                        └── Render Hierarchical Drilldown Tree
  │
  ├── 'qa' ───────────► QaDashboard.jsx
  │                        ├── Render 41 Sub-parameters checklist
  │                        ├── Calculate Proportional Score & Fatal Check
  │                        └── Render 7 QC Tools & Past Audit Explorer
  │
  └── 'users' ────────► UserManagement.jsx
                           ├── User Accounts CRUD
                           ├── Role Permission Matrix
                           └── Supervisory Scope Assignment UI
```

## 3. Supervisory Scope Reassignment Flow
```
Admin selects Agent (e.g. "Debapriya Basu") in UserManagement
  │
  ├─► Chooses Target Senior Manager (e.g. "Surajit Laha")
  ├─► Chooses Target Pod Captain (e.g. "Nasima Banu")
  ├─► Clicks "Confirm Scope Transfer"
  │
  ▼
updateRmMapping(agent, newCaptain, newManager) in DataContext
  │
  ├── Updates rmDirectory state & localStorage
  ├── Modifies hierarchy.json tree dynamically
  └── Triggers immediate re-render across Consolidated, L2, RM & QA views
```

## 4. Universal Data Ingestion & Month Switching Flow
```
User clicks "Upload Data" or switches Month in Navbar
  │
  ├── Month Switcher Dropdown
  │     ├── Select "October 2026 Live" (2,688 tickets • ₹39.81 Cr)
  │     ├── Select "November 2026 Live" (326 tickets • ₹5.83 Cr)
  │     └── Select "All Months Consolidated" (3,014 tickets • ₹45.64 Cr)
  │           └── Updates selectedMonth in DataContext ──► Re-evaluates scopedTickets
  │
  └── Universal Upload Center Modal (UploadCenterModal.jsx)
        ├── Tab 1: L2 Financials ──► autoDetectColumnMapping ──► transformUploadedData ──► importTickets()
        ├── Tab 2: RM Telephony ──► downloadTemplate() / parse rows ──► detect missing RMs ──► addTelephonyRows()
        ├── Tab 3: QA Historical Audits ──► parse 11 parameter columns ──► addQaAuditsBulk()
        └── Tab 4: Dialer Call Records ──► parse phone, audio links, durations ──► addDialerCalls()
                                                                                      │
                                                                                      ▼
                                                                        1-Click "Audit Now" in QA Dashboard
                                                                        auto-fills Scorecard with active audio
```
  ├── Re-keys historical telephony records
  └── Syncs across all dashboards in real-time
```
