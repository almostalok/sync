# SiteSync — Product Requirements Document (PRD)
**SIH26122 — Oil India Limited**

## 1. Executive Summary
SiteSync is an intelligent data capture and schedule-linking platform for infrastructure project management (Oil India Limited - Compressor Station Expansion Project). It bridges planned schedules (L5/L6 activities) and field execution reality (DPRs, spreadsheets, voice memos).

## 2. Core Principle
> **AI should assist schedule synchronization, not silently modify the project schedule.**

## 3. Key Workflows
1. Schedule Ingestion (L1–L6 WBS & Activities, Dependencies).
2. Field Report Ingestion (PDF, XLSX, CSV, TXT, Voice).
3. Deterministic Jargon Normalization (`comp` → `compressor`, `fdn` → `foundation`, `exctn` → `excavation`).
4. Structured Event Extraction with sentence & character offsets.
5. 7-Signal Hybrid Matching (Semantic 40%, Discipline 15%, Location 10%, WBS 10%, Temporal 10%, Dependency 10%, Entity 5%).
6. Calibrated Confidence Policy (≥0.90 Auto-Link, 0.70–0.89 Review Queue, <0.70 Unmatched).
7. Planner Human Verification Workstation.
8. Verified Schedule Synchronization & CPM Downstream Delay Cascades.
9. Evidence-Grounded AI Copilot & Voice Memo Ingestion.
