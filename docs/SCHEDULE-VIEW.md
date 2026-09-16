# SiteSync — Schedule View & Gantt Intelligence Specification

## 1. Overview

The **SiteSync Schedule View** delivers high-density, interactive Gantt visualization for large-scale infrastructure projects ($1,000+$ activities, $5,000+$ dependencies).

---

## 2. WBS Hierarchy

The schedule is structured using a standard 6-level Work Breakdown Structure (WBS):

```text
L1: Compressor Station Expansion Project (1.0)
    │
    ├── L2: Compressor Train Area (1.1)
    │     ├── L3: Compressor Foundations & Civil (1.1.1)
    │     │     ├── CIV-EXC-042: Compressor Foundation Excavation [L5]
    │     │     ├── CIV-PCC-043: Plain Cement Concrete (PCC) Sub-base [L5]
    │     │     └── CIV-REB-044: Foundation Reinforcement Steel Binding [L5]
    │     │
    │     └── L3: Compressor Equipment Erection (1.1.2)
    │           ├── MEC-SKD-051: Compressor Skid Placement [L5]
    │           └── MEC-NOZ-052: Suction & Discharge Nozzle Fit-up [L5]
    │
    ├── L2: Interconnecting Pipe Rack (1.2)
    │     └── L3: Process Piping Fabrication & Welding (1.2.1)
    │           ├── PIP-FAB-101: Header Pipe Spool Cutting & Fabrication [L5]
    │           └── PIP-WLD-102: Header Spool Tie-in Joint Welding [L5]
    │
    ├── L2: Substation & Electrical Yard (1.3)
    │     └── L3: Power Cables & Switchgear (1.3.1)
    │           ├── ELE-CBL-005: Substation Cable Trench Excavation [L5]
    │           └── ELE-SWG-006: 11kV Switchgear Panel Installation [L5]
    │
    └── L2: Control & Instrumentation Building (1.4)
          └── L3: Transmitters & DCS Loop Checking (1.4.1)
                └── INS-DCS-001: SCADA Remote Terminal Unit Configuration [L5]
```

---

## 3. Zoom Scaling Modes

| Zoom Level | Time Window | Tick Resolution | Optimal Use Case |
| :--- | :--- | :--- | :--- |
| **`DAY`** | $\pm 14$ days | Daily grid columns | Field execution shift planning & micro-task tracking |
| **`WEEK`** | $\pm 60$ days | 7-day milestone markers | Weekly progress review meetings with site supervisors |
| **`MONTH`** | $\pm 6$ months | Calendar month columns | Executive project status review & discipline S-curve analysis |
| **`QUARTER`** | Entire lifecycle (2-5 yrs) | Quarter (Q1-Q4) | Multi-year capital infrastructure master planning |

---

## 4. Visual State Design & Accessibility

To maintain accessibility for color-blind users and high-contrast environments, activity states are communicated through multiple redundant visual channels:

```text
1. Completed   : Emerald Bar + CheckCircle Icon + "100%" label + Solid Fill
2. On Track    : Cyan Bar + Clock Icon + "+0d" label + Standard Fill
3. At Risk     : Amber Bar + AlertTriangle Icon + "+X d" label + Stale/Float Warning
4. Delayed     : Rose Bar + AlertOctagon Icon + "+X d Overrun" + Striped Hatch Pattern
5. Not Started : Slate Muted Bar + CircleDot Icon + "0%" label + Outlined Track
```

---

## 5. Activity Detail Drawer

Clicking any schedule item opens the **Activity Detail Drawer**:
- **Identity**: Code, Name, Discipline, WBS Node, Location.
- **Milestones**: Planned Start/Finish vs Actual Start/Finish.
- **Variances**: Start variance, duration variance, progress delta.
- **Verified Evidence**: Quoted excerpt from DPR, page number, verifying planner.
- **Dependencies**: Inbound predecessors and outbound successors with delay risk exposure.

---

## 6. Dependency Impact Graph

When an upstream delay occurs:

$$\text{Delayed Activity} \longrightarrow \text{Direct Successors} \longrightarrow \text{Multi-Tier Cascade} \longrightarrow \text{Schedule Risk Exposure}$$

$$\text{Potential Start Delay} = \max(0, \text{PredecessorVarianceDays} - \text{DependencyLag})$$

The dependency view visually distinguishes **confirmed delay** from **potential schedule risk exposure**.
