import React from 'react';
import {C, FONT_HUD, SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {PhoneFrame} from '../shared/PhoneFrame';
import {clockText} from '../timeline';
import {ez, rnd, sp, wob, OUT, IO} from '../util';

const CAPS: Cap[] = [{voice: 'v05', end: 270, lines: ['THEY ONLY MOVE', 'IN THE DARK.'], accent: [1, 2, 'red']}];

const RULES = [
  {n: 1, lines: ['NEVER GO', 'OUTSIDE.'], angle: -4},
  {n: 2, lines: ['NEVER ANSWER', 'THE DOOR.'], angle: 3},
  {n: 3, lines: ['KEEP THE', 'LIGHTS ON.'], angle: -2.5},
];

const Icon: React.FC<{n: number}> = ({n}) => (
  <svg width={620} height={760} viewBox="0 0 620 760" fill="none" stroke="#1d2740" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round">
    {n === 1 && (<><rect x={150} y={60} width={320} height={640} /><circle cx={420} cy={400} r={14} /><path d="M60 700H560" /></>)}
    {n === 2 && (<><rect x={150} y={60} width={320} height={640} /><circle cx={310} cy={250} r={30} /><path d="M230 520h160M230 580h160" /></>)}
    {n === 3 && (<><path d="M310 40V150" /><path d="M200 330C200 220 420 220 420 330 420 410 370 430 370 520H250C250 430 200 410 200 330Z" /><path d="M255 580H365M270 640H350" /></>)}
  </svg>
);

const Label: React.FC<{n: number; f: number; stamp: number | null; recut?: boolean}> = ({n, f, stamp, recut}) => {
  const r = RULES[n - 1];
  const s = stamp === null ? 1 : sp(f, stamp, {damping: 9, stiffness: 320, mass: 0.6});
  const sc = stamp === null ? 1 : 2.3 - 1.3 * Math.min(1.1, s);
  const op = stamp === null ? 1 : ez(f, stamp, stamp + 2, 0, 1, OUT);
  const ring = stamp === null ? 0 : ez(f, stamp, stamp + 10, 0, 1, OUT);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', opacity: op}}>
      <div style={{position: 'relative', transform: `rotate(${r.angle}deg) scale(${sc * (recut ? 1.06 : 1)})`}}>
        {stamp !== null && ring < 1 && <div style={{position: 'absolute', inset: -10 - ring * 60, border: `6px solid rgba(255,59,48,${0.7 * (1 - ring)})`, borderRadius: 14}} />}
        <div style={{background: C.red, padding: '26px 52px 30px', border: '8px solid #05070D', boxShadow: '0 18px 0 rgba(0,0,0,0.45), 0 0 80px rgba(255,59,48,0.45)', fontFamily: FONT_HUD, fontWeight: 700, color: '#fff', textTransform: 'uppercase', textAlign: 'center'}}>
          <div style={{fontSize: 62, letterSpacing: 8, opacity: 0.92}}>RULE {n}:</div>
          {r.lines.map((l) => (
            <div key={l} style={{fontSize: 116, letterSpacing: 3, lineHeight: 1.04, whiteSpace: 'nowrap'}}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const S2Rules: React.FC<{f: number}> = ({f}) => {
  const thumb = {x: 850 + 16 * Math.sin(f * 0.21), y: 1560 + 30 * Math.sin(f * 0.33), hover: 1};
  // beat map: [start, kind, ruleIndex]
  let content: React.ReactNode = null;
  const flash = (variant: number, local: number) => (
    <CamFeed cam="flash" variant={variant} f={f} mode="dark" w={SCREEN.w} h={SCREEN.h} ts={clockText(f)} noBar jitter={1.6} dropout={local % 2 === 0} zoom={1.05 + 0.02 * local} seed={variant} />
  );
  const card = (n: number, start: number, stamp: number | null, recut: boolean) => {
    const k = ez(f, start, start + 40, 1, 1.12, IO);
    return (
      <div style={{position: 'absolute', inset: 0, background: C.panel}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', transform: `scale(${k * (recut ? 1.15 : 1)}) translateX(${recut ? -40 : 0}px)`}}>
          <Icon n={n} />
        </div>
        <div style={{position: 'absolute', left: 36, right: 36, top: 290, fontFamily: FONT_HUD, fontSize: 28, letterSpacing: 6, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', textAlign: 'center'}}>SAFE-HOUSE RULES · DAY 12</div>
        <Label n={n} f={f} stamp={stamp} recut={recut} />
      </div>
    );
  };
  if (f < 110) content = card(1, 90, 90, false);
  else if (f < 116) content = flash(0, f - 110);
  else if (f < 130) content = card(1, 90, null, true);
  else if (f < 150) content = card(2, 130, 130, false);
  else if (f < 156) content = flash(1, f - 150);
  else if (f < 170) content = card(2, 130, null, true);
  else if (f < 190) content = card(3, 170, 170, false);
  else if (f < 196) content = flash(2, f - 190);
  else if (f < 210) content = card(3, 170, null, true);
  else
    content = (
      <CamFeed cam="flash" variant={1} f={f} mode="dark" w={SCREEN.w} h={SCREEN.h} ts={clockText(f)} noBar jitter={0.5} zoom={ez(f, 210, 270, 1.0, 1.2, IO)} origin={[0.5, 0.6]} seed={9} />
    );
  return (
    <>
      <PhoneFrame f={f} thumb={thumb} scale={1 + 0.006 * Math.sin(f * 0.08)}>
        {content}
      </PhoneFrame>
      <Captions f={f} caps={CAPS} />
    </>
  );
};
