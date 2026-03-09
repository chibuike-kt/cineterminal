import { ThemeConfig, ThemeName } from '../config/types';
declare const themes: Record<ThemeName, ThemeConfig>;
export declare function getTheme(name: ThemeName): ThemeConfig;
export { themes };
