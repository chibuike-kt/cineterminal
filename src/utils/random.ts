export function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rand = Math.random.bind(Math);

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number): number {
  return rand() * (max - min) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = randInt(0, copy.length - 1);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

export function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function chance(p: number): boolean {
  return rand() < p;
}

export function zeroPad(str: string, width: number): string {
  return str.padStart(width, '0');
}

export function randHex(bytes: number): string {
  return Array.from({ length: bytes }, () =>
    randInt(0, 255).toString(16).padStart(2, '0')
  ).join('');
}

export function randIPv4(): string {
  return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

export function randMAC(): string {
  return Array.from({ length: 6 }, () =>
    randInt(0, 255).toString(16).padStart(2, '0')
  ).join(':');
}
