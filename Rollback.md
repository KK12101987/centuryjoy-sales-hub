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
