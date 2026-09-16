import { ExtractedEntity, EntityType } from '../matching.types';
import { EQUIPMENT_TAGS } from '../../../../../../data/synthetic/dictionaries/equipment';
import { PROJECT_LOCATIONS } from '../../../../../../data/synthetic/dictionaries/locations';

export class EntityExtractorService {
  private static ACTIVITY_TYPES = [
    'excavation',
    'pcc',
    'reinforcement',
    'formwork',
    'concrete',
    'backfilling',
    'grouting',
    'fabrication',
    'erection',
    'fit-up',
    'welding',
    'ndt',
    'hydrotest',
    'flushing',
    'insulation',
    'positioning',
    'alignment',
    'cable pulling',
    'termination',
    'earthing',
    'energization',
    'calibration',
    'loop check',
    'inspection',
    'commissioning',
  ];

  private static SECTION_PATTERNS = [
    /\b(north|south|east|west)\s+(section|bay|side|grid|zone)\b/gi,
    /\b(block\s+[a-z0-9]+)\b/gi,
    /\b(tier\s+[0-9]+)\b/gi,
    /\b(train\s+[0-9]+)\b/gi,
    /\b(pit\s+[a-z0-9]+)\b/gi,
  ];

  /**
   * Extracts typed entities from normalized text.
   */
  public extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const seen = new Set<string>();

    const addEntity = (entityText: string, type: EntityType, confidence: number = 0.9) => {
      const key = `${type}:${entityText.toLowerCase()}`;
      if (!seen.has(key) && entityText.trim().length > 1) {
        seen.add(key);
        entities.push({ text: entityText.trim(), type, confidence });
      }
    };

    // 1. Extract Equipment Tags (e.g. C-101, C101, GT-101, TR-01, V-201, JB-101)
    for (const eq of EQUIPMENT_TAGS) {
      const tagVariants = [
        eq.tag,
        eq.tag.replace('-', ''), // e.g. C101
        eq.name,
      ];

      for (const variant of tagVariants) {
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        if (regex.test(text)) {
          addEntity(eq.tag, EntityType.EQUIPMENT, 0.95);
          break;
        }
      }
    }

    // Generic equipment tag regex (e.g. [A-Z]{1,3}-\d{2,4}[A-Z]?)
    const genericTagRegex = /\b([A-Z]{1,3}-?\d{2,4}[A-Z]?)\b/g;
    let match: RegExpExecArray | null;
    while ((match = genericTagRegex.exec(text)) !== null) {
      const tagStr = match[1];
      if (!['PCC', 'NDT', 'DPR', 'PTW', 'HSE', 'DCS', 'ESD', 'MCC', 'GTAW', 'SMAW'].includes(tagStr.toUpperCase())) {
        addEntity(tagStr, EntityType.TAG, 0.85);
      }
    }

    // 2. Extract Locations & Project Areas
    for (const loc of PROJECT_LOCATIONS) {
      const locRegex = new RegExp(`\\b${loc.name}\\b`, 'gi');
      if (locRegex.test(text)) {
        addEntity(loc.name, EntityType.LOCATION, 0.95);
      }
      for (const sub of loc.subLocations) {
        const subRegex = new RegExp(`\\b${sub}\\b`, 'gi');
        if (subRegex.test(text)) {
          addEntity(sub, EntityType.LOCATION, 0.9);
        }
      }
    }

    // 3. Extract Activity Types
    for (const actType of EntityExtractorService.ACTIVITY_TYPES) {
      const regex = new RegExp(`\\b${actType}\\b`, 'gi');
      if (regex.test(text)) {
        addEntity(actType.toUpperCase(), EntityType.ACTIVITY_TYPE, 0.9);
      }
    }

    // 4. Extract Sections & Sub-scopes
    for (const secPattern of EntityExtractorService.SECTION_PATTERNS) {
      const matches = text.matchAll(secPattern);
      for (const m of matches) {
        if (m[0]) {
          addEntity(m[0], EntityType.SECTION, 0.85);
        }
      }
    }

    return entities;
  }
}
