import { DelayCause, Discipline, HistoricalOutcomeDTO, ProjectComparisonItemDTO } from '@sitesync/types';
import { HISTORICAL_CONFIG } from './historical.config';

/**
 * High-fidelity Synthetic Institutional Memory Dataset
 * Contains completed capital projects across Oil India Limited operational assets (Assam & North-East)
 */

export const SYNTHETIC_HISTORICAL_PROJECTS: ProjectComparisonItemDTO[] = [
  {
    projectId: 'OIL-BOG-2024',
    projectCode: 'OIL-BOG-2024',
    projectName: 'Bhogpara Gas Compression Plant',
    location: 'Bhogpara Terminal, Dibrugarh, Assam',
    activityCount: 240,
    completedActivities: 240,
    averageDurationDays: 14.2,
    medianVarianceDays: 1.5,
    delayRatePercentage: 18.5,
    topDelayCause: DelayCause.WEATHER,
    disciplineMix: { CIVIL: 60, PIPING: 80, MECHANICAL: 45, ELECTRICAL: 35, INSTRUMENTATION: 20 },
  },
  {
    projectId: 'OIL-KDM-2025',
    projectCode: 'OIL-KDM-2025',
    projectName: 'Kusijan Gas Dehydration & Metering Station',
    location: 'Kusijan Field, Tinsukia, Assam',
    activityCount: 180,
    completedActivities: 180,
    averageDurationDays: 11.8,
    medianVarianceDays: 2.0,
    delayRatePercentage: 22.0,
    topDelayCause: DelayCause.MATERIAL,
    disciplineMix: { CIVIL: 40, PIPING: 65, MECHANICAL: 35, ELECTRICAL: 25, INSTRUMENTATION: 15 },
  },
  {
    projectId: 'OIL-MKN-2023',
    projectCode: 'OIL-MKN-2023',
    projectName: 'Makum Crude Oil Gathering Station (OCS-4)',
    location: 'Makum Terminal, Assam',
    activityCount: 310,
    completedActivities: 310,
    averageDurationDays: 16.5,
    medianVarianceDays: 1.0,
    delayRatePercentage: 15.0,
    topDelayCause: DelayCause.DESIGN,
    disciplineMix: { CIVIL: 85, PIPING: 110, MECHANICAL: 55, ELECTRICAL: 40, INSTRUMENTATION: 20 },
  },
  {
    projectId: 'OIL-DUL-2022',
    projectCode: 'OIL-DUL-2022',
    projectName: 'Duliajan Central Gas Processing Upgrade Phase II',
    location: 'Duliajan Industrial Complex, Assam',
    activityCount: 420,
    completedActivities: 420,
    averageDurationDays: 18.0,
    medianVarianceDays: 2.5,
    delayRatePercentage: 24.5,
    topDelayCause: DelayCause.EQUIPMENT,
    disciplineMix: { CIVIL: 100, PIPING: 150, MECHANICAL: 80, ELECTRICAL: 60, INSTRUMENTATION: 30 },
  },
  {
    projectId: 'OIL-JRH-2024',
    projectCode: 'OIL-JRH-2024',
    projectName: 'Jorajan Secondary Gas Compression Train',
    location: 'Jorajan Field, Upper Assam',
    activityCount: 134,
    completedActivities: 134,
    averageDurationDays: 10.4,
    medianVarianceDays: 0.5,
    delayRatePercentage: 12.0,
    topDelayCause: DelayCause.APPROVAL,
    disciplineMix: { CIVIL: 30, PIPING: 50, MECHANICAL: 25, ELECTRICAL: 20, INSTRUMENTATION: 9 },
  },
  {
    projectId: 'OIL-NMK-2023',
    projectCode: 'OIL-NMK-2023',
    projectName: 'Naharkatiya Crude Stabilization Facility',
    location: 'Naharkatiya Oilfield, Assam',
    activityCount: 195,
    completedActivities: 195,
    averageDurationDays: 12.6,
    medianVarianceDays: 1.0,
    delayRatePercentage: 16.0,
    topDelayCause: DelayCause.MATERIAL,
    disciplineMix: { CIVIL: 45, PIPING: 70, MECHANICAL: 40, ELECTRICAL: 25, INSTRUMENTATION: 15 },
  },
  {
    projectId: 'OIL-SHL-2025',
    projectCode: 'OIL-SHL-2025',
    projectName: 'Shalmari Gas Gathering Hub',
    location: 'Shalmari Field, Dibrugarh, Assam',
    activityCount: 140,
    completedActivities: 140,
    averageDurationDays: 9.8,
    medianVarianceDays: 0.8,
    delayRatePercentage: 14.0,
    topDelayCause: DelayCause.WEATHER,
    disciplineMix: { CIVIL: 35, PIPING: 45, MECHANICAL: 30, ELECTRICAL: 18, INSTRUMENTATION: 12 },
  },
  {
    projectId: 'OIL-TNK-2024',
    projectCode: 'OIL-TNK-2024',
    projectName: 'Tengakhat High-Pressure Gas Distribution Pipeline',
    location: 'Tengakhat, Assam',
    activityCount: 220,
    completedActivities: 220,
    averageDurationDays: 15.1,
    medianVarianceDays: 1.8,
    delayRatePercentage: 20.0,
    topDelayCause: DelayCause.SITE_ACCESS,
    disciplineMix: { CIVIL: 50, PIPING: 90, MECHANICAL: 40, ELECTRICAL: 25, INSTRUMENTATION: 15 },
  },
  {
    projectId: 'OIL-DKM-2023',
    projectCode: 'OIL-DKM-2023',
    projectName: 'Dikhowmukh Wellhead Compression Station',
    location: 'Dikhowmukh, Sivasagar, Assam',
    activityCount: 165,
    completedActivities: 165,
    averageDurationDays: 11.2,
    medianVarianceDays: 1.2,
    delayRatePercentage: 17.5,
    topDelayCause: DelayCause.EQUIPMENT,
    disciplineMix: { CIVIL: 40, PIPING: 55, MECHANICAL: 35, ELECTRICAL: 22, INSTRUMENTATION: 13 },
  },
  {
    projectId: 'OIL-NGN-2025',
    projectCode: 'OIL-NGN-2025',
    projectName: 'Numaligarh Refined Products Dispatch Terminal',
    location: 'Numaligarh Terminal, Golaghat, Assam',
    activityCount: 280,
    completedActivities: 280,
    averageDurationDays: 17.4,
    medianVarianceDays: 2.2,
    delayRatePercentage: 23.0,
    topDelayCause: DelayCause.CONTRACTOR,
    disciplineMix: { CIVIL: 70, PIPING: 100, MECHANICAL: 50, ELECTRICAL: 38, INSTRUMENTATION: 22 },
  },
  {
    projectId: 'OIL-GHY-2024',
    projectCode: 'OIL-GHY-2024',
    projectName: 'Guwahati Pipeline Pumping Station Modernization',
    location: 'Guwahati Station, Assam',
    activityCount: 150,
    completedActivities: 150,
    averageDurationDays: 13.0,
    medianVarianceDays: 0.9,
    delayRatePercentage: 11.5,
    topDelayCause: DelayCause.PLANNING,
    disciplineMix: { CIVIL: 30, PIPING: 55, MECHANICAL: 35, ELECTRICAL: 20, INSTRUMENTATION: 10 },
  },
  {
    projectId: 'OIL-DGB-2025',
    projectCode: 'OIL-DGB-2025',
    projectName: 'Digboi Historic Refinery Offsite Utilities Automation',
    location: 'Digboi Refinery Area, Tinsukia, Assam',
    activityCount: 210,
    completedActivities: 210,
    averageDurationDays: 14.8,
    medianVarianceDays: 1.6,
    delayRatePercentage: 19.0,
    topDelayCause: DelayCause.DESIGN,
    disciplineMix: { CIVIL: 50, PIPING: 70, MECHANICAL: 40, ELECTRICAL: 30, INSTRUMENTATION: 20 },
  },
];

