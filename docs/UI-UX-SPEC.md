# SiteSync Enterprise UI/UX Specification

## 1. Executive Summary & Design Philosophy

**SiteSync** is an enterprise infrastructure project execution and schedule intelligence platform designed for project controllers, planners, lead engineers, and executive operations teams. 

SiteSync explicitly rejects consumer AI chat tropes, neon glow styling, and startup dashboard templates. The design language communicates:
* **Control & Accountability**: Real surfaces, crisp borders, and immutable audit lineage.
* **Operational Density**: Compact typography, data tables, and structured grids engineered for thousands of L5/L6 activities.
* **Evidence-First Traceability**: Direct provenance links connecting field reports (DPRs) to schedule activities with zero decorative "magic."
* **Contextual Project Intelligence**: An assistant panel structured around executive briefings, quantifiable driver attribution, and verified citations—not a generic conversational chatbot.

---

## 2. Design Token Architecture (`@sitesync/design-system`)

The design system is centralized in `packages/design-system` with strict token separation:

### 2.1 Color Tokens (`tokens/colors.ts`)

```typescript
export const enterpriseColors = {
  // Brand & Navigation
  primary: {
    DEFAULT: '#0f2744', // Deep enterprise navy
    hover: '#1a365d',
    light: '#f0f4f8',
  },
  secondary: {
    DEFAULT: '#475569', // Steel / slate
    hover: '#334155',
  },

  // Surfaces & Borders
  background: '#f8fafc', // Very light neutral gray
  surface: '#ffffff',    // Solid white (zero glassmorphism)
  border: {
    DEFAULT: '#e2e8f0', // Soft neutral gray
    strong: '#cbd5e1',
    light: '#f1f5f9',
  },

  // Typography
  text: {
    primary: '#0f172a',   // Dark charcoal
    secondary: '#475569', // Muted slate
    tertiary: '#94a3b8',  // Low emphasis
    inverse: '#ffffff',
  },

  // Operational Semantics
  semantic: {
    success: { DEFAULT: '#15803d', surface: '#f0fdf4', border: '#bbf7d0' }, // Verified / Completed / Healthy
    warning: { DEFAULT: '#b45309', surface: '#fffbeb', border: '#fde68a' }, // Attention / Review Required
    danger:  { DEFAULT: '#b91c1c', surface: '#fef2f2', border: '#fecaca' }, // Critical / Delayed / Blocked
    info:    { DEFAULT: '#0369a1', surface: '#f0f9ff', border: '#bae6fd' }, // Active / Informational
    neutral: { DEFAULT: '#64748b', surface: '#f8fafc', border: '#e2e8f0' }, // Inactive / Historical
  }
};
```

### 2.2 Typography Hierarchy (`tokens/typography.ts`)

Font Family: `Inter`, system sans-serif fallback.

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 20–24px | 700 (Bold) | 28px | Major views (`PageHeader`) |
| **Section Heading** | 14–16px | 600 (Semibold) | 22px | Widget and card headers |
| **Subsection / Label** | 11–12px | 600 (Semibold) | 16px | Field labels, table headers (uppercase) |
| **Body Text** | 12–13px | 400 (Regular) | 18px | Descriptive copy, excerpts, notes |
| **Table Data** | 11–12px | 400 / 500 | 16px | Activity rows, log entries |
| **KPI Metric** | 24–28px | 700 (Bold) | 32px | High-level executive statistics |
| **Code / Identifier** | 10–12px | 500 / 600 | Mono | Activity IDs (`MECH-L5-042`), hashes |

### 2.3 Radius & Shadow Restraint

* **Border Radius**:
  * Inputs & Buttons: `4px` (`rounded`)
  * Data Tables & Cards: `6px – 8px` (`rounded-md` / `rounded-lg`)
  * Drawers & Modals: `8px` (`rounded-lg`)
  * Status Badges: `4px` (`rounded`)
* **Shadows**:
  * Flat default with `border: 1px solid #e2e8f0`
  * Ambient lift only on hover or modals (`box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`)
  * **Forbidden**: Colored glows, neon borders, heavy dark drop shadows.

---

## 3. Application Shell & Navigation Architecture

### 3.1 Top Bar (`src/components/Header.tsx`)
1. **Brand Wordmark**: Industrial SiteSync monogram (`SS` badge in deep enterprise navy).
2. **Project Scope Selector**: Prominent dropdown with active project ID (`Compressor Station Expansion • CSE-2026-001`). Switching updates global application context across all screens.
3. **Operational Ticker**: Live indicators for Active Schedule (100% verified), Verification Mode, and Server Status.
4. **User Badge**: Role designation (`Lead Project Planner`) with audit profile link.

### 3.2 Sidebar (`src/components/Sidebar.tsx`)
Grouped into four distinct enterprise workflows:
* **PROJECT OPERATIONS**:
  * Command Center (`dashboard`)
  * Schedule & Gantt (`gantt`)
  * Field Reports (`reports`)
  * Review Queue (`review`)
  * Evidence Traceability (`evidence`)
