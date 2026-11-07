import React from 'react';
import {W, H} from '../constants';

export type Thumb = {x: number; y: number; press?: number; hover?: number};

const SKIN = '#cf9f89';
const SKIN_D = '#a8715f';
const LINE = '#25171a';
const SLEEVE = '#1f2739';

export const Hands: React.FC<{thumb: Thumb; light?: number}> = ({thumb, light = 1}) => {
  const {x: tx, y: ty, press = 0, hover = 0} = thumb;
  // right thumb grows out of the right palm
  const bx = 915;
  const by = 1590;
  const cx = bx - (bx - tx) * 0.3;
  const cy = by - (by - ty) * 0.55;
  const ang = Math.atan2(ty - cy, tx - cx);
  const nailX = tx - Math.cos(ang) * 8;
  const nailY = ty - Math.sin(ang) * 8;
  const nub = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={110} height={58} rx={29} fill={SKIN} stroke={LINE} strokeWidth={4} />
      <rect x={x + 8} y={y + 8} width={90} height={16} rx={8} fill="#fff" opacity={0.07 * light} />
    </g>
  );
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="skinLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdcff" stopOpacity={0.3 * light} />
          <stop offset="0.45" stopColor="#8fdcff" stopOpacity={0.06 * light} />
          <stop offset="1" stopColor="#000" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="sleeveLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb7e6" stopOpacity={0.18 * light} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
        <filter id="thumbBlur"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      {/* LEFT: sleeve, hand heel, resting thumb, fingertips peeking over the edge */}
      <g>
        <path d="M-20 1930 L-20 1668 C40 1636 170 1640 238 1700 C300 1756 340 1840 372 1930 Z" fill={SLEEVE} stroke={LINE} strokeWidth={5} />
        <path d="M-20 1930 L-20 1668 C40 1636 170 1640 238 1700 C300 1756 340 1840 372 1930 Z" fill="url(#sleeveLight)" />
        <path d="M30 1700 C130 1690 215 1730 262 1795" fill="none" stroke="#0e1320" strokeWidth={6} opacity={0.7} />
        {[1236, 1306, 1376].map((y) => nub(-76, y))}
        <path d="M-20 1396 C60 1382 150 1398 206 1456 C252 1506 262 1580 250 1672 C190 1650 100 1646 -20 1672 Z" fill={SKIN} stroke={LINE} strokeWidth={5} />
        <path d="M-20 1396 C60 1382 150 1398 206 1456 C252 1506 262 1580 250 1672 C190 1650 100 1646 -20 1672 Z" fill="url(#skinLight)" />
        <path d="M168 1500 Q130 1430 92 1352" stroke={LINE} strokeWidth={84} strokeLinecap="round" fill="none" />
        <path d="M168 1500 Q130 1430 92 1352" stroke={SKIN} strokeWidth={76} strokeLinecap="round" fill="none" />
        <ellipse cx={92} cy={1346} rx={22} ry={28} fill="#e9c9bd" stroke={LINE} strokeWidth={3} transform="rotate(-18 92 1346)" />
      </g>
      {/* RIGHT: sleeve, palm, fingertips */}
      <g>
        <path d="M1100 1930 L1100 1668 C1040 1636 910 1640 842 1700 C780 1756 740 1840 708 1930 Z" fill={SLEEVE} stroke={LINE} strokeWidth={5} />
        <path d="M1100 1930 L1100 1668 C1040 1636 910 1640 842 1700 C780 1756 740 1840 708 1930 Z" fill="url(#sleeveLight)" />
        <path d="M1050 1700 C950 1690 865 1730 818 1795" fill="none" stroke="#0e1320" strokeWidth={6} opacity={0.7} />
        {[1236, 1306, 1376].map((y) => nub(W - 34, y))}
        <path d="M1100 1396 C1020 1382 930 1398 874 1456 C828 1506 818 1580 830 1672 C890 1650 980 1646 1100 1672 Z" fill={SKIN} stroke={LINE} strokeWidth={5} />
        <path d="M1100 1396 C1020 1382 930 1398 874 1456 C828 1506 818 1580 830 1672 C890 1650 980 1646 1100 1672 Z" fill="url(#skinLight)" />
      </g>
      {/* thumb shadow on the glass */}
      <ellipse cx={tx + 24 + hover * 34} cy={ty + 36 + hover * 46} rx={58 + hover * 24} ry={40 + hover * 16} fill="#000" opacity={(0.14 + 0.3 * (1 - hover)) * (1 - press * 0.3)} filter="url(#thumbBlur)" />
      {/* active thumb */}
      <path d={`M${bx} ${by} Q${cx} ${cy} ${tx} ${ty}`} stroke={LINE} strokeWidth={98} strokeLinecap="round" fill="none" />
      <path d={`M${bx} ${by} Q${cx} ${cy} ${tx} ${ty}`} stroke={SKIN} strokeWidth={90} strokeLinecap="round" fill="none" />
      <path d={`M${bx} ${by} Q${cx} ${cy} ${tx} ${ty}`} stroke={SKIN_D} strokeWidth={24} strokeLinecap="round" fill="none" opacity={0.22} transform="translate(22 0)" />
      <path d={`M${bx} ${by} Q${cx} ${cy} ${tx} ${ty}`} stroke="url(#skinLight)" strokeWidth={90} strokeLinecap="round" fill="none" opacity={0.55} />
      <ellipse cx={nailX} cy={nailY - 2} rx={27} ry={34} transform={`rotate(${(ang * 180) / Math.PI + 90} ${nailX} ${nailY})`} fill="#e9c9bd" stroke={LINE} strokeWidth={3} opacity={0.95} />
    </svg>
  );
};
