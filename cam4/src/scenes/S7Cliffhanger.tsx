import React from 'react';
import {SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {PhoneFrame} from '../shared/PhoneFrame';
import {cam4Sec, cam4Text} from '../timeline';
import {ez, wob, IO, OUT} from '../util';

const Fog: React.FC<{f: number}> = ({f}) => {
  // two warm exhales hitting the glass from the bottom/right edge
  const a1 = ez(f, 1630, 1644, 0, 1, OUT) * (1 - ez(f, 1650, 1676, 0, 1, OUT));
  const a2 = ez(f, 1676, 1686, 0, 1, OUT) * (1 - ez(f, 1694, 1712, 0, 1, OUT)) * 0.7;
  const a = Math.max(a1, a2);
  if (a < 0.01) return null;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a, mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -120, right: -120, bottom: -160, height: 760, background: 'radial-gradient(ellipse at 50% 100%, rgba(255,226,196,0.62), rgba(255,226,196,0.2) 45%, rgba(255,226,196,0) 70%)', filter: 'blur(14px)'}} />
      <div style={{position: 'absolute', right: -140, top: 300, width: 520, height: 900, background: 'radial-gradient(ellipse at 100% 50%, rgba(255,226,196,0.4), rgba(255,226,196,0) 70%)', filter: 'blur(18px)'}} />
      {Array.from({length: 5}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 100 + i * 190 + 22 * wob(f, i, 0.6), bottom: 40 + 30 * wob(f, i + 7, 0.5), width: 220, height: 160, borderRadius: '50%', background: 'rgba(255,236,214,0.18)', filter: 'blur(20px)'}} />
      ))}
    </div>
  );
};

export const S7Cliffhanger: React.FC<{f: number; pulse: number}> = ({f, pulse}) => {
  const dip = ez(f, 1620, 1704, 0, 150, IO);
  const slip = ez(f, 1722, 1739, 0, 70, OUT); // grip loosens on the last beat
  const trem = ez(f, 1620, 1700, 1.2, 4.2, IO);
  const dy = dip + slip + trem * 3.2 * wob(f, 41, 2.4);
  const rot = trem * 0.55 * wob(f, 42, 2.0) - ez(f, 1722, 1739, 0, 4, OUT);
  const reach = ez(f, 1650, 1712, 0, 1, IO);
  const grip = ez(f, 1725, 1739, 0, 1, IO);
  const flinch = ez(f, 1712, 1722, 0, 1, OUT);
  const zoom = ez(f, 1620, 1740, 1.16, 1.34, IO);
  const thumb = {x: 860 + trem * 9 * wob(f, 51, 3), y: 1560 + trem * 9 * wob(f, 52, 3), hover: 1};
  const lagTick = f >= 1650 && f < 1702 && Math.floor(cam4Sec(f)) !== Math.floor(cam4Sec(f - 1));
  // faint something behind the phone: the room is dark, but not empty
  const behind = ez(f, 1696, 1738, 0, 0.1, IO);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#04050a,#070a11 60%,#05070d)'}}>
        <div style={{position: 'absolute', left: 120, top: 40, width: 220, height: 560, background: '#0a0e17', opacity: 0.9}} />
        <div style={{position: 'absolute', left: 640, top: 90, width: 280, height: 470, background: '#080b13'}} />
        <div style={{position: 'absolute', left: 460, top: 0, width: 150, height: 700, background: '#e1e5ee', opacity: behind, filter: 'blur(22px)'}} />
      </div>
      <PhoneFrame f={f} thumb={thumb} dy={dy} rot={rot} scale={ez(f, 1620, 1700, 1.0, 0.94, IO)} glow={0.7}>
        <CamFeed
          cam={4} f={f} mode="lit" w={SCREEN.w} h={SCREEN.h} ts={cam4Text(f)} zoom={zoom} origin={[0.42, 0.62]}
          person unfold={1} reach={reach} grip={grip} flinch={flinch} jitter={0.8 + trem * 0.4} dropout={lagTick} seed={7}
        />
        <Fog f={f} />
      </PhoneFrame>
    </>
  );
};
