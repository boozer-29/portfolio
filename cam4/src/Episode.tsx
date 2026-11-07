import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C} from './constants';
import './shared/fonts';
import {ChromaWrap, Grain, Vignette} from './shared/Fx';
import {S1Hook} from './scenes/S1Hook';
import {S2Rules} from './scenes/S2Rules';
import {S3Feeds} from './scenes/S3Feeds';
import {S4LightsOut} from './scenes/S4LightsOut';
import {S5Door} from './scenes/S5Door';
import {S6Cam4} from './scenes/S6Cam4';
import {S7Cliffhanger} from './scenes/S7Cliffhanger';
import {EndCard} from './scenes/EndCard';
import {beatPulse, chroma, shakeAt} from './timeline';
import {ez, wob, IO} from './util';

export const Episode: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 1740) {
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <EndCard f={f} />
      </AbsoluteFill>
    );
  }
  const pulse = f >= 600 ? beatPulse(f) : 0;
  const sh = shakeAt(f);
  // handheld drift so nothing is ever perfectly still
  const hx = 1.6 * wob(f, 71, 0.8);
  const hy = 1.6 * wob(f, 72, 0.8);
  const tense = ez(f, 0, 1700, 0.55, 0.82, IO);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${sh.x + hx}px, ${sh.y + hy}px)`}}>
        <ChromaWrap amount={chroma(f)}>
          {f < 90 && <S1Hook f={f} />}
          {f >= 90 && f < 270 && <S2Rules f={f} />}
          {f >= 270 && f < 600 && <S3Feeds f={f} />}
          {f >= 600 && f < 960 && <S4LightsOut f={f} pulse={pulse} />}
          {f >= 960 && f < 1380 && <S5Door f={f} pulse={pulse} />}
          {f >= 1380 && f < 1620 && <S6Cam4 f={f} />}
          {f >= 1620 && <S7Cliffhanger f={f} pulse={pulse} />}
        </ChromaWrap>
      </div>
      <Vignette strength={tense} pulse={pulse} />
      <Grain f={f} opacity={0.3} />
      {/* studio timeline labels only (components are pure functions of the absolute frame) */}
      <Sequence from={0} durationInFrames={90} name="S1 Hook" layout="none"><></></Sequence>
      <Sequence from={90} durationInFrames={180} name="S2 Rules" layout="none"><></></Sequence>
      <Sequence from={270} durationInFrames={330} name="S3 Feeds" layout="none"><></></Sequence>
      <Sequence from={600} durationInFrames={360} name="S4 Lights Out" layout="none"><></></Sequence>
      <Sequence from={960} durationInFrames={420} name="S5 The Door" layout="none"><></></Sequence>
      <Sequence from={1380} durationInFrames={240} name="S6 CAM 4" layout="none"><></></Sequence>
      <Sequence from={1620} durationInFrames={120} name="S7 Cliffhanger" layout="none"><></></Sequence>
    </AbsoluteFill>
  );
};
