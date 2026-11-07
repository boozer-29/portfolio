import React from 'react';
import {C, FONT_CAP} from '../constants';
import {ez, sp, OUT} from '../util';

export type Cap = {
  start: number;
  end: number;
  lines: string[];
  /** [lineIndex, wordIndex, color] */
  accent: [number, number, 'lime' | 'red'];
};

const STAGGER = 4; // frames between words; each word pops with a 3-frame spring
const FS_MAX = 84;
const LH = 100;

export const Captions: React.FC<{f: number; caps: Cap[]}> = ({f, caps}) => {
  const cap = caps.find((c) => f >= c.start && f < c.end);
  if (!cap) return null;
  const out = ez(f, cap.end - 5, cap.end, 1, 0, OUT);
  let wi = 0;
  const total = cap.lines.reduce((a, l) => a + l.split(' ').length, 0);
  const lastIn = cap.start + (total - 1) * STAGGER + 4;
  // 66% of 1920 = 1267: vertical centre of the caption block, inside the 60-72% band
  const maxChars = Math.max(...cap.lines.map((l) => l.length));
  const FS = Math.min(FS_MAX, Math.floor(940 / (maxChars * 0.8)));
  const blockH = cap.lines.length * LH;
  const top = 0.66 * 1920 - blockH / 2;
  return (
    <>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: top - 70, height: blockH + 140,
          background: 'linear-gradient(180deg, rgba(5,7,13,0), rgba(5,7,13,0.55) 28%, rgba(5,7,13,0.55) 72%, rgba(5,7,13,0))',
          opacity: out * ez(f, cap.start, cap.start + 6, 0, 1, OUT),
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top, opacity: out, textAlign: 'center', fontFamily: FONT_CAP, fontWeight: 800, fontSize: FS, lineHeight: `${LH}px`, textTransform: 'uppercase', letterSpacing: 1}}>
        {cap.lines.map((line, li) => (
          <div key={li} style={{height: LH, whiteSpace: 'nowrap'}}>
            {line.split(' ').map((word, wj) => {
              const idx = wi++;
              const t = sp(f, cap.start + idx * STAGGER, {damping: 13, stiffness: 520, mass: 0.45}, 3);
              const scale = 0.8 + 0.2 * Math.min(1.12, t);
              const op = ez(f, cap.start + idx * STAGGER, cap.start + idx * STAGGER + 2, 0, 1, OUT);
              const acc = cap.accent[0] === li && cap.accent[1] === wj;
              const col = acc ? (cap.accent[2] === 'red' ? C.red : C.lime) : C.text;
              void lastIn;
              return (
                <span key={wj} style={{display: 'inline-block', margin: '0 0.14em', color: col, opacity: op, transform: `scale(${scale})`, WebkitTextStroke: '9px #05070D', paintOrder: 'stroke fill', textShadow: `0 4px 14px rgba(0,0,0,0.7)${acc ? `, 0 0 28px ${col}66` : ''}`}}>
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};
