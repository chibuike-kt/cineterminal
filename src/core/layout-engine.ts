import * as blessed from 'blessed';
import { Pane, PaneOptions } from '../rendering/pane';
import { ThemeConfig } from '../config/types';
import { Scheduler } from './scheduler';

export class LayoutEngine {
  public readonly screen: blessed.Widgets.Screen;
  private panes: Map<string, Pane> = new Map();
  public theme: ThemeConfig;
  private onQuit?: () => void;

  constructor(theme: ThemeConfig, scheduler: Scheduler) {
    this.theme = theme;

    this.screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
      forceUnicode: true,
      title: 'CineTerminal',
      cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
        color: theme.primary,
      },
    });

    scheduler.every('__render', 50, () => {
      this.screen.render();
    });

    this.screen.key(['q', 'C-c'], () => {
      if (this.onQuit) this.onQuit();
      else this.shutdown();
    });
  }

  setQuitHandler(cb: () => void): void { this.onQuit = cb; }

  get width(): number { return this.screen.width as number; }
  get height(): number { return this.screen.height as number; }

  createPane(opts: Omit<PaneOptions, 'theme'>): Pane {
    if (this.panes.has(opts.id)) {
      this.panes.get(opts.id)!.destroy();
      this.panes.delete(opts.id);
    }
    const pane = new Pane(this.screen, { ...opts, theme: this.theme });
    this.panes.set(opts.id, pane);
    return pane;
  }

  getPane(id: string): Pane | undefined { return this.panes.get(id); }

  destroyPane(id: string): void {
    this.panes.get(id)?.destroy();
    this.panes.delete(id);
  }

  destroyAllPanes(): void {
    for (const pane of this.panes.values()) pane.destroy();
    this.panes.clear();
  }

  setTheme(theme: ThemeConfig): void { this.theme = theme; }

  shutdown(): void {
    this.screen.destroy();
    process.exit(0);
  }
}
