import React from 'react';
import {SCREEN, W, H} from '../constants';
import {HandsBack, HandsFront, Thumb} from './Hands';
import {Hud} from './Hud';

export const PhoneFrame: React.FC<{
  f: number;
  children?: React.ReactNode;
  /** screen brightness 0..1 (S1 lights up from black) */
  on?: number;
  hud?: boolean;
  thumb: Thumb;
  dy?: number;
  rot?: number;
  scale?: number;
  handsY?: number;
  glow?: number;
  survivors?: number;
  origin?: string;
}> = ({f, children, on = 1, hud = true, thumb, dy = 0, rot = 0, scale = 1, handsY = 0, glow = 1, survivors = 0, origin = '540px 1000px'}) => {
  const pad = 15;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${dy}px) rotate(${rot}deg) scale(${scale})`, transformOrigin: origin, opacity: Math.min(1, on * 1.4)}}>
      <div style={{position: 'absolute', left: SCREEN.x - 90, top: SCREEN.y - 60, width: SCREEN.w + 180, height: SCREEN.h + 120, borderRadius: 120, background: 'radial-gradient(ellipse at center, rgba(120,200,255,0.20), rgba(120,200,255,0) 70%)', opacity: on * glow}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${handsY}px)`}}>
        <HandsBack light={on} />
      </div>
      <div style={{position: 'absolute', left: SCREEN.x - pad, top: SCREEN.y - pad, width: SCREEN.w + pad * 2, height: SCREEN.h + pad * 2, borderRadius: SCREEN.r + pad, background: '#020305', border: '2px solid #1a2030', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'}} />
      <div style={{position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN.r, overflow: 'hidden', background: '#000'}}>
        <div style={{position: 'absolute', inset: 0, opacity: on}}>{children}</div>
        {hud && on > 0.05 && (
          <div style={{position: 'absolute', inset: 0, opacity: on}}>
            <Hud f={f} survivors={survivors} />
          </div>
        )}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 28%)', pointerEvents: 'none'}} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${handsY}px)`}}>
        <HandsFront thumb={thumb} light={on} />
      </div>
    </div>
  );
};
