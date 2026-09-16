# SiteSync — Read-Only What-If Scenario Simulation Engine

## 1. Safety & Non-Mutation Invariants
1. **Zero Database Mutation**: Scenario simulations run purely in memory on cloned state representations.
2. **Immutable Baselines**: Baseline planned dates ($A_i.\text{plannedStart}$, $A_i.\text{plannedFinish}$) remain strictly constant.
3. **No Phantom Updates**: No `ProgressUpdate`, `AuditLog`, or `RiskSignal` records are persisted during scenario runs.
4. **Transparent Labeling**: UI renders all scenario outputs with explicit read-only tags and "Hypothetical Simulation" watermarks.

---

## 2. Topological Delay Ripple Algorithm
Given hypothetical delay $\Delta$ on predecessor activity $P$:
1. Initialize queue with $P$.
2. For each successor $S \in \text{Successors}(P)$:
   - Determine available float $F_S = S.\text{totalFloat}$.
   - Absorbed delay = $\min(\Delta, F_S)$.
   - Propagated delay $\Delta_S = \max(0, \Delta - F_S)$.
   - If $\Delta_S > 0$, update $S.\text{simulatedDelay}$ and enqueue $S$.
3. Compute impacted milestones as $\max_{pred} \Delta_{pred}$.
4. Compute net project completion delta $\Delta_{\text{project}}$.
