import { DisciplineType, EventStatus } from '@/types/domain';

export interface NormalizedResult {
  raw: string;
  normalized: string;
  tokens: string[];
  extractedProgress?: number;
  extractedStatus: EventStatus;
  detectedDiscipline?: DisciplineType;
  detectedLocation?: string;
  detectedQuantities?: { value: number; unit: string };
  expectedFutureTasks?: string[];
  blockers?: string[];
}

// Construction & Oil & Gas Domain Normalization Dictionary
const JARGON_MAP: Record<string, string> = {
  // Foundations & Civil
  'comp': 'compressor',
  'fdn': 'foundation',
  'fdns': 'foundations',
  'exctn': 'excavation',
  'exc': 'excavation',
  'dig': 'excavation',
  'digging': 'excavation',
  'earthwork': 'excavation',
  'pcc': 'plain cement concrete',
  'rcc': 'reinforced cement concrete',
  'rebar': 'reinforcement',
  'reinf': 'reinforcement',
  'shuttering': 'formwork',
  'frmwrk': 'formwork',
  'conc': 'concrete',
  'pour': 'concreting',
  'poured': 'concreting',
  'plinth': 'plinth beam',
  'backfill': 'backfilling',
  'bf': 'backfilling',

  // Piping & Mechanical
  'pip': 'piping',
  'hdr': 'header',
  'wld': 'welding',
  'wldg': 'welding',
  'weld': 'welding',
  'fitup': 'fit up',
  'fit-up': 'fit up',
  'fab': 'fabrication',
  'erect': 'erection',
  'erectn': 'erection',
  'algn': 'alignment',
  'align': 'alignment',
  'hyd': 'hydrotest',
  'hydro': 'hydrotesting',
  'flg': 'flange',
  'vlv': 'valve',
  'spool': 'pipe spool',
  'tiein': 'tie in',
  'tie-in': 'tie in',
  'ndt': 'non destructive testing',
  'dpt': 'dye penetrant test',
  'rt': 'radiography test',
  'ut': 'ultrasonic test',

  // Electrical & Instrumentation
  'elec': 'electrical',
  'cbl': 'cable',
  'tray': 'cable tray',
  'pull': 'cable pulling',
  'pulling': 'cable pulling',
  'term': 'termination',
  'termn': 'termination',
  'inst': 'instrumentation',
  'xmtr': 'transmitter',
  'plc': 'programmable logic controller',
  'dcs': 'distributed control system',
  'scada': 'scada system',
  'calib': 'calibration',
  'jb': 'junction box',
  'swgr': 'switchgear',
  'mcc': 'motor control center',
  'tx': 'transformer',
  'earthing': 'earthing ground grid',

  // General & Noise words
  'approx': 'approximately',
  'abt': 'about',
  'prog': 'progress',
  'inprog': 'in progress',
  'wip': 'in progress',
  'nxt': 'next',
  'tom': 'tomorrow',
  'tmrw': 'tomorrow',
  'compld': 'completed',
  'cmpltd': 'completed',
  'fin': 'finished',
  'strtd': 'started',
};

const DISCIPLINE_KEYWORDS: Record<DisciplineType, string[]> = {
  CIVIL: ['excavation', 'foundation', 'pcc', 'rcc', 'reinforcement', 'rebar', 'concrete', 'formwork', 'grading', 'civil', 'earthwork', 'piling', 'masonry', 'trench'],
  PIPING: ['piping', 'pipe', 'weld', 'welding', 'spool', 'fit up', 'hydrotest', 'flange', 'valve', 'tie in', 'pipeline', 'isometric', 'header'],
  MECHANICAL: ['compressor', 'turbine', 'pump', 'skid', 'alignment', 'vessel', 'heat exchanger', 'tank', 'crane', 'motor', 'gearbox', 'lubrication'],
  ELECTRICAL: ['cable', 'tray', 'cable pulling', 'transformer', 'switchgear', 'mcc', 'earthing', 'lighting', 'substation', 'termination', 'panel'],
  INSTRUMENTATION: ['instrumentation', 'transmitter', 'sensor', 'plc', 'dcs', 'scada', 'calibration', 'tubing', 'junction box', 'control valve', 'loop check'],
  HSE: ['safety', 'hazard', 'toolbox', 'incident', 'ppe', 'hse', 'permit', 'fire', 'spill', 'environmental'],
  GENERAL: ['site', 'mobilization', 'demobilization', 'survey', 'clearing', 'handover', 'commissioning']
};

