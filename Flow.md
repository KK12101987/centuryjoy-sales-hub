# Flow of Execution & Traceability

## System Flow Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        L2_EXCEL["L2 data_Oct'26.xlsx"] --> PY_SCRIPT["process_data.py"]
        RM_EXCEL["RM_Cap_MGR.xlsx"] --> PY_SCRIPT
        PY_SCRIPT --> CLEAN_JSON["src/data/initialData.json"]
        PY_SCRIPT --> HIERARCHY_JSON["src/data/hierarchy.json"]
    end

    subgraph Client Application [React + Vite]
        CLEAN_JSON --> APP_STATE["Application State (DataContext)"]
        UPLOAD_UI["Upload Section (.xlsx / .csv)"] --> SHEETJS["In-Browser Parser (SheetJS)"]
        SHEETJS --> COLUMN_MATCHER["Fuzzy Column Matcher & Normalizer"]
        COLUMN_MATCHER -->|If ambiguous| MAPPER_MODAL["Interactive Column Mapper UI"]
        MAPPER_MODAL --> APP_STATE
        COLUMN_MATCHER -->|Auto-matched| APP_STATE

        APP_STATE --> INTEGRITY_CHECK["Security & Integrity Watcher (Rule 19)"]
        INTEGRITY_CHECK -->|Passed| DASHBOARD_VIEWS["Dashboard Views"]
        INTEGRITY_CHECK -->|Tampered| KILL_SWITCH["Catastrophic Failure Protocol"]

        subgraph Dashboard Views
            DASHBOARD_VIEWS --> KPI_CARDS["Executive KPI Cards"]
            DASHBOARD_VIEWS --> DRILLDOWN["Manager > Captain > RM Drilldown"]
            DASHBOARD_VIEWS --> L2_METRICS["L2 Approver Workload & TAT"]
            DASHBOARD_VIEWS --> TIMELINE["Daily Trends & Channel Mix"]
            DASHBOARD_VIEWS --> TICKET_TABLE["Searchable Ticket Explorer + CSV Export"]
        end
    end
```

## Traceability Map

1. **Raw Ingestion:** `L2 data_Oct'26.xlsx` & `RM_Cap_MGR.xlsx` $\rightarrow$ normalized via `process_data.py` into initial static bundles for zero-latency local startup.
2. **Dynamic Ingestion:** `src/components/UploadModal.jsx` reads uploaded binary Excel via `xlsx` library, passes records through `src/utils/columnMatcher.js` and `src/utils/normalizer.js`.
3. **Hierarchy Mapping:** Unmatched RM names are fuzzy-matched against `src/data/hierarchy.json` to assign Manager and Captain.
4. **Data Store:** `src/context/DataContext.jsx` maintains live ticket state, filtered state, date filters, and aggregations.
5. **Watermark & Integrity Engine:** `src/components/Watermark.jsx` and `src/utils/integrity.js` continuously observe DOM nodes and string integrity.
