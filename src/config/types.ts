export type SceneMode = 'breach' | 'satellite' | 'trace' | 'code-storm' | 'ops-center';

export type ThemeName = 'matrix' | 'ghost' | 'redteam' | 'iceberg' | 'gold';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  alert: string;
  success: string;
  bg: string;
  borderColor: string;
}

export interface SceneConfig {
  mode: SceneMode;
  duration: number;
  speed?: number;
}

export interface CineTerminalConfig {
  scenes: SceneConfig[];
  theme: ThemeName;
  speed: number;
  density: number;
  statusBar: boolean;
  titleSplash: boolean;
  exitWhenDone: boolean;
}

export const DEFAULT_CONFIG: CineTerminalConfig = {
  scenes: [{ mode: 'breach', duration: 0 }],
  theme: 'matrix',
  speed: 1.0,
  density: 1.0,
  statusBar: true,
  titleSplash: true,
  exitWhenDone: false,
};
