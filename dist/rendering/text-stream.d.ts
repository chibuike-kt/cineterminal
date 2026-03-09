import { Pane } from './pane';
import { Scheduler } from '../core/scheduler';
export type LineSource = string[] | (() => string) | (() => string[]);
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
export declare class TextStream {
    private id;
    private pane;
    private scheduler;
    private source;
    private intervalMs;
    private linesPerTick;
    private prefix;
    private cycle;
    private onExhausted?;
    private arrayIndex;
    constructor(opts: TextStreamOptions);
    start(): void;
    stop(): void;
    private _emit;
    private _getLines;
    setInterval(ms: number): void;
    setDensity(linesPerTick: number): void;
}
