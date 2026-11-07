export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const TOTAL = 1800;

export const C = {
  bg: '#05070D',
  panel: '#0F1420',
  red: '#FF3B30',
  nv: '#7CFF9B',
  text: '#FFFFFF',
  lime: '#C6FF3D',
};

// Phone screen rectangle in canvas px.
export const SCREEN = {x: 36, y: 36, w: 1008, h: 1404, r: 64};
// Feed art is drawn in this logical space and scaled to the screen.
export const ART = {w: 1000, h: 1400};

export const SCENES = {
  S1: [0, 90],
  S2: [90, 270],
  S3: [270, 600],
  S4: [600, 960],
  S5: [960, 1380],
  S6: [1380, 1620],
  S7: [1620, 1740],
  END: [1740, 1800],
} as const;

export const FONT_HUD = "'Oswald', 'Arial Narrow', sans-serif";
export const FONT_CAP = "'Montserrat', 'Arial Black', sans-serif";
