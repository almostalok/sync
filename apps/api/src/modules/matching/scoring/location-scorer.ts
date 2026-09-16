export class LocationScorer {
  public score(eventLocation?: string, activityLocation?: string): number {
    if (!eventLocation || !activityLocation) {
      return 0.5; // Unknown
    }

    const normEventLoc = eventLocation.toLowerCase().trim();
    const normActLoc = activityLocation.toLowerCase().trim();

    if (normEventLoc === normActLoc) {
      return 1.0; // Exact match
    }

    // Sub-sector / Area overlap check (e.g. "Compressor Area" vs "Compressor Area - Train 1")
    if (normActLoc.includes(normEventLoc) || normEventLoc.includes(normActLoc)) {
      return 0.95;
    }

    const eventTokens = normEventLoc.split(/[\s-]+/);
    const actTokens = new Set(normActLoc.split(/[\s-]+/));
    const overlap = eventTokens.filter((t) => t.length > 3 && actTokens.has(t));

    if (overlap.length > 0) {
      return 0.75;
    }

    return 0.1; // Location conflict
  }
}
