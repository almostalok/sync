# SiteSync — Prototype Boundaries & Technical Limitations

**Version:** 1.0.0  
**Scope:** Honest Prototype Appraisal & Operational Constraints  
**Problem Statement:** SIH26122 (Oil India Limited)

---

## 1. Executive Summary

In adherence to SiteSync's **Honest Claim Policy**, this document transparently delineates the boundaries of the current release (v1.0.0). While SiteSync provides a complete, production-grade domain model, deterministic golden demo, real hybrid matching engine, and rigorous statistical forecasting, certain capabilities in this release are tailored for evaluation and offline validation rather than immediate unmonitored enterprise rollout.

---

## 2. Detailed Technical Limitations

### 2.1 Synthetic Dataset Scope
* **Current State:** Evaluated against `synthetic-compressor-v1` (250 Level-5 activities, 24 historical baseline foundation grouting records, deterministic seed `42`).
* **Boundary:** In real enterprise EPC environments (e.g., Oil India pump stations, offshore processing complexes), master schedules frequently exceed 10,000 to 50,000 activities across Level 1 through Level 6.
* **Impact:** While the hybrid matcher scales logarithmically ($O(N \log K)$ via vector indexing and spatial WBS pre-filtering), real-world multi-site projects require clustering cross-discipline WBS branches to maintain sub-10ms response times.

### 2.2 OCR & Document Layout Extraction
* **Current State:** The DPR document processing pipeline implements rule-based tabular extraction and structured text parsing, augmented with simulated OCR bounding boxes for scanned site log evaluation.
* **Boundary:** Scanned field diaries captured under inclement weather, smudged ink, or handwritten site supervisor notes require heavy computer vision preprocessing.
* **Production Requirement:** Enterprise deployment requires tethering to cloud-grade document intelligence pipelines (e.g., Azure Document Intelligence or AWS Textract) with custom key-value layout models trained on PSU contractor billing formats.

### 2.3 Direct Enterprise Scheduler RPC Integration
* **Current State:** Native, deterministic ingestion and export via industry-standard Primavera P6 `.xer` files and Microsoft Project XML formats.
* **Boundary:** Direct real-time bidirectional RPC/REST synchronization against Oracle Primavera EPPM Web Services or SAP Project Systems (PS) is not bundled inside the core edge runtime.
* **Mitigation:** Production architectures deploy the SiteSync Enterprise Connector daemon as a dedicated container in the client VPC to interface directly with Primavera P6 EPPM APIs.

### 2.4 Field Acoustic Environment & Audio Processing
* **Current State:** The Supervisor Voice Agent features robust NLP parsing, entity extraction, hinge-word negation detection (e.g., *"not finished"*), self-correction resolution, and Hinglish vocabulary handling.
* **Boundary:** Live microphone capture in heavy industrial field environments (>85 dBA from diesel compressors, hydraulic piling rigs) causes acoustic signal degradation on consumer mobile microphones.
* **Mitigation:** Requires hardware-level directional beamforming or pre-processing DSP (e.g., RNNoise, WebRTC AGC/AEC) on the field recording client before streaming to speech-to-text inference.

### 2.5 Conformal Prediction Cold-Start Thresholds
* **Current State:** Schedule completion forecasts use conformal quantile regression combined with historical contractor velocity curves.
* **Boundary:** Calibrated 80% coverage intervals require a minimum sample size ($N \ge 15$) of completed activities within the identical work package class (e.g., `FOUNDATION_GROUTING`).
* **Fallback:** On greenfield sites with zero recorded project history, the engine falls back to classical PERT three-point Beta estimation with wide uncertainty bounds until sufficient empirical velocity is established.

### 2.6 Offline Edge Synchronization
* **Current State:** Client-side state machine with optimistic UI updates and deterministic replay log.
* **Boundary:** Local IndexedDB offline queueing with multi-master conflict resolution is prototyped at the component layer, but asynchronous distributed vector clock reconciliation across concurrent field supervisors is scheduled for Phase 2.

---

## 3. Summary of Operational Guardrails

| Subsystem | Prototype Behavior | Enterprise Fallback |
| :--- | :--- | :--- |
| **Hybrid Matching** | $O(N)$ candidate search with top-10 pruning | pgvector HNSW index with partition filtering |
| **Schedule Ingestion** | Full `.xer` and XML file parsing | P6 Web Services connector daemon |
| **Voice Processing** | WebSpeech / pre-transcribed text engine | On-premise Whisper Large-v3 with DSP |
| **Forecasting** | Conformal historical regression | PERT Beta fallback for cold-start WBS |
| **Storage** | Monolithic schema with SQLite / Postgres support | High-availability PostgreSQL with read replicas |

---

*SiteSync v1.0.0 is verified and optimized for evaluation, deterministic live demonstration, and pilot deployment.*
