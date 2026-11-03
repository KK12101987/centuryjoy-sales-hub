# Rollback Plan

## Phase: FEAT-001 (Local Dashboard & Ingestion Implementation)

### Safe Recovery Steps
1. **Clean Project Reset:**
   If the React scaffold or package installation fails, clean up the generated frontend files while keeping raw Excel data intact:
   ```powershell
   Remove-Item -Recurse -Force node_modules, dist, src, public, package.json, package-lock.json, vite.config.js, tailwind.config.js, postcss.config.js
   ```
2. **Preserved Raw Data:**
   The raw files `L2 data_Oct'26.xlsx` and `RM_Cap_MGR.xlsx` are read-only and never modified.
3. **Commit Point:**
   Initialize a git commit before and after major file additions so `git reset --hard` can restore the previous clean state if needed.
