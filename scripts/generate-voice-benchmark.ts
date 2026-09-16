import * as fs from 'fs';
import * as path from 'path';

export interface VoiceBenchmarkItem {
  id: string;
  category:
    | 'CLEAN_ENGLISH'
    | 'HINDI_HINGLISH'
    | 'TERMINOLOGY_HEAVY'
    | 'NOISY_FRAGMENTED'
    | 'TEMPORAL_EXPRESSIONS'
    | 'NEGATION'
    | 'SELF_CORRECTION'
    | 'AMBIGUOUS'
    | 'DUPLICATE';
  transcriptText: string;
  language: string;
  expectedEventsCount: number;
  expectedNegation: boolean;
  expectedSelfCorrection: boolean;
  expectedDiscipline?: string;
  expectedProgress?: number;
  expectedStatus?: string;
  expectedTemporalResolution?: string;
}

const items: VoiceBenchmarkItem[] = [];

// 1. 20 Clean English transcripts
const cleanEnglish = [
  'Completed excavation for compressor foundation area B today. Reinforcement is 85 percent complete.',
  'Piping team completed 120 meters of underground pipe near station three today.',
  'Structural steel erection for compressor shelter reached 60 percent progress.',
  'Welding of 8 inch header spool completed and passed visual inspection.',
  'Cable tray installation along main pipe rack is 100 percent finished.',
  'Plain cement concrete pouring for transformer plinth completed this morning.',
  'Installed three suction control valves at manifold area today.',
  'Hydrostatic testing of cooling water line completed with zero pressure drop.',
  'Earthwork grading for substation yard achieved 90 percent completion.',
  'Fabrication of pipe supports in site workshop reached 75 percent progress.',
  'Cable pulling for low voltage motor feeders completed up to battery limit.',
  'Excavation for flare knock out drum foundation reached target depth of three meters.',
  'Grouting beneath compressor skid finished and curing initiated.',
  'Erected two nitrogen storage vessels onto concrete foundations.',
  'Terminated 24 instrument signal cables inside local junction box four.',
  'Completed perimeter security fencing around compressor station boundary.',
  'Pump alignment between motor and pump shaft achieved within tolerance.',
  'Conducted dielectric insulation resistance testing on main switchgear busbars.',
  'Applied anti corrosive primer coating on all welded pipe joints today.',
  'Rebar tying for compressor foundation slab reached 50 percent milestone.',
];

cleanEnglish.forEach((text, idx) => {
  items.push({
    id: `VOICE-EN-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'CLEAN_ENGLISH',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
    expectedStatus: text.includes('Completed') || text.includes('finished') ? 'COMPLETED' : 'IN_PROGRESS',
  });
});

// 2. 20 Hindi / Hinglish transcripts
const hinglish = [
  'Aaj compressor station mein foundation excavation complete ho gaya hai, reinforcement 85 percent hai.',
  'Piping team ne underground pipe ka kaam khatam kar diya hai near compressor station three.',
  'Compressor shelter ka structural steel erection 60 percent progress tak pahuch gaya hai.',
  '8 inch header spool ka welding pura ho gaya aur inspection bhi pass ho gaya.',
  'Substation yard mein cable tray installation 100 percent finished ho chuka hai.',
  'Transformer plinth ke liye PCC pouring aaj subah complete ho gaya.',
  'Manifold area mein teen suction control valves install kar diye gaye hain.',
  'Cooling water line ka hydro test complete ho gaya bina kisi leakage ke.',
  'Substation yard mein mitti ki khudai aur grading 90 percent ho chuki hai.',
  'Workshop mein pipe support fabrication ka kaam 75 percent chal raha hai.',
  'Low voltage motor feeders ka cable pulling complete ho gaya hai.',
  'Flare knock out drum foundation ki khudai teen meter depth tak ho gayi hai.',
  'Compressor skid ke niche grouting ka kaam khatam ho gaya hai.',
  'Do nitrogen storage vessels ko concrete foundation par erect kar diya hai.',
  'Junction box number four mein 24 signal cables terminate ho chuki hain.',
  'Boundary wall ke pass security fencing ka kaam pura ho gaya.',
  'Motor aur pump shaft ka alignment tolerance ke andar achieve ho gaya hai.',
  'Main switchgear busbars par megger test complete kar liya gaya hai.',
  'Welded joints par primer paint lagane ka kaam aaj pura ho gaya.',
  'Foundation slab ke sariya baandhne ka kaam 50 percent ho chuka hai.',
];

hinglish.forEach((text, idx) => {
  items.push({
    id: `VOICE-HI-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'HINDI_HINGLISH',
    transcriptText: text,
    language: 'hinglish',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
  });
});

// 3. 15 Terminology-Heavy transcripts
const terminology = [
  'NDT radiography testing completed on 16 butt welds of main gas header.',
  'Hydrotest pressure held at 150 bar for 4 hours with zero pressure decay on spool SP-42.',
  'Installed 600 pound rating globe valve on discharge bypass manifold.',
  'Cable meggering on 11 kV switchgear incomer completed with insulation greater than 100 megaohms.',
  'Dye penetrant inspection conducted on fillet welds of suction nozzle.',
  'Poured 45 cubic meters of M35 grade RCC for heavy reciprocating compressor base.',
  'Loop check from field pressure transmitter PT-104 to DCS console verified successfully.',
  'Erected structural pipe rack modules PR-01 and PR-02 using 100-ton hydraulic crane.',
  'Flange alignment on suction line checked for parallel gap within 0.5 mm tolerance.',
  'Terminated optical fiber backbone cable in telecom patch panel at control room.',
  'Installed cathodic protection sacrificial zinc anodes along buried flowline trench.',
  'Torqued all foundation anchor bolts to 850 Newton meters using calibrated hydraulic torque wrench.',
  'Conducted spark testing on external three-layer polyethylene coating of line pipe.',
  'Installed motor-operated valve MOV-201 with actuator limit switch calibration.',
  'Poured sulfur resistant cement concrete grout under turbine base frame.',
];

