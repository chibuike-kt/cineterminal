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

export class Pane {
  public readonly id: string;
  private box: blessed.Widgets.BoxElement;
  private lines: string[] = [];
  private maxLines: number;

  constructor(screen: blessed.Widgets.Screen, opts: PaneOptions) {
    this.id = opts.id;
    this.maxLines = opts.maxLines ?? 500;

    this.box = blessed.box({
      label: opts.label ? ` ${opts.label} ` : undefined,
      top: opts.top,
      left: opts.left,
      width: opts.width,
      height: opts.height,
      tags: true,
      scrollable: opts.scrollable ?? true,
      alwaysScroll: true,
      scrollbar: { style: { bg: opts.theme.borderColor } },
      border: opts.border !== false ? { type: 'line' } : undefined,
      style: {
        fg: opts.theme.primary,
        bg: opts.theme.bg,
        border: { fg: opts.theme.borderColor },
        label: { fg: opts.theme.secondary },
        scrollbar: { bg: opts.theme.borderColor },
      },
    });

    screen.append(this.box);
  }

  appendLine(line: string): void {
    this.lines.push(line);
    if (this.lines.length > this.maxLines) this.lines.shift();
    this.box.setContent(this.lines.join('\n'));
    this.box.setScrollPerc(100);
  }

  setContent(content: string): void {
    this.lines = content.split('\n');
    this.box.setContent(content);
  }

  setLine(index: number, content: string): void {
    while (this.lines.length <= index) this.lines.push('');
    this.lines[index] = content;
    this.box.setContent(this.lines.join('\n'));
  }

  clear(): void {
    this.lines = [];
    this.box.setContent('');
  }

  setLabel(label: string): void {
    this.box.setLabel(` ${label} `);
  }

  get innerWidth(): number { return (this.box.width as number) - 2; }
  get innerHeight(): number { return (this.box.height as number) - 2; }
  get lineCount(): number { return this.lines.length; }
  get raw(): blessed.Widgets.BoxElement { return this.box; }

  destroy(): void { this.box.destroy(); }
}
