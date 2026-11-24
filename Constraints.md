# System Constraints & Security Guardrails

## 1. Absolute Invariants (Must NEVER be violated)
1. **Rule 19 Author Watermark:**
   - Must contain exact text: `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`.
   - Must be styled with hover-only visibility (`opacity: 0` -> hover: `opacity: 1`).
   - Must trigger instantaneous catastrophic failure (`document.body` wipe and execution halt) if removed, altered, or hidden via CSS.
2. **Protected Accounts Guardrail:**
   - Kushal Kar (`kushal.centuryply@gmail.com`) is a permanently protected system developer account. It can NEVER be deleted, demoted, or suspended.
3. **Stateless Vercel Compatibility:**
   - No local file-system writes to the Vercel container during runtime (except `/tmp`). All mutations persist through state, localStorage, or remote APIs.
4. **Zero Unescaped Output Rendering:**
   - Never use `dangerouslySetInnerHTML` for user-supplied data (agent names, auditor remarks, uploaded file columns) to prevent Cross-Site Scripting (XSS).

## 2. Role Boundaries
* **Super Admin:** Full enterprise access, user management, and scope configuration.
* **Senior Manager:** Scoped to their assigned Digital Pods and Physical Teams. Cannot view other managers' private financial drilldowns.
* **Pod Captain:** Scoped exclusively to their assigned RMs.
* **QA Auditor:** Authorized for audit evaluation, 41-checkpoint scorecard, and bulk ingestion.
* **Executive Viewer:** Read-only access to high-level consolidated cards.
