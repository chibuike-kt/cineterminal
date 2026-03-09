import { LayoutEngine } from '../core/layout-engine';
import { Scheduler } from '../core/scheduler';
import { CineTerminalConfig } from '../config/types';
import { getTheme } from '../themes';
export declare abstract class BaseScene {
    protected layout: LayoutEngine;
    protected scheduler: Scheduler;
    protected config: CineTerminalConfig;
    protected theme: ReturnType<typeof getTheme>;
    constructor(layout: LayoutEngine, scheduler: Scheduler, config: CineTerminalConfig);
    abstract get name(): string;
    abstract mount(): void;
    unmount(): void;
    protected get width(): number;
    protected get height(): number;
    protected get speed(): number;
    protected get density(): number;
}
