# SiteSync Architecture: Real vs Deterministic Simulation vs Mock vs Planned

**Standard**: Master Prompt 14 Section 45 Honest Architecture Disclosure  
**Purpose**: Transparently declare the exact runtime implementation status of every subsystem to prevent accidental overclaiming during SIH evaluation.

---

## 1. Classification Definitions

- **REAL**: Fully implemented in production-grade TypeScript/Node.js code, with complete business logic, algorithms, state mutations, validations, and tests executed at runtime.
- **DETERMINISTIC SIMULATION**: Authentic algorithms executing over high-fidelity synthetic benchmark datasets (e.g. simulated XGBoost weights, local embedding projections, fixed-seed test suites) to guarantee 100% reproducible evaluation without external cloud API dependencies.
- **MOCK / FALLBACK**: Staged placeholder or test double utilized as a safety net if external hardware or network infrastructure fails during live demonstration.
- **PLANNED**: Acknowledged architectural roadmap item not yet implemented in the prototype.

---

## 2. Comprehensive Subsystem Classification Matrix

| Subsystem / Capability | Classification | Runtime Implementation Details |
| :--- | :---: | :--- |
| **Schedule Ingestion & Graph Model** | **REAL** | Full L1–L6 WBS hierarchical schedule parser, predecessor/successor graph, and CPM forward/backward pass. |
| **Field Report Ingestion (PDF/XLSX/Text)** | **REAL** | Ingestion pipeline extracting raw text, character offsets, tables, and document metadata. |
| **Jargon & Abbreviations Normalizer** | **REAL** | Rule-based engineering dictionary normalizer mapping 100+ site abbreviations and units. |
| **7-Signal Hybrid Activity Matcher** | **REAL** | Multi-signal ranker calculating Semantic, Discipline, Location, WBS, Temporal, Dependency, and Entity scores. |
| **Confidence Scoring & Calibration** | **REAL** | Mathematical confidence calibration evaluating candidate score margins and uncertainty. |
| **Human Review Workstation** | **REAL** | Full dual-column workstation with Accept, Reject, Reassign, and Mark Unmatched workflows. |
| **Authoritative Progress Service** | **REAL** | Transactional domain service mutating `actualStart`, `actualFinish`, `actualProgress`, and `status`. |
| **Schedule Synchronization Service** | **REAL** | Baseline-preserving CPM recalculator updating schedule variance and critical path. |
| **Deterministic Risk Radar** | **REAL** | CPM float consumption, critical path lag, and upstream bottleneck evaluation rules. |
| **Immutable Audit Logging** | **REAL** | Hash-chained audit ledger recording actor, timestamp, before-state, and after-state. |
| **Enterprise Security (RBAC, IDOR, Magic Bytes)** | **REAL** | 5-role permission matrix, server-side project boundary enforcement, file type validation, and prompt quarantine. |
| **Data Integrity & Orphan Auditor** | **REAL** | Comprehensive audit engine checking 196+ relationships across WBS, activities, dependencies, and reports. |
| **Grounded Copilot RAG Pipeline** | **REAL** | 12-step grounded RAG pipeline with intent classification, context budgeting, citation verification, and read-only gating. |
| **Supervisor Voice Processing** | **REAL** | Natural speech parsing, Hinglish normalizer, strict negation detection, and self-correction resolution. |
| **What-If Scenario Simulator** | **REAL** | In-memory CPM graph cloner simulating delay cascades without database mutation. |
| **XGBoost Forecasting Model** | **DETERMINISTIC SIMULATION** | Multi-signal forecasting algorithm executing over 500 chronological backtest cases using deterministic regression weights. |
| **High-Dimensional Embeddings** | **DETERMINISTIC SIMULATION** | Domain-tailored vocabulary vector projection running locally to allow offline benchmarking without OpenAI API keys. |
| **Prerecorded Voice Stream Fallback** | **MOCK / FALLBACK** | Pre-staged 16kHz audio sample representing the Golden Scenario, used if live microphone fails during presentation. |
| **Direct Live Oracle Primavera P6 Database Hook** | **PLANNED** | Production roadmap integration via Primavera P6 EPPM REST API / XER XML exchange (not live in prototype). |
| **Direct SAP Plant Maintenance ERP Hook** | **PLANNED** | Enterprise roadmap connector for automated equipment work order creation. |

---

## 3. Presentation Integrity Guarantee

During the SIH demonstration:
1. All scores, variances, status transitions, and audit records shown are **computed live by real application services**.
2. No numbers are hardcoded into HTML or React components.
3. The synthetic dataset is prominently labeled as such.
4. When simulated algorithms are used (e.g. offline embedding projections), they represent legitimate standalone algorithm implementations designed to demonstrate the complete architecture without external failure risks.
