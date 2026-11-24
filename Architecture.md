# Architecture Document: Century Joy Complete Dashboard

## 1. Executive Summary
The **Century Joy Complete Dashboard** consolidates three previously disparate applications into a single, unified enterprise web portal hosted on Vercel:
1. **L2 Dashboard:** Financial reconciliation, ticket approvals, monetary value bifurcation (Auditable ₹29.72 Cr vs Non-Auditable ₹10.78 Cr), SLA tracking.
2. **RM Productivity Dashboard:** Telephony calling metrics, dialing volume, connectivity rates, talk time, and agent hierarchies migrated from Google Apps Script to Vercel Serverless + Google Sheets API.
3. **CenturyPly QA WebApp:** Call quality scorecards evaluating 41 standardized sub-parameters with 3-state evaluation (`Pass`, `Missed`, `N/A`), fatal parameter zero-overrides, and the complete Seven Quality Control (7 QC) Tools analytical suite.
4. **Consolidated Command Center:** High-level synthesis reconciling financial disbursals with telephony dials and QA scores across all 4 Senior Managers and 7 Pods.
5. **User, Role & Supervisory Scope Governance Console:** Administrative interface for User CRUD, Role-Based Access Control (RBAC), and interactive drag/reassignment of Pod Captains and RMs to Senior Managers.

---

## 2. System Architecture & Component Map

```mermaid
flowchart TD
    subgraph Client["Client Browser (React 18 + Vite SPA)"]
        Nav["Global Navigation & Module Switcher"]
        DRM["Watermark Anti-Tamper Engine (Rule 19)"]
        
        subgraph Views["Operational Modules"]
            ConsolidatedView["📊 Consolidated Command Center"]
            L2View["💳 L2 Financial Reconciliation"]
            TelephonyView["📞 RM Calling Productivity"]
            QaView["🎯 QA Scorecard (41 Checks) & 7 QC Tools"]
            UserMgmtView["👥 User & Supervisory Scope Governance"]
        end
    end

    subgraph State["Global React Context (DataContext.jsx)"]
        AuthStore["Auth & Session (Anti-Escalation Verified)"]
        L2Store["L2 Tickets Corpus (Oct 2,688 & Nov 326)"]
        TelephonyStore["Telephony Logs (1,868 records)"]
        QaStore["QA Audits & 41 Sub-parameters"]
        ScopeStore["Supervisory Tree & 54 Active RMs"]
    end

    subgraph Serverless["Vercel Edge & Serverless Layer (/api/*)"]
        OtpAPI["/api/send-otp (Nodemailer Email OTP)"]
        UsersAPI["/api/users (User CRUD & Scope Sync)"]
        ProductivityAPI["/api/productivity (Google Sheets Bridge)"]
    end

    subgraph Persistence["External Storage Stores"]
        GSheet[("Google Sheets (Spreadsheet ID: 1KRw1dgFehNYvCcej93Xk9outyVCvARXoIqQpd7xVULM)")]
        LocalRegistry[("Persistent Storage & State Cache")]
    end

    Nav --> Views
    Views --> State
    State <--> Serverless
    Serverless <--> GSheet
    DRM -.->|Continuous Integrity Watch| Client
```

---

## 3. Organizational Hierarchy & Role Model
All three portals operate on the identical organizational structure:
* **4 Senior Managers:** Surajit Laha, Niladri Bhadra, Arijit Nath, Amit Singal (Physical Only).
* **7 Pod Captains:** Arshi Afreen Jamal, Mousumi Chakraborty, Nasima Banu, Pallabi Chura, Ranjana Mohajan, Shiuli Bhattacharjee, Silpa Palchina.
* **Direct Physical Teams (No Captain):** Under Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal.
* **Relationship Managers (RMs):** 54 active field and digital agents.

---

## 4. Security & Watermark Anti-Tamper Protocol (Rule 19)
* **Watermark Element:** `id="antigravity-watermark-kushalkar"` with exact text: `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`.
* **Visibility:** Hover-only (`opacity-0 hover:opacity-100`).
* **Kill-Switch:** Continuous MutationObserver + 1,200ms background interval checking DOM existence, exact text normalization, and CSS concealment (`display: none` / `visibility: hidden`). Any violation triggers catastrophic failure (`document.body` wipe and fatal exception).