terminology.forEach((text, idx) => {
  items.push({
    id: `VOICE-TERM-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'TERMINOLOGY_HEAVY',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
  });
});

// 4. 10 Noisy / Fragmented transcripts
const noisy = [
  'Yeah hello, compressor... excavation done... eighty percent rebar done... lots of background noise here.',
  'Site update... pipe line 120 meter... welder generator stopped... valve came late.',
  'Shelter steel... crane was waiting... finished around sixty percent today.',
  'Header weld... NDT guys coming night shift... joint prep complete.',
  'Substation cable tray... finished full... waiting for inspector signoff.',
  'Water in trench... pump running... concrete tomorrow morning.',
  'Three valves fixed... gasket missing for fourth valve.',
  'Pressure test okay... cooling water line cleared.',
  'Grading machine breakdown... ninety percent earthwork done.',
  'Fabrication shop... 75 percent supports ready... paint drying.',
];

noisy.forEach((text, idx) => {
  items.push({
    id: `VOICE-NOISE-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'NOISY_FRAGMENTED',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
  });
});

// 5. 10 Temporal Expression transcripts
const temporal = [
  'Yesterday we finished underground piping. Today we are backfilling.',
  'Concrete pour is planned for tomorrow morning at compressor foundation.',
  'Excavation completed two days ago and dewatering has been active since Monday.',
  'Valve delivery was delayed yesterday by supplier logistics.',
  'Planned hydrotest tomorrow afternoon after radiography clearance.',
  'Cable laying started yesterday and continued through today shift.',
  'Tomorrow team will start shuttering for the second lift of foundation.',
  'PCC was completed yesterday; rebar installation started today.',
  'Yesterday night shift completed radiographic testing on all field joints.',
  'Delivery of motor expected tomorrow; skid alignment on hold until then.',
];

temporal.forEach((text, idx) => {
  items.push({
    id: `VOICE-TEMP-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'TEMPORAL_EXPRESSIONS',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
    expectedTemporalResolution: text.includes('Yesterday') ? '2026-09-15' : text.includes('tomorrow') ? '2026-09-17' : '2026-09-16',
  });
});

// 6. 10 Explicit Negation transcripts (Section 61 Safety Rule)
const negation = [
  'Compressor foundation concrete pour has NOT started yet.',
  'Piping welding has not commenced due to rain.',
  'No structural steel was erected on shift today.',
  'Cable pulling has not begun because trays are pending inspection.',
  'Foundation excavation is NOT complete; water seepage stopped work.',
  'Valve installation abhi tak shuru nahi hua hai.',
  'No material has arrived from the central warehouse today.',
  'Hydrostatic testing did not start because blind flanges were missing.',
  'Grouting work has not started beneath compressor base.',
  'Reinforcement steel tying nahi hua hai today.',
];

negation.forEach((text, idx) => {
  items.push({
    id: `VOICE-NEG-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'NEGATION',
    transcriptText: text,
    language: text.includes('nahi') ? 'hinglish' : 'en',
    expectedEventsCount: 1,
    expectedNegation: true,
    expectedSelfCorrection: false,
    expectedStatus: 'BLOCKED',
  });
});

// 7. 5 Self-Correction transcripts (Section 62)
const selfCorrection = [
  'Foundation excavation progress is 80—sorry, 70 percent complete today.',
  'We welded 15—actually 12 pipe joints on the header today.',
  'Progress is 90 percent—no make that 85 percent on cable trays.',
  'Erected 4—sorry 3 structural columns for compressor shelter.',
  'Foundation depth is 4 meters—actually 3.5 meters verified by surveyor.',
];

selfCorrection.forEach((text, idx) => {
  items.push({
    id: `VOICE-SELF-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'SELF_CORRECTION',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: true,
  });
});

// 8. 5 Ambiguous transcripts (Requiring Planner Review)
const ambiguous = [
  'Some work was done near the compressor area today.',
  'Workers did miscellaneous civil maintenance around the site.',
  'Piping guys worked on several lines across the yard.',
  'Checked electrical connections in one of the panels.',
  'Site preparation active with a few laborers present.',
];

ambiguous.forEach((text, idx) => {
  items.push({
    id: `VOICE-AMBIG-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'AMBIGUOUS',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
  });
});

// 9. 5 Duplicate-Like transcripts (Section 27)
const duplicates = [
  'Compressor foundation excavation is 80 percent complete today.',
  'Compressor foundation excavation is 80 percent complete today.',
  'Piping team completed 120 meters of underground pipe today.',
  'Piping team completed 120 meters of underground pipe today.',
  'Cable tray installation in substation yard is 100 percent complete.',
];

duplicates.forEach((text, idx) => {
  items.push({
    id: `VOICE-DUP-${(idx + 1).toString().padStart(2, '0')}`,
    category: 'DUPLICATE',
    transcriptText: text,
    language: 'en',
    expectedEventsCount: 1,
    expectedNegation: false,
    expectedSelfCorrection: false,
  });
});

const outPath = path.resolve(__dirname, '../data/benchmark/voice-evaluation.json');
fs.writeFileSync(outPath, JSON.stringify({ totalTranscripts: items.length, items }, null, 2));
console.log(`Generated ${items.length} voice evaluation benchmark transcripts at ${outPath}`);
