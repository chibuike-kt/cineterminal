import * as blessed from 'blessed';
import { ThemeConfig } from '../config/types';
export interface PaneOptions {
    id: string;
    label?: string;
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
    theme: ThemeConfig;
    border?: boolean;
    scrollable?: boolean;
    maxLines?: number;
}
export declare class Pane {
    readonly id: string;
    private box;
    private lines;
    private maxLines;
    constructor(screen: blessed.Widgets.Screen, opts: PaneOptions);
    appendLine(line: string): void;
    setContent(content: string): void;
    setLine(index: number, content: string): void;
    clear(): void;
    setLabel(label: string): void;
    get innerWidth(): number;
    get innerHeight(): number;
    get lineCount(): number;
    get raw(): blessed.Widgets.BoxElement;
    destroy(): void;
}
