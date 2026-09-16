import { PRNG } from './prng';

// QWERTY keyboard adjacency map for realistic keyboard typos
const KEYBOARD_ADJACENCY: Record<string, string[]> = {
  a: ['q', 'w', 's', 'z'],
  b: ['v', 'g', 'h', 'n'],
  c: ['x', 'd', 'f', 'v'],
  d: ['s', 'e', 'r', 'f', 'c', 'x'],
  e: ['w', 's', 'd', 'r'],
  f: ['d', 'r', 't', 'g', 'v', 'c'],
  g: ['f', 't', 'y', 'h', 'b', 'v'],
  h: ['g', 'y', 'u', 'j', 'n', 'b'],
  i: ['u', 'j', 'k', 'o'],
  j: ['h', 'u', 'i', 'k', 'm', 'n'],
  k: ['j', 'i', 'o', 'l', 'm'],
  l: ['k', 'o', 'p'],
  m: ['n', 'j', 'k'],
  n: ['b', 'h', 'j', 'm'],
  o: ['i', 'k', 'l', 'p'],
  p: ['o', 'l'],
  q: ['w', 'a'],
  r: ['e', 'd', 'f', 't'],
  s: ['a', 'w', 'e', 'd', 'x', 'z'],
  t: ['r', 'f', 'g', 'y'],
  u: ['y', 'h', 'j', 'i'],
  v: ['c', 'f', 'g', 'b'],
  w: ['q', 'a', 's', 'e'],
  x: ['z', 's', 'd', 'c'],
  y: ['t', 'g', 'h', 'u'],
  z: ['a', 's', 'x'],
};

export class TypoEngine {
  constructor(private prng: PRNG) {}

  /**
   * Applies realistic site-report typos to a text string based on intensity (0.0 - 1.0).
   */
  public applyTypos(text: string, intensity: number = 0.2): string {
    const words = text.split(' ');
    const noisyWords = words.map((word) => {
      // Don't mutate short acronyms or codes like C-101 or 85%
      if (word.length <= 3 || /^[A-Z0-9-]+$/.test(word) || /^\d+%?$/.test(word)) {
        return word;
      }

      if (!this.prng.chance(intensity)) {
        return word;
      }

      const mutationType = this.prng.nextInt(1, 4);
      const chars = word.split('');
      const charIdx = this.prng.nextInt(1, chars.length - 2); // Avoid first & last char

      switch (mutationType) {
        case 1: {
          // Transposition (e.g. foudnation)
          if (charIdx < chars.length - 1) {
            const temp = chars[charIdx];
            chars[charIdx] = chars[charIdx + 1];
            chars[charIdx + 1] = temp;
          }
          break;
        }
        case 2: {
          // Omission (e.g. comprsor)
          chars.splice(charIdx, 1);
          break;
        }
        case 3: {
          // Adjacency substitution (e.g. compredsor)
          const char = chars[charIdx].toLowerCase();
          const adjacent = KEYBOARD_ADJACENCY[char];
          if (adjacent && adjacent.length > 0) {
            chars[charIdx] = this.prng.pick(adjacent);
          }
          break;
        }
        case 4: {
          // Double letter typo (e.g. exxcavation)
          chars.splice(charIdx, 0, chars[charIdx]);
          break;
        }
      }

      return chars.join('');
    });

    return noisyWords.join(' ');
  }
}
