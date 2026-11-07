import React from 'react';
import {C, FONT_HUD} from '../constants';
import {battery, batteryPulse, clockText} from '../timeline';

export const Hud: React.FC<{f: number; survivors?: number}> = ({f, survivors = 0}) => {
  const pct = battery(f);
  const pulse = batteryPulse(f);
  const dot = Math.sin(f * 0.2) > -0.35 ? 1 : 0.2;
  const base: React.CSSProperties = {fontFamily: FONT_HUD, textTransform: 'uppercase', letterSpacing: 2.5, lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.8)'};
  const bcol = pulse > 0.02 ? `rgb(255, ${Math.round(255 - 196 * pulse)}, ${Math.round(255 - 207 * pulse)})` : '#fff';
  return (
    <div
      style={{
        position: 'absolute', left: 26, top: 26, width: 440, padding: '14px 20px 14px 20px', background: 'rgba(15,20,32,0.82)',
        borderLeft: `5px solid ${C.red}`, borderRadius: 10, ...base,
      }}
    >
      <div style={{fontSize: 30, fontWeight: 600, color: '#fff'}}>
        <span style={{color: C.red, opacity: dot, marginRight: 10}}>●</span>DAY 12
      </div>
      <div style={{fontSize: 52, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: 3, margin: '2px 0'}}>{clockText(f)}</div>
      <div style={{fontSize: 28, fontWeight: 500, color: bcol, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${1 + 0.1 * pulse})`, transformOrigin: 'left center'}}>
        <span>BATTERY {pct}%</span>
        <span style={{display: 'inline-block', width: 44, height: 20, border: `2px solid ${bcol}`, borderRadius: 4, position: 'relative'}}>
          <span style={{position: 'absolute', left: 2, top: 2, bottom: 2, width: `${pct * 0.4}px`, background: bcol}} />
        </span>
      </div>
      <div style={{fontSize: 24, fontWeight: 500, color: survivors > 0 ? C.lime : 'rgba(255,255,255,0.85)', marginTop: 3}}>SURVIVORS NEAR YOU: {survivors}</div>
    </div>
  );
};
