import { CopilotIntent, ExtractedEntities, Discipline } from '@sitesync/types';

export class IntentClassifierService {
  /**
   * Classify user natural language question into one of the 18 deterministic Copilot intents.
   */
  classifyIntent(question: string): { intent: CopilotIntent; confidence: number } {
    const q = question.toLowerCase().trim();

    // 1. Change Analysis ("What changed today?", "What happened yesterday?")
    if (
      /\b(what changed|changed today|changed since|since yesterday|today's change|daily change|what happened (today|yesterday))\b/i.test(
        q
      )
    ) {
      return { intent: 'CHANGE_ANALYSIS', confidence: 0.98 };
    }

    // 2. Evidence & Provenance Lookup ("Where did this date come from?", "Who verified?", "Show source report")
    if (
      /\b(where did .* come from|who verified|who approved|source report|show evidence|proof|verified by|source document|citation)\b/i.test(
        q
      )
    ) {
      return { intent: 'EVIDENCE_LOOKUP', confidence: 0.96 };
    }

    // 3. Historical Delay Root Causes ("common delay causes", "historical delays", "why did past projects delay")
    if (
      /\b(historical delay|common delay cause|past delay|why did past|delay causes for similar|past projects delay)\b/i.test(
        q
      )
    ) {
      return { intent: 'HISTORICAL_DELAY', confidence: 0.95 };
    }

    // 4. Productivity Analysis ("productivity rate", "how fast did they pour", "productivity benchmark")
    if (/\b(productivity|rate of excavation|output per day|cubic meter per day|meter per day)\b/i.test(q)) {
      return { intent: 'PRODUCTIVITY_ANALYSIS', confidence: 0.94 };
    }

    // 5. Historical Benchmark ("How long did similar take?", "in previous projects", "past benchmark")
    if (
      /\b(how long did .* take|similar activit|previous project|past project|historical benchmark|institutional memory|historical duration)\b/i.test(
        q
      )
    ) {
      return { intent: 'HISTORICAL_BENCHMARK', confidence: 0.96 };
    }

    // 6. Review Queue & Unmatched Updates ("needs review", "planner review", "unmatched", "pending verification")
    if (
      /\b(need.* review|review queue|unresolved match|low-confidence|unmatched|pending review|verify update|awaiting approval)\b/i.test(
        q
      )
    ) {
      return { intent: 'REVIEW_QUEUE', confidence: 0.97 };
    }

    // 7. Stale Updates ("no recent field update", "stale activities", "not updated")
    if (/\b(no recent (field )?update|stale|out of date|not updated|missing field report)\b/i.test(q)) {
      return { intent: 'STALE_UPDATE', confidence: 0.95 };
    }

    // 8. Dependency Impact & Cascade ("What downstream activities", "depend on", "slips by 5 days", "cascade")
    if (
      /\b(downstream|depend on|depends on|what happens if .* slip|cascade|predecessor|successor|impact of delay)\b/i.test(
        q
      )
    ) {
      return { intent: 'DEPENDENCY_IMPACT', confidence: 0.96 };
    }

    // 9. Delay Analysis for specific activity ("Why is compressor delayed?", "Why is X delayed?", "root cause")
    if (
      /\b(why is .* (delayed|behind|late|slipping)|cause of delay|reason for delay|delay root cause)\b/i.test(
        q
      )
    ) {
      return { intent: 'DELAY_ANALYSIS', confidence: 0.97 };
    }

    // 10. Progress Lag ("activities with progress lag", "behind plan", "progress deficit")
    if (/\b(progress lag|lagging progress|below plan|actual vs planned progress)\b/i.test(q)) {
      return { intent: 'PROGRESS_LAG', confidence: 0.95 };
    }

    // 11. Schedule Variance ("delayed activities", "behind schedule", "schedule variance", "critical activities behind")
    if (
      /\b(which activit.* delayed|what activit.* delayed|behind schedule|schedule variance|critical activit.* behind|slip)\b/i.test(
        q
      )
    ) {
      return { intent: 'SCHEDULE_VARIANCE', confidence: 0.95 };
    }

    // 12. Discipline Progress ("How much civil work", "status of piping", "which discipline is slowest")
    if (
      /\b(how much (civil|piping|mechanical|electrical|instrumentation)|status of (civil|piping|mechanical|electrical)|discipline|discipline progress|which discipline|slowest discipline)\b/i.test(
        q
      )
    ) {
      return { intent: 'DISCIPLINE_PROGRESS', confidence: 0.94 };
    }

    // 13. Risk Analysis ("why is this at risk", "project risks", "risk signals", "high risk")
    if (/\b(risk|at risk|risk signals|risk analysis|threat to schedule)\b/i.test(q)) {
      return { intent: 'RISK_ANALYSIS', confidence: 0.93 };
    }

    // 14. Activity Status ("status of ACT-", "current status of foundation")
    if (/\b(status of [a-z0-9-]+|current status of|progress of [a-z0-9-]+)\b/i.test(q)) {
      return { intent: 'ACTIVITY_STATUS', confidence: 0.92 };
    }

    // 15. Report Search ("find report", "DPR-", "field reports from")
    if (/\b(dpr-\d+|find report|show report|search report)\b/i.test(q)) {
      return { intent: 'REPORT_SEARCH', confidence: 0.91 };
    }

    // 16. Activity Search ("search for activity", "find activity")
    if (/\b(find activity|search activity|activities located at)\b/i.test(q)) {
      return { intent: 'ACTIVITY_SEARCH', confidence: 0.90 };
    }

    // 17. Project Status ("overall progress", "project health", "executive status", "quick status")
    if (
      /\b(project status|overall status|executive summary|how is the project|overall progress|project health)\b/i.test(
        q
      )
    ) {
      return { intent: 'PROJECT_STATUS', confidence: 0.94 };
    }

    // Fallback
    return { intent: 'GENERAL_PROJECT_QUERY', confidence: 0.80 };
  }

