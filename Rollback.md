# Rollback & Recovery Procedures

## 1. Fast Rollback via Git / Commit
To revert the workspace back to its pre-merge clean state:
```bash
git checkout HEAD~1 -- .
```

## 2. Restoring Individual Standalone Projects
The original 3 independent project repositories remain completely untouched and operative in their source locations:
* `E:\Kushal\ai projects\CenturyPly_QA_WebApp_v4.6_ReactFlask`
* `E:\Kushal\ai projects\RM Productivity Dashboard`
* `E:\Kushal\ai projects\L2 Dashboard`

If any component requires isolated debugging, reference or execute the original standalone build commands in their respective directories.

## 3. Executed Rollback: Production Master Release Switch Reversion
* **Date:** 2026-11-27
* **Action:** Reverted commits `8b9cde1` and `790fe1c` via `git revert`.
* **State Restored:** Commit `59b952c` (identical code tree to `9f1bc07`).
* **Result:**
  - `IS_PRODUCTION_RELEASE_ACTIVE` removed.
  - The staging lock is active again: outside / public devices strictly see ONLY **L2 Approvals**.
  - Developer role testing remains intact on authorized devices using the navbar toggle (`Dev Unlocked` / `Public Mode`).
