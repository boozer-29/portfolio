import React from 'react';
import {rnd, wob, clamp} from '../util';

export type Mode = 'lit' | 'dark' | 'nv';

// ------------------------------------------------------------------ palettes
const PAL = {
  lit: {
    wallL: '#4b5160', wallR: '#3f4554', ceil: '#2c313d', floor: '#2f2b29', end: '#5a6070',
    door: '#2b2119', frame: '#1c1f28', line: '#14161d', plank: '#231f1d',
  },
  dark: {
    wallL: '#0d111a', wallR: '#0b0f17', ceil: '#080b12', floor: '#090a0e', end: '#10151f',
    door: '#07080c', frame: '#06080d', line: '#05070b', plank: '#07080b',
  },
  nv: {
    wallL: '#1f5a38', wallR: '#1a4c30', ceil: '#154229', floor: '#123a24', end: '#27693f',
    door: '#103420', frame: '#0c2a1a', line: '#0a2315', plank: '#0f301e',
  },
};

// ------------------------------------------------------------------ the Quiet (blocky, pale, faceless)
export const Quiet: React.FC<{
  x: number; y: number; h: number; tone?: 'pale' | 'nv' | 'shadow'; lean?: number; id: string; opacity?: number;
}> = ({x, y, h, tone = 'pale', lean = 0, id, opacity = 1}) => {
  const s = h / 300;
  const top = tone === 'nv' ? '#e4ffe9' : tone === 'shadow' ? '#1b2030' : '#e4e7ee';
  const bot = tone === 'nv' ? '#58c47d' : tone === 'shadow' ? '#0b0e16' : '#8e95a6';
  const edge = tone === 'nv' ? '#0b3a1f' : '#0b0d14';
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`} opacity={opacity}>
      <defs>
        <linearGradient id={`q${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <g fill={`url(#q${id})`} stroke={edge} strokeWidth={3 / Math.max(s, 0.2)} strokeLinejoin="round">
        <rect x={-27} y={-122} width={21} height={122} rx={3} />
        <rect x={6} y={-122} width={21} height={122} rx={3} />
        <rect x={-36} y={-218} width={72} height={104} rx={5} />
        <rect x={-46} y={-228} width={92} height={32} rx={6} />
        <rect x={-66} y={-222} width={17} height={170} rx={4} />
        <rect x={49} y={-222} width={17} height={170} rx={4} />
        <rect x={-70} y={-62} width={25} height={30} rx={4} />
        <rect x={45} y={-62} width={25} height={30} rx={4} />
        <rect x={-10} y={-244} width={20} height={20} rx={2} />
        <rect x={-25} y={-300} width={50} height={60} rx={9} />
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ hallway (CAM 1)
export const Hallway: React.FC<{
  mode: Mode; bulbLit?: boolean; figures?: number[]; f: number; ghosts?: number; vp?: number;
}> = ({mode, bulbLit = true, figures, f, ghosts = 0}) => {
  const p = PAL[mode];
  const lit = mode === 'lit' && bulbLit;
  const side = (dir: 1 | -1, u1: number, u2: number) => {
    const X = (u: number) => (dir === 1 ? 380 * u : 1000 - 380 * u);
    const top = (u: number) => 540 * u;
    const bot = (u: number) => 1400 - 640 * u;
    const dt = (u: number) => top(u) + 0.2 * (bot(u) - top(u));
    return `${X(u1)},${dt(u1)} ${X(u2)},${dt(u2)} ${X(u2)},${bot(u2)} ${X(u1)},${bot(u1)}`;
  };
  const figDefs = [
    {d: 0.62, lat: -0.55}, {d: 0.74, lat: 0.02}, {d: 0.68, lat: 0.55},
  ];
  const figX = (d: number, lat: number) => 500 + lat * (500 - 380 * d);
  const figH = (d: number) => 0.7 * (1400 - 1180 * d);
  return (
    <g>
      <rect width={1000} height={1400} fill={p.line} />
      <polygon points="0,0 1000,0 620,540 380,540" fill={p.ceil} />
      <polygon points="0,0 380,540 380,760 0,1400" fill={p.wallL} />
      <polygon points="1000,0 620,540 620,760 1000,1400" fill={p.wallR} />
      <polygon points="0,1400 1000,1400 620,760 380,760" fill={p.floor} />
      <rect x={380} y={540} width={240} height={220} fill={p.end} />
      {/* floor planks */}
      {Array.from({length: 11}, (_, i) => {
        const x = -200 + i * 140;
        return <line key={i} x1={500 + (x - 500) * 0.0} y1={760} x2={x} y2={1400} stroke={p.plank} strokeWidth={3} opacity={0.8} />;
      })}
      {[0.12, 0.28, 0.46, 0.66, 0.86].map((d, i) => (
        <line key={i} x1={380 - d * 380 * 0.4 + 0} y1={760 + d * 640} x2={620 + d * 380 * 0.4} y2={760 + d * 640} stroke={p.plank} strokeWidth={2} opacity={0.5} />
      ))}
      {/* doors on both walls */}
      {[[0.22, 0.34], [0.5, 0.58], [0.74, 0.8]].map(([a, b], i) => (
        <g key={i}>
          <polygon points={side(1, a, b)} fill={p.door} stroke={p.frame} strokeWidth={5} />
          <polygon points={side(-1, a + (i % 2 ? 0.04 : 0), b + (i % 2 ? 0.04 : 0))} fill={p.door} stroke={p.frame} strokeWidth={5} />
        </g>
      ))}
      {/* end of hall: small door + exit sign */}
      <rect x={470} y={600} width={60} height={160} fill={p.door} stroke={p.frame} strokeWidth={4} />
      <rect x={478} y={572} width={44} height={16} fill={mode === 'dark' ? '#0a1a10' : mode === 'nv' ? '#b8ffca' : '#2cd070'} opacity={mode === 'dark' ? 0.5 : 0.9} />
      {/* hanging bulb */}
      <line x1={500} y1={250} x2={500} y2={330} stroke={mode === 'nv' ? '#1d6a3c' : '#0c0d12'} strokeWidth={4} />
      <ellipse cx={500} cy={350} rx={20} ry={26} fill={lit ? '#fff3c9' : mode === 'nv' ? '#2c7a4a' : '#1a1a1a'} />
      {lit && (
        <g>
          <circle cx={500} cy={350} r={560} fill="url(#warmGlow)" />
          <ellipse cx={500} cy={1060} rx={330} ry={130} fill="#ffd88a" opacity={0.2} />
        </g>
      )}
      <defs>
        <radialGradient id="warmGlow">
          <stop offset="0" stopColor="#ffe6a0" stopOpacity={0.55} />
          <stop offset="0.45" stopColor="#ffcf7a" stopOpacity={0.18} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* dim ghost silhouettes visible only in the dark flicker frames */}
      {mode === 'dark' && ghosts > 0 &&
        figDefs.map((fd, i) => {
          return <Quiet key={i} id={`g${i}`} x={figX(fd.d, fd.lat)} y={1400 - 640 * fd.d} h={figH(fd.d)} tone="pale" opacity={0.22 * ghosts} />;
        })}
      {/* the three frozen figures, one step closer on every screen flicker */}
      {figures &&
        figures.map((st, i) => {
          const d = figDefs[i].d - st * 0.08; // one step closer per flicker; never animated between flickers
          return <Quiet key={i} id={`f${i}`} x={figX(d, figDefs[i].lat)} y={1400 - 640 * d} h={figH(d)} tone="nv" />;
        })}
    </g>
  );
};

// ------------------------------------------------------------------ front door (CAM 2)
export const FrontDoor: React.FC<{
  mode: Mode; handleAngle?: number; f: number; feet?: number; knockShake?: number;
}> = ({mode, handleAngle = 0, f, feet = 0, knockShake = 0}) => {
  const nv = mode === 'nv';
  const wall = nv ? '#1d5535' : '#454b59';
  const door = nv ? '#16452b' : '#3a2c22';
  const panel = nv ? '#1a4e30' : '#33261d';
  const edge = nv ? '#0a2a18' : '#14110e';
  const metal = nv ? '#d6ffe0' : '#b8bdc8';
  const gapLight = nv ? '#a8ffc0' : '#ffd890';
  return (
    <g>
      <rect width={1000} height={1400} fill={wall} />
      <rect x={0} y={1305} width={1000} height={95} fill={nv ? '#0f3220' : '#25211f'} />
      <g transform={`translate(${knockShake} 0)`}>
        <rect x={220} y={190} width={560} height={1120} fill={edge} />
        <rect x={250} y={220} width={500} height={1085} fill={door} />
        {[[290, 270, 190, 300], [520, 270, 190, 300], [290, 640, 190, 600], [520, 640, 190, 600]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill={panel} stroke={edge} strokeWidth={5} />
        ))}
        {/* peephole */}
        <circle cx={500} cy={420} r={17} fill={edge} />
        <circle cx={500} cy={420} r={11} fill={nv ? '#9dffb8' : '#556070'} />
        {/* hinges */}
        {[300, 760, 1130].map((y) => <rect key={y} x={246} y={y} width={12} height={46} fill={metal} opacity={0.7} />)}
        {/* deadbolt */}
        <circle cx={700} cy={640} r={24} fill={metal} stroke={edge} strokeWidth={4} />
        <rect x={694} y={628} width={12} height={24} fill={edge} />
        {/* security chain: track on frame, slider on door, slack links */}
        <rect x={684} y={528} width={70} height={22} rx={5} fill={metal} stroke={edge} strokeWidth={3} />
        <rect x={758} y={520} width={22} height={38} rx={4} fill={metal} stroke={edge} strokeWidth={3} />
        {Array.from({length: 9}, (_, i) => {
          const u = i / 8;
          const x = 770 - u * 78 - 6;
          const y = 540 + Math.sin(u * Math.PI) * 34;
          return <ellipse key={i} cx={x} cy={y} rx={8} ry={5} fill="none" stroke={metal} strokeWidth={3.2} transform={`rotate(${(u - 0.5) * 50} ${x} ${y})`} />;
        })}
        {/* lever handle: rotates about the rose */}
        <circle cx={690} cy={780} r={30} fill={metal} stroke={edge} strokeWidth={4} />
        <g transform={`rotate(${handleAngle} 690 780)`}>
          <rect x={520} y={768} width={170} height={24} rx={12} fill={metal} stroke={edge} strokeWidth={4} />
          <rect x={528} y={772} width={150} height={6} rx={3} fill="#ffffff" opacity={0.35} />
        </g>
      </g>
      {/* gap under the door */}
      <rect x={250} y={1305} width={500} height={9} fill={gapLight} opacity={nv ? 0.45 : 0.9} />
      {/* shadows of feet standing on the other side of the door */}
      {feet > 0 && (
        <g opacity={feet} fill={nv ? '#041a0d' : '#0a0705'}>
          <rect x={382} y={1303} width={70} height={12} rx={3} />
          <rect x={548} y={1303} width={70} height={12} rx={3} />
        </g>
      )}
      <rect x={340} y={1335} width={320} height={50} rx={8} fill={nv ? '#0e301e' : '#1c1a18'} />
    </g>
  );
};

