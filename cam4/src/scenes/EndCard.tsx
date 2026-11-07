import React from 'react';
import {C, FONT_CAP} from '../constants';
import {ez, sp, OUT} from '../util';

/** 1740-1769: pure black. 1770-1799: the card fades in after one full second of black. */
export const EndCard: React.FC<{f: number}> = ({f}) => {
  const op = ez(f, 1770, 1786, 0, 1, OUT);
  const s = 0.97 + 0.03 * Math.min(1, sp(f, 1770, {damping: 18, stiffness: 90, mass: 1}));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000'}}>
      {f >= 1770 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', opacity: op, transform: `scale(${s})`, fontFamily: FONT_CAP, fontWeight: 800, textTransform: 'uppercase', color: C.text, lineHeight: 1.12}}>
          <div style={{fontSize: 118, letterSpacing: 2}}>PART 2</div>
          <div style={{fontSize: 118, letterSpacing: 2, color: C.lime}}>TOMORROW.</div>
        </div>
      )}
    </div>
  );
};
