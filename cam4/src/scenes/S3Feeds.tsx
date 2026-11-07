import React from 'react';
import {C, SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {PhoneFrame} from '../shared/PhoneFrame';
import {cam4Text, clockText} from '../timeline';
import {ez, sp, wob, OUT, IO, IN} from '../util';

const CAPS: Cap[] = [{start: 555, end: 600, lines: ['ALL QUIET.', 'FOR NOW.'], accent: [0, 1, 'lime']}];

const CW = 486;
const CH = 560;
const GAP = 12;
const GX = 12;
const GY = 232;
const cells = [
  {cam: 1 as const, x: GX, y: GY},
  {cam: 2 as const, x: GX + CW + GAP, y: GY},
  {cam: 3 as const, x: GX, y: GY + CH + GAP},
  {cam: 4 as const, x: GX + CW + GAP, y: GY + CH + GAP},
];

export const S3Feeds: React.FC<{f: number}> = ({f}) => {
  // which cell is being pushed into (60 frames each from 300)
  const k = Math.floor((f - 300) / 60);
  const u = f - (300 + k * 60);
  const active = k >= 0 && k < 4;
  const bump = active ? Math.max(0, ez(u, 0, 26, 0, 1, OUT) - ez(u, 40, 60, 0, 1, IO)) : 0;
  const focus = active ? cells[k] : cells[0];
  const ox = focus.x + CW / 2;
  const oy = focus.y + CH / 2;
  // closing move: dive into CAM 1 so S4 can open on it full-screen
  const dive = ez(f, 586, 600, 0, 1, IN);
  const creep = 0.012 * ez(f, 270, 560, 0, 1, IO);
  const TARGET = {x: SCREEN.w / 2, y: 790};
  const sPush = 1 + 0.88 * bump;
  const sDive = 1 + 1.07 * dive;
  const scale = (active ? sPush : sDive) + creep;
  const tgt = active ? TARGET : {x: SCREEN.w / 2, y: 702};
  const amt = active ? bump : dive;
  const tx = amt * (tgt.x - scale * ox);
  const ty = amt * (tgt.y - scale * oy);
  const jit = (c: number) => (active && k === c ? 1.4 : 0.6);
  const thumb = {x: 760 + 30 * wob(f, 3), y: 1560 + 20 * wob(f, 4), press: active && u < 4 ? 1 : 0, hover: 1};
  return (
    <>
      <PhoneFrame f={f} thumb={thumb}>
        <div style={{position: 'absolute', inset: 0, background: C.panel}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0'}}>
            {cells.map((c, i) => {
              const a = sp(f, 272 + i * 5, {damping: 16, stiffness: 140, mass: 0.8});
              const dim = active && k !== i ? 0.55 : 1;
              const ts = c.cam === 4 ? cam4Text(f) : clockText(f);
              return (
                <div key={i} style={{position: 'absolute', left: c.x, top: c.y, width: CW, height: CH, opacity: Math.min(1, a) * dim, transform: `scale(${0.94 + 0.06 * Math.min(1, a)})`, borderRadius: 14, overflow: 'hidden', outline: active && k === i ? `4px solid ${C.lime}` : '2px solid rgba(255,255,255,0.08)'}}>
                  <CamFeed cam={c.cam} f={f} mode="lit" w={CW} h={CH} ts={ts} compact jitter={jit(i)} seed={i * 7 + 1} person={false} />
                </div>
              );
            })}
          </div>
        </div>
      </PhoneFrame>
      <Captions f={f} caps={CAPS} />
    </>
  );
};