const LOCATION_KEYWORDS = [
  'compressor area',
  'north side',
  'south side',
  'east side',
  'west side',
  'substation yard',
  'control room',
  'manifold area',
  'tank farm',
  'battery limit',
  'inlet header',
  'discharge manifold',
  'flare stack',
  'utility block',
  'pump house',
  'pipe rack'
];

export function normalizeFieldText(rawText: string): NormalizedResult {
  const clean = rawText
    .replace(/[^\w\s%.,-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(/\s+/);
  const normalizedWords = words.map(w => {
    const lower = w.toLowerCase().replace(/[.,]$/, '');
    return JARGON_MAP[lower] || lower;
  });

  const normalizedString = normalizedWords.join(' ');

  // Extract progress percentage (e.g. 80%, 80 %, 0.80, approx 80%)
  let extractedProgress: number | undefined;
  const pctMatch = clean.match(/(\d{1,3})\s*%/);
  if (pctMatch) {
    const val = parseInt(pctMatch[1], 10);
    if (val >= 0 && val <= 100) extractedProgress = val;
  } else {
    const fracMatch = clean.match(/\b(0\.\d{1,2}|1\.0)\b/);
    if (fracMatch) {
      extractedProgress = Math.round(parseFloat(fracMatch[1]) * 100);
    }
  }

  // Extract Status
  let extractedStatus: EventStatus = 'UNKNOWN';
  const lowerNorm = normalizedString.toLowerCase();
  if (lowerNorm.includes('completed') || lowerNorm.includes('finished') || lowerNorm.includes('done') || extractedProgress === 100) {
    extractedStatus = 'COMPLETED';
    if (extractedProgress === undefined) extractedProgress = 100;
  } else if (lowerNorm.includes('in progress') || lowerNorm.includes('progressing') || (extractedProgress && extractedProgress > 0 && extractedProgress < 100)) {
    extractedStatus = 'IN_PROGRESS';
  } else if (lowerNorm.includes('started') || lowerNorm.includes('commenced') || lowerNorm.includes('initiated')) {
    extractedStatus = 'STARTED';
    if (extractedProgress === undefined) extractedProgress = 10;
  } else if (lowerNorm.includes('blocked') || lowerNorm.includes('halted') || lowerNorm.includes('stopped') || lowerNorm.includes('delay') || lowerNorm.includes('hindered')) {
    extractedStatus = 'BLOCKED';
  } else if (lowerNorm.includes('expected') || lowerNorm.includes('tomorrow') || lowerNorm.includes('planned') || lowerNorm.includes('scheduled for')) {
    extractedStatus = 'EXPECTED';
  }

  // Detect Discipline
  let detectedDiscipline: DisciplineType | undefined;
  let maxDisciplineMatches = 0;
  for (const [disc, keywords] of Object.entries(DISCIPLINE_KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (lowerNorm.includes(kw)) matches++;
    }
    if (matches > maxDisciplineMatches) {
      maxDisciplineMatches = matches;
      detectedDiscipline = disc as DisciplineType;
    }
  }

  // Detect Location
  let detectedLocation: string | undefined;
  for (const loc of LOCATION_KEYWORDS) {
    if (lowerNorm.includes(loc)) {
      detectedLocation = loc.replace(/\b\w/g, l => l.toUpperCase());
      break;
    }
  }

  // Detect Expected Future Tasks
  const expectedFutureTasks: string[] = [];
  const futureMatch = lowerNorm.match(/(?:expected|planned|scheduled|starting)\s+(?:tomorrow|nxt day|next day|next week|soon)?\s*[:\-]?\s*([^.]+)/i);
  if (futureMatch && futureMatch[1]) {
    expectedFutureTasks.push(futureMatch[1].trim());
  }

  // Detect Blockers
  const blockers: string[] = [];
  const blockerMatch = lowerNorm.match(/(?:blocked|delayed|hindered|stopped)\s+(?:due to|by|because of)\s+([^.]+)/i);
  if (blockerMatch && blockerMatch[1]) {
    blockers.push(blockerMatch[1].trim());
  }

  return {
    raw: rawText,
    normalized: normalizedString,
    tokens: normalizedWords,
    extractedProgress,
    extractedStatus,
    detectedDiscipline,
    detectedLocation,
    expectedFutureTasks,
    blockers,
  };
}
