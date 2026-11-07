import React from 'react';
import {C, FONT_HUD, SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {Flash} from '../shared/Fx';
import {PhoneFrame} from '../shared/PhoneFrame';
import {clockText} from '../timeline';
import {ez, sp, wob, OUT, IO} from '../util';

const CAPS: Cap[] = [{voice: 'v01', end: 90, lines: ['YOU LIVE ALONE.'], accent: [0, 2, 'red']}];

export const S1Hook: React.FC<{f: number}> = ({f}) => {
  const on = f < 6 ? 0 : ez(f, 6, 15, 0, 1, OUT);
  const scale = ez(f, 8, 90, 1.12, 1.0, IO);
  const handsY = ez(f, 14, 62, 420, 0, OUT);
  const slam = sp(f, 15, {damping: 9, stiffness: 260, mass: 0.7});
  const bScale = 1.55 - 0.55 * Math.min(1.08, slam);
  const bOp = ez(f, 15, 17, 0, 1, OUT);
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.34);
  const thumb = {x: 840 + 10 * wob(f, 1), y: 1585 + 8 * wob(f, 2), hover: 1};
  return (
    <>
      <PhoneFrame f={f} on={on} thumb={thumb} scale={scale} handsY={handsY} origin="540px 240px">
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#070a12,#0b1220 60%,#05070d)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT_HUD, fontWeight: 600, fontSize: 150, color: 'rgba(255,255,255,0.88)', letterSpacing: 4}}>
          {clockText(f).slice(0, -3)}
        </div>
        {/* older, quieter notifications */}
        {[['CAM 1 · ALL CLEAR', 2.4], ['CAM 2 · ALL CLEAR', 2.1], ['CAM 3 · ALL CLEAR', 1.9]].map(([t], i) => (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: 1000 + i * 100, height: 80, borderRadius: 18, background: C.panel, opacity: 0.55 - i * 0.1, display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: FONT_HUD, fontSize: 30, letterSpacing: 2.5, color: 'rgba(255,255,255,0.75)'}}>
            {t as string}
          </div>
        ))}
        {/* the alert */}
        <div
          style={{
            position: 'absolute', left: 40, right: 40, top: 560, height: 360, borderRadius: 30, background: C.red,
            opacity: bOp, transform: `scale(${bScale})`, boxShadow: `0 0 ${50 + 40 * pulse}px rgba(255,59,48,${0.5 + 0.3 * pulse})`,
            display: 'flex', alignItems: 'center', padding: '0 34px', gap: 30,
          }}
        >
          <div style={{width: 230, height: 290, borderRadius: 18, overflow: 'hidden', border: '4px solid rgba(0,0,0,0.5)', flex: 'none'}}>
            <CamFeed cam={4} f={f} mode="lit" w={230} h={290} ts={clockText(f)} compact noBar jitter={0.5} seed={4} />
          </div>
          <div style={{fontFamily: FONT_HUD, fontWeight: 700, color: '#fff', textTransform: 'uppercase', lineHeight: 1.02}}>
            <div style={{fontSize: 40, letterSpacing: 4, opacity: 0.9}}>● ALERT</div>
            <div style={{fontSize: 74, letterSpacing: 2}}>MOTION<br />DETECTED</div>
            <div style={{fontSize: 74, letterSpacing: 2}}>- CAM 4</div>
          </div>
        </div>
      </PhoneFrame>
      <Flash f={f} color={C.red} start={15} len={3} peak={0.4} />
      <Captions f={f} caps={CAPS} />
    </>
  );
};
