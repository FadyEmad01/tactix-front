export type ThemeMode = "light" | "dark";

export interface HSLAdjustments {
  hueShift: number;
  saturationScale: number;
  lightnessScale: number;
}

export interface ThemeStyles {
  [key: string]: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  styles: {
    light: ThemeStyles;
    dark: ThemeStyles;
  };
}

export interface ThemeEditorState {
  styles: {
    light: ThemeStyles;
    dark: ThemeStyles;
  };
  currentMode: ThemeMode;
  hslAdjustments: HSLAdjustments;
}
