import { 
  Activity, 
  ActivityCandidate, 
  ActivityMatch, 
  ExtractedEvent, 
  MatchDecision, 
  SignalBreakdown 
} from '@/types/domain';

// Text tokenization and Jaccard / Cosine similarity helpers
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function calculateJaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function calculateTokenOverlap(eventTokens: string[], targetTokens: string[]): number {
  if (eventTokens.length === 0 || targetTokens.length === 0) return 0;
  let matched = 0;
  for (const et of eventTokens) {
    if (targetTokens.some(tt => tt.includes(et) || et.includes(tt))) {
      matched++;
    }
  }
  return matched / Math.max(eventTokens.length, targetTokens.length);
}

// 1. Semantic Similarity Calculation (weight: 40%)
function calculateSemanticScore(eventText: string, activity: Activity): number {
  const eventTokens = tokenize(eventText);
  const actTokens = tokenize(activity.name + ' ' + (activity.description || ''));
  const aliasScores = (activity.aliases || []).map(al => {
    const alTokens = tokenize(al);
    return calculateJaccard(new Set(eventTokens), new Set(alTokens));
  });

  const jaccard = calculateJaccard(new Set(eventTokens), new Set(actTokens));
  const overlap = calculateTokenOverlap(eventTokens, actTokens);
  const maxAlias = aliasScores.length > 0 ? Math.max(...aliasScores) : 0;

  // Exact phrase match bonus
  const lowerEvent = eventText.toLowerCase();
  const lowerAct = activity.name.toLowerCase();
  let exactBonus = 0;
  if (lowerAct.includes(lowerEvent) || lowerEvent.includes(lowerAct)) {
    exactBonus = 0.35;
  }

  const score = Math.max(
    jaccard * 0.6 + overlap * 0.4 + exactBonus,
    maxAlias * 0.9 + exactBonus
  );

  return Math.min(1.0, Math.max(0.0, Number(score.toFixed(3))));
}

// 2. Discipline Compatibility (weight: 15%)
function calculateDisciplineScore(event: ExtractedEvent, activity: Activity): number {
  if (!event.discipline) return 0.65; // neutral if unstated
  if (event.discipline === activity.discipline) return 1.0;
  if (event.discipline === 'GENERAL') return 0.7;
  return 0.1; // penalty for conflicting disciplines
}

// 3. Location Compatibility (weight: 10%)
function calculateLocationScore(event: ExtractedEvent, activity: Activity): number {
  if (!event.location) return 0.6; // neutral
  const evLoc = event.location.toLowerCase();
  const actLoc = activity.location.toLowerCase();

  if (actLoc.includes(evLoc) || evLoc.includes(actLoc)) return 1.0;
  const evTokens = new Set(tokenize(evLoc));
  const actTokens = new Set(tokenize(actLoc));
  const jaccard = calculateJaccard(evTokens, actTokens);
  return Math.min(1.0, 0.3 + jaccard * 0.7);
}

// 4. WBS Compatibility (weight: 10%)
function calculateWBSScore(eventText: string, activity: Activity): number {
  const wbsTokens = tokenize(activity.wbsPath);
  const evTokens = tokenize(eventText);
  const overlap = calculateTokenOverlap(evTokens, wbsTokens);
  return Math.min(1.0, 0.4 + overlap * 0.6);
}

// 5. Temporal Compatibility (weight: 10%)
function calculateTemporalScore(eventDateStr: string, activity: Activity): number {
  try {
    const evDate = new Date(eventDateStr).getTime();
    const pStart = new Date(activity.plannedStart).getTime();
    const pFinish = new Date(activity.plannedFinish).getTime();

    if (isNaN(evDate) || isNaN(pStart) || isNaN(pFinish)) return 0.8;

    // If event occurs within planned window
    if (evDate >= pStart && evDate <= pFinish) return 1.0;

    // Distance in days from window
    const distDays = evDate < pStart 
      ? (pStart - evDate) / (1000 * 60 * 60 * 24)
      : (evDate - pFinish) / (1000 * 60 * 60 * 24);

    if (distDays <= 7) return 0.9;
    if (distDays <= 30) return 0.7;
    if (distDays <= 60) return 0.5;
    return 0.3;
  } catch {
    return 0.7;
  }
}

// 6. Dependency Precedence Compatibility (weight: 10%)
function calculateDependencyScore(
  event: ExtractedEvent,
  activity: Activity,
  allActivities: Map<string, Activity>
): number {
  if (!activity.predecessorIds || activity.predecessorIds.length === 0) return 1.0;

  let predecessorsSatisfied = 0;
  for (const predId of activity.predecessorIds) {
    const pred = allActivities.get(predId);
    if (!pred || pred.status === 'COMPLETED' || pred.actualProgress >= 80) {
      predecessorsSatisfied++;
    }
  }

  const ratio = predecessorsSatisfied / activity.predecessorIds.length;
  // If predecessors are not completed but event claims activity is completed, suspicious
  if (ratio < 0.5 && event.status === 'COMPLETED') {
    return 0.4;
  }
  return 0.5 + 0.5 * ratio;
}

// 7. Equipment / Entity Similarity (weight: 5%)
function calculateEntityScore(eventText: string, activity: Activity): number {
  const keywords = ['compressor', 'turbine', 'pump', 'skid', 'valve', 'header', 'transformer', 'cable', 'spool', 'tank'];
  const lowerEv = eventText.toLowerCase();
  const lowerAct = (activity.name + ' ' + activity.location).toLowerCase();

  let matchCount = 0;
  let totalKeywords = 0;
  for (const kw of keywords) {
    if (lowerEv.includes(kw)) {
      totalKeywords++;
      if (lowerAct.includes(kw)) {
        matchCount++;
      }
    }
  }

  if (totalKeywords === 0) return 0.8;
  return matchCount / totalKeywords;
}

