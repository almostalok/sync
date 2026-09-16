export class DependencyScorer {
  /**
   * Scores logical dependency sequence likelihood.
   */
  public score(
    candidateActivityStatus?: string,
    predecessorsCompleted: boolean = true
  ): number {
    if (candidateActivityStatus === 'IN_PROGRESS' || candidateActivityStatus === 'DELAYED') {
      return 1.0;
    }
    if (predecessorsCompleted) {
      return 0.90;
    }
    return 0.60;
  }
}
