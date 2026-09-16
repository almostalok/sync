/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Guarantees identical output streams for identical seeds across runs.
 */
export class PRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random float between 0 (inclusive) and 1 (exclusive).
   */
  public next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer between min (inclusive) and max (inclusive).
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random item from an array.
   */
  public pick<T>(items: readonly T[] | T[]): T {
    if (!items || items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }

  /**
   * Shuffles an array in place using Fisher-Yates with deterministic PRNG.
   */
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Picks multiple unique items from an array.
   */
  public sample<T>(items: readonly T[] | T[], count: number): T[] {
    const shuffled = this.shuffle([...items]);
    return shuffled.slice(0, Math.min(count, items.length));
  }

  /**
   * Returns true with a given probability (0.0 to 1.0).
   */
  public chance(probability: number): boolean {
    return this.next() < probability;
  }
}
