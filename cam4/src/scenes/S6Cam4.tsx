import React from 'react';
import {SCREEN} from '../constants';
import {CamFeed} from '../shared/CamFeed';
import {Captions, Cap} from '../shared/Caption';
import {PhoneFrame} from '../shared/PhoneFrame';
import {cam4Text} from '../timeline';
import {ez, wob, IO, OUT} from '../util';

const CAPS: Cap[] = [
  {start: 1400, end: 1492, lines: ['THE FEED IS', '3 SECONDS BEHIND.'], accent: [1, 2, 'red']},
  {start: 1556, end: 1620, lines: ['WHATEVER YOU SEE...', 'IS ALREADY THERE.'], accent: [1, 2, 'red']},
];

export const S6Cam4: React.FC<{f: number}> = ({f}) => {
  const zoom = ez(f, 1380, 1620, 1.0, 1.16, IO);
  const unfold = ez(f, 1498, 1572, 0, 1, IO);
  const thumb = {x: 870 + 5 * wob(f, 31, 1.2), y: 1690 + 5 * wob(f, 32, 1.2), hover: 1};
  return (
    <>
      <PhoneFrame f={f} thumb={thumb}>
        <CamFeed cam={4} f={f} mode="lit" w={SCREEN.w} h={SCREEN.h} ts={cam4Text(f)} zoom={zoom} origin={[0.4, 0.66]} person unfold={unfold} jitter={0.5} seed={6} />
      </PhoneFrame>
      <Captions f={f} caps={CAPS} />
    </>
  );
};
