import React from 'react';
import {C, FONT_HUD, SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {Flash} from '../shared/Fx';
import {PhoneFrame} from '../shared/PhoneFrame';
import {KNOCKS, SKIP_FLASH, clockText, knockRed} from '../timeline';
import {ez, rnd, sp, wob, IO, OUT} from '../util';

const CAPS: Cap[] = [{start: 1290, end: 1380, lines: ["THEY'RE LISTENING."], accent: [0, 1, 'red']}];

const LINES = ['THEY LEARNED', 'YOUR NAME.'];
const GLYPHS = '▓▒░#@%&*+=<>/\\|';

const Radio: React.FC<{f: number}> = ({f}) => {
  const total = LINES.join('').length;
  const shown = Math.floor(ez(f, 1200, 1264, 0, total + 0.99, OUT));
  const fadeOut = ez(f, 1350, 1374, 1, 0, OUT);
  const gate = rnd(Math.floor(f / 2) * 1.7) > 0.12 ? 1 : 0.35;
  let idx = 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: fadeOut * gate * ez(f, 1200, 1204, 0, 1, OUT), transform: `rotate(-3deg) skewX(-5deg) translateX(${(rnd(f * 3.3) - 0.5) * 8}px)`}}>
      {/* static bars behind the text */}
      {Array.from({length: 7}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: -30 + rnd(f * 5 + i) * 330, height: 3 + rnd(f + i * 9) * 8, background: `rgba(255,255,255,${0.08 + rnd(f * 2 + i) * 0.16})`, transform: `translateX(${(rnd(f * 4 + i) - 0.5) * 200}px)`}} />
      ))}
      {LINES.map((line, li) => (
        <div key={li} style={{fontFamily: FONT_HUD, fontWeight: 700, fontSize: li === 0 ? 112 : 128, letterSpacing: 6, lineHeight: 1.08, color: '#fff', textShadow: '5px 0 0 rgba(255,59,48,0.9), -5px 0 0 rgba(120,230,255,0.75), 0 6px 22px rgba(0,0,0,0.9)'}}>
          {line.split('').map((ch, ci) => {
            const i = idx++;
            const resolved = i < shown;
            const g = GLYPHS[Math.floor(rnd(f * 7 + i * 13) * GLYPHS.length)];
            return <span key={ci} style={{display: 'inline-block', width: ch === ' ' ? 36 : undefined, opacity: resolved ? 1 : 0.55, color: resolved ? '#fff' : C.red}}>{ch === ' ' ? ' ' : resolved ? ch : g}</span>;
          })}
        </div>
      ))}
    </div>
  );
};

export const S5Door: React.FC<{f: number; pulse: number}> = ({f, pulse}) => {
  // slow push, then in on the handle so a 1 degree turn is legible
  const toHandle = ez(f, 1090, 1250, 0, 1, IO);
  const zoom = f < 1090 ? ez(f, 960, 1090, 1.0, 1.1, IO) : 1.1 + 0.45 * toHandle + ez(f, 1250, 1380, 0, 0.07, OUT);
  const origin: [number, number] = [0.5 + 0.19 * toHandle, 0.5 + 0.057 * toHandle];
  const handleAngle = -1 * ez(f, 1140, 1162, 0, 1, OUT);
  const feet = ez(f, 1056, 1092, 0, 0.9, OUT);
  let knock = 0;
  for (const k of KNOCKS) {
    const t = f - k;
    if (t >= 0 && t < 10) knock += (1 - sp(t, 0, {damping: 10, stiffness: 260, mass: 0.6}, 8)) * 3.2 * Math.cos(t * 2.4);
  }
  const thumb = {x: 880 + 6 * wob(f, 21, 1.5), y: 1700 + 6 * wob(f, 22, 1.5), hover: 1};
  return (
    <>
      <PhoneFrame f={f} thumb={thumb} scale={1 + 0.008 * pulse}>
        <CamFeed
          cam={2} f={f} mode="nv" w={SCREEN.w} h={SCREEN.h} ts={clockText(f)} zoom={zoom} origin={origin}
          handleAngle={handleAngle} feet={feet} knockShake={knock} jitter={f >= 1100 && f < 1140 ? 1.2 : 0.7} seed={5}
          dropout={f >= SKIP_FLASH[0] && f < SKIP_FLASH[1] + 2}
        />
        <Radio f={f} />
      </PhoneFrame>
      <Flash f={f} color={C.red} start={KNOCKS.find((k) => f >= k && f < k + 3) ?? -10} len={3} peak={0.5} />
      <Flash f={f} color="#ffffff" start={SKIP_FLASH[0]} len={SKIP_FLASH[1] - SKIP_FLASH[0]} peak={0.9} />
      <Captions f={f} caps={CAPS} />
    </>
  );
};
