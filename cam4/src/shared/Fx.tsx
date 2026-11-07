import React from 'react';
import {W, H} from '../constants';
import {staticFile} from 'remotion';
import {rnd, ez, OUT} from '../util';

export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.3}) => {
  const k = Math.floor(f) % 4;
  const ox = Math.floor(rnd(f * 3.7) * 540);
  const oy = Math.floor(rnd(f * 9.1) * 960);
  return (
    <div
      style={{
        position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay', pointerEvents: 'none',
        backgroundImage: `url(${staticFile(`tex/grain_${k}.png`)})`,
        backgroundSize: '1080px 1920px',
        backgroundPosition: `${-ox * 2}px ${-oy * 2}px`,
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number; pulse?: number}> = ({strength = 0.7, pulse = 0}) => (
  <div
    style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) ${46 - pulse * 6}%, rgba(0,0,0,${strength + pulse * 0.18}) 100%)`,
    }}
  />
);

export const ChromaWrap: React.FC<{amount: number; children: React.ReactNode}> = ({amount, children}) => {
  const d = Math.round(amount * 10) / 10;
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="ca" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx={d} dy={0} result="ro" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feOffset in="b" dx={-d} dy={0} result="bo" />
            <feBlend in="ro" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bo" mode="screen" />
          </filter>
        </defs>
      </svg>
      <div style={{position: 'absolute', inset: 0, filter: d >= 0.4 ? 'url(#ca)' : undefined}}>{children}</div>
    </>
  );
};

export const Flash: React.FC<{color: string; start: number; len: number; f: number; peak?: number}> = ({color, start, len, f, peak = 0.4}) => {
  if (f < start || f >= start + len) return null;
  const a = peak * (1 - 0.45 * ez(f, start, start + len, 0, 1, OUT));
  return <div style={{position: 'absolute', inset: 0, background: color, opacity: a, pointerEvents: 'none'}} />;
};
