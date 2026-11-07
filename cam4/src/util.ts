import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './constants';

export const IO = Easing.inOut(Easing.cubic);
export const OUT = Easing.out(Easing.cubic);
export const OUTQ = Easing.out(Easing.quad);
export const IN = Easing.in(Easing.cubic);

/** Clamped, eased interpolation. Never linear. */
export const ez = (
  f: number,
  a: number,
  b: number,
  v0 = 0,
  v1 = 1,
  easing: (t: number) => number = IO,
) =>
  interpolate(f, [a, b], [v0, v1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Spring that is 0 before `start`, then 0 -> 1 (with overshoot for bouncy configs). */
export const sp = (
  f: number,
  start: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {damping: 14, stiffness: 190, mass: 0.7},
  dur?: number,
) =>
  spring({
    frame: Math.max(0, f - start),
    fps: FPS,
    config,
    durationInFrames: dur,
  });

/** Deterministic hash noise in [0,1). */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth organic wobble (sum of sines), range about [-1,1]. */
export const wob = (f: number, seed = 0, speed = 1) =>
  (Math.sin(f * 0.13 * speed + seed * 7.1) * 0.55 +
    Math.sin(f * 0.31 * speed + seed * 3.3) * 0.3 +
    Math.sin(f * 0.77 * speed + seed * 1.7) * 0.15);

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
