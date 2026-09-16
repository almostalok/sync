import { EventExtractorService } from '../apps/api/src/modules/matching/extraction/event-extractor.service';
import { HybridMatchingService } from '../apps/api/src/modules/matching/scoring/hybrid-matching.service';
import { Discipline } from '@sitesync/types';

const extractor = new EventExtractorService();
const hybridMatcher = new HybridMatchingService();
const acts = [
  {
    id: 'act-civ-042',
    activityCode: 'CIV-EXC-0042',
    name: 'Excavation for Compressor Foundation C-101',
    description: 'Bulk mechanical excavation for compressor C-101 concrete plinth',
    discipline: Discipline.CIVIL,
    activityType: 'EXCAVATION',
    location: 'Compressor Area - Compressor Train 1 (C-101)',
    wbsPath: '1.0 > 1.1 > 1.1.1 > 1.1.1.1',
    plannedStart: '2026-03-01T08:00:00.000Z',
    plannedFinish: '2026-03-15T17:00:00.000Z',
    plannedProgress: 1.0,
    actualProgress: 0.85,
    status: 'IN_PROGRESS',
  },
  {
    id: 'act-civ-043',
    activityCode: 'CIV-EXC-0043',
    name: 'Excavation for Compressor Foundation C-102',
    description: 'Bulk mechanical excavation for compressor C-102 concrete plinth',
    discipline: Discipline.CIVIL,
    activityType: 'EXCAVATION',
    location: 'Compressor Area - Compressor Train 2 (C-102)',
    wbsPath: '1.0 > 1.1 > 1.1.1 > 1.1.1.2',
    plannedStart: '2026-03-16T08:00:00.000Z',
    plannedFinish: '2026-03-30T17:00:00.000Z',
    plannedProgress: 0.0,
    actualProgress: 0.0,
    status: 'NOT_STARTED',
  },
];

const raw1 = 'Excavation for Compressor Foundation C-101 85% complete';
const evt1 = extractor.extractEventsFromReport({
  reportId: 'r1',
  projectId: 'p1',
  reportDate: '2026-03-05T08:00:00.000Z',
  text: raw1,
})[0];
const res1 = hybridMatcher.matchEvent(evt1, acts);
console.log('Test 1 result:', {
  decision: res1.decision,
  confidence: res1.confidence,
  top1: res1.topCandidate?.finalScore,
  margin: res1.candidateMargin,
  scores: res1.topCandidate?.scores,
  gran: res1.granularityMismatch,
  ambig: res1.isAmbiguous,
});

const raw7 = 'Temporary perimeter security fence repair completed.';
const evt7 = extractor.extractEventsFromReport({
  reportId: 'r7',
  projectId: 'p7',
  reportDate: '2026-03-10T08:00:00.000Z',
  text: raw7,
})[0];
const res7 = hybridMatcher.matchEvent(evt7, acts);
console.log('Test 7 result:', {
  decision: res7.decision,
  confidence: res7.confidence,
  top1: res7.topCandidate?.finalScore,
  scores: res7.topCandidate?.scores,
});
