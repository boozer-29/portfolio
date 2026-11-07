import React from 'react';
import {W, H} from '../constants';

export type Thumb = {x: number; y: number; press?: number; hover?: number};

const SKIN = '#cf9f89';
const SKIN_HI = '#e0b5a1';
const SKIN_LO = '#a4705f';
const LINE = '#2a1a1d';
const SLEEVE = '#1f2739';
const NAIL = '#efd3c9';

// ---- geometry helpers -------------------------------------------------------
type P = [number, number];
const quad = (b: P, c: P, t: P, u: number): P => [
  (1 - u) * (1 - u) * b[0] + 2 * u * (1 - u) * c[0] + u * u * t[0],
  (1 - u) * (1 - u) * b[1] + 2 * u * (1 - u) * c[1] + u * u * t[1],
];
const dquad = (b: P, c: P, t: P, u: number): P => [
  2 * (1 - u) * (c[0] - b[0]) + 2 * u * (t[0] - c[0]),
  2 * (1 - u) * (c[1] - b[1]) + 2 * u * (t[1] - c[1]),
];

/** A tapered digit along a quadratic curve: outline path, centre samples, nail + knuckle placement. */
const digit = (b: P, c: P, t: P, w0: number, w1: number) => {
  const N = 28;
  const L: P[] = [];
  const R: P[] = [];
  const mid: P[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = quad(b, c, t, u);
    const d = dquad(b, c, t, u);
    const l = Math.hypot(d[0], d[1]) || 1;
    const nx = -d[1] / l;
    const ny = d[0] / l;
    // width tapers, with a slight pad bulge before the tip
    const w = (w0 + (w1 - w0) * (u * u * (3 - 2 * u))) * (1 + 0.05 * Math.sin(Math.PI * Math.min(1, u * 1.15)));
    L.push([p[0] + nx * w, p[1] + ny * w]);
    R.push([p[0] - nx * w, p[1] - ny * w]);
    mid.push(p);
  }
  const dEnd = dquad(b, c, t, 1);
  const lEnd = Math.hypot(dEnd[0], dEnd[1]) || 1;
  const dir: P = [dEnd[0] / lEnd, dEnd[1] / lEnd];
  const nrm: P = [-dir[1], dir[0]];
  // semicircular fingertip, sampled (no SVG arc flags to get wrong)
  const cap: P[] = [];
  for (let i = 1; i < 14; i++) {
    const phi = (Math.PI * i) / 14;
    cap.push([t[0] + w1 * (nrm[0] * Math.cos(phi) + dir[0] * Math.sin(phi)), t[1] + w1 * (nrm[1] * Math.cos(phi) + dir[1] * Math.sin(phi))]);
  }
  const sideL = L.map((q) => `${q[0]},${q[1]}`).join(' L');
  const sideR = R.slice().reverse().map((q) => `${q[0]},${q[1]}`).join(' L');
  const capS = cap.map((q) => `${q[0]},${q[1]}`).join(' L');
  const outline = `M${sideL} L${capS} L${sideR} Z`; // closed, used for the fill
  const edge = `M${sideL} L${capS} L${sideR}`; // open, used for the outline stroke: base stays seamless
  const centre = 'M' + mid.map((q) => `${q[0]},${q[1]}`).join(' L');
  const k = quad(b, c, t, 0.5);
  const kd = dquad(b, c, t, 0.5);
  const kl = Math.hypot(kd[0], kd[1]) || 1;
  return {outline, edge, centre, dir, tip: t, knuckle: k, kn: [-kd[1] / kl, kd[0] / kl] as P, w1, mid};
};