  /**
   * Deterministically extract named entities from the query text.
   */
  extractEntities(question: string): ExtractedEntities {
    const q = question.trim();
    const entities: ExtractedEntities = {
      keywords: [],
    };

    // 1. Activity Code extraction (e.g. CIV-EXC-042, ACT-104, PIP-L6-221, FND-L5-104)
    const codeMatch = q.match(/\b([A-Z]{2,4}-[A-Z0-9]{2,5}-[0-9]{2,4}|ACT-[0-9]{3,4})\b/i);
    if (codeMatch) {
      entities.activityCode = codeMatch[1].toUpperCase();
    }

    // 2. Discipline extraction
    if (/\bcivil\b/i.test(q)) entities.discipline = Discipline.CIVIL;
    else if (/\bpip(ing|e)\b/i.test(q)) entities.discipline = Discipline.PIPING;
    else if (/\bmech(anical)?\b/i.test(q)) entities.discipline = Discipline.MECHANICAL;
    else if (/\belect(rical)?\b/i.test(q)) entities.discipline = Discipline.ELECTRICAL;
    else if (/\binst(rumentation)?\b/i.test(q)) entities.discipline = Discipline.INSTRUMENTATION;
    else if (/\bhse\b/i.test(q)) entities.discipline = Discipline.HSE;

    // 3. Location extraction
    const locMatch = q.match(
      /\b(compressor (station|yard|foundation|area)|duliajan|valve station|terminal|bay [0-9]|substation)\b/i
    );
    if (locMatch) {
      entities.location = locMatch[0];
    }

    // 4. Report filename extraction
    const dprMatch = q.match(/\b(dpr-[\w.-]+(\.pdf)?)\b/i);
    if (dprMatch) {
      entities.reportId = dprMatch[1];
    }

    // 5. Date extraction
    const dateMatch = q.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}[-/ ](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-/ ]\d{2,4})\b/i);
    if (dateMatch) {
      entities.date = dateMatch[0];
    }

    // 6. Keywords
    const words = q
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['what', 'when', 'where', 'which', 'show', 'tell', 'about', 'from', 'this', 'that'].includes(w.toLowerCase()));
    entities.keywords = Array.from(new Set(words));

    return entities;
  }
}
