import React from 'react';
import {SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {PhoneFrame} from '../shared/PhoneFrame';
import {BULB_DIES, NV_ON, bulbOn, clockText, flickerSteps, inFlicker} from '../timeline';
import {ez, wob, IO, OUT} from '../util';

const CAPS: Cap[] = [{voice: 'v12', end: 800, lines: ["DON'T BLINK."], accent: [0, 1, 'red']}];

export const S4LightsOut: React.FC<{f: number; pulse: number}> = ({f, pulse}) => {
  const nv = f >= NV_ON;
  const on = bulbOn(f);
  const mode = nv ? 'nv' : on ? 'lit' : 'dark';
  const s = flickerSteps(f);
  const figures = nv ? [Number(s >= 1) + Number(s >= 4), Number(s >= 2) + Number(s >= 5), Number(s >= 3) + Number(s >= 6)] : undefined;
  const drop = nv && inFlicker(f);
  // slow zoom 100% -> 115% over exactly 200 frames (640-840), then a creeping hold
  const zoom =
    f < 640 ? ez(f, 600, 640, 1.0, 1.0 + 0.0, IO) + 0.0 :
    f < 840 ? ez(f, 640, 840, 1.0, 1.15, IO) :
    ez(f, 840, 960, 1.15, 1.19, OUT);
  const hover = ez(f, 650, 959, 1, 0.35, IO);
  const trem = 1 + ez(f, 800, 959, 0, 3, IO);
  const thumb = {x: 790 + 6 * trem * wob(f, 9, 2), y: 1180 + 40 * (1 - hover) + 6 * trem * wob(f, 11, 2), hover, press: 0};
  const ghosts = !nv && !on && f < BULB_DIES ? 1 : 0;
  return (
    <>
      <PhoneFrame f={f} thumb={thumb} scale={1 + 0.008 * pulse}>
        <CamFeed
          cam={1} f={f} mode={mode} w={SCREEN.w} h={SCREEN.h} ts={clockText(f)} bulbLit={on}
          figures={figures} ghosts={ghosts} zoom={zoom} origin={[0.5, 0.47]}
          jitter={drop ? 3 : nv ? 1.1 : 0.7} dropout={drop} black={f >= BULB_DIES && f < NV_ON ? 0.25 : 0} seed={2}
        />
      </PhoneFrame>
      <Captions f={f} caps={CAPS} />
    </>
  );
};
