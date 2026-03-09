const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

export function visibleLength(str: string): number {
  return str.replace(ANSI_REGEX, '').length;
}

export function truncate(str: string, max: number, ellipsis = '…'): string {
  const visible = str.replace(ANSI_REGEX, '');
  if (visible.length <= max) return str;
  return visible.slice(0, max - ellipsis.length) + ellipsis;
}

export function padLeft(str: string, width: number, char = ' '): string {
  const len = visibleLength(str);
  return len >= width ? str : char.repeat(width - len) + str;
}

export function padRight(str: string, width: number, char = ' '): string {
  const len = visibleLength(str);
  return len >= width ? str : str + char.repeat(width - len);
}

export function center(str: string, width: number, char = ' '): string {
  const len = visibleLength(str);
  if (len >= width) return str;
  const total = width - len;
  const left = Math.floor(total / 2);
  const right = total - left;
  return char.repeat(left) + str + char.repeat(right);
}

export function formatTime(date: Date = new Date()): string {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':');
}

export function formatTimeMs(date: Date = new Date()): string {
  return formatTime(date) + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

export function repeat(char: string, n: number): string {
  return n > 0 ? char.repeat(n) : '';
}

export function progressBar(
  percent: number,
  width: number,
  filled = '¦',
  empty = '¦'
): string {
  const filledCount = Math.round((percent / 100) * width);
  const emptyCount = width - filledCount;
  return filled.repeat(filledCount) + empty.repeat(emptyCount);
}
