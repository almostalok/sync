# Synthetic Data Disclosure & Versioning Manifest

**Product**: SiteSync — Planning → Reality Intelligence (SIH26122)  
**Standard**: Master Prompt 14 Section 6 & 7 Honest Disclosure Policy  
**Dataset Identifier**: `synthetic-compressor-v1`  
**Deterministic Seed**: `DEMO_SEED = 42`  
**Generation Engine**: `src/lib/data/syntheticGenerator.ts`

---

## 1. Ethical & Scientific Disclosure

> **Official Disclaimer**:  
> The dataset utilized for prototype evaluation, testing, benchmarking, and demonstration is a **high-fidelity synthetic dataset created specifically for prototype evaluation**. It is not live, proprietary, or confidential Oil India Limited production data.

The synthetic data was engineered to faithfully mirror the real-world operational challenges described in SIH26122:
- Complex 6-level WBS hierarchies typical of natural gas compressor stations.
- Realistic engineering jargon, site abbreviations, and informal Hindi/Hinglish phrasing.
- Varied noise levels (typos, missing tags, ambiguous equipment references).
- Asynchronous multi-contractor reporting (PDFs, spreadsheets, site diaries, supervisor audio).

---

## 2. Dataset Composition & Dimensions

| Entity Type | Count | Scope & Details |
| :--- | :---: | :--- |
| **Project Baseline** | 1 | Compressor Station Expansion Project (`OIL-CSE-2026`) |
| **Schedule Activities** | 1,000 | L1–L6 activities spanning Civil, Piping, Mechanical, Electrical, Instrumentation, HSE |
| **Schedule Dependencies** | 5,000+ | Finish-to-Start, Start-to-Start, and Finish-to-Finish precedence relationships with lag |
| **Field Reports** | 2,000+ | Daily Progress Reports (DPRs), inspection certificates, site shift logs |
| **Extracted Events** | 1,000+ | Granular canonical execution events with character-level source text offsets |
| **Engineering Disciplines** | 6 | Civil, Piping, Mechanical, Electrical, Instrumentation, HSE |
| **Historical Outcomes** | 24+ | Completed activities from completed regional assets (Bhogpara, Kusijan, Makum, Duliajan) |

---

## 3. Benchmark Ground-Truth Test Set & Split

To rigorously prevent data leakage during AI evaluation, the dataset is divided into standardized splits:

```text
TOTAL BENCHMARK TEST SAMPLES: 300+ events
├── Development / Training Split (70%)
├── Validation & Calibration Split (15%)
└── Held-Out Test Set (15%)
```

### 3.1 Difficulty Taxonomy Evaluated
1. **Level 1 (Exact)**: Standard Primavera nomenclature.
2. **Level 2 (Paraphrased)**: Common industry synonyms (e.g. "concreting" vs "concrete pour").
3. **Level 3 (Abbreviated)**: Heavy domain shorthand (e.g. "comp fdn exctn", "mv cbl layng").
4. **Level 4 (Noisy / Typos)**: Orthographic errors and spelling mistakes (e.g. "compresser fondation").
5. **Level 5 (Ambiguous)**: Multiple valid candidate matches requiring equipment tag resolution (e.g. C-101 vs C-102).
6. **Level 6 (Granularity Mismatch)**: High-level package updates covering multiple sub-activities.
7. **Level 7 (Unmatched / Negative)**: Non-schedule maintenance, camp repairs, or out-of-scope tasks.

---

## 4. Dataset Version Manifest

```json
{
  "datasetVersion": "synthetic-compressor-v1",
  "generationSeed": 42,
  "generatorVersion": "2.4.0",
  "schemaVersion": "1.0.0",
  "generationDate": "2026-09-16T12:00:00.000Z",
  "authoritativeDigest": "sha256-42a98f10b884920c8e19b8823141f01c99812489",
  "reproducibilityCommand": "pnpm demo:reset && pnpm demo:seed"
}
```