// ------------------------------------------------------------------ window onto the burning city (CAM 3)
export const CityWindow: React.FC<{mode?: Mode; f: number}> = ({f}) => {
  const fires = [
    {x: 220, y: 760, r: 150, s: 1}, {x: 420, y: 820, r: 110, s: 2}, {x: 640, y: 740, r: 170, s: 3}, {x: 790, y: 830, r: 100, s: 4},
  ];
  const bldg = [
    [140, 760, 70, 290], [215, 700, 60, 350], [280, 820, 80, 230], [365, 660, 55, 390], [425, 790, 90, 260],
    [520, 720, 60, 330], [585, 640, 75, 410], [665, 800, 85, 250], [755, 700, 55, 350], [815, 770, 45, 280],
  ];
  return (
    <g>
      <rect width={1000} height={1400} fill="#0b0d14" />
      <defs>
        <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0f1c" />
          <stop offset="0.6" stopColor="#3a0f16" />
          <stop offset="1" stopColor="#8a1d17" />
        </linearGradient>
        <radialGradient id="fireG">
          <stop offset="0" stopColor="#ff7a2a" stopOpacity={0.95} />
          <stop offset="0.4" stopColor="#ff3b1e" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ff3b1e" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={120} y={260} width={760} height={800} fill="url(#citySky)" />
      {bldg.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#0a0b11" />)}
      {bldg.map(([x, y, w], i) => (
        <rect key={`w${i}`} x={x + 10} y={y + 24} width={8} height={10} fill="#ffb26a" opacity={rnd(i * 3.1 + Math.floor(f / 40)) > 0.8 ? 0.7 : 0} />
      ))}
      {fires.map((fi, i) => {
        const fl = 0.8 + 0.2 * wob(f, fi.s, 1.4);
        return (
          <g key={i}>
            <circle cx={fi.x} cy={fi.y} r={fi.r * fl} fill="url(#fireG)" />
            <ellipse cx={fi.x + 22 * wob(f, fi.s + 9, 0.4)} cy={fi.y - 190} rx={42} ry={150} fill="#1a0809" opacity={0.55} />
          </g>
        );
      })}
      {/* blinds + frame */}
      {Array.from({length: 9}, (_, i) => <rect key={i} x={120} y={260 + i * 20} width={760} height={11} fill="#0a0b10" opacity={0.92} />)}
      <rect x={120} y={260} width={760} height={800} fill="none" stroke="#10131b" strokeWidth={26} />
      <rect x={494} y={260} width={14} height={800} fill="#10131b" />
      <rect x={120} y={640} width={760} height={14} fill="#10131b" />
      <rect x={90} y={1060} width={820} height={34} fill="#161923" />
      {/* room interior: chair + plant silhouette */}
      <rect x={760} y={1100} width={120} height={300} fill="#07080c" />
      <rect x={110} y={1120} width={80} height={280} fill="#07080c" />
      <rect x={0} y={1094} width={1000} height={306} fill="#0a0c12" opacity={0.85} />
    </g>
  );
};

// ------------------------------------------------------------------ geometry helpers for organic limbs
const limb = (p0: [number, number], p1: [number, number], w0: number, w1: number) => {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  return `M${p0[0] + nx * w0},${p0[1] + ny * w0} L${p1[0] + nx * w1},${p1[1] + ny * w1} L${p1[0] - nx * w1},${p1[1] - ny * w1} L${p0[0] - nx * w0},${p0[1] - ny * w0} Z`;
};

const ik = (s: [number, number], t: [number, number], l1: number, l2: number, bend: 1 | -1): [number, number] => {
  const dx = t[0] - s[0];
  const dy = t[1] - s[1];
  const d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 1);
  const a = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = a + bend * Math.acos(cosA);
  return [s[0] + Math.cos(ang) * l1, s[1] + Math.sin(ang) * l1];
};
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ------------------------------------------------------------------ the tall pale figure that unfolds
export const Unfolding: React.FC<{u: number; reach: number; grip: number; f: number}> = ({u, reach, grip}) => {
  if (u <= 0.001) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const F: [number, number] = [190, 1392];
  // hips rise from a crouch; torso un-hunches; head lifts last
  const hipH = mix(170, 520, u);
  const H: [number, number] = [F[0] + mix(20, 26, u), F[1] - hipH];
  const K: [number, number] = [(F[0] + H[0]) / 2 + mix(190, 16, u), (F[1] + H[1]) / 2 - 10];
  const aT = mix(30, 17, u);
  const Lt = mix(230, 380, u);
  const S: [number, number] = [H[0] + Math.sin(rad(aT)) * Lt, H[1] - Math.cos(rad(aT)) * Lt];
  const aN = aT + mix(58, 4, u);
  const N: [number, number] = [S[0] + Math.sin(rad(aN)) * 96, S[1] - Math.cos(rad(aN)) * 96];
  const perp = [Math.cos(rad(aT)), Math.sin(rad(aT))];
  const shL: [number, number] = [S[0] - perp[0] * 52, S[1] - perp[1] * 52 + 14];
  const shR: [number, number] = [S[0] + perp[0] * 52, S[1] + perp[1] * 52 + 14];
  const touch: [number, number] = [705, 975];
  const hangR: [number, number] = [shR[0] + mix(20, 30, u), shR[1] + mix(120, 690, u)];
  const floorR: [number, number] = [mix(330, 390, u), 1392];
  const baseR = u < 0.55 ? floorR : hangR;
  const handR = lerp2(baseR, touch, reach);
  const elbowR = ik(shR, handR, 370, 390, reach > 0.02 ? 1 : -1);
  const handL: [number, number] = [shL[0] - 24, shL[1] + mix(110, 700, u)];
  const elbowL = ik(shL, handL, 370, 390, -1);
  const vis = 0.1 + 0.9 * Math.min(1, u * 1.7);
  const spread = 1 - grip * 0.85;
  const dx = handR[0] - elbowR[0];
  const dy = handR[1] - elbowR[1];
  const dl = Math.hypot(dx, dy) || 1;
  const base = Math.atan2(dy / dl, dx / dl);
  const headRot = aN + mix(10, 8, u);
  const F2: [number, number] = [F[0] + 62, F[1]];
  const K2: [number, number] = [(F2[0] + H[0] + 30) / 2 + mix(150, 24, u), (F2[1] + H[1]) / 2 - 6];
  return (
    <g opacity={vis}>
      <defs>
        <linearGradient id="paleG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a8194" />
          <stop offset="0.5" stopColor="#dfe3ec" />
          <stop offset="1" stopColor="#a3aabb" />
        </linearGradient>
      </defs>
      <g fill="url(#paleG)" stroke="#06080d" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        {/* back arm + legs first */}
        <path d={limb(shL, elbowL, 25, 18)} />
        <path d={limb(elbowL, handL, 18, 12)} />
        <path d={limb([H[0] + 30, H[1]], K2, 33, 23)} />
        <path d={limb(K2, F2, 23, 16)} />
        <rect x={F2[0] - 12} y={F2[1] - 16} width={74} height={20} rx={8} />
        <path d={limb(H, K, 38, 26)} />
        <path d={limb(K, F, 26, 17)} />
        <rect x={F[0] - 12} y={F[1] - 16} width={74} height={20} rx={8} />
        {/* torso, shoulders, neck, faceless head */}
        <path d={limb(H, S, 46, 66)} />
        <path d={limb(shL, shR, 24, 24)} />
        <path d={limb(S, N, 19, 15)} />
        <g transform={`translate(${N[0]} ${N[1]}) rotate(${headRot})`}>
          <rect x={-40} y={-132} width={80} height={140} rx={26} />
        </g>
        {/* reaching arm */}
        <path d={limb(shR, elbowR, 26, 19)} />
        <path d={limb(elbowR, handR, 19, 14)} />
        {[-2, -1, 0, 1, 2].map((k) => {
          const ang = base + k * 0.2 * spread;
          const len = 84 - Math.abs(k) * 9;
          const end: [number, number] = [handR[0] + Math.cos(ang) * len, handR[1] + Math.sin(ang) * len];
          return <path key={k} d={limb(handR, end, 6, 3)} />;
        })}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ bedroom (CAM 4)
export const Bedroom: React.FC<{
  f: number; person?: boolean; unfold?: number; reach?: number; grip?: number; flinch?: number; glow?: number; mode?: Mode;
}> = ({f, person = false, unfold = 0, reach = 0, grip = 0, flinch = 0, glow = 1}) => {
  const flick = 0.88 + 0.12 * wob(f, 5, 1.1);
  const glowA = person ? 0.62 * glow * flick : 0;
  return (
    <g>
      <defs>
        <radialGradient id="cornerDark" cx="0.1" cy="0.84" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity={0.97} />
          <stop offset="0.55" stopColor="#000" stopOpacity={0.72} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="phoneGlow">
          <stop offset="0" stopColor="#9aeaff" stopOpacity={0.9} />
          <stop offset="0.3" stopColor="#52bde8" stopOpacity={0.32} />
          <stop offset="1" stopColor="#52bde8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2639" />
          <stop offset="1" stopColor="#111828" />
        </linearGradient>
      </defs>
      <rect width={1000} height={1400} fill="#080b12" />
      <rect width={1000} height={650} fill="url(#wallG)" />
      {/* moonlit window */}
      <rect x={640} y={100} width={250} height={340} fill="#33507a" opacity={0.75} />
      <rect x={640} y={100} width={250} height={340} fill="none" stroke="#0d131f" strokeWidth={12} />
      <rect x={759} y={100} width={10} height={340} fill="#0d131f" />
      <rect x={640} y={264} width={250} height={10} fill="#0d131f" />
      <polygon points="640,440 890,440 980,700 540,700" fill="#3a5f92" opacity={0.14} />
      {/* wardrobe + shelf */}
      <rect x={240} y={220} width={210} height={430} fill="#0c111b" />
      <rect x={252} y={232} width={86} height={400} fill="none" stroke="#161d2b" strokeWidth={4} />
      <rect x={350} y={232} width={86} height={400} fill="none" stroke="#161d2b" strokeWidth={4} />
      <rect x={480} y={470} width={120} height={180} fill="#101624" />
      {/* floor + rug */}
      <polygon points="0,650 1000,650 1000,1400 0,1400" fill="#0b0f18" />
      <polygon points="150,690 940,690 1000,1400 70,1400" fill="#131b2b" />
      {/* bed */}
      <polygon points="230,690 960,690 1000,1400 130,1400" fill="#1d2740" />
      <rect x={700} y={700} width={230} height={78} rx={32} fill="#34406008" />
      <rect x={690} y={690} width={240} height={84} rx={34} fill="#3a4766" />
      <rect x={440} y={700} width={220} height={74} rx={30} fill="#323e5c" />
      {person && (
        <g transform={`translate(0 ${-flinch * 16}) rotate(${flinch * 2.2} 620 1100)`}>
          <circle cx={620} cy={800} r={330} fill="url(#phoneGlow)" opacity={glowA} />
          {/* torso + shoulders (hoodie) */}
          <path d="M486 1300 C470 1130 478 990 540 950 C585 925 655 925 700 950 C762 990 770 1130 754 1300 Z" fill="#2c3652" stroke="#0a0d15" strokeWidth={4} />
          <path d="M520 985 C560 1018 680 1018 720 985" fill="none" stroke="#161d30" strokeWidth={10} />
          <ellipse cx={620} cy={962} rx={118} ry={42} fill="#2f3a58" stroke="#0a0d15" strokeWidth={4} />
          {/* neck + hair */}
          <rect x={596} y={895} width={48} height={50} fill="#5b4a48" />
          <ellipse cx={620} cy={838} rx={64} ry={74} fill="#14100f" stroke="#050608" strokeWidth={4} />
          <path d="M572 812 C600 790 650 790 674 818" fill="none" stroke="#2b2220" strokeWidth={5} />
          <path d="M575 860 C600 890 640 890 666 860" fill="none" stroke="#0c0a0a" strokeWidth={6} />
          {/* cyan rim from the phone light */}
          <path d="M560 800 C560 756 600 742 640 748" fill="none" stroke="#8fe7ff" strokeWidth={5} opacity={0.5 * glow} strokeLinecap="round" />
          {/* upper arms, elbows out, hands forward */}
          <path d="M508 975 C446 1018 456 1110 540 1138" fill="none" stroke="#364163" strokeWidth={50} strokeLinecap="round" />
          <path d="M732 975 C794 1018 784 1110 700 1138" fill="none" stroke="#364163" strokeWidth={50} strokeLinecap="round" />
        </g>
      )}
      {/* blanket drawn over the lower body: you are sitting up in bed */}
      <path d="M140 1130 Q400 1070 640 1112 T1000 1090 L1000 1400 L120 1400 Z" fill="#26304c" />
      <path d="M170 1260 Q420 1210 660 1260 T1000 1230" stroke="#161d30" strokeWidth={7} fill="none" />
      <path d="M220 1000 L180 1125" stroke="#10151f" strokeWidth={4} opacity={0.6} />
      {unfold > 0 && <Unfolding u={unfold} reach={reach} grip={grip} f={f} />}
      <rect width={1000} height={1400} fill="url(#cornerDark)" />
    </g>
  );
};

// ------------------------------------------------------------------ the Quiet, huge, in a dark hallway with a pool of light
export const QuietFlash: React.FC<{variant: number; f: number}> = ({variant, f}) => {
  const v = variant % 3;
  const poolX = [260, 500, 740][v];
  const figs = [
    [{x: 250, d: 0.38, lean: -3}, {x: 560, d: 0.6, lean: 2}, {x: 780, d: 0.74, lean: 0}],
    [{x: 420, d: 0.3, lean: 1}, {x: 680, d: 0.55, lean: -2}, {x: 220, d: 0.7, lean: 0}],
    [{x: 700, d: 0.34, lean: -2}, {x: 360, d: 0.52, lean: 3}, {x: 560, d: 0.72, lean: 0}],
  ][v];
  return (
    <g>
      <rect width={1000} height={1400} fill="#04050a" />
      <polygon points="0,0 1000,0 640,540 360,540" fill="#080a10" />
      <polygon points="0,1400 1000,1400 640,760 360,760" fill="#0b0c11" />
      <polygon points="0,0 360,540 360,760 0,1400" fill="#0a0c12" />
      <polygon points="1000,0 640,540 640,760 1000,1400" fill="#090b11" />
      <defs>
        <radialGradient id="poolG">
          <stop offset="0" stopColor="#ffe3a1" stopOpacity={0.75} />
          <stop offset="1" stopColor="#ffe3a1" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={poolX} cy={1000} rx={360} ry={200} fill="url(#poolG)" />
      {figs.map((fg, i) => {
        const hh = 1250 - fg.d * 900;
        const lit = Math.abs(fg.x - poolX) < 250;
        return <Quiet key={i} id={`qf${v}${i}`} x={fg.x} y={1400 - fg.d * 560} h={hh} lean={fg.lean} tone={lit ? 'pale' : 'shadow'} />;
      })}
    </g>
  );
};
