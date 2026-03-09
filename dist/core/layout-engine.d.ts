import * as blessed from 'blessed';
import { Pane, PaneOptions } from '../rendering/pane';
import { ThemeConfig } from '../config/types';
import { Scheduler } from './scheduler';
export declare class LayoutEngine {
    readonly screen: blessed.Widgets.Screen;
    private panes;
    theme: ThemeConfig;
    private onQuit?;
    constructor(theme: ThemeConfig, scheduler: Scheduler);
    setQuitHandler(cb: () => void): void;
    get width(): number;
    get height(): number;
    createPane(opts: Omit<PaneOptions, 'theme'>): Pane;
    getPane(id: string): Pane | undefined;
    destroyPane(id: string): void;
    destroyAllPanes(): void;
    setTheme(theme: ThemeConfig): void;
    shutdown(): void;
}
