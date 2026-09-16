/**
 * SiteSync Master Prompt 9 — Supervisor Voice Agent Configuration
 */

export const VOICE_CONFIG = {
  // Audio Limits (Sections 4 & 74)
  LIMITS: {
    MAX_RECORDING_SECONDS: 300, // 5 minutes
    MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
    MIN_AUDIO_DURATION_SECONDS: 1.0,
    SIGNED_URL_EXPIRATION_SECONDS: 900, // 15 minutes
    VOICE_RETENTION_DAYS: 365,
  },

  // Supported MIME Types (Section 4)
  SUPPORTED_MIME_TYPES: [
    'audio/webm',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/m4a',
    'audio/mp4',
    'audio/ogg',
  ],

  // Hindi & Hinglish Field Jargon Dictionary (Section 10 & 11)
  HINGLISH_DICTIONARY: {
    // Verbs / Actions
    'ho gaya': 'completed',
    'ho gaya hai': 'completed',
    'khatam ho gaya': 'completed',
    'khatam': 'completed',
    'pura ho gaya': 'completed',
    'shuru hua': 'started',
    'shuru kiya': 'started',
    'chalu hai': 'in progress',
    'chal raha hai': 'in progress',
    'kaam chal raha hai': 'in progress',
    'baki hai': 'pending',
    'ruka hua hai': 'blocked',
    'ruk gaya': 'blocked',
    'late aaya': 'delayed',
    'der se aaya': 'delayed',
    'kal': 'yesterday',
    'aaj': 'today',
    'aane wala kal': 'tomorrow',

    // Construction Terms
    'kaam': 'work',
    'khudai': 'excavation',
    'mitti': 'earthwork',
    'dhalai': 'concreting',
    'sariya': 'reinforcement steel',
    'loha': 'steel',
    'pipe': 'piping',
    'jod': 'joint',
    'taar': 'cable',
    'pani': 'water',
    'kachha': 'temporary',
    'pakka': 'permanent',
  } as Record<string, string>,

  // Negation Particles (Section 61: "Concrete pour has NOT started" must NOT become ACTIVITY_STARTED)
  NEGATION_TERMS: [
    'not',
    'no',
    'never',
    'nahi',
    'nahin',
    'mat',
    'na',
    'pending',
    'unfinished',
    'without',
    'haven\'t',
    'hasn\'t',
    'didn\'t',
    'incomplete',
  ],

  // Self-Correction Indicators (Section 62: "80—sorry, 70 percent")
  SELF_CORRECTION_PATTERNS: [
    /—\s*sorry\s*,?\s*/i,
    /sorry\s*,?\s*/i,
    /actually\s*,?\s*/i,
    /rather\s*,?\s*/i,
    /make that\s*,?\s*/i,
    /i mean\s*,?\s*/i,
    /(?:no|nahi)\s*,\s*(?:sorry|actually|wait|make that|galti se)/i,
    /galti se\s*,?\s*/i,
  ],

  // Epistemic Modality Keywords (Section 60)
  EPISTEMIC_PATTERNS: {
    FACT: /\b(completed|finished|done|poured|welded|installed|erected|inspected|verified|ho gaya)\b/i,
    PLAN: /\b(planned|scheduled|tomorrow|next day|expected|will be|target|plan hai|karna hai)\b/i,
    ESTIMATE: /\b(about|approx|approximately|around|roughly|nearly|almost|lagbhag|aaspas)\b/i,
    HEARSAY: /\b(said|told me|reported by|according to|engineer said|supervisor said|bol rahe the)\b/i,
    UNCERTAINTY: /\b(maybe|perhaps|probably|not sure|seems like|might be|lagta hai|shayad)\b/i,
    NEGATION: /\b(not|no|nahi|nahin|has not|did not|pending|ruk|stopped|unfulfilled)\b/i,
  },
};
