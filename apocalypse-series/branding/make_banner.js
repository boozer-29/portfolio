const { chromium } = require('playwright');
const fs = require('fs');
const W = 2048, H = 1152;
// seeded random
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// skyline
let sky = '', win = '';
for (let x = -20; x < W; ) {
  const w = 60 + rnd() * 120, h = 180 + rnd() * 330, y = 900 - h;
  sky += `<rect x="${x}" y="${y}" width="${w}" height="${h + 300}"/>`;
  if (rnd() < .5) sky += `<path d="M${x + w * .3} ${y} l${w * .15} -${20 + rnd() * 40} l${w * .1} ${30}z"/>`; // broken top
  for (let i = 0; i < 3; i++) if (rnd() < .35) win += `<rect x="${x + 10 + rnd() * (w - 30)}" y="${y + 20 + rnd() * (h - 60)}" width="12" height="15"/>`;
  x += w + rnd() * 18;
}

// sleeper crowd: block heads + shoulders, back rows smaller/darker
function sleeper(cx, base, s, shade, eyeOpen) {
  const tilt = (rnd() < .5 ? -1 : 1) * (10 + rnd() * 5);
  const sk = shade;
  let g = `<g transform="translate(${cx} ${base}) scale(${s})">
    <path d="M-55 0 L-45 -70 Q-40 -88 -20 -90 H20 Q40 -88 45 -70 L55 0 Z" fill="${sk.body}"/>
    <rect x="-12" y="-110" width="24" height="25" fill="${sk.neck}"/>
    <g transform="rotate(${tilt} 0 -110)">
      <rect x="-34" y="-180" width="68" height="72" rx="6" fill="${sk.skin}"/>
      <rect x="-34" y="-180" width="68" height="10" rx="5" fill="${sk.hi}"/>
      <rect x="-36" y="-188" width="72" height="14" rx="5" fill="${sk.hair}"/>`;
  if (eyeOpen) g += `<circle cx="12" cy="-148" r="70" fill="url(#eyeGlow)"/><rect x="2" y="-153" width="20" height="10" rx="2" fill="#E6F7FF"/><rect x="-24" y="-150" width="18" height="4" rx="2" fill="#1C212B"/>`;
  else g += `<rect x="-24" y="-150" width="16" height="4" rx="2" fill="#1C212B" opacity=".8"/><rect x="6" y="-150" width="16" height="4" rx="2" fill="#1C212B" opacity=".8"/>`;
  return g + `</g></g>`;
}
const rows = [
  { y: 960, s: .55, n: 34, c: { body: '#141C2B', neck: '#4A5160', skin: '#5E6573', hi: '#6B7280', hair: '#1A1F29' } },
  { y: 1040, s: .8, n: 24, c: { body: '#1A2232', neck: '#7D8492', skin: '#8D94A1', hi: '#9EA5B1', hair: '#232833' } },
  { y: 1170, s: 1.15, n: 16, c: { body: '#222B3C', neck: '#AEB4BE', skin: '#C9CED6', hi: '#DDE1E7', hair: '#2D323D' } },
];
let crowd = '';
rows.forEach((r, ri) => {
  for (let i = 0; i < r.n; i++) {
    const cx = (i + .5) * (W / r.n) + (rnd() - .5) * (W / r.n) * .5;
    const open = ri === 2 && i === 11; // one Sleeper waking, front row right of center
    crowd += sleeper(cx, r.y + (rnd() - .5) * 20, r.s * (.9 + rnd() * .2), r.c, open);
  }
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <radialGradient id="night" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#1E3D60"/><stop offset=".5" stop-color="#0B1F3A"/><stop offset="1" stop-color="#05080F"/></radialGradient>
  <radialGradient id="moon" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9CC3E8" stop-opacity=".5"/><stop offset="1" stop-color="#9CC3E8" stop-opacity="0"/></radialGradient>
  <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#E6F7FF" stop-opacity=".95"/><stop offset=".4" stop-color="#BFE9FF" stop-opacity=".45"/><stop offset="1" stop-color="#BFE9FF" stop-opacity="0"/></radialGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC3E8" stop-opacity="0"/><stop offset="1" stop-color="#9CC3E8" stop-opacity=".18"/></linearGradient>
  <radialGradient id="panel" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#05080F" stop-opacity=".75"/><stop offset="1" stop-color="#05080F" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .06 0"/></filter>
  <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".7"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#night)"/>
<circle cx="1024" cy="420" r="560" fill="url(#moon)"/>
<!-- smoke columns -->
<g fill="#2A3A52" opacity=".35"><ellipse cx="330" cy="420" rx="70" ry="260"/><ellipse cx="1720" cy="380" rx="90" ry="300"/></g>
<g fill="#081426">${sky}</g>
<g fill="#F2A93B" opacity=".85">${win}</g>
<rect y="650" width="${W}" height="500" fill="url(#fog)"/>
${crowd}
<!-- title panel (inside the 1235x338 safe area: x 406-1641, y 407-745) -->
<ellipse cx="1024" cy="576" rx="760" ry="250" fill="url(#panel)"/>
<g font-family="Inter" text-anchor="middle" filter="url(#shadow)">
  <text x="1024" y="540" font-weight="900" font-size="112" fill="#FFFFFF" letter-spacing="-2">WHAT WOULD U DO<tspan fill="#C8E234">?</tspan></text>
  <text x="1024" y="632" font-family="JetBrains Mono" font-weight="800" font-size="54" fill="#E5383B" letter-spacing="26">APOCALYPSE</text>
  <text x="1024" y="714" font-weight="600" font-size="34" fill="#C9CED6">The world ended. <tspan fill="#FFFFFF" font-weight="800">You</tspan> decide what happens next.</text>
</g>
<!-- A / B pills at the edges of the safe area -->
<g font-family="Inter" font-weight="900" font-size="62" text-anchor="middle" filter="url(#shadow)">
  <rect x="596" y="572" width="84" height="84" rx="18" fill="#C8E234"/><text x="638" y="637" fill="#0A0D16">A</text>
  <rect x="1368" y="572" width="84" height="84" rx="18" fill="#E5383B"/><text x="1410" y="637" fill="#FFFFFF">B</text>
</g>
<!-- HUD (desktop/TV only) -->
<g font-family="JetBrains Mono" font-weight="700">
  <circle cx="96" cy="120" r="11" fill="#E5383B"/>
  <text x="120" y="130" font-size="30" fill="#E5383B" letter-spacing="5">NEW EPISODES · YOU VOTE</text>
  <text x="1952" y="130" font-size="30" fill="#8A8F99" letter-spacing="5" text-anchor="end">HOURS AWAKE <tspan fill="#FFFFFF">41:58</tspan></text>
</g>
<rect width="${W}" height="${H}" fill="url(#vig)"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;

(async () => {
  fs.writeFileSync('banner.svg', svg);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.setContent(`<body style="margin:0">${svg}</body>`);
  await p.screenshot({ path: 'banner.png', clip: { x: 0, y: 0, width: W, height: H } });
  // safe-area check overlay (for me, not for upload)
  await p.setContent(`<body style="margin:0;position:relative">${svg}
    <div style="position:absolute;left:406px;top:407px;width:1235px;height:338px;outline:4px dashed #0f0"></div>
    <div style="position:absolute;left:0;top:188px;width:2048px;height:776px;outline:4px dashed #f0f"></div></body>`);
  await p.screenshot({ path: 'banner_safezone_check.png', clip: { x: 0, y: 0, width: W, height: H } });
  await b.close();
})();
