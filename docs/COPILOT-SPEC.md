# SiteSync Copilot Specification — Grounded Project Intelligence (SIH26122)

## 1. Primary Objective & Non-Negotiable Principles

SiteSync Copilot is an enterprise-grade, evidence-grounded project intelligence conversational system built for **Oil India Limited (OIL)** infrastructure execution (SIH Problem Statement **SIH26122**).

Unlike generic LLM wrappers or chatbots connected directly to raw databases:
- **Zero Hallucination Policy**: The Copilot NEVER invents activities, dates, progress metrics, contractors, or delay causes.
- **Strict Read-Only Enforcement**: Natural language cannot execute destructive or state-mutating actions (`approve`, `delete`, `change date`, `mark complete`).
- **Deterministic Analytics First**: The LLM NEVER calculates schedule variance, progress lag, completion percentages, or critical path delays itself. All mathematical computations are executed by deterministic backend services and provided as structured `CopilotCalculation` objects.
- **Multi-Tenant Project Isolation**: Every retrieval query, citation, and conversation thread is strictly scoped by `projectId`. Cross-project data leakage is structurally rejected at service boundaries.
- **Prompt Injection Defense**: Daily Field Reports (DPRs) and user inputs are strictly treated as untrusted data. Instructions embedded within reports are quarantined and never executed.

---

## 2. Supported Intent Taxonomy (18 Deterministic Intents)

| Intent Code | Description | Example Query |
| :--- | :--- | :--- |
| `PROJECT_STATUS` | High-level executive reality snapshot | "How is the project doing overall?" |
| `SCHEDULE_VARIANCE` | Activities lagging baseline schedule | "Which activities are currently delayed?" |
| `ACTIVITY_STATUS` | Granular L5/L6 activity state | "What is the status of CIV-EXC-042?" |
| `DISCIPLINE_PROGRESS` | Progress breakdown by engineering discipline | "Which discipline is progressing slowest?" |
| `DELAY_ANALYSIS` | Root-cause delay investigation | "Why is compressor foundation work delayed?" |
| `PROGRESS_LAG` | Progress deficit against planned S-curve | "Show activities with progress lag" |
| `STALE_UPDATE` | Activities missing recent field updates | "Which activities have no recent DPR update?" |
| `DEPENDENCY_IMPACT` | Downstream impact and cascade analysis | "What downstream activities could be affected?" |
| `RISK_ANALYSIS` | Active schedule delay & bottleneck threats | "Why is this activity flagged as HIGH risk?" |
| `REVIEW_QUEUE` | Items awaiting planner verification | "Which updates still need planner review?" |
| `EVIDENCE_LOOKUP` | Provenance trace back to primary DPR document | "Where did this actual start date come from?" |
| `HISTORICAL_BENCHMARK`| Comparable project durations & milestones | "How long did similar foundation activities take?" |
| `HISTORICAL_DELAY` | Past institutional delay root causes | "What were common delay causes in past projects?" |
| `PRODUCTIVITY_ANALYSIS`| Output rates (m3/day, dia-inch/day) | "Compare excavation productivity with history" |
| `REPORT_SEARCH` | Field report lookup | "Find reports mentioning compressor foundation" |
| `ACTIVITY_SEARCH` | Schedule activity search | "Find valve installation activities" |
| `CHANGE_ANALYSIS` | Day-over-day delta across schedule & field | "What changed today on the project?" |
| `GENERAL_PROJECT_QUERY`| Grounded project fallback | "Summarize project execution packages" |

---

## 3. Evidence Priority Hierarchy

Factual claims are resolved strictly according to the 5-level evidence hierarchy:

```text
LEVEL 1: Verified ProgressUpdate + ReviewDecision + Schedule Baseline (Highest Authority)
   ↓
LEVEL 2: ExtractedEvent with Accepted Match (Auto-linked or Planner-verified)
   ↓
LEVEL 3: FieldReport Raw DPR Text & Document Locators (Page, Line, Sheet)
   ↓
LEVEL 4: HistoricalOutcome (Institutional Memory from Completed Past Projects)
   ↓
LEVEL 5: AI Inference (Explicitly labeled as probabilistic inference)
```

AI inference must NEVER override verified Level 1 or Level 2 project data.

---

## 4. Contract Schema

### 4.1 Request Contract (`POST /api/v1/projects/:id/copilot/query`)

```typescript
interface CopilotQuery {
  projectId: string;
  userId: string;
  question: string;
  conversationId?: string;
}
```

### 4.2 Response Contract

```typescript
interface CopilotResponse {
  answer: string;
  confidence: number;
  groundingStatus: "GROUNDED" | "PARTIAL" | "INSUFFICIENT";
  citations: CopilotCitation[];
  calculations?: CopilotCalculation[];
  relatedActivities?: string[];
  relatedReports?: string[];
  warnings?: string[];
  intent: CopilotIntent;
  suggestedActions?: string[];
  latencyMs?: number;
  dataVersion?: number;
}
```

### 4.3 Citation Contract

```typescript
interface CopilotCitation {
  sourceType:
    | "FIELD_REPORT"
    | "EVIDENCE"
    | "ACTIVITY"
    | "PROGRESS_UPDATE"
    | "REVIEW_DECISION"
    | "HISTORICAL_OUTCOME"
    | "DEPENDENCY"
    | "RISK"
    | "SCHEDULE";
  sourceId: string;
  title: string;
  locator?: {
    page?: number;
    sheet?: string;
    cell?: string;
    line?: number;
    timestamp?: string | number;
  };
  excerpt?: string;
  relevanceScore: number;
  verifiedBy?: string;
  verifiedAt?: string;
  discipline?: string;
}
```

---

## 5. Security & Safety Gates

1. **Mutation Prevention**: Regex & keyword gate identifies mutative requests (`approve`, `delete`, `change date`, `mark complete`) and returns safe refusal explanations.
2. **Project Isolation Gate**: Validates that all retrieved activity, report, and event IDs strictly match the target `projectId`.
3. **Citation Validation Gate**: Verifies that every cited record ID actually exists within the project context. Unverified citation IDs are rejected and trigger warnings.
4. **Untrusted Data Quarantine**: DPR texts are wrapped inside data tags; instructions within reports cannot alter copilot prompt directives.