export function matchEventToActivities(
  event: ExtractedEvent,
  activities: Activity[],
  topK = 5
): ActivityMatch {
  const actMap = new Map<string, Activity>();
  activities.forEach(a => actMap.set(a.id, a));

  const textToMatch = `${event.normalizedDescription} ${event.location || ''} ${event.discipline || ''}`;

  const candidates: ActivityCandidate[] = activities.map(act => {
    const semantic = calculateSemanticScore(textToMatch, act);
    const discipline = calculateDisciplineScore(event, act);
    const location = calculateLocationScore(event, act);
    const wbs = calculateWBSScore(textToMatch, act);
    const temporal = calculateTemporalScore(event.eventDate, act);
    const dependency = calculateDependencyScore(event, act, actMap);
    const entity = calculateEntityScore(textToMatch, act);

    // Hybrid weighted formula:
    // 40% Semantic + 15% Discipline + 10% Location + 10% WBS + 10% Temporal + 10% Dependency + 5% Entity
    const finalScore = Number((
      semantic * 0.40 +
      discipline * 0.15 +
      location * 0.10 +
      wbs * 0.10 +
      temporal * 0.10 +
      dependency * 0.10 +
      entity * 0.05
    ).toFixed(3));

    // Confidence calibration logic
    let confidence = finalScore;
    // Boost if strong discipline + location + semantic match
    if (semantic > 0.85 && discipline === 1.0 && location > 0.8) {
      confidence = Math.min(0.98, confidence + 0.05);
    }
    // Severe penalty if discipline clashes completely
    if (discipline <= 0.2) {
      confidence = Math.max(0.1, confidence - 0.25);
    }
    confidence = Number(confidence.toFixed(3));

    // Decision rule
    let decision: MatchDecision = 'UNMATCHED';
    if (confidence >= 0.90) {
      decision = 'AUTO_LINKED';
    } else if (confidence >= 0.70) {
      decision = 'PENDING_REVIEW';
    } else {
      decision = 'UNMATCHED';
    }

    // Explanation signals
    const explanation: string[] = [
      `Semantic similarity: ${(semantic * 100).toFixed(0)}%`,
      `Discipline compatibility: ${(discipline * 100).toFixed(0)}%`,
      `Location compatibility: ${(location * 100).toFixed(0)}%`,
      `WBS context score: ${(wbs * 100).toFixed(0)}%`,
      `Temporal window match: ${(temporal * 100).toFixed(0)}%`,
      `Dependency precedence: ${(dependency * 100).toFixed(0)}%`,
      `Equipment/Entity overlap: ${(entity * 100).toFixed(0)}%`,
    ];

    const signals: SignalBreakdown = {
      semanticScore: semantic,
      disciplineScore: discipline,
      locationScore: location,
      wbsScore: wbs,
      temporalScore: temporal,
      dependencyScore: dependency,
      entityScore: entity,
    };

    return {
      activityId: act.id,
      activityCode: act.activityCode,
      activityName: act.name,
      discipline: act.discipline,
      location: act.location,
      wbsPath: act.wbsPath,
      plannedStart: act.plannedStart,
      plannedFinish: act.plannedFinish,
      rank: 1,
      signals,
      finalScore,
      confidence,
      decision,
      explanation,
    };
  });

  // Sort candidates by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  // Re-assign ranks
  candidates.slice(0, topK).forEach((c, idx) => {
    c.rank = idx + 1;
  });

  const topCandidates = candidates.slice(0, topK);
  const best = topCandidates[0] || {
    activityId: 'UNMATCHED',
    activityCode: 'NONE',
    activityName: 'Unmatched Activity',
    confidence: 0,
    decision: 'UNMATCHED' as MatchDecision,
    rank: 1,
    finalScore: 0,
    signals: {
      semanticScore: 0,
      disciplineScore: 0,
      locationScore: 0,
      wbsScore: 0,
      temporalScore: 0,
      dependencyScore: 0,
      entityScore: 0,
    },
    discipline: 'GENERAL' as const,
    location: '',
    wbsPath: '',
    plannedStart: '',
    plannedFinish: '',
    explanation: ['No candidate satisfied minimum threshold (<0.70). Safety rule applied.']
  };

  let overallDecision: MatchDecision = best.decision;
  let reason = '';

  if (best.confidence >= 0.90) {
    overallDecision = 'AUTO_LINKED';
    reason = `High calibrated confidence (${(best.confidence * 100).toFixed(1)}%) with strong multi-signal alignment across Semantic, Discipline, and Location.`;
  } else if (best.confidence >= 0.70) {
    overallDecision = 'PENDING_REVIEW';
    reason = `Medium confidence (${(best.confidence * 100).toFixed(1)}%). Queued for Planner verification to prevent false auto-link.`;
  } else {
    overallDecision = 'UNMATCHED';
    reason = `Confidence (${(best.confidence * 100).toFixed(1)}%) below safety threshold (<70%). Prevented forced link.`;
  }

  return {
    id: `MATCH-${event.id}`,
    eventId: event.id,
    activityId: best.activityId,
    activityCode: best.activityCode,
    activityName: best.activityName,
    rank: 1,
    signals: best.signals,
    finalScore: best.finalScore,
    confidence: best.confidence,
    decision: overallDecision,
    decisionReason: reason,
    candidates: topCandidates,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