* **INTELLIGENCE & CONTROLS**:
  * Risk Radar (`risks`)
  * Forecast Intelligence (`forecast`)
  * Institutional Memory (`history`)
* **ANALYTICAL TOOLS**:
  * Project Intelligence (`copilot`)
  * Voice Ingestion (`voice`)
* **COMPLIANCE & AUDIT**:
  * Scientific Benchmark (`benchmark`)
  * Audit Trail (`audit`)

---

## 4. Operational Screen Specifications

### 4.1 Command Center (`CommandCenterView.tsx`)
* **Project Header**: Baseline start/finish dates, variance days, and current data freshness timestamp.
* **Executive Metrics**: 4 standardized metric cards (Verified Progress, Items Requiring Review, Critical Activities at Risk, Verified Updates).
* **Progress vs Plan S-Curve**: Clean SVG chart plotting Planned Baseline vs Verified Actual Progress. Zero animated glowing trails.
* **Schedule Health Breakdown**: Horizontal segmented distribution (Completed, On Track, At Risk, Delayed, Not Started).
* **Attention Required Queue**: Actionable cards directing planners directly to unverified items.
* **Critical Path Activities**: Structured data table showing top variance activities.

### 4.2 Schedule & Gantt (`GanttView.tsx`, `GanttScheduleView.tsx`)
* **WBS Hierarchy**: Obvious visual indentation from L1 facility level down to L6 inspection tasks.
* **Activity Table**: Sticky headers, sorting, discipline filters, variance tags, and critical path indicators.
* **Visual Gantt Timeline**: Neutral gray bars for planned baseline; strong enterprise navy for actual progress; semantic green for completed, amber for at-risk, red for delayed.
* **Activity Detail Drawer**: Clean right-hand drawer providing schedule parameters, predecessor/successor dependencies, and direct backward evidence citations.

### 4.3 Review Workspace (`ReviewQueueView.tsx`)
* **Enterprise Work Queue**: Filter bar by discipline, priority, and match confidence.
* **5-Step Verification Layout**:
  1. *Source Field Evidence*: Report name, page number, verbatim supervisor statement.
  2. *Extracted Event*: Normalized parameters (quantity, location, equipment tag).
  3. *Proposed Activity*: Matched schedule activity with calibrated confidence score (e.g., 94%).
  4. *Explainable Reasons*: 7-signal breakdown (Discipline, Location, Semantic, Temporal).
  5. *Review Decision*: Functional actions (`[Accept Match]`, `[Reassign]`, `[Reject]`).

### 4.4 Contextual Project Intelligence (`CopilotView.tsx`)
* **NO CHATBOT UI**: Completely eliminates conversational bubbles, robot avatars, and empty prompt boxes.
* **Master-Detail Dossier**:
  * *Left Column*: Query input and categorized operational inquiries (Schedule, Field Evidence, Institutional Memory).
  * *Right Column*: Structured Intelligence Assessment dossier including Grounding Status (`GROUNDED`), Executive Assessment in business typography, Deterministic System Calculations, and verified Source Evidence reference table.
* **Source Evidence Drawer**: Slide-out drawer with document locator, primary quoted excerpt, and direct links to Review Queue or Gantt.

### 4.5 Forecasting & Predictive Intelligence (`ForecastIntelligenceView.tsx`)
* **Project Controls Focus**: Calibrated activity completion dates, P80 conformal prediction intervals, and milestone slip analysis.
* **Multi-Baseline Comparison**: Planned Baseline vs Linear Projection vs Historical Median vs XGBoost Model.
* **Quantified Drivers Waterfall**: Feature importance percentages explaining schedule risk factors.
* **What-If Scenario Simulator**: Purely read-only downstream delay propagation tool that never mutates authoritative database state.

---

## 5. Architectural Guardrails & Invariants

* **No Direct DB Mutations by AI**: AI and forecasting modules only propose candidates or compute read-only scenarios. Authoritative database state is mutated exclusively by domain services with planner authorization.
* **Redux Saga API Orchestration**: UI components dispatch typed Redux actions; sagas own API calls.
* **Zero Prisma in Components**: Enforced by architecture unit tests (`tests/architecture-audit.test.ts`).
* **Cryptographic Audit Ledger**: Every progress adjustment and review decision generates an immutable audit record with user ID and timestamp.

---

## 6. Accessibility & Responsiveness

* **Desktop First**: Optimized for `1440 × 900` and `1280 × 800` workstation screens with high information density.
* **Responsive Breakpoints**: Seamless scaling to tablet (`1024 × 768`, `768 × 1024`) and mobile (`390 × 844`).
* **Contrast Compliance**: Charcoal text (`#0f172a`) on white surface (`#ffffff`) exceeds WCAG AAA standards (> 12:1 ratio). Semantic colors maintain WCAG AA minimums (4.5:1).
