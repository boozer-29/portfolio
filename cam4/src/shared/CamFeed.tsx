import React from 'react';
import {FONT_HUD, C} from '../constants';
import {rnd} from '../util';
import {Bedroom, CityWindow, FrontDoor, Hallway, Mode, QuietFlash} from './art';

export type FeedProps = {
  cam: 1 | 2 | 3 | 4 | 'flash';
  f: number;
  mode: Mode;
  w: number;
  h: number;
  ts: string;
  compact?: boolean;
  noBar?: boolean;
  // push-in inside the cell
  zoom?: number;
  origin?: [number, number];
  // cam 1
  bulbLit?: boolean;
  figures?: number[];
  ghosts?: number;
  // cam 2
  handleAngle?: number;
  feet?: number;
  knockShake?: number;
  // cam 4
  person?: boolean;
  unfold?: number;
  reach?: number;
  grip?: number;
  flinch?: number;
  // glitch
  jitter?: number;
  dropout?: boolean;
  black?: number;
  variant?: number;
  seed?: number;
};

const NAMES: Record<string, string> = {1: 'HALLWAY', 2: 'FRONT DOOR', 3: 'WINDOW', 4: 'BEDROOM'};

export const CamFeed: React.FC<FeedProps> = (p) => {
  const {cam, f, mode, w, h, compact, zoom = 1, origin = [0.5, 0.5], jitter = 0, dropout, black = 0} = p;
  const nv = mode === 'nv';
  const jx = jitter > 0 && rnd(f * 1.9 + (p.seed ?? 0)) > 0.62 ? (rnd(f * 7.3) - 0.5) * 6 * jitter : 0;
  const jy = jitter > 0 && rnd(f * 2.7 + (p.seed ?? 0)) > 0.8 ? (rnd(f * 3.1) - 0.5) * 3 * jitter : 0;
  const barH = compact ? 40 : 56;
  const fs = compact ? 24 : 34;
  const roll = ((Math.sin(f * 0.045 + (p.seed ?? 0)) + 1) / 2) * 100;
  const art = (() => {
    switch (cam) {
      case 1: return <Hallway mode={mode} bulbLit={p.bulbLit} figures={p.figures} ghosts={p.ghosts} f={f} />;
      case 2: return <FrontDoor mode={mode} handleAngle={p.handleAngle} feet={p.feet} knockShake={p.knockShake} f={f} />;
      case 3: return <CityWindow f={f} />;
      case 4: return <Bedroom f={f} person={p.person} unfold={p.unfold} reach={p.reach} grip={p.grip} flinch={p.flinch} mode={mode} />;
      default: return <QuietFlash variant={p.variant ?? 0} f={f} />;
    }
  })();
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: '#000'}}>
      <div
        style={{
          position: 'absolute', inset: 0,
          transform: `translate(${jx}px, ${jy}px) scale(${zoom})`,
          transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`,
          filter: nv ? 'contrast(1.12) brightness(1.08)' : 'saturate(0.7) contrast(1.06)',
        }}
      >
        <svg width={w} height={h} viewBox="0 0 1000 1400" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
          {art}
        </svg>
      </div>
      {/* CCTV scanlines + sensor noise */}
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0) 3px)', mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: `${roll}%`, height: '9%', background: `linear-gradient(0deg, rgba(255,255,255,0), rgba(${nv ? '124,255,155' : '210,230,255'},0.06), rgba(255,255,255,0))`}} />
      {nv && <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,255,155,0.07), rgba(0,20,6,0.55) 100%)'}} />}
      {dropout && (
        <div style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 9}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${rnd(f * 13 + i) * 100}%`, height: `${2 + rnd(f + i * 5) * 7}%`, background: `rgba(${nv ? '170,255,190' : '235,240,255'},${0.18 + rnd(i + f) * 0.4})`, transform: `translateX(${(rnd(i * 3 + f) - 0.5) * 120}px)`}} />
          ))}
        </div>
      )}
      {!p.noBar && (
        <div style={{position: 'absolute', left: 0, right: 0, top: compact ? 0 : 236, height: barH, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${compact ? 14 : 22}px`, fontFamily: FONT_HUD, fontWeight: 600, fontSize: fs, letterSpacing: 1.5, color: nv ? C.nv : '#fff', background: compact ? 'linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0))' : 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.1))', textShadow: '0 1px 3px #000'}}>
          <span><span style={{color: C.red, opacity: Math.sin(f * 0.15) > -0.2 ? 1 : 0.25}}>●</span>&nbsp;CAM {cam === 'flash' ? '1' : cam}{compact ? '' : <span style={{opacity: 0.7}}>&nbsp;·&nbsp;{NAMES[String(cam)] ?? 'HALLWAY'}</span>}</span>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{p.ts}</span>
        </div>
      )}
      {black > 0 && <div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />}
    </div>
  );
};
