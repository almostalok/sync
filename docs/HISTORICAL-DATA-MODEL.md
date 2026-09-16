# SiteSync — Historical Data Model & REST API Specification

**Product:** SiteSync — Planning → Reality Intelligence (SIH26122)  
**Organization:** Oil India Limited  
**Module:** Domain Model, REST Contract & Prisma Schema Extensions  

---

## 1. Domain Entities & Interfaces

### 1.1 HistoricalOutcome
```typescript
export interface HistoricalOutcomeDTO {
  id: string;
  projectId: string;
  projectName: string;
  activityId: string;
  activityCode: string;
  activityName: string;
  discipline: Discipline;
  activityType: string;
  activityCategory: string;
  wbsPath: string;
  location: string;
  contractorName?: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string;
  actualEnd: string;
  plannedDuration: number;
  actualDuration: number;
  scheduleVariance: number;
  plannedQuantity?: number;
  actualQuantity?: number;
  quantityUnit?: string;
  productivityMetric?: number;
  productivityUnit?: string;
  delayCause: DelayCause;
  delayCategory: string;
  delayDays: number;
  lessonsLearned?: string;
  evidenceReference: string;
  evidenceSourceDocument: string;
  evidenceQuotedText: string;
  completionStatus: string;
  confidence: number;
  quality: HistoricalQualityMetadataDTO;
  createdAt: string;
}
```

### 1.2 HistoricalBenchmarkDTO
```typescript
export interface HistoricalBenchmarkDTO {
  activityType: string;
  activityName: string;
  discipline: Discipline;
  sampleCount: number;
  quality: SampleQuality;
  warningNotice?: string;
  durationDays: {
    median: number;
    mean: number;
    p25: number;
    p75: number;
    min: number;
    max: number;
  };
  scheduleVarianceDays: {
    median: number;
    mean: number;
  };
  productivity: {
    median: number | null;
    p25: number | null;
    p75: number | null;
    unit: string | null;
  };
  topDelayCauses: Array<{
    cause: DelayCause;
    count: number;
    percentage: number;
  }>;
  sampleRecords: HistoricalOutcomeDTO[];
}
```

---

## 2. REST API Endpoints

### 2.1 Historical Overview
- `GET /api/v1/history/overview`
- **Response**: `HistoricalOverviewDTO` (Completed activities, historical projects, average duration, median variance, top delay categories, discipline distribution).

### 2.2 Activity Benchmarks
- `GET /api/v1/history/benchmarks?discipline=CIVIL&activityType=FOUNDATION_EXCAVATION`
- **Response**: Array of `HistoricalBenchmarkDTO` with percentiles and sample quality badges.

### 2.3 Delay Intelligence
- `GET /api/v1/history/delays?discipline=PIPING`
- **Response**: High-level summary + ranked array of `DelayIntelligenceDTO` with occurrences, affected activities, median delay days, and evidence excerpts.

### 2.4 Productivity Intelligence
- `GET /api/v1/history/productivity?discipline=CIVIL`
- **Response**: Array of `ProductivityIntelligenceDTO` with P25, Median, P75 rates per unit.

### 2.5 Historical Search
- `GET /api/v1/history/search?search=foundation&discipline=CIVIL&delayCause=WEATHER&page=1&limit=20`
- **Response**: Paginated `{ outcomes: HistoricalOutcomeDTO[], total: number }`.

### 2.6 Similar Activity Comparisons
- `GET /api/v1/projects/:projectId/activities/:activityId/historical-comparisons`
- **Response**: `SimilarActivityComparisonDTO` with source activity, statistical baseline, and ranked comparable activities with similarity explanations and match scores.

### 2.7 Project Closure & Quality Report
- `GET /api/v1/projects/:projectId/closure-report`
- **Response**: `HistoricalQualityReportDTO` evaluating completion eligibility and metadata gaps.
- `POST /api/v1/projects/:projectId/close`
- **Response**: Project closure confirmation and institutional memory ingestion count.

### 2.8 Copilot Benchmark Query Contract
- `GET /api/v1/history/benchmark-query?question=How+long+does+compressor+foundation+excavation+usually+take`
- **Response**: `HistoricalCopilotContractResponse` ready for Copilot LLM consumption.
