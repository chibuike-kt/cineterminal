import { Pane } from './pane';
import { Scheduler } from '../core/scheduler';

export type LineSource =
  | string[]
  | (() => string)
  | (() => string[]);

export interface TextStreamOptions {
  id: string;
  pane: Pane;
  scheduler: Scheduler;
  source: LineSource;
  intervalMs?: number;
  linesPerTick?: number;
  prefix?: string | (() => string);
  cycle?: boolean;
  onExhausted?: () => void;
}

export class TextStream {
  private id: string;
  private pane: Pane;
  private scheduler: Scheduler;
  private source: LineSource;
  private intervalMs: number;
  private linesPerTick: number;
  private prefix: string | (() => string);
  private cycle: boolean;
  private onExhausted?: () => void;
  private arrayIndex = 0;

  constructor(opts: TextStreamOptions) {
    this.id = opts.id;
    this.pane = opts.pane;
    this.scheduler = opts.scheduler;
    this.source = opts.source;
    this.intervalMs = opts.intervalMs ?? 120;
    this.linesPerTick = opts.linesPerTick ?? 1;
    this.prefix = opts.prefix ?? '';
    this.cycle = opts.cycle ?? true;
    this.onExhausted = opts.onExhausted;
  }

  start(): void {
    this.scheduler.every(this.id, this.intervalMs, () => { this._emit(); });
  }

  stop(): void {
    this.scheduler.cancel(this.id);
  }

  private _emit(): void {
    const lines = this._getLines();
    for (const line of lines) {
      const pfx = typeof this.prefix === 'function' ? this.prefix() : this.prefix;
      this.pane.appendLine(pfx + line);
    }
  }

  private _getLines(): string[] {
    const result: string[] = [];
    if (typeof this.source === 'function') {
      const output = this.source();
      if (Array.isArray(output)) {
        result.push(...output.slice(0, this.linesPerTick));
      } else {
        for (let i = 0; i < this.linesPerTick; i++) {
          result.push((this.source as () => string)());
        }
      }
    } else {
      for (let i = 0; i < this.linesPerTick; i++) {
        if (this.arrayIndex >= this.source.length) {
          if (this.cycle) { this.arrayIndex = 0; }
          else { this.onExhausted?.(); this.stop(); return result; }
        }
        result.push(this.source[this.arrayIndex++]);
      }
    }
    return result;
  }

  setInterval(ms: number): void {
    this.intervalMs = ms;
    if (this.scheduler.has(this.id)) { this.stop(); this.start(); }
  }

  setDensity(linesPerTick: number): void {
    this.linesPerTick = linesPerTick;
  }
}
