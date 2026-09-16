export class WBSScorer {
  public score(eventWbsHint?: string, activityWbsPath?: string): number {
    if (!eventWbsHint || !activityWbsPath) {
      return 0.80; // Compatible branch default when report omits WBS code
    }

    const cleanEventWbs = eventWbsHint.trim();
    const cleanActWbs = activityWbsPath.trim();

    if (cleanActWbs.includes(cleanEventWbs)) {
      return 1.0; // Exact branch match
    }

    // Compare level prefix (e.g. 1.1.1 vs 1.1.2)
    const eventParts = cleanEventWbs.split(/[\s.>]+/);
    const actParts = cleanActWbs.split(/[\s.>]+/);

    let commonPrefix = 0;
    const minLen = Math.min(eventParts.length, actParts.length);
    for (let i = 0; i < minLen; i++) {
      if (eventParts[i] === actParts[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }

    if (commonPrefix >= 3) return 0.85;
    if (commonPrefix >= 2) return 0.70;
    if (commonPrefix >= 1) return 0.40;

    return 0.20;
  }
}
