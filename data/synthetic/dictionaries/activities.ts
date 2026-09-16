import { Discipline } from '@sitesync/types';

export interface ActivityTemplate {
  discipline: Discipline;
  activityType: string;
  action: string;
  objects: string[];
  durationRange: [number, number]; // in days
  predecessorTypes?: string[];
}

export const DISCIPLINE_ACTIVITY_TEMPLATES: Record<Discipline, ActivityTemplate[]> = {
  [Discipline.CIVIL]: [
    {
      discipline: Discipline.CIVIL,
      activityType: 'CLEARING',
      action: 'Site Clearing & Grubbing',
      objects: ['Plot Boundary', 'Access Corridor', 'Excavation Footprint'],
      durationRange: [3, 7],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'EXCAVATION',
      action: 'Bulk & Foundation Excavation',
      objects: ['Foundation Pit', 'Equipment Pad Footing', 'Trench Line', 'Sump Basin'],
      durationRange: [5, 14],
      predecessorTypes: ['CLEARING'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'PCC',
      action: 'Plain Cement Concrete (PCC) Sub-base Pouring',
      objects: ['Blinding Layer', 'Levelling Concrete', 'Under-slab Base'],
      durationRange: [2, 5],
      predecessorTypes: ['EXCAVATION'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'REINFORCEMENT',
      action: 'Rebar Cutting, Bending & Fixing',
      objects: ['Mat Foundation Rebar', 'Pedestal Steel Cage', 'Plinth Beam Steel'],
      durationRange: [4, 10],
      predecessorTypes: ['PCC'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'FORMWORK',
      action: 'Shuttering & Formwork Assembly',
      objects: ['Side Shutters', 'Pedestal Formwork', 'Pocket Former Boxes'],
      durationRange: [3, 7],
      predecessorTypes: ['REINFORCEMENT'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'CONCRETE',
      action: 'Structural Concrete Pouring & Curing',
      objects: ['Main Raft Slab', 'Equipment Pedestals', 'Anchor Plinth'],
      durationRange: [4, 10],
      predecessorTypes: ['FORMWORK'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'BACKFILLING',
      action: 'Earth Backfilling & Layer Compaction',
      objects: ['Foundation Periphery', 'Grade Slab Sub-base', 'Cable Trench'],
      durationRange: [3, 8],
      predecessorTypes: ['CONCRETE'],
    },
    {
      discipline: Discipline.CIVIL,
      activityType: 'GROUTING',
      action: 'Non-shrink Precision Baseplate Grouting',
      objects: ['Equipment Baseplate', 'Sole Plate Pocket', 'Column Base'],
      durationRange: [2, 4],
      predecessorTypes: ['CONCRETE'],
    },
  ],

  [Discipline.PIPING]: [
    {
      discipline: Discipline.PIPING,
      activityType: 'FABRICATION',
      action: 'Pipe Spool Fabrication & Cutting',
      objects: ['Suction Header Spool', 'Discharge Spool', 'Cooling Water Line Spool', 'Fuel Gas Piping'],
      durationRange: [6, 18],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'ERECTION',
      action: 'Pipe Spool Rigging & Erection',
      objects: ['Main Process Header', 'Bypass Loop', 'Compressor Manifold'],
      durationRange: [5, 14],
      predecessorTypes: ['FABRICATION'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'FITUP',
      action: 'Joint Fit-up & Alignment Verification',
      objects: ['Butt-weld Joint', 'Flange Assembly', 'Branch Connection'],
      durationRange: [3, 7],
      predecessorTypes: ['ERECTION'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'WELDING',
      action: 'Piping GTAW/SMAW Welding',
      objects: ['High-pressure Gas Line Joint', 'Lube Oil Header Welds', 'Drain Line Joints'],
      durationRange: [5, 12],
      predecessorTypes: ['FITUP'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'NDT',
      action: 'Non-Destructive Testing (Radiography/UT/DPT)',
      objects: ['Weld Seams 100% RT', 'Flange Root DPT', 'Tie-in Welds UT'],
      durationRange: [2, 6],
      predecessorTypes: ['WELDING'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'HYDROTEST',
      action: 'Hydrostatic Pressure Testing & De-watering',
      objects: ['Discharge Piping Circuit', 'Suction Test Package', 'Cooling System Loop'],
      durationRange: [3, 8],
      predecessorTypes: ['NDT'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'FLUSHING',
      action: 'Chemical Cleaning & Nitrogen Flushing',
      objects: ['Lube Oil Piping System', 'Seal Gas Line', 'Fuel Gas System'],
      durationRange: [2, 5],
      predecessorTypes: ['HYDROTEST'],
    },
    {
      discipline: Discipline.PIPING,
      activityType: 'INSULATION',
      action: 'Thermal Insulation & Acoustic Cladding',
      objects: ['Hot Gas Header', 'Chilled Water Line', 'Exhaust Duct'],
      durationRange: [4, 10],
      predecessorTypes: ['HYDROTEST'],
    },
  ],

  [Discipline.MECHANICAL]: [
    {
      discipline: Discipline.MECHANICAL,
      activityType: 'POSITIONING',
      action: 'Heavy Equipment Rigging & Positioning',
      objects: ['Centrifugal Compressor Skid', 'Gas Turbine Driver Package', 'Lube Oil Skid', 'Air Fin Cooler'],
      durationRange: [4, 10],
    },
    {
      discipline: Discipline.MECHANICAL,
      activityType: 'ALIGNMENT',
      action: 'Precision Laser Shaft Alignment',
      objects: ['Compressor to Turbine Coupling', 'Motor to Pump Shaft', 'Gearbox Alignment'],
      durationRange: [3, 7],
      predecessorTypes: ['POSITIONING'],
    },
    {
      discipline: Discipline.MECHANICAL,
      activityType: 'INTERNAL_ASSEMBLY',
      action: 'Compressor Bundle & Rotor Assembly',
      objects: ['Impeller Stage Bundles', 'Diaphragm Stages', 'Dry Gas Seal Cartridges'],
      durationRange: [5, 12],
      predecessorTypes: ['ALIGNMENT'],
    },
    {
      discipline: Discipline.MECHANICAL,
      activityType: 'NO_LOAD_RUN',
      action: 'Mechanical Solo Run & Uncoupled Testing',
      objects: ['Turbine Driver Solo Run', 'Lube Oil Pump Motor Test', 'Auxiliary LOP Run'],
      durationRange: [3, 6],
      predecessorTypes: ['INTERNAL_ASSEMBLY'],
    },
  ],

  [Discipline.ELECTRICAL]: [
    {
      discipline: Discipline.ELECTRICAL,
      activityType: 'TRAY_INSTALLATION',
      action: 'Perforated Cable Tray & Ladder Erection',
      objects: ['HV Cable Ladder', 'Control Cable Tray', 'Lighting Conduit Network'],
      durationRange: [4, 12],
    },
    {
      discipline: Discipline.ELECTRICAL,
      activityType: 'CABLE_PULLING',
      action: 'Power & Control Cable Pulling',
      objects: ['6.6kV MV Feeder Cables', '415V Power Cables', 'Control Multi-core Cables'],
      durationRange: [5, 15],
      predecessorTypes: ['TRAY_INSTALLATION'],
    },
    {
      discipline: Discipline.ELECTRICAL,
      activityType: 'TERMINATION',
      action: 'Cable Glanding, Meggering & Termination',
      objects: ['Switchgear MV Incomer Cells', 'MCC Panel Terminals', 'Motor Terminal Boxes'],
      durationRange: [4, 10],
      predecessorTypes: ['CABLE_PULLING'],
    },
    {
      discipline: Discipline.ELECTRICAL,
      activityType: 'EARTHING',
      action: 'Grid Earthing & Grounding Rod Bonding',
      objects: ['Main Grounding Ring', 'Equipment Frame Earthing', 'Lightning Protection Grid'],
      durationRange: [3, 8],
    },
    {
      discipline: Discipline.ELECTRICAL,
      activityType: 'ENERGIZATION',
      action: 'Transformer & Substation Bus Energization',
      objects: ['Step-down Transformer TR-01', '6.6kV Switchgear Bus A', 'Essential MCC Bus B'],
      durationRange: [2, 5],
      predecessorTypes: ['TERMINATION', 'EARTHING'],
    },
  ],

  [Discipline.INSTRUMENTATION]: [
    {
      discipline: Discipline.INSTRUMENTATION,
      activityType: 'JB_INSTALLATION',
      action: 'Field Junction Box Mounting & Support',
      objects: ['Field JB JB-101', 'ESD Marshalling Cabinet', 'Analyzer Sample Station'],
      durationRange: [3, 8],
    },
    {
      discipline: Discipline.INSTRUMENTATION,
      activityType: 'INSTRUMENT_INSTALL',
      action: 'Field Transmitter & Sensor Mounting',
      objects: ['Differential Pressure Transmitters', 'Suction Temperature RTDs', 'Vibration Probes'],
      durationRange: [4, 10],
      predecessorTypes: ['JB_INSTALLATION'],
    },
    {
      discipline: Discipline.INSTRUMENTATION,
      activityType: 'TUBING',
      action: 'SS Impulse Tubing Routing & Bending',
      objects: ['1/2 Inch SS Tubing Line', 'Seal Gas Supply Tubing', 'Instrument Air Manifold'],
      durationRange: [4, 10],
      predecessorTypes: ['INSTRUMENT_INSTALL'],
    },
    {
      discipline: Discipline.INSTRUMENTATION,
      activityType: 'CALIBRATION',
      action: 'Bench & Field Transmitter Calibration',
      objects: ['Pressure Transmitter 5-point Check', 'Control Valve Smart Positioner', 'Flow Meter Orifice Calibration'],
      durationRange: [3, 7],
      predecessorTypes: ['TUBING'],
    },
    {
      discipline: Discipline.INSTRUMENTATION,
      activityType: 'LOOP_CHECK',
      action: 'Cold & Hot Signal Loop Checking to DCS/ESD',
      objects: ['Compressor Anti-surge Loop', 'Emergency Shutdown (ESD) Loop', 'Process Interlock Matrix'],
      durationRange: [4, 10],
      predecessorTypes: ['CALIBRATION'],
    },
  ],

  [Discipline.HSE]: [
    {
      discipline: Discipline.HSE,
      activityType: 'SAFETY_INSPECTION',
      action: 'Daily HSE Walkthrough & Permit Audit',
      objects: ['Hot Work Permit Validation', 'Confined Space Entry Check', 'Excavation Slope Stability'],
      durationRange: [1, 2],
    },
    {
      discipline: Discipline.HSE,
      activityType: 'SCAFFOLDING_CHECK',
      action: 'Scaffolding Tagging & Load Certification',
      objects: ['Heavy Duty Pipe Rack Scaffold', 'Compressor Bay Working Platform', 'Stair Tower Access'],
      durationRange: [1, 3],
    },
    {
      discipline: Discipline.HSE,
      activityType: 'FIRE_SYSTEM_TEST',
      action: 'Fire Water Deluge & Foam System Testing',
      objects: ['Compressor Hood Deluge Valve', 'Hydrant Ring Main Pressure Test', 'Flame Detector Response Test'],
      durationRange: [2, 5],
    },
  ],

  [Discipline.GENERAL]: [
    {
      discipline: Discipline.GENERAL,
      activityType: 'COMMISSIONING',
      action: 'Integrated System Commissioning & Handover',
      objects: ['Compressor Train 1 Full Loop', 'Utility Air Package', 'Flare System Tie-in'],
      durationRange: [7, 21],
    },
  ],
};
