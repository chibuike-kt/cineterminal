import * as blessed from 'blessed';
import { ThemeConfig } from '../config/types';
import { Scheduler } from '../core/scheduler';
export declare class StatusBar {
    private box;
    private theme;
    private sceneName;
    constructor(screen: blessed.Widgets.Screen, theme: ThemeConfig, scheduler: Scheduler);
    setScene(name: string): void;
    private render;
}
