import { ThemeConfig, ThemeName } from '../config/types';

const themes: Record<ThemeName, ThemeConfig> = {
  matrix: {
    primary: '#00ff41', secondary: '#007a1f', alert: '#ffcc00',
    success: '#00ff41', bg: 'black', borderColor: '#005c16',
  },
  ghost: {
    primary: '#a0d8ef', secondary: '#4a7fa5', alert: '#ff6b9d',
    success: '#7efff5', bg: 'black', borderColor: '#1e3a5f',
  },
  redteam: {
    primary: '#ff3131', secondary: '#8b0000', alert: '#ff8c00',
    success: '#ff3131', bg: 'black', borderColor: '#5c0000',
  },
  iceberg: {
    primary: '#c0caf5', secondary: '#565f89', alert: '#f7768e',
    success: '#9ece6a', bg: 'black', borderColor: '#292e42',
  },
  gold: {
    primary: '#ffd700', secondary: '#b8860b', alert: '#ff6347',
    success: '#adff2f', bg: 'black', borderColor: '#5a4500',
  },
};

export function getTheme(name: ThemeName): ThemeConfig {
  return themes[name] ?? themes.matrix;
}

export { themes };
