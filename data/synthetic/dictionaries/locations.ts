export interface AreaLocation {
  code: string;
  name: string;
  subLocations: string[];
}

export const PROJECT_LOCATIONS: AreaLocation[] = [
  {
    code: 'COMP_AREA',
    name: 'Compressor Area',
    subLocations: [
      'Compressor Train 1 (C-101)',
      'Compressor Train 2 (C-102)',
      'Lube Oil Console Skid',
      'Gas Turbine Driver Bay',
      'Suction Scrubber Pad',
      'Discharge Cooler Bay',
    ],
  },
  {
    code: 'PROC_AREA',
    name: 'Process Area',
    subLocations: [
      'Slug Catcher Area',
      'Inlet Separation Manifold',
      'Gas Dehydration Unit (TEG)',
      'Gas Metering Skid',
      'Hydrocarbon Condensate Unit',
    ],
  },
  {
    code: 'PIPE_RACK',
    name: 'Main Pipe Rack',
    subLocations: [
      'Rack Tier 1 (Process Lines)',
      'Rack Tier 2 (Utility & Steam)',
      'Rack Tier 3 (Electrical & Instrument Trays)',
      'North-South Spine Corridor',
      'East-West Offsite Header',
    ],
  },
  {
    code: 'UTIL_AREA',
    name: 'Utility Area',
    subLocations: [
      'Instrument Air Package',
      'Nitrogen Generation Skid',
      'Raw Water Treatment Plant',
      'Cooling Water Circulation Basin',
      'Fuel Gas Conditioning Skid',
    ],
  },
  {
    code: 'SUBSTN_AREA',
    name: 'Electrical Substation',
    subLocations: [
      '6.6kV Switchgear Room',
      '415V MCC Switchboard Area',
      'Transformer Yard (TR-01 / TR-02)',
      'Battery & UPS Room',
      'Cable Cellar Vault',
    ],
  },
  {
    code: 'CR_AREA',
    name: 'Control Room & Admin',
    subLocations: [
      'Central Control Room (CCR)',
      'DCS & ESD System Rack Room',
      'Telecom & Server Room',
      'Engineer Workstation Annex',
      'Field Safety Office',
    ],
  },
  {
    code: 'TANK_FARM',
    name: 'Condensate & Slop Tank Farm',
    subLocations: [
      'Condensate Storage Tank TK-301',
      'Condensate Storage Tank TK-302',
      'Slop Oil Sump Vessel',
      'Truck Loading Gantry',
      'Dyke Wall Containment Basin',
    ],
  },
  {
    code: 'FW_AREA',
    name: 'Fire Water & Safety Area',
    subLocations: [
      'Fire Water Storage Tank TK-401',
      'Main Diesel Fire Water Pump House',
      'Foam Proportioner Skid',
      'Hydrant Ring Main Perimeter',
      'Deluge Valve Station 01',
    ],
  },
  {
    code: 'DRAIN_AREA',
    name: 'Oily Water & Storm Drainage',
    subLocations: [
      'Corrugated Plate Interceptor (CPI) Basin',
      'Oily Water Sewer Lift Station',
      'Storm Water Retention Basin',
      'Evaporation Pond Perimeter',
    ],
  },
];