const Digit: React.FC<{d: ReturnType<typeof digit>; light: number}> = ({d, light}) => {
  const ang = (Math.atan2(d.dir[1], d.dir[0]) * 180) / Math.PI;
  const nailW = d.w1 * 1.05;
  const nailH = d.w1 * 1.22;
  const nx = d.tip[0] - d.dir[0] * d.w1 * 0.95;
  const ny = d.tip[1] - d.dir[1] * d.w1 * 0.95;
  const kw = d.w1 * 0.62;
  return (
    <g>
      <path d={d.outline} fill={SKIN} />
      {/* soft light / shade along the digit so it reads as round, not flat */}
      <path d={d.centre} stroke={SKIN_HI} strokeWidth={d.w1 * 0.55} strokeLinecap="round" fill="none" opacity={0.55} transform={`translate(${-d.kn[0] * d.w1 * 0.3} ${-d.kn[1] * d.w1 * 0.3})`} />
      <path d={d.centre} stroke={SKIN_LO} strokeWidth={d.w1 * 0.5} strokeLinecap="round" fill="none" opacity={0.28} transform={`translate(${d.kn[0] * d.w1 * 0.95} ${d.kn[1] * d.w1 * 0.95})`} />
      {/* knuckle creases */}
      {[-9, 9].map((o) => (
        <path key={o} d={`M${d.knuckle[0] - d.kn[0] * kw + d.dir[0] * o} ${d.knuckle[1] - d.kn[1] * kw + d.dir[1] * o} Q${d.knuckle[0] + d.dir[0] * (o + 7)} ${d.knuckle[1] + d.dir[1] * (o + 7)} ${d.knuckle[0] + d.kn[0] * kw + d.dir[0] * o} ${d.knuckle[1] + d.kn[1] * kw + d.dir[1] * o}`} stroke={LINE} strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round" />
      ))}
      {/* nail: squared, with cuticle arc and a highlight (not an oval) */}
      <g transform={`translate(${nx} ${ny}) rotate(${ang + 90})`}>
        <rect x={-nailW / 2} y={-nailH / 2} width={nailW} height={nailH} rx={nailW * 0.3} fill={NAIL} stroke="#a47d70" strokeWidth={3} />
        <path d={`M${-nailW / 2 + 5} ${nailH / 2 - 10} Q0 ${nailH / 2 - 2} ${nailW / 2 - 5} ${nailH / 2 - 10}`} stroke="#c79f92" strokeWidth={3} fill="none" opacity={0.8} />
        <rect x={-nailW / 2 + 6} y={-nailH / 2 + 6} width={nailW * 0.22} height={nailH * 0.45} rx={4} fill="#fff" opacity={0.4} />
      </g>
      <path d={d.outline} fill="url(#handShade)" opacity={light} />
      <path d={d.edge} fill="none" stroke={LINE} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
};

// ---- the hands, split so the palms sit BEHIND the phone and thumbs/fingertips sit in FRONT ----
export const HandsBack: React.FC<{light?: number}> = ({light = 1}) => {
  const mirror = (x: number) => W - x;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="palmShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdcff" stopOpacity={0.28 * light} />
          <stop offset="0.5" stopColor="#8fdcff" stopOpacity={0.05 * light} />
          <stop offset="1" stopColor="#000" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="sleeveShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb7e6" stopOpacity={0.16 * light} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {[false, true].map((flip) => {
        const X = (x: number) => (flip ? mirror(x) : x);
        const path = (pts: string) =>
          pts.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (_m, a, _b, b) => `${X(parseFloat(a))} ${b}`);
        return (
          <g key={String(flip)}>
            {/* forearm in a hoodie sleeve */}
            <path d={path('M-40 1650 C120 1618 270 1660 342 1752 L384 1930 L-40 1930 Z')} fill={SLEEVE} stroke={LINE} strokeWidth={5} />
            <path d={path('M-40 1650 C120 1618 270 1660 342 1752 L384 1930 L-40 1930 Z')} fill="url(#sleeveShade)" />
            <path d={path('M-10 1722 C130 1698 250 1736 318 1818')} fill="none" stroke="#0e1320" strokeWidth={6} opacity={0.7} />
            {/* cuff rib lines */}
            {[0, 1, 2].map((i) => <path key={i} d={path(`M${60 + i * 30} 1670 L${40 + i * 34} 1760`)} stroke="#0e1320" strokeWidth={3} opacity={0.45} />)}
            {/* hand: runs under the phone; only the heel and the wrapped side are visible */}
            <path d={path('M-40 1200 C-10 1140 40 1136 70 1150 L340 1150 C386 1300 392 1500 350 1672 C270 1716 130 1712 -40 1690 Z')} fill={SKIN} stroke={LINE} strokeWidth={5} />
            <path d={path('M-40 1200 C-10 1140 40 1136 70 1150 L340 1150 C386 1300 392 1500 350 1672 C270 1716 130 1712 -40 1690 Z')} fill="url(#palmShade)" />
            {/* heel-of-palm crease */}
            <path d={path('M300 1490 C330 1560 322 1620 290 1660')} stroke={LINE} strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

export const HandsFront: React.FC<{thumb: Thumb; light?: number}> = ({thumb, light = 1}) => {
  const tx = Math.min(980, Math.max(660, thumb.x));
  const ty = Math.min(1400, thumb.y);
  const {press = 0, hover = 0} = thumb;
  // right (scrolling) thumb grows out of the right palm heel
  const rb: P = [905, 1570];
  const rc: P = [rb[0] - (rb[0] - tx) * 0.3, rb[1] - (rb[1] - ty) * 0.55];
  const rThumb = digit(rb, rc, [tx, ty], 44, 40);
  // left thumb rests lightly on the glass
  const lThumb = digit([185, 1545], [150, 1450], [104, 1352], 44, 40);
  // four fingertips curl over each side edge: index longest, pinky shortest, touching, rounded at the inner end
  const reach = [66, 72, 62, 46];
  const tips = (flip: boolean) =>
    reach.map((len, i) => {
      const y = 1200 + i * 68;
      const X = (x: number) => (flip ? W - x : x);
      const x0 = X(-24);
      const x1 = X(len);
      const dir = flip ? -1 : 1;
      const r = 33;
      const d = `M${x0} ${y - r} L${x1 - dir * r} ${y - r} Q${x1} ${y - r} ${x1} ${y} Q${x1} ${y + r} ${x1 - dir * r} ${y + r} L${x0} ${y + r} Z`;
      return (
        <g key={`${flip}${i}`}>
          <path d={d} fill={SKIN} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M${X(len - 22)} ${y - 18} Q${X(len - 8)} ${y} ${X(len - 22)} ${y + 18}`} stroke={SKIN_LO} strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
          <path d={`M${X(-10)} ${y - 18} L${X(len - 34)} ${y - 18}`} stroke={SKIN_HI} strokeWidth={7} strokeLinecap="round" opacity={0.5} />
          <path d={d} fill="url(#handShade)" opacity={light} />
        </g>
      );
    });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="handShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdcff" stopOpacity={0.14} />
          <stop offset="1" stopColor="#000" stopOpacity={0.14} />
        </linearGradient>
        <filter id="thumbBlur"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      {tips(false)}
      {tips(true)}
      <Digit d={lThumb} light={light} />
      <ellipse cx={tx + 24 + hover * 34} cy={ty + 36 + hover * 46} rx={58 + hover * 24} ry={40 + hover * 16} fill="#000" opacity={(0.14 + 0.3 * (1 - hover)) * (1 - press * 0.3)} filter="url(#thumbBlur)" />
      <Digit d={rThumb} light={light} />
    </svg>
  );
};
