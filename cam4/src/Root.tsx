import React from 'react';
import {Composition} from 'remotion';
import {Episode} from './Episode';
import {FPS, H, TOTAL, W} from './constants';

export const Root: React.FC = () => (
  <Composition id="cam4-ep1" component={Episode} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
