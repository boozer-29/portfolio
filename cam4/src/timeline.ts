import {Easing, interpolate} from 'remotion';
import beatsJson from './generated/beats.json';
import cues from './cues.json';
import {FPS} from './constants';
import {ez, IO, OUT, sp} from './util';

// ---------------------------------------------------------------- clock
export const SKIP_FRAME = 1103; // clock jumps +80 s under a 6-frame white flash
export const SKIP_FLASH: [number, number] = [1100, 1106];
const T0 = 2 * 3600 + 58 * 60 + 10; // 2:58:10 at frame 480

export const clockSec = (f: number) => T0 + (f - 480) / FPS + (f >= SKIP_FRAME ? 80 : 0);

/** CAM 4 runs behind the real clock: 3 s, until the lag collapses at the end. */
export const lagSec = (f: number) =>
  interpolate(f, [1650, 1700], [3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
export const cam4Sec = (f: number) => clockSec(f) - lagSec(f);

export const fmt = (sec: number) => {
  const s = Math.floor(sec + 1e-6);
  const h = Math.floor(s / 3600) % 24;
  const m = Math.floor(s / 60) % 60;
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
};
export const clockText = (f: number) => fmt(clockSec(f));
export const cam4Text = (f: number) => fmt(cam4Sec(f));

// ---------------------------------------------------------------- battery
export const battery = (f: number) => (f < 1170 ? 41 : f < 1380 ? 40 : f < 1650 ? 39 : 38);
/** 0..1 pulse right after a battery change (HUD flashes red + pops) */
export const batteryPulse = (f: number) => {
  const marks = [1170, 1380, 1650];
  let best = 0;
  for (const m of marks) if (f >= m) best = Math.max(best, 1 - ez(f, m, m + 18, 0, 1, OUT));
  return f >= 1170 ? best : 0;
};

// ---------------------------------------------------------------- hallway bulb
export const BULB_TOGGLES = [600, 604, 607, 611, 614, 618, 621, 625];
export const BULB_DIES = 630;
export const NV_ON = 640;
export const bulbOn = (f: number) => {
  if (f >= BULB_DIES) return false;
  let on = true;
  for (const t of BULB_TOGGLES) if (f >= t) on = !on;
  return on;
};

// ---------------------------------------------------------------- screen flickers: a Quiet moves closer
export const SCREEN_FLICKERS = [668, 722, 776, 830, 884, 930];
export const flickerSteps = (f: number) => SCREEN_FLICKERS.filter((t) => f >= t + 1).length;
/** true for the 3 frames of dropout */
export const inFlicker = (f: number) => SCREEN_FLICKERS.some((t) => f >= t && f < t + 3);

// ---------------------------------------------------------------- door knocks
export const KNOCKS = [990, 1020, 1050];
export const knockRed = (f: number) => KNOCKS.some((k) => f >= k && f < k + 3);

// ---------------------------------------------------------------- heartbeat
export const BEATS: number[] = (beatsJson as {beats: number[]}).beats;
/** 0..1 thump envelope, springs on every audible beat (lub + dub) */
export const beatPulse = (f: number) => {
  let v = 0;
  for (const b of BEATS) {
    const d = f - b;
    if (d >= 0 && d < 10) {
      v = Math.max(v, 1 - ez(d, 0, 7, 0, 1, OUT));
    } else if (d >= 4 && d < 14) {
      v = Math.max(v, 0.6 * (1 - ez(d, 4, 11, 0, 1, OUT)));
    }
  }
  return v;
};

// ---------------------------------------------------------------- screen shake from every sound cue
type Cue = {id: string; frame: number; shake: number};
const CUES = (cues as {oneshots: Cue[]}).oneshots;
export const shakeAt = (f: number) => {
  let x = 0;
  let y = 0;
  for (const c of CUES) {
    const t = f - c.frame;
    if (t < 0 || t > 6 || c.shake <= 0) continue;
    // damped spring, 6 frames, 1 -> 0 with a little overshoot
    const env = 1 - sp(t, 0, {damping: 11, stiffness: 240, mass: 0.6}, 6);
    const ph = (c.frame * 12.9898) % 6.28318;
    x += c.shake * env * Math.cos(t * 2.3 + ph);
    y += c.shake * 0.8 * env * Math.sin(t * 2.9 + ph * 1.3);
  }
  return {x, y};
};

// ---------------------------------------------------------------- chromatic aberration (px), tense beats only
export const chroma = (f: number) => {
  let a = 0;
  const bump = (at: number, amp: number, len = 14) => {
    if (f >= at && f < at + len) a = Math.max(a, amp * (1 - ez(f, at, at + len, 0, 1, OUT)));
  };
  bump(15, 4, 20); // alert slam
  [110, 150, 190].forEach((t) => bump(t, 3, 8)); // Quiet flashes
  BULB_TOGGLES.forEach((t) => bump(t, 2, 4));
  bump(BULB_DIES, 4, 12);
  SCREEN_FLICKERS.forEach((t) => bump(t, 5, 12));
  KNOCKS.forEach((t) => bump(t, 5, 12));
  bump(SKIP_FRAME, 6, 12);
  if (f >= 1500 && f < 1620) a = Math.max(a, ez(f, 1500, 1580, 0, 2.2)); // unfold
  if (f >= 1620 && f < 1740) a = Math.max(a, ez(f, 1620, 1710, 0.8, 4.5));
  bump(1712, 8, 14); // contact
  return a;
};
