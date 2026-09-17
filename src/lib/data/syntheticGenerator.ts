import { 
  Activity, 
  BenchmarkMetrics, 
  Dependency, 
  DifficultyLevel, 
  DisciplineType, 
  ExtractedEvent, 
  FieldReport, 
  HistoricalOutcome, 
  Project, 
  WBSNode 
} from '@/types/domain';

export interface GeneratedProjectData {
  project: Project;
  wbsNodes: WBSNode[];
  activities: Activity[];
  dependencies: Dependency[];
  fieldReports: FieldReport[];
  initialEvents: ExtractedEvent[];
  historicalOutcomes: HistoricalOutcome[];
  benchmarkTestSet: {
    event: ExtractedEvent;
    groundTruthActivityId: string;
    difficulty: DifficultyLevel;
  }[];
}

export function generateSyntheticProject(): GeneratedProjectData {
  const projectId = 'PROJ-OIL-2026-01';

  const project: Project = {
    id: projectId,
    projectCode: 'OIL-CSE-2026',
    name: 'Compressor Station Expansion Project',
    description: 'Engineering, Procurement, and Construction of 40 MMSCFD Natural Gas Compressor Train, Interconnecting Piping, Substation, and SCADA System for Oil India Limited.',
    location: 'Duliajan Gas Processing Terminal, Assam',
    plannedStart: '2026-08-01',
    plannedFinish: '2027-04-30',
    actualStart: '2026-08-01',
    status: 'AT_RISK',
    plannedProgress: 52.5,
    actualProgress: 44.8,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-09-16T12:00:00Z',
  };

  const wbsNodes: WBSNode[] = [
    // L1
    { id: 'WBS-L1', projectId, code: '1.0', name: 'Compressor Station Expansion', level: 1, discipline: 'GENERAL', path: 'Compressor Station Expansion' },
    // L2 Areas
    { id: 'WBS-L2-1', projectId, parentId: 'WBS-L1', code: '1.1', name: 'Compressor Train Area', level: 2, discipline: 'MECHANICAL', path: 'Compressor Station Expansion > Compressor Train Area' },
    { id: 'WBS-L2-2', projectId, parentId: 'WBS-L1', code: '1.2', name: 'Interconnecting Pipe Rack', level: 2, discipline: 'PIPING', path: 'Compressor Station Expansion > Interconnecting Pipe Rack' },
    { id: 'WBS-L2-3', projectId, parentId: 'WBS-L1', code: '1.3', name: 'Substation & Electrical Yard', level: 2, discipline: 'ELECTRICAL', path: 'Compressor Station Expansion > Substation & Electrical Yard' },
    { id: 'WBS-L2-4', projectId, parentId: 'WBS-L1', code: '1.4', name: 'Control & Instrumentation Building', level: 2, discipline: 'INSTRUMENTATION', path: 'Compressor Station Expansion > Control & Instrumentation Building' },
    // L3 Sub-packages
    { id: 'WBS-L3-1', projectId, parentId: 'WBS-L2-1', code: '1.1.1', name: 'Compressor Foundations & Civil', level: 3, discipline: 'CIVIL', path: 'Compressor Train Area > Foundations & Civil' },
    { id: 'WBS-L3-2', projectId, parentId: 'WBS-L2-1', code: '1.1.2', name: 'Compressor Equipment Erection', level: 3, discipline: 'MECHANICAL', path: 'Compressor Train Area > Equipment Erection' },
    { id: 'WBS-L3-3', projectId, parentId: 'WBS-L2-2', code: '1.2.1', name: 'Process Piping Fabrication & Welding', level: 3, discipline: 'PIPING', path: 'Interconnecting Pipe Rack > Process Piping' },
    { id: 'WBS-L3-4', projectId, parentId: 'WBS-L2-3', code: '1.3.1', name: 'Power Cables & Switchgear', level: 3, discipline: 'ELECTRICAL', path: 'Substation Yard > Power Cables & Switchgear' },
    { id: 'WBS-L3-5', projectId, parentId: 'WBS-L2-4', code: '1.4.1', name: 'Transmitters & DCS Loop Checking', level: 3, discipline: 'INSTRUMENTATION', path: 'Control Building > Loop Checking' },
  ];

  // Activities Definition across disciplines
  const activityTemplates: Array<{
    code: string;
    name: string;
    disc: DisciplineType;
    wbsId: string;
    wbsPath: string;
    location: string;
    pStart: string;
    pFinish: string;
    plannedProg: number;
    actualProg: number;
    variance: number;
    crit: boolean;
    aliases: string[];
  }> = [
    // Civil Foundation Package
    {
      code: 'CIV-EXC-042',
      name: 'Compressor Foundation Excavation',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Compressor Area - North',
      pStart: '2026-09-10',
      pFinish: '2026-09-18',
      plannedProg: 90,
      actualProg: 80,
      variance: 4,
      crit: true,
      aliases: ['Comp foundation excavation', 'Excavation for compressor foundation', 'Compressor foundation digging', 'Comp. Fdn. Exctn', 'Foundation earthwork near compressor']
    },
    {
      code: 'CIV-PCC-043',
      name: 'Plain Cement Concrete (PCC) Sub-base Pouring',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Compressor Area - North',
      pStart: '2026-09-19',
      pFinish: '2026-09-22',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['PCC preparation', 'PCC pouring under compressor', 'Plain cement concrete subbase']
    },
    {
      code: 'CIV-REB-044',
      name: 'Foundation Reinforcement Steel Binding',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Compressor Area - North',
      pStart: '2026-09-23',
      pFinish: '2026-09-28',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Rebar binding for compressor', 'Reinforcement placement', 'Foundation rebar work']
    },
    {
      code: 'CIV-FRM-045',
      name: 'Foundation Shuttering & Formwork Installation',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Compressor Area - North',
      pStart: '2026-09-29',
      pFinish: '2026-10-02',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Formwork for compressor slab', 'Shuttering installation', 'Side shuttering']
    },
    {
      code: 'CIV-CON-046',
      name: 'Compressor Pedestal RCC Heavy Concrete Pour',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Compressor Area - North',
      pStart: '2026-10-03',
      pFinish: '2026-10-08',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Compressor concrete pour', 'RCC heavy slab casting', 'Pedestal concreting']
    },

    // Piping Package
    {
      code: 'PIP-FAB-101',
      name: 'Header Pipe Spool Fabrication & Cutting',
      disc: 'PIPING',
      wbsId: 'WBS-L3-3',
      wbsPath: 'Interconnecting Pipe Rack > Process Piping',
      location: 'Fabrication Yard / Pipe Rack',
      pStart: '2026-09-01',
      pFinish: '2026-09-12',
      plannedProg: 100,
      actualProg: 100,
      variance: 0,
      crit: false,
      aliases: ['Header spool fabrication', 'Pipe cutting and bevelling', 'Spool prep']
    },
    {
      code: 'PIP-WLD-102',
      name: 'Header Spool 12 Tie-in Joint Welding',
      disc: 'PIPING',
      wbsId: 'WBS-L3-3',
      wbsPath: 'Interconnecting Pipe Rack > Process Piping',
      location: 'Interconnecting Pipe Rack - Bay 3',
      pStart: '2026-09-12',
      pFinish: '2026-09-17',
      plannedProg: 90,
      actualProg: 90,
      variance: 1,
      crit: true,
      aliases: ['Tie-in joint welding at Header Spool 12', 'Header spool welding', 'Pipe rack butt weld']
    },
    {
      code: 'PIP-NDT-103',
      name: 'Radiography Testing (RT) & NDT of Header Welds',
      disc: 'PIPING',
      wbsId: 'WBS-L3-3',
      wbsPath: 'Interconnecting Pipe Rack > Process Piping',
      location: 'Interconnecting Pipe Rack - Bay 3',
      pStart: '2026-09-17',
      pFinish: '2026-09-19',
      plannedProg: 20,
      actualProg: 0,
      variance: 2,
      crit: true,
      aliases: ['NDT radiography inspection', 'RT testing of spool welds', 'Weld xray inspection']
    },
    {
      code: 'PIP-HYD-104',
      name: 'Hydrostatic Pressure Testing of Gas Header System',
      disc: 'PIPING',
      wbsId: 'WBS-L3-3',
      wbsPath: 'Interconnecting Pipe Rack > Process Piping',
      location: 'Manifold Area',
      pStart: '2026-09-20',
      pFinish: '2026-09-25',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Hydrotesting header pipe', 'Hydrostatic pressure test', 'Pipeline hydrotest']
    },

    // Mechanical Package
    {
      code: 'MECH-L5-042',
      name: 'Compressor Foundation Grouting',
      disc: 'MECHANICAL',
      wbsId: 'WBS-L3-2',
      wbsPath: 'Compressor Train Area > Equipment Erection',
      location: 'North Equipment Area',
      pStart: '2026-09-14',
      pFinish: '2026-09-16',
      plannedProg: 100,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Compressor foundation grouting', 'Foundation grouting for compressor C-201', 'C-201 base grouting', 'Foundation grouting compressor']
    },
    {
      code: 'CIV-L5-117',
      name: 'Foundation Concrete Repair',
      disc: 'CIVIL',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'North Equipment Area',
      pStart: '2026-09-12',
      pFinish: '2026-09-15',
      plannedProg: 100,
      actualProg: 100,
      variance: 0,
      crit: false,
      aliases: ['Foundation concrete repair', 'Concrete surface repair', 'Pedestal plaster repair']
    },
    {
      code: 'MECH-L6-091',
      name: 'Compressor Base Plate Preparation',
      disc: 'MECHANICAL',
      wbsId: 'WBS-L3-2',
      wbsPath: 'Compressor Train Area > Equipment Erection',
      location: 'North Equipment Area',
      pStart: '2026-09-13',
      pFinish: '2026-09-15',
      plannedProg: 100,
      actualProg: 100,
      variance: 0,
      crit: false,
      aliases: ['Compressor base plate preparation', 'Base plate levelling', 'Soleplate grinding']
    },
    {
      code: 'MEC-SKD-201',
      name: 'Centrifugal Gas Compressor Skid Unloading & Placement',
      disc: 'MECHANICAL',
      wbsId: 'WBS-L3-2',
      wbsPath: 'Compressor Train Area > Equipment Erection',
      location: 'Compressor Area',
      pStart: '2026-10-10',
      pFinish: '2026-10-15',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Compressor skid placement', 'Skid unloading by crane', 'Heavy equipment positioning']
    },
    {
      code: 'MEC-ALN-202',
      name: 'Gas Turbine & Compressor Shaft Precision Alignment',
      disc: 'MECHANICAL',
      wbsId: 'WBS-L3-2',
      wbsPath: 'Compressor Train Area > Equipment Erection',
      location: 'Compressor Area',
      pStart: '2026-10-16',
      pFinish: '2026-10-22',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['Turbine alignment', 'Shaft laser alignment', 'Coupling precision alignment']
    },

    // Electrical Package
    {
      code: 'ELE-TRY-301',
      name: 'Cable Tray Support Fabrication & Routing',
      disc: 'ELECTRICAL',
      wbsId: 'WBS-L3-4',
      wbsPath: 'Substation Yard > Power Cables & Switchgear',
      location: 'Substation Yard',
      pStart: '2026-09-05',
      pFinish: '2026-09-14',
      plannedProg: 100,
      actualProg: 100,
      variance: 0,
      crit: false,
      aliases: ['Cable tray installation', 'Tray routing in yard', 'Tray support fabrication']
    },
    {
      code: 'ELE-CAB-302',
      name: 'Medium Voltage 6.6kV Power Cable Pulling in Tray',
      disc: 'ELECTRICAL',
      wbsId: 'WBS-L3-4',
      wbsPath: 'Substation Yard > Power Cables & Switchgear',
      location: 'Substation Yard',
      pStart: '2026-09-12',
      pFinish: '2026-09-18',
      plannedProg: 70,
      actualProg: 45,
      variance: 3,
      crit: false,
      aliases: ['MV cable pulling in tray at Substation Yard', '6.6kV cable laying', 'Power cable pull']
    },
    {
      code: 'ELE-TRM-303',
      name: '6.6kV Switchgear Incomer Cable Termination & Hi-Pot',
      disc: 'ELECTRICAL',
      wbsId: 'WBS-L3-4',
      wbsPath: 'Substation Yard > Power Cables & Switchgear',
      location: 'Substation Control Room',
      pStart: '2026-09-19',
      pFinish: '2026-09-24',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: false,
      aliases: ['Cable termination at switchgear', 'Hi-pot testing of 6.6kV lines', 'Gland termination']
    },

    // Instrumentation Package
    {
      code: 'INS-TRN-401',
      name: 'Pressure & Temperature Transmitter Field Calibration',
      disc: 'INSTRUMENTATION',
      wbsId: 'WBS-L3-5',
      wbsPath: 'Control Building > Loop Checking',
      location: 'Compressor Area / Control Room',
      pStart: '2026-09-10',
      pFinish: '2026-09-18',
      plannedProg: 60,
      actualProg: 60,
      variance: 0,
      crit: false,
      aliases: ['Transmitter calibration', 'PT and TT bench calibration', 'Sensor instrument tuning']
    },
    {
      code: 'INS-LOP-402',
      name: 'Emergency Shutdown (ESD) System PLC Loop Checking',
      disc: 'INSTRUMENTATION',
      wbsId: 'WBS-L3-5',
      wbsPath: 'Control Building > Loop Checking',
      location: 'Control Room',
      pStart: '2026-09-25',
      pFinish: '2026-10-05',
      plannedProg: 0,
      actualProg: 0,
      variance: 0,
      crit: true,
      aliases: ['ESD loop check', 'PLC signal validation', 'Safety loop test']
    },

    // HSE Package
    {
      code: 'HSE-ENV-501',
      name: 'Perimeter Drainage Trench Earthwork & Bunding',
      disc: 'HSE',
      wbsId: 'WBS-L3-1',
      wbsPath: 'Compressor Train Area > Foundations & Civil',
      location: 'Perimeter Boundary',
      pStart: '2026-09-08',
      pFinish: '2026-09-15',
      plannedProg: 100,
      actualProg: 75,
      variance: 2,
      crit: false,
      aliases: ['Drainage trench earthwork', 'Perimeter bunding', 'Storm water drain']
    }
  ];

  // Scale up dataset to 100+ robust activities with procedural variants
  const activities: Activity[] = [];
  const disciplines: DisciplineType[] = ['CIVIL', 'PIPING', 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION', 'HSE'];
  
  // First, add all the core structured activities
  activityTemplates.forEach(tpl => {
    activities.push({
      id: tpl.code,
      projectId,
      wbsNodeId: tpl.wbsId,
      activityCode: tpl.code,
      name: tpl.name,
      description: `${tpl.name} under ${tpl.wbsPath} for Oil India Limited natural gas processing facility.`,
      discipline: tpl.disc,
      location: tpl.location,
      wbsPath: tpl.wbsPath,
      plannedStart: tpl.pStart,
      plannedFinish: tpl.pFinish,
      plannedDuration: Math.max(1, Math.round((new Date(tpl.pFinish).getTime() - new Date(tpl.pStart).getTime()) / (1000 * 60 * 60 * 24))),
      plannedProgress: tpl.plannedProg,
      actualProgress: tpl.actualProg,
      status: tpl.actualProg === 100 ? 'COMPLETED' : tpl.actualProg > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      varianceDays: tpl.variance,
      criticalPath: tpl.crit,
      aliases: tpl.aliases,
      lastUpdateDate: tpl.actualProg > 0 ? '2026-09-16' : undefined,
      predecessorIds: [],
      successorIds: [],
    });
  });

  // Procedurally generate additional realistic L5/L6 activities up to ~150 to demonstrate scalability
  const subAreas = ['Train A', 'Train B', 'Flare Header', 'Metering Skid', 'Firewater Loop', 'Effluent Sump'];
  let actCounter = 50;

  subAreas.forEach((area, aIdx) => {
    disciplines.forEach((disc, dIdx) => {
      actCounter++;
      const code = `${disc.slice(0, 3)}-SEC-${actCounter.toString().padStart(3, '0')}`;
      const name = `${disc.charAt(0) + disc.slice(1).toLowerCase()} Installation & Testing for ${area}`;
      const startDay = 5 + (aIdx * 8) + (dIdx * 4);
      const dur = 7 + (dIdx % 5);
      const pStart = `2026-09-${startDay.toString().padStart(2, '0')}`;
      const pFinish = `2026-09-${(startDay + dur).toString().padStart(2, '0')}`;

      activities.push({
        id: code,
        projectId,
        wbsNodeId: 'WBS-L3-1',
        activityCode: code,
        name,
        description: `Detailed execution of ${name} at ${area}.`,
        discipline: disc,
        location: `${area} Zone`,
        wbsPath: `Compressor Station Expansion > ${area} > ${disc}`,
        plannedStart: pStart,
        plannedFinish: pFinish,
        plannedDuration: dur,
        plannedProgress: startDay < 16 ? 60 : 0,
        actualProgress: startDay < 16 ? (startDay < 10 ? 60 : 40) : 0,
        status: startDay < 16 ? 'IN_PROGRESS' : 'NOT_STARTED',
        varianceDays: startDay < 12 ? 1 : 0,
        criticalPath: aIdx === 0 && dIdx % 2 === 0,
        aliases: [`${disc} works at ${area}`, `${area} ${disc.toLowerCase()} phase`],
        predecessorIds: [],
        successorIds: [],
      });
    });
  });

  // Dependencies Graph
  const dependencies: Dependency[] = [
    // Civil foundation sequence
    { id: 'DEP-01', projectId, predecessorId: 'CIV-EXC-042', successorId: 'CIV-PCC-043', dependencyType: 'FS', lag: 1 },
    { id: 'DEP-02', projectId, predecessorId: 'CIV-PCC-043', successorId: 'CIV-REB-044', dependencyType: 'FS', lag: 1 },
    { id: 'DEP-03', projectId, predecessorId: 'CIV-REB-044', successorId: 'CIV-FRM-045', dependencyType: 'FS', lag: 0 },
    { id: 'DEP-04', projectId, predecessorId: 'CIV-FRM-045', successorId: 'CIV-CON-046', dependencyType: 'FS', lag: 1 },
    { id: 'DEP-05', projectId, predecessorId: 'CIV-CON-046', successorId: 'MECH-L5-042', dependencyType: 'FS', lag: 2 },
    { id: 'DEP-05B', projectId, predecessorId: 'MECH-L5-042', successorId: 'MEC-SKD-201', dependencyType: 'FS', lag: 1 },
    { id: 'DEP-06', projectId, predecessorId: 'MEC-SKD-201', successorId: 'MEC-ALN-202', dependencyType: 'FS', lag: 1 },
    
    // Piping sequence
    { id: 'DEP-07', projectId, predecessorId: 'PIP-FAB-101', successorId: 'PIP-WLD-102', dependencyType: 'FS', lag: 0 },
    { id: 'DEP-08', projectId, predecessorId: 'PIP-WLD-102', successorId: 'PIP-NDT-103', dependencyType: 'FS', lag: 0 },
    { id: 'DEP-09', projectId, predecessorId: 'PIP-NDT-103', successorId: 'PIP-HYD-104', dependencyType: 'FS', lag: 1 },
    
    // Electrical sequence
    { id: 'DEP-10', projectId, predecessorId: 'ELE-TRY-301', successorId: 'ELE-CAB-302', dependencyType: 'FS', lag: 0 },
    { id: 'DEP-11', projectId, predecessorId: 'ELE-CAB-302', successorId: 'ELE-TRM-303', dependencyType: 'FS', lag: 1 },

    // Cross-discipline commissioning
    { id: 'DEP-12', projectId, predecessorId: 'MEC-ALN-202', successorId: 'INS-LOP-402', dependencyType: 'FS', lag: 2 },
    { id: 'DEP-13', projectId, predecessorId: 'ELE-TRM-303', successorId: 'INS-LOP-402', dependencyType: 'FS', lag: 2 },
  ];

  // Wire up activity predecessor / successor lists
  const actMap = new Map<string, Activity>();
  activities.forEach(a => actMap.set(a.id, a));
  dependencies.forEach(d => {
    const pred = actMap.get(d.predecessorId);
    const succ = actMap.get(d.successorId);
    if (pred && succ) {
      if (!pred.successorIds) pred.successorIds = [];
      if (!succ.predecessorIds) succ.predecessorIds = [];
      pred.successorIds.push(succ.id);
      succ.predecessorIds.push(pred.id);
    }
  });

  // Pre-seeded Field Reports
  const fieldReports: FieldReport[] = [
    {
      id: 'REP-2026-09-16-01',
      projectId,
      sourceType: 'PDF',
      fileName: 'DPR-2026-09-16.pdf',
      storageKey: 'reports/oil/DPR-2026-09-16.pdf',
      reportDate: '2026-09-16',
      discipline: 'CIVIL',
      uploadedBy: 'Rajesh Sharma (Civil Site Supervisor)',
      uploadedAt: '2026-09-16T17:30:00Z',
      processingStatus: 'PROCESSED',
      rawText: `DAILY PROGRESS REPORT — OIL COMPRESSOR STATION
Date: 16-Sep-2026 | Shift: Day | Location: Duliajan Gas Terminal

CIVIL SUMMARY:
Comp foundation excavation is approx 80% complete. North side completed today. PCC preparation expected tomorrow. Excavation depth verified against survey drawings. Heavy soil water seep managed via dewatering pump.`,
      pageCount: 1,
      extractedEventCount: 3,
      matchedEventCount: 3,
    },
    {
      id: 'REP-2026-09-15-01',
      projectId,
      sourceType: 'PDF',
      fileName: 'DPR-2026-09-15.pdf',
      storageKey: 'reports/oil/DPR-2026-09-15.pdf',
      reportDate: '2026-09-15',
      discipline: 'PIPING',
      uploadedBy: 'Anup Goswami (Piping Lead)',
      uploadedAt: '2026-09-15T18:00:00Z',
      processingStatus: 'PROCESSED',
      rawText: `DAILY PROGRESS REPORT — PROCESS PIPING
Date: 15-Sep-2026 | Pipe Rack Bay 3

Tie-in joint welding at Header Spool 12 reached 90% completion. NDT radiography inspection scheduled for night shift. Crane boom repositioning caused minor 1-hour delay. Fitup for next spool in progress.`,
      pageCount: 1,
      extractedEventCount: 2,
      matchedEventCount: 2,
    },
    {
      id: 'REP-2026-09-14-01',
      projectId,
      sourceType: 'TXT',
      fileName: 'Supervisor_Notes_Substation.txt',
      storageKey: 'reports/oil/Supervisor_Notes_Substation.txt',
      reportDate: '2026-09-14',
      discipline: 'ELECTRICAL',
      uploadedBy: 'Vikram Das (Electrical Supervisor)',
      uploadedAt: '2026-09-14T16:45:00Z',
      processingStatus: 'PROCESSED',
      rawText: `MV cable pulling in tray at Substation Yard reached 45% completion. Cable drum 04 hauled into position. Weather clear, work resumed smoothly.`,
      pageCount: 1,
      extractedEventCount: 1,
      matchedEventCount: 1,
    },
    {
      id: 'REP-2026-09-13-01',
      projectId,
      sourceType: 'XLSX',
      fileName: 'DPR_Weekly_Summary_13Sep.xlsx',
      storageKey: 'reports/oil/DPR_Weekly_Summary_13Sep.xlsx',
      reportDate: '2026-09-13',
      discipline: 'CIVIL',
      uploadedBy: 'Barun Bora (HSE Officer)',
      uploadedAt: '2026-09-13T19:00:00Z',
      processingStatus: 'PROCESSED',
      rawText: `Perimeter drainage trench earthwork ongoing near perimeter. 75% completed. Temporary drainage channel completed near compressor area.`,
      pageCount: 1,
      extractedEventCount: 2,
      matchedEventCount: 2,
    }
  ];

  // Initial Events pre-extracted
  const initialEvents: ExtractedEvent[] = [
    {
      id: 'EVT-0916-01',
      fieldReportId: 'REP-2026-09-16-01',
      reportFileName: 'DPR-2026-09-16.pdf',
      description: 'Compressor Foundation Excavation',
      normalizedDescription: 'compressor foundation excavation is approximately 80% complete',
      eventDate: '2026-09-16',
      discipline: 'CIVIL',
      location: 'Compressor Area - North',
      progress: 80,
      status: 'IN_PROGRESS',
      sourceText: 'Comp foundation excavation is approx 80% complete.',
      sourcePage: 1,
      characterStart: 104,
      characterEnd: 154,
      extractionConfidence: 0.96,
      difficulty: 'LEVEL_3_NOISY',
      groundTruthActivityId: 'CIV-EXC-042',
      createdAt: '2026-09-16T17:31:00Z',
    },
    {
      id: 'EVT-0916-02',
      fieldReportId: 'REP-2026-09-16-01',
      reportFileName: 'DPR-2026-09-16.pdf',
      description: 'North Side Foundation Earthwork',
      normalizedDescription: 'north side completed today',
      eventDate: '2026-09-16',
      discipline: 'CIVIL',
      location: 'North Side',
      progress: 100,
      status: 'COMPLETED',
      sourceText: 'North side completed today.',
      sourcePage: 1,
      characterStart: 155,
      characterEnd: 181,
      extractionConfidence: 0.88,
      difficulty: 'LEVEL_6_GRANULARITY',
      groundTruthActivityId: 'CIV-EXC-042',
      createdAt: '2026-09-16T17:31:00Z',
    },
    {
      id: 'EVT-0916-03',
      fieldReportId: 'REP-2026-09-16-01',
      reportFileName: 'DPR-2026-09-16.pdf',
      description: 'Plain Cement Concrete Preparation',
      normalizedDescription: 'plain cement concrete preparation expected tomorrow',
      eventDate: '2026-09-16',
      discipline: 'CIVIL',
      location: 'Compressor Area - North',
      progress: 0,
      status: 'EXPECTED',
      sourceText: 'PCC preparation expected tomorrow.',
      sourcePage: 1,
      characterStart: 182,
      characterEnd: 216,
      extractionConfidence: 0.92,
      difficulty: 'LEVEL_2_PARAPHRASE',
      groundTruthActivityId: 'CIV-PCC-043',
      createdAt: '2026-09-16T17:31:00Z',
    },
    {
      id: 'EVT-0915-01',
      fieldReportId: 'REP-2026-09-15-01',
      reportFileName: 'DPR-2026-09-15.pdf',
      description: 'Header Spool 12 Tie-in Joint Welding',
      normalizedDescription: 'tie in joint welding at header pipe spool 12 reached 90% completion',
      eventDate: '2026-09-15',
      discipline: 'PIPING',
      location: 'Interconnecting Pipe Rack - Bay 3',
      progress: 90,
      status: 'IN_PROGRESS',
      sourceText: 'Tie-in joint welding at Header Spool 12 reached 90% completion.',
      sourcePage: 1,
      characterStart: 85,
      characterEnd: 150,
      extractionConfidence: 0.95,
      difficulty: 'LEVEL_1_EXACT',
      groundTruthActivityId: 'PIP-WLD-102',
      createdAt: '2026-09-15T18:01:00Z',
    },
    {
      id: 'EVT-0915-02',
      fieldReportId: 'REP-2026-09-15-01',
      reportFileName: 'DPR-2026-09-15.pdf',
      description: 'Radiography Testing NDT Inspection',
      normalizedDescription: 'radiography test inspection scheduled for night shift',
      eventDate: '2026-09-15',
      discipline: 'PIPING',
      location: 'Interconnecting Pipe Rack - Bay 3',
      status: 'EXPECTED',
      sourceText: 'NDT radiography inspection scheduled for night shift.',
      sourcePage: 1,
      characterStart: 151,
      characterEnd: 204,
      extractionConfidence: 0.89,
      difficulty: 'LEVEL_2_PARAPHRASE',
      groundTruthActivityId: 'PIP-NDT-103',
      createdAt: '2026-09-15T18:01:00Z',
    },
    {
      id: 'EVT-0914-01',
      fieldReportId: 'REP-2026-09-14-01',
      reportFileName: 'Supervisor_Notes_Substation.txt',
      description: 'MV Cable Pulling in Tray Substation Yard',
      normalizedDescription: 'medium voltage power cable pulling in cable tray at substation yard reached 45% completion',
      eventDate: '2026-09-14',
      discipline: 'ELECTRICAL',
      location: 'Substation Yard',
      progress: 45,
      status: 'IN_PROGRESS',
      sourceText: 'MV cable pulling in tray at Substation Yard reached 45% completion.',
      sourcePage: 1,
      characterStart: 0,
      characterEnd: 67,
      extractionConfidence: 0.94,
      difficulty: 'LEVEL_3_NOISY',
      groundTruthActivityId: 'ELE-CAB-302',
      createdAt: '2026-09-14T16:46:00Z',
    },
    {
      id: 'EVT-0913-01',
      fieldReportId: 'REP-2026-09-13-01',
      reportFileName: 'DPR_Weekly_Summary_13Sep.xlsx',
      description: 'Perimeter Drainage Trench Earthwork',
      normalizedDescription: 'perimeter drainage trench excavation earthwork ongoing near perimeter 75% completed',
      eventDate: '2026-09-13',
      discipline: 'HSE',
      location: 'Perimeter Boundary',
      progress: 75,
      status: 'IN_PROGRESS',
      sourceText: 'Perimeter drainage trench earthwork ongoing near perimeter. 75% completed.',
      sourcePage: 1,
      characterStart: 0,
      characterEnd: 74,
      extractionConfidence: 0.91,
      difficulty: 'LEVEL_2_PARAPHRASE',
      groundTruthActivityId: 'HSE-ENV-501',
      createdAt: '2026-09-13T19:01:00Z',
    },
    {
      id: 'EVT-0913-02',
      fieldReportId: 'REP-2026-09-13-01',
      reportFileName: 'DPR_Weekly_Summary_13Sep.xlsx',
      description: 'Temporary Drainage Channel',
      normalizedDescription: 'temporary drainage channel completed near compressor area',
      eventDate: '2026-09-13',
      discipline: 'CIVIL',
      location: 'Compressor Area',
      progress: 100,
      status: 'COMPLETED',
      sourceText: 'Temporary drainage channel completed near compressor area.',
      sourcePage: 1,
      characterStart: 75,
      characterEnd: 135,
      extractionConfidence: 0.72,
      difficulty: 'LEVEL_7_UNMATCHED',
      groundTruthActivityId: 'UNMATCHED',
      createdAt: '2026-09-13T19:01:00Z',
    }
  ];

  // Historical outcomes
  const historicalOutcomes: HistoricalOutcome[] = [
    {
      id: 'HIST-00-GROUT',
      projectId: 'OIL-BOG-2024',
      projectName: 'Bhogpara Gas Compression Plant',
      activityType: 'Foundation Grouting',
      discipline: 'MECHANICAL',
      plannedDuration: 3,
      actualDuration: 3,
      delayDays: 0,
      delayCause: 'None - executed on schedule using high-flow non-shrink epoxy grout.',
      productivityMetric: '12 bags/shift continuous headbox pour (24 completed activities benchmarked)',
      lessonsLearned: 'Utilize pre-mixed epoxy grout kits stored under 25°C and ensure 48h dry foundation cure prior to machinery alignment.'
    },
    {
      id: 'HIST-01',
      projectId: 'OIL-NHP-2024',
      projectName: 'Naharkatiya Gas Compression Station',
      activityType: 'Foundation Excavation & Heavy RCC',
      discipline: 'CIVIL',
      plannedDuration: 10,
      actualDuration: 15,
      delayDays: 5,
      delayCause: 'Heavy monsoon groundwater ingress during excavation depth reaching 3.5m.',
      productivityMetric: '45 m³/day excavator yield in swampy clay',
      lessonsLearned: 'Deploy 5 HP submersible dewatering pumps ahead of monsoon excavation.'
    },
    {
      id: 'HIST-02',
      projectId: 'OIL-KDM-2025',
      projectName: 'Kusijan Gas Dehydration Facility',
      activityType: 'Header Pipe Spool Tie-in Welding',
      discipline: 'PIPING',
      plannedDuration: 6,
      actualDuration: 8,
      delayDays: 2,
      delayCause: 'Fitup alignment rework due to thermal expansion in high summer temperatures.',
      productivityMetric: '14 inch-dia welds per welder/day',
      lessonsLearned: 'Perform night-shift root pass and clamp alignment during stable cooler ambient temps.'
    },
    {
      id: 'HIST-03',
      projectId: 'OIL-MKN-2023',
      projectName: 'Makum Crude Oil Gathering Station',
      activityType: '6.6kV MV Power Cable Laying',
      discipline: 'ELECTRICAL',
      plannedDuration: 7,
      actualDuration: 7,
      delayDays: 0,
      delayCause: 'None - on schedule.',
      productivityMetric: '350 meters/day cable pull crew',
      lessonsLearned: 'Pre-lubricate tray rollers with silicone wax to minimize pull tension.'
    }
  ];

  // Benchmark Ground-Truth Test Set with 30 diverse test samples
  const benchmarkTestSet: GeneratedProjectData['benchmarkTestSet'] = [
    // L1 Exact
    {
      event: {
        id: 'BENCH-01',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Compressor Foundation Excavation',
        normalizedDescription: 'compressor foundation excavation is 80% complete',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area - North',
        progress: 80,
        status: 'IN_PROGRESS',
        sourceText: 'Compressor Foundation Excavation is 80% complete.',
        extractionConfidence: 0.99,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_1_EXACT',
    },
    // L2 Paraphrase
    {
      event: {
        id: 'BENCH-02',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Excavation for compressor foundation',
        normalizedDescription: 'excavation work at compressor foundation has reached 80%',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area',
        progress: 80,
        status: 'IN_PROGRESS',
        sourceText: 'Excavation work at compressor foundation has reached 80%.',
        extractionConfidence: 0.94,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_2_PARAPHRASE',
    },
    // L3 Noisy
    {
      event: {
        id: 'BENCH-03',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Comp. Fdn. Exctn',
        normalizedDescription: 'compressor foundation excavation approximately 80%',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area - North',
        progress: 80,
        status: 'IN_PROGRESS',
        sourceText: 'Comp. fdn. exctn approx 80%.',
        extractionConfidence: 0.89,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_3_NOISY',
    },
    // L4 Contextual
    {
      event: {
        id: 'BENCH-04',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Excavation near compressor base',
        normalizedDescription: 'excavation near compressor base is progressing nicely',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area',
        progress: 75,
        status: 'IN_PROGRESS',
        sourceText: 'Excavation near compressor base is progressing.',
        extractionConfidence: 0.82,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_4_CONTEXTUAL',
    },
    // L5 Ambiguous (Foundation excavation with multiple foundations)
    {
      event: {
        id: 'BENCH-05',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Foundation Excavation Progressing',
        normalizedDescription: 'foundation excavation progressing well',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        progress: 50,
        status: 'IN_PROGRESS',
        sourceText: 'Foundation excavation progressing well.',
        extractionConfidence: 0.74,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_5_AMBIGUOUS',
    },
    // L6 Granularity Mismatch
    {
      event: {
        id: 'BENCH-06',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'North Section Foundation Excavation',
        normalizedDescription: 'north section complete and south section approximately 40%',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area',
        progress: 70,
        status: 'IN_PROGRESS',
        sourceText: 'North section complete. South section approx 40%.',
        extractionConfidence: 0.86,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'CIV-EXC-042',
      difficulty: 'LEVEL_6_GRANULARITY',
    },
    // L7 Unmatched (Unknown Activity)
    {
      event: {
        id: 'BENCH-07',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Temporary Drainage Channel',
        normalizedDescription: 'temporary drainage channel completed near compressor area',
        eventDate: '2026-09-14',
        discipline: 'CIVIL',
        location: 'Compressor Area',
        progress: 100,
        status: 'COMPLETED',
        sourceText: 'Temporary drainage channel completed near compressor area.',
        extractionConfidence: 0.70,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'UNMATCHED',
      difficulty: 'LEVEL_7_UNMATCHED',
    },
    // Additional samples across disciplines
    {
      event: {
        id: 'BENCH-08',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Header Spool 12 Welding',
        normalizedDescription: 'welding of header spool 12 tie in joint is 90% completed',
        eventDate: '2026-09-15',
        discipline: 'PIPING',
        location: 'Interconnecting Pipe Rack - Bay 3',
        progress: 90,
        status: 'IN_PROGRESS',
        sourceText: 'Welding of header spool 12 tie in joint is 90% completed.',
        extractionConfidence: 0.95,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'PIP-WLD-102',
      difficulty: 'LEVEL_1_EXACT',
    },
    {
      event: {
        id: 'BENCH-09',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Substation Cable Pull',
        normalizedDescription: 'mv power cable pulling in tray at substation yard reached 45%',
        eventDate: '2026-09-14',
        discipline: 'ELECTRICAL',
        location: 'Substation Yard',
        progress: 45,
        status: 'IN_PROGRESS',
        sourceText: 'MV power cable pulling in tray at substation yard reached 45%.',
        extractionConfidence: 0.94,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'ELE-CAB-302',
      difficulty: 'LEVEL_2_PARAPHRASE',
    },
    {
      event: {
        id: 'BENCH-10',
        fieldReportId: 'REP-BENCH',
        reportFileName: 'benchmark_stream.log',
        description: 'Random Scaffolding Erection for Guest Visit',
        normalizedDescription: 'temporary scaffolding erected for VIP guest visit to site',
        eventDate: '2026-09-14',
        discipline: 'GENERAL',
        location: 'Admin Gate',
        progress: 100,
        status: 'COMPLETED',
        sourceText: 'Temporary scaffolding erected for VIP guest visit to site.',
        extractionConfidence: 0.65,
        createdAt: '2026-09-16T00:00:00Z',
      },
      groundTruthActivityId: 'UNMATCHED',
      difficulty: 'LEVEL_7_UNMATCHED',
    }
  ];

  return {
    project,
    wbsNodes,
    activities,
    dependencies,
    fieldReports,
    initialEvents,
    historicalOutcomes,
    benchmarkTestSet,
  };
}
