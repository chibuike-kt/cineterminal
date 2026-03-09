export const BOX = {
  topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
  horizontal: '-', vertical: '¦', tLeft: '+', tRight: '¦',
  tTop: '-', tBottom: '-', cross: '+',
  dTopLeft: '+', dTopRight: '+', dBottomLeft: '+', dBottomRight: '+',
  dHorizontal: '-', dVertical: '¦',
  bHorizontal: '?', bVertical: '?',
  dot: '·', bullet: '•', arrow: '›', arrowLeft: '‹',
  diamond: '?', circle: '?', filledCircle: '?',
  triangleRight: '?', triangleLeft: '?',
} as const;

export function hRule(width: number, char = BOX.horizontal): string {
  return char.repeat(width);
}

export function sectionHeader(label: string, width: number): string {
  const inner = ` ${label} `;
  const remaining = width - inner.length - 2;
  const left = Math.floor(remaining / 2);
  const right = remaining - left;
  return BOX.horizontal.repeat(left) + inner + BOX.horizontal.repeat(right);
}

export const SPINNER_FRAMES = {
  dots: ['?','?','?','?','?','?','?','?','?','?'],
  line: ['|','/','-','\\'],
  pulse: ['¦','¦','¦','¦','¦','¦'],
  arrows: ['?','?','?','?','?','?','?','?'],
  radar: ['?','?','?','?'],
  scan: ['?','?','?','¦','?','?','?','¦','?','?','?','¦','?','?'],
} as const;

export type SpinnerType = keyof typeof SPINNER_FRAMES;

export function spinnerFrame(type: SpinnerType, tick: number): string {
  const frames = SPINNER_FRAMES[type];
  return frames[tick % frames.length];
}

export function signalBars(strength: number, max = 5): string {
  const chars = ['?','?','?','_','?','?','?','¦'];
  const filled = Math.round((strength / max) * chars.length);
  return chars.slice(0, filled).join('') + ' '.repeat(chars.length - filled);
}