export function generateSyntheticHistoricalOutcomes(): HistoricalOutcomeDTO[] {
  const outcomes: HistoricalOutcomeDTO[] = [];

  const activityTemplates: Array<{
    type: string;
    name: string;
    category: string;
    discipline: Discipline;
    basePlannedDuration: number;
    durationSpread: number[]; // actual durations across projects
    variances: number[];
    unit?: string;
    quantities?: number[];
    delayCauses: DelayCause[];
    delayTexts: string[];
    lessons: string;
    evidenceDoc: string;
  }> = [
    // 1. Foundation Excavation
    {
      type: 'FOUNDATION_EXCAVATION',
      name: 'Compressor Foundation Excavation',
      category: 'Civil Earthwork & Foundations',
      discipline: Discipline.CIVIL,
      basePlannedDuration: 5,
      durationSpread: [5, 6, 7, 7, 8, 6, 7, 10, 9, 8, 7, 6, 7, 8, 10, 6, 7, 7, 9, 8, 6, 7, 8, 10], // 24 samples -> Median 7d, P25 6d, P75 8.5d
      variances: [0, 1, 2, 2, 3, 1, 2, 5, 4, 3, 2, 1, 2, 3, 5, 1, 2, 2, 4, 3, 1, 2, 3, 5],
      unit: 'm³',
      quantities: [800, 850, 920, 850, 780, 840, 900, 950, 820, 860, 870, 830, 850, 910, 960, 840, 850, 880, 930, 870, 820, 850, 890, 970],
      delayCauses: [
        DelayCause.WEATHER,
        DelayCause.WEATHER,
        DelayCause.EQUIPMENT,
        DelayCause.SITE_ACCESS,
        DelayCause.WEATHER,
        DelayCause.UNKNOWN,
      ],
      delayTexts: [
        'Heavy monsoon downpour inundated foundation trench; required 48h continuous dewatering.',
        'Excavator boom hydraulic cylinder seal leakage paused excavation for 1.5 shifts.',
        'High water table seepage encountered at depth of 3.2m in alluvial clay.',
      ],
      lessons: 'Mobilize 5 HP mud submersible dewatering pumps and pre-install geotextile trench lining before monsoon season earthwork.',
      evidenceDoc: 'DPR-Final-Closure.pdf',
    },

    // 2. PCC Pouring
    {
      type: 'PCC_POURING',
      name: 'Plain Cement Concrete Sub-base Pouring',
      category: 'Civil Earthwork & Foundations',
      discipline: Discipline.CIVIL,
      basePlannedDuration: 3,
      durationSpread: [3, 3, 4, 4, 3, 5, 3, 4, 4, 3, 4, 3, 4, 5, 3, 4, 3, 4], // 18 samples -> Median 3.5d
      variances: [0, 0, 1, 1, 0, 2, 0, 1, 1, 0, 1, 0, 1, 2, 0, 1, 0, 1],
      unit: 'm³',
      quantities: [120, 130, 125, 140, 135, 120, 125, 130, 145, 125, 130, 120, 135, 140, 125, 130, 125, 135],
      delayCauses: [DelayCause.MATERIAL, DelayCause.WEATHER, DelayCause.CONTRACTOR],
      delayTexts: [
        'Ready-mix transit mixer breakdown on terminal access road delayed batch pouring by 6 hours.',
        'Intermittent rain forced postponement of top surface screed leveling.',
      ],
      lessons: 'Maintain backup on-site batching plant for structural subbase concrete during critical path pours.',
      evidenceDoc: 'DPR-PCC-Record.pdf',
    },

    // 3. Reinforcement Binding
    {
      type: 'REINFORCEMENT_BINDING',
      name: 'Foundation Reinforcement Steel Binding',
      category: 'Civil Structural Package',
      discipline: Discipline.CIVIL,
      basePlannedDuration: 5,
      durationSpread: [5, 6, 6, 7, 5, 6, 7, 8, 6, 5, 6, 7, 6, 7, 8, 5, 6, 7, 6, 7], // 20 samples -> Median 6d
      variances: [0, 1, 1, 2, 0, 1, 2, 3, 1, 0, 1, 2, 1, 2, 3, 0, 1, 2, 1, 2],
      unit: 'MT',
      quantities: [45, 50, 48, 52, 46, 50, 54, 55, 49, 47, 51, 53, 48, 52, 56, 46, 50, 53, 49, 52],
      delayCauses: [DelayCause.DESIGN, DelayCause.MATERIAL, DelayCause.CONTRACTOR],
      delayTexts: [
        'Bar bending schedule (BBS) revision required due to pedestal anchor bolt clash resolution.',
        'Fe500D rebar delivery delay from regional stockyard.',
      ],
      lessons: 'Pre-fabricate reinforcement cages at off-site yard and cross-check anchor bolt sleeve templates in CAD prior to binding.',
      evidenceDoc: 'DPR-Rebar-Binding.pdf',
    },

    // 4. Header Pipe Spool Fabrication
    {
      type: 'PIPE_SPOOL_FABRICATION',
      name: 'Header Pipe Spool Fabrication & Cutting',
      category: 'Piping Process Package',
      discipline: Discipline.PIPING,
      basePlannedDuration: 12,
      durationSpread: [11, 12, 13, 12, 14, 13, 15, 12, 14, 13, 12, 13, 14, 16, 12, 13, 14, 13, 15, 12, 13, 14], // 22 samples -> Median 13d
      variances: [-1, 0, 1, 0, 2, 1, 3, 0, 2, 1, 0, 1, 2, 4, 0, 1, 2, 1, 3, 0, 1, 2],
      unit: 'dia-inch',
      quantities: [1400, 1500, 1450, 1600, 1550, 1480, 1520, 1650, 1580, 1490, 1530, 1620, 1500, 1550, 1680, 1470, 1510, 1590, 1540, 1610, 1480, 1530],
      delayCauses: [DelayCause.MATERIAL, DelayCause.DESIGN, DelayCause.QUALITY_REWORK],
      delayTexts: [
        'Delay in receiving seamless CS ASTM A106 Gr. B pipe materials from stockist.',
        'Bevel angle non-conformance required refacing of 12" pipe ends.',
      ],
      lessons: 'Implement receiving inspection protocols with portable ultrasonic thickness gauges at supplier dispatch.',
      evidenceDoc: 'DPR-Spool-Fab.pdf',
    },

    // 5. Pipe Rack Tie-in Welding
    {
      type: 'TIE_IN_WELDING',
      name: 'Process Piping Tie-in Joint Welding',
      category: 'Piping Process Package',
      discipline: Discipline.PIPING,
      basePlannedDuration: 8,
      durationSpread: [8, 8, 9, 10, 8, 9, 11, 9, 10, 8, 9, 10, 12, 8, 9, 10, 9, 11, 8, 9, 10, 8], // 22 samples -> Median 9d
      variances: [0, 0, 1, 2, 0, 1, 3, 1, 2, 0, 1, 2, 4, 0, 1, 2, 1, 3, 0, 1, 2, 0],
      unit: 'joints',
      quantities: [24, 26, 25, 28, 26, 25, 27, 30, 28, 25, 27, 29, 32, 24, 26, 28, 27, 31, 25, 27, 29, 26],
      delayCauses: [DelayCause.QUALITY_REWORK, DelayCause.APPROVAL, DelayCause.WEATHER],
      delayTexts: [
        'Radiography testing (RT) revealed porosity on joint W-14; cut out and reweld completed.',
        'Hot work permit renewal delayed due to high gas detector sensor reading nearby.',
      ],
      lessons: 'Use orbital GTAW for root pass to maintain >98% first-time RT clearance rate.',
      evidenceDoc: 'DPR-Welding-Log.pdf',
    },

    // 6. Compressor Skid Placement
    {
      type: 'COMPRESSOR_SKID_PLACEMENT',
      name: 'Gas Compressor Skid Heavy Rigging & Erection',
      category: 'Mechanical Rotating Equipment',
      discipline: Discipline.MECHANICAL,
      basePlannedDuration: 4,
      durationSpread: [4, 4, 5, 5, 4, 6, 4, 5, 5, 4, 6, 5, 4, 5, 6, 4], // 16 samples -> Median 5d
      variances: [0, 0, 1, 1, 0, 2, 0, 1, 1, 0, 2, 1, 0, 1, 2, 0],
      unit: 'MT',
      quantities: [85, 85, 85, 90, 85, 85, 90, 90, 85, 85, 90, 85, 85, 90, 85, 85],
      delayCauses: [DelayCause.EQUIPMENT, DelayCause.WEATHER, DelayCause.SITE_ACCESS],
      delayTexts: [
        '150T hydraulic crane ground stabilization plates required additional timber compaction after rain.',
        'Heavy crosswinds (>35 km/h) suspended tandem crane lift for 8 hours.',
      ],
      lessons: 'Conduct pre-rigging soil bearing capacity tests and use load-spreader steel mats for heavy-lift cranes.',
      evidenceDoc: 'DPR-Rigging-Log.pdf',
    },

    // 7. MV Power Cable Laying
    {
      type: 'MV_CABLE_LAYING',
      name: '11kV Medium Voltage Power Cable Laying in Trench',
      category: 'Electrical Power Package',
      discipline: Discipline.ELECTRICAL,
      basePlannedDuration: 6,
      durationSpread: [6, 6, 7, 7, 6, 8, 6, 7, 7, 8, 6, 7, 8, 6, 7, 7, 8, 6, 7], // 19 samples -> Median 7d
      variances: [0, 0, 1, 1, 0, 2, 0, 1, 1, 2, 0, 1, 2, 0, 1, 1, 2, 0, 1],
      unit: 'meters',
      quantities: [1200, 1300, 1250, 1400, 1350, 1280, 1320, 1450, 1380, 1290, 1330, 1420, 1300, 1350, 1480, 1270, 1310, 1390, 1340],
      delayCauses: [DelayCause.SITE_ACCESS, DelayCause.MATERIAL, DelayCause.CONTRACTOR],
      delayTexts: [
        'Cable trench obstructed by temporary civil scaffolding near substation building.',
        'Delay in delivery of heat-shrink termination kits from OEM.',
      ],
      lessons: 'Enforce clear workfront buffer between civil trench backfilling and electrical pulling crews.',
      evidenceDoc: 'DPR-Cable-Pull.pdf',
    },

    // 8. SCADA Loop Checking
    {
      type: 'SCADA_LOOP_CHECKING',
      name: 'Transmitter & DCS Loop Checking',
      category: 'Instrumentation & Control',
      discipline: Discipline.INSTRUMENTATION,
      basePlannedDuration: 7,
      durationSpread: [6, 7, 7, 8, 7, 8, 9, 7, 8, 7, 7, 8, 9, 7, 8, 7, 8, 9, 7, 8, 7], // 21 samples -> Median 7d
      variances: [-1, 0, 0, 1, 0, 1, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 1, 2, 0, 1, 0],
      unit: 'loops',
      quantities: [80, 85, 82, 90, 88, 84, 86, 92, 89, 83, 87, 91, 85, 88, 94, 82, 86, 90, 87, 89, 84],
      delayCauses: [DelayCause.DESIGN, DelayCause.APPROVAL, DelayCause.UNKNOWN],
      delayTexts: [
        'I/O channel mapping mismatch between DCS vendor database and field marshalling cabinet.',
        'Transmitter HART communicator calibration sign-off delayed by client inspector.',
      ],
      lessons: 'Perform pre-commissioning simulated signal injection at OEM factory acceptance testing (FAT).',
      evidenceDoc: 'DPR-Loop-Check.pdf',
    },
  ];

  let idCounter = 1;
  const projectList = SYNTHETIC_HISTORICAL_PROJECTS;

  for (const tpl of activityTemplates) {
    for (let i = 0; i < tpl.durationSpread.length; i++) {
      const proj = projectList[i % projectList.length];
      const actualDuration = tpl.durationSpread[i];
      const variance = tpl.variances[i];
      const plannedDuration = tpl.basePlannedDuration;

      const pStart = new Date('2024-03-01');
      pStart.setDate(pStart.getDate() + (i * 14));
      const pEnd = new Date(pStart);
      pEnd.setDate(pEnd.getDate() + plannedDuration);

      const aStart = new Date(pStart);
      if (variance > 0) aStart.setDate(aStart.getDate() + Math.min(2, variance));
      const aEnd = new Date(aStart);
      aEnd.setDate(aEnd.getDate() + actualDuration);

      const qty = tpl.quantities ? tpl.quantities[i % tpl.quantities.length] : undefined;
      const productivity = qty && actualDuration > 0 ? Math.round((qty / actualDuration) * 10) / 10 : undefined;

      const delayCause = variance > 0
        ? tpl.delayCauses[i % tpl.delayCauses.length]
        : DelayCause.UNKNOWN;

      const delayText = variance > 0
        ? tpl.delayTexts[i % tpl.delayTexts.length]
        : 'Completed within planned duration buffer.';

      outcomes.push({
        id: `HIST-${idCounter.toString().padStart(4, '0')}`,
        projectId: proj.projectId,
        projectName: proj.projectName,
        activityId: `ACT-HIST-${tpl.type}-${i + 1}`,
        activityCode: `${tpl.discipline.slice(0, 3)}-${tpl.type.slice(0, 3)}-${(i + 1).toString().padStart(3, '0')}`,
        activityName: tpl.name,
        discipline: tpl.discipline,
        activityType: tpl.type,
        activityCategory: tpl.category,
        wbsPath: `${proj.projectName} > ${tpl.category} > ${tpl.name}`,
        location: proj.location,
        contractorName: i % 2 === 0 ? 'Assam Hydrocarbon Builders Ltd' : 'North-East Infra Projects Pvt Ltd',
        plannedStart: pStart.toISOString().slice(0, 10),
        plannedEnd: pEnd.toISOString().slice(0, 10),
        actualStart: aStart.toISOString().slice(0, 10),
        actualEnd: aEnd.toISOString().slice(0, 10),
        plannedDuration,
        actualDuration,
        scheduleVariance: variance,
        plannedQuantity: qty,
        actualQuantity: qty,
        quantityUnit: tpl.unit,
        productivityMetric: productivity,
        productivityUnit: tpl.unit ? `${tpl.unit}/day` : undefined,
        delayCause,
        delayCategory: HISTORICAL_CONFIG.DELAY_TAXONOMY[delayCause]?.label || 'Standard Execution',
        delayDays: Math.max(0, variance),
        lessonsLearned: tpl.lessons,
        evidenceReference: `${tpl.evidenceDoc}#P${(i % 5) + 1}`,
        evidenceSourceDocument: tpl.evidenceDoc,
        evidenceQuotedText: delayText,
        completionStatus: 'COMPLETED',
        confidence: 0.96,
        quality: {
          startVerified: true,
          endVerified: true,
          sourceCount: 2 + (i % 3),
          reviewed: true,
          isEligible: true,
        },
        createdAt: aEnd.toISOString(),
      });

      idCounter++;
    }
  }

  return outcomes;
}
