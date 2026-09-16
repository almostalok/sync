export class TemporalScorer {
  /**
   * Scores alignment between eventDate and activity's planned execution window.
   */
  public score(eventDateStr: string, plannedStartStr: string, plannedFinishStr: string): number {
    const eventTime = new Date(eventDateStr).getTime();
    const startTime = new Date(plannedStartStr).getTime();
    const finishTime = new Date(plannedFinishStr).getTime();

    if (isNaN(eventTime) || isNaN(startTime) || isNaN(finishTime)) {
      return 0.5;
    }

    // Inside planned execution window
    if (eventTime >= startTime && eventTime <= finishTime) {
      return 1.0;
    }

    const DAY_MS = 1000 * 60 * 60 * 24;
    const distDays = eventTime < startTime
      ? Math.round((startTime - eventTime) / DAY_MS)
      : Math.round((eventTime - finishTime) / DAY_MS);

    if (distDays <= 7) return 0.85;
    if (distDays <= 14) return 0.70;
    if (distDays <= 30) return 0.50;

    return 0.30;
  }
}
