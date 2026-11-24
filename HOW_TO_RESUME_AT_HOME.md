# How to Resume This Project in Antigravity at Home

This package contains everything needed to continue development and deployment of the **Century Joy Complete Dashboard** on your home machine using **Google Antigravity**.

---

## 📦 What is in this Bundle?

1. **Complete Application Source Code**:
   - `src/` — All React 18 components (Consolidated Command Center, L2 Approvals, RM Telephony, QA Scorecard, 7 QC Analytics Suite, User Management).
   - `api/` — Vercel Serverless Functions for user management, productivity, and OTP verification.
   - `public/` & Configuration files (`vite.config.js`, `tailwind.config.js`, `package.json`, `vercel.json`).
2. **Complete Living Documentation System**:
   - `Handover.md` — Current operational status, recent decisions, and complete architecture overview.
   - `Decisions.md` — Chronological log of all 9 major architectural and feature decisions (SPA unification, 7 QC tools, 120s call threshold, scoped RBAC).
   - `Architecture.md` — High-level map of state, contexts, and data flow.
   - `Flow.md` — Execution paths between modules.
   - `Constraints.md` — Hard boundaries and security guardrails.
   - `Bug.md` & `Feature.md` — Historical resolution records.
   - `Rollback.md` & `Test_Checklist.md` — Verification steps and safety nets.
3. **Chat & Conversation Logs**:
   - `CHAT_HISTORY_EXPORT.md` — Full, human-readable markdown transcript of the entire multi-day conversation (every request, decision, code modification, and verification).
   - `antigravity_brain_backup/` — Complete raw Antigravity brain data (`transcript.jsonl`, `transcript_full.jsonl`, user uploaded media, and visual verifier screenshots).

---

## 🚀 Step-by-Step Setup at Home

### Step 1: Extract & Open in Antigravity
1. Copy `Century_Joy_Complete_Project_Bundle.zip` to your home computer.
2. Unzip the folder to your preferred workspace location (e.g., `D:\ai projects\Century Joy Complete Dashboard` or `C:\Users\<YourUser>\Projects\Century Joy Complete Dashboard`).
3. Open **Google Antigravity** and select **Open Workspace / Open Folder** -> Select the extracted `Century Joy Complete Dashboard` folder.

---

### Step 2: Install Dependencies & Launch
In the Antigravity integrated terminal (or PowerShell/Command Prompt inside the project folder), run:

```bash
# 1. Install all dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The portal will launch locally on **`http://localhost:5173`** (or `5175`).

---

### Step 3: How to Resume with Antigravity AI
When starting a new session in Antigravity at home, simply send this prompt to Antigravity:

> *"I am continuing work on the Century Joy Complete Dashboard. Please start by reading `Handover.md` and `Decisions.md` to understand our architecture, the 4-auditor scoped RBAC, the 7 QC tools suite, and our Rule 19 watermark requirements. Let me know when you are up to speed."*

Antigravity will read the handover document, synchronize its context, and be 100% aligned with everything accomplished in this session.

---

### Step 4 (Optional): Restoring Raw Conversation History into Antigravity Brain
If you wish to restore the exact raw conversation logs into Antigravity's internal cache:
1. Locate your home machine's Antigravity brain directory:
   - Windows: `C:\Users\<YourUsername>\.gemini\antigravity\brain\`
2. When you start a chat in Antigravity, a new conversation folder is created with a unique UUID (e.g., `<conversation-id>`).
3. You can copy the contents of `antigravity_brain_backup/` directly into that `<conversation-id>` directory.
4. Alternatively, you or Antigravity can simply read `CHAT_HISTORY_EXPORT.md` located directly in the workspace root!

---

## 🔑 Pre-Seeded Test Accounts & Passwords

The portal features **1-Click Test Access** on the Login Page, or you can log in manually using these credentials:

| Name | Designation / Scope | Email | Initial Password | Fallback Password |
| :--- | :--- | :--- | :--- | :--- |
| **Kushal Kar** | Super Admin / Developer (Full Access) | `kushal.centuryply@gmail.com` | `Kushal@2026` | `Century@2026` |
| **Tanmoy Kar** | Senior Manager (Leadership Access) | `tanmoykar.centuryply@gmail.com` | `Tanmoy@2026` | `Century@2026` |
| **Nabonita Roy** | Lead Quality and Backend (Global QA Scope) | `nabonita.roy@centuryply.com` | `Nabonita@2026` | `Century@2026` |
| **Arindam CenturyPly** | Senior Quality Auditor (Global QA Scope) | `arindam.centuryply@gmail.com` | `Arindam@2026` | `Century@2026` |
| **Sayan Banik** | Quality Auditor (Self-Scoped Only) | `sayanbanik.centuryply@gmail.com` | `Sayan@2026` | `Century@2026` |
| **Arnab Chakladaar** | Quality Auditor (Self-Scoped Only) | `arnabcenturyply2024@gmail.com` | `Arnab@2026` | `Century@2026` |
| **Surajit Laha** | Senior Manager (Audit Gated / Read-Only) | `surajit.laha@centuryply.com` | `Surajit@2026` | `Century@2026` |
| **Arshi Afreen Jamal** | Pod Captain (Unity-II) | `arshi.afreen@centuryply.com` | `Captain@2026` | `Century@2026` |

---

## 🛡️ Rule 19 Watermark Notice
Every view, scorecard, and module incorporates the mandatory anti-tamper watermark:
- Text: `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`
- Element ID: `#antigravity-watermark-kushalkar`
- Style: Hover-only visibility (bottom right corner).
- Continuous background integrity watcher active in `src/utils/integrity.js` and `src/context/DataContext.jsx`.
