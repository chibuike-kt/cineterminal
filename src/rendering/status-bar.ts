import * as blessed from 'blessed';
import chalk from 'chalk';
import { ThemeConfig } from '../config/types';
import { Scheduler } from '../core/scheduler';
import { formatTime } from '../utils/format';
import { randInt, randFloat } from '../utils/random';

function spinnerFrame(tick: number): string {
  const frames = ['?','?','?','?','?','?','?','?','?','?'];
  return frames[tick % frames.length];
}

function signalBars(strength: number, max: number): string {
  const chars = ['?','?','?','_','?','?','?','¦'];
  const filled = Math.round((strength / max) * chars.length);
  return chars.slice(0, filled).join('');
}

export class StatusBar {
  private box: blessed.Widgets.BoxElement;
  private theme: ThemeConfig;
  private sceneName: string = '';

  constructor(screen: blessed.Widgets.Screen, theme: ThemeConfig, scheduler: Scheduler) {
    this.theme = theme;

    this.box = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      tags: true,
      style: { fg: theme.secondary, bg: 'black' },
    });

    screen.append(this.box);

    scheduler.every('__statusBar', 250, (tick) => {
      this.render(screen.width as number, tick);
    });
  }

  setScene(name: string): void {
    this.sceneName = name.toUpperCase();
  }

  private render(width: number, tick: number): void {
    const time = chalk.dim(formatTime());
    const scene = this.sceneName
      ? chalk.hex(this.theme.primary)(` ? ${this.sceneName} `)
      : '';

    const latency = `${randFloat(0.5, 200).toFixed(1)}ms`;
    const signal = signalBars(randInt(3, 8), 8);
    const procs = randInt(80, 512);
    const cpu = randInt(10, 95);
    const spinner = spinnerFrame(tick);

    const left = ` ${spinner} ${time}${scene}`;
    const right = `CPU:${cpu}%  PROC:${procs}  SIG:${signal}  LAT:${latency} `;

    const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');
    const leftLen = stripAnsi(left).length;
    const rightLen = stripAnsi(right).length;
    const mid = ' '.repeat(Math.max(0, width - leftLen - rightLen));

    this.box.setContent(
      chalk.dim(left) + chalk.dim(mid) + chalk.hex(this.theme.secondary)(right)
    );
  }
}
