export interface EquipmentTag {
  tag: string;
  name: string;
  areaCode: string;
  discipline: string;
  type: string;
}

export const EQUIPMENT_TAGS: EquipmentTag[] = [
  // Compressors & Drivers
  { tag: 'C-101', name: 'Feed Gas Booster Compressor Train 1', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'COMPRESSOR' },
  { tag: 'C-102', name: 'Feed Gas Booster Compressor Train 2', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'COMPRESSOR' },
  { tag: 'GT-101', name: 'Gas Turbine Driver Train 1', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'TURBINE' },
  { tag: 'GT-102', name: 'Gas Turbine Driver Train 2', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'TURBINE' },
  { tag: 'V-101', name: 'Suction Knockout Drum Train 1', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'VESSEL' },
  { tag: 'V-102', name: 'Suction Knockout Drum Train 2', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'VESSEL' },
  { tag: 'E-101', name: 'Discharge Gas Air Cooler Train 1', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'COOLER' },
  { tag: 'E-102', name: 'Discharge Gas Air Cooler Train 2', areaCode: 'COMP_AREA', discipline: 'MECHANICAL', type: 'COOLER' },

  // Process Vessels & Packages
  { tag: 'V-201', name: 'Inlet Slug Catcher Vessel', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'VESSEL' },
  { tag: 'V-202', name: 'High Pressure 3-Phase Separator', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'VESSEL' },
  { tag: 'T-201', name: 'Glycol Contactor Tower (TEG)', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'COLUMN' },
  { tag: 'PK-201', name: 'Gas Metering Skid Package', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'PACKAGE' },
  { tag: 'P-201A', name: 'Condensate Booster Pump A', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'PUMP' },
  { tag: 'P-201B', name: 'Condensate Booster Pump B (Standby)', areaCode: 'PROC_AREA', discipline: 'MECHANICAL', type: 'PUMP' },

  // Utilities
  { tag: 'PK-401', name: 'Instrument Air Compressor Package', areaCode: 'UTIL_AREA', discipline: 'MECHANICAL', type: 'PACKAGE' },
  { tag: 'PK-402', name: 'Nitrogen Membrane Generator', areaCode: 'UTIL_AREA', discipline: 'MECHANICAL', type: 'PACKAGE' },
  { tag: 'P-401A', name: 'Cooling Water Circulation Pump A', areaCode: 'UTIL_AREA', discipline: 'MECHANICAL', type: 'PUMP' },
  { tag: 'P-401B', name: 'Cooling Water Circulation Pump B', areaCode: 'UTIL_AREA', discipline: 'MECHANICAL', type: 'PUMP' },

  // Tanks
  { tag: 'TK-301', name: 'Stabilized Condensate Storage Tank A', areaCode: 'TANK_FARM', discipline: 'MECHANICAL', type: 'TANK' },
  { tag: 'TK-302', name: 'Stabilized Condensate Storage Tank B', areaCode: 'TANK_FARM', discipline: 'MECHANICAL', type: 'TANK' },
  { tag: 'TK-401', name: 'Main Fire Water Storage Tank (5000m3)', areaCode: 'FW_AREA', discipline: 'MECHANICAL', type: 'TANK' },

  // Electrical Equipment
  { tag: 'TR-01', name: '33kV/6.6kV Main Step-Down Transformer 1', areaCode: 'SUBSTN_AREA', discipline: 'ELECTRICAL', type: 'TRANSFORMER' },
  { tag: 'TR-02', name: '33kV/6.6kV Main Step-Down Transformer 2', areaCode: 'SUBSTN_AREA', discipline: 'ELECTRICAL', type: 'TRANSFORMER' },
  { tag: 'SWG-01', name: '6.6kV Medium Voltage Switchgear Board', areaCode: 'SUBSTN_AREA', discipline: 'ELECTRICAL', type: 'SWITCHGEAR' },
  { tag: 'MCC-01', name: '415V Motor Control Center Bus A', areaCode: 'SUBSTN_AREA', discipline: 'ELECTRICAL', type: 'MCC' },
  { tag: 'MCC-02', name: '415V Motor Control Center Bus B', areaCode: 'SUBSTN_AREA', discipline: 'ELECTRICAL', type: 'MCC' },

  // Instrumentation Panels & Junction Boxes
  { tag: 'DCS-01', name: 'Main Process Automation DCS Cabinet', areaCode: 'CR_AREA', discipline: 'INSTRUMENTATION', type: 'PANEL' },
  { tag: 'ESD-01', name: 'Safety Instrumented System (SIS/ESD) Rack', areaCode: 'CR_AREA', discipline: 'INSTRUMENTATION', type: 'PANEL' },
  { tag: 'JB-101', name: 'Train 1 Compressor Vibration Junction Box', areaCode: 'COMP_AREA', discipline: 'INSTRUMENTATION', type: 'JB' },
  { tag: 'JB-102', name: 'Train 2 Compressor Vibration Junction Box', areaCode: 'COMP_AREA', discipline: 'INSTRUMENTATION', type: 'JB' },
  { tag: 'JB-201', name: 'Process Area Hazardous Area Transmitter JB', areaCode: 'PROC_AREA', discipline: 'INSTRUMENTATION', type: 'JB' },
];
