import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, getStaticFiles} from 'remotion';
import {SA, A_DUR} from './a';
import {XING, KAI, MONO, rand} from '../lib';
import {clamp, eo, sm, pulse} from './kit';
import {HexG} from './fx';
import {XT} from './data';
import {SCN} from './scenes';

const fontHandle = delayRender('fonts');
Promise.all([
	new FontFace('KaiX', `url(${staticFile('kaiti.ttf')})`).load(),
	new FontFace('XingX', `url(${staticFile('xingkai.ttf')})`).load(),
]).then((fs) => { fs.forEach((x) => document.fonts.add(x)); continueRender(fontHandle); }).catch(() => continueRender(fontHandle));

const CH = ['生成', '方圆', '错综', '互变', '序卦', '消息', '八宫'];
const GOLD = '#ffd27a';

// 64 卦环：开场炸开、收尾收拢
const Ring64: React.FC<{f: number; r: number; spin: number; op?: number; w?: number}> = ({f, r, spin, op = 1, w = 34}) => (
	<svg width={1920} height={1080} style={{position: 'absolute'}}>
		{XT.map((g, i) => {
			const a = (i / 64) * Math.PI * 2 + spin;
			const rr = r * (1 + 0.04 * Math.sin(f * 0.2 + i));
			return <HexG key={i} x={960 + Math.cos(a) * rr} y={540 + Math.sin(a) * rr} w={w} lines={g.lines} color={g.lines[5] ? '#ffe7b0' : '#8ec2ff'} rot={(a * 180) / Math.PI + 90} op={op} />;
		})}
	</svg>
);

const IN = 90;
const Intro: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - sm((f - 80) / 10)}}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{Array.from({length: 180}).map((_, i) => { const a = rand(i) * 6.28; const d = 40 + ((f * 11 * (0.4 + rand(i + 1))) % 1100); return <line key={i} x1={960 + Math.cos(a) * d} y1={540 + Math.sin(a) * d * 0.6} x2={960 + Math.cos(a) * (d + 40)} y2={540 + Math.sin(a) * (d + 40) * 0.6} stroke={i % 2 ? GOLD : '#8ec2ff'} strokeWidth={2} opacity={0.4} />; })}
			</svg>
			<Ring64 f={f} r={430 * eo(f / 18) + 20 * pulse(f, 18, 10)} spin={f * 0.012} op={clamp(f / 6)} />
			<div style={{fontFamily: MONO, fontSize: 20, color: GOLD, letterSpacing: 10, opacity: clamp(f / 8)}}>I CHING · 64 HEXAGRAMS</div>
			<div style={{fontFamily: XING, fontSize: 150, color: '#f6efe2', letterSpacing: 24, textShadow: `0 0 40px ${GOLD}`, transform: `scale(${1.7 - 0.7 * eo(f / 12)})`, opacity: clamp(f / 6)}}>六十四卦</div>
			<div style={{fontFamily: KAI, fontSize: 36, color: GOLD, letterSpacing: 14, marginTop: 4, opacity: clamp((f - 12) / 10)}}>结构 · 关系 · 内容</div>
			<div style={{display: 'flex', gap: 22, marginTop: 26}}>
				{CH.map((c, i) => <span key={c} style={{fontFamily: KAI, fontSize: 28, color: '#f6efe2', opacity: clamp((f - 24 - i * 3) / 6), transform: `translateY(${(1 - eo((f - 24 - i * 3) / 8)) * 24}px)`, display: 'inline-block'}}><span style={{fontFamily: MONO, fontSize: 14, color: GOLD, marginRight: 4}}>0{i + 1}</span>{c}</span>)}
			</div>
		</AbsoluteFill>
	);
};

const OUT = 150;
const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const r = 430 * (1 - eo((f - 16) / 46)) + 10;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - sm((f - 130) / 20)}}>
			<Ring64 f={f} r={Math.max(10, r)} spin={f * 0.02 + Math.pow(Math.max(0, f - 16) / 46, 2) * 6} op={clamp(f / 8) * (1 - sm((f - 50) / 25))} w={34 * (0.4 + 0.6 * clamp(r / 430))} />
			<div style={{fontFamily: XING, fontSize: 120, color: '#f6efe2', letterSpacing: 24, textShadow: `0 0 40px ${GOLD}`, transform: `scale(${1.4 - 0.4 * eo(f / 14)})`, opacity: clamp(f / 10), marginTop: -40}}>周而复始</div>
			<div style={{fontFamily: KAI, fontSize: 26, color: GOLD, letterSpacing: 4, marginTop: 10, opacity: clamp((f - 14) / 10), maxWidth: 1600, textAlign: 'center'}}>
				两仪生成 · 方圆排布 · 错综成对 · 互卦归四 · 一爻之变 · 序卦相承 · 十二消息 · 八宫世应
			</div>
			<div style={{position: 'absolute', bottom: 70, fontFamily: KAI, fontSize: 24, color: 'rgba(240,230,210,0.7)', letterSpacing: 3, opacity: clamp((f - 24) / 10)}}>释读据《周易》经传及邵雍、京房诸家易学　|　卦象为传统文化之符号体系，不构成占卜或决策建议</div>
		</AbsoluteFill>
	);
};

export const SCENES: [React.FC, number][] = [[Intro, IN], ...SCN, [Outro, OUT]];
export const STARTS = SCENES.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + SCENES[i - 1][1] : 0], []);
export const TOTAL = SCENES.reduce((a, s) => a + s[1], 0);
const hasMusic = () => getStaticFiles().some((x) => x.name === 'music.wav');
export const GMain: React.FC = () => {
	const f = useCurrentFrame();
	let flash = 0;
	for (const s of STARTS.slice(1)) { const d = f - s; if (d >= 0 && d < 8) flash = Math.max(flash, (1 - d / 8) * 0.55); }
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #141a22 0%, #030406 80%)'}}>
			{hasMusic() ? <Audio src={staticFile('music.wav')} /> : null}
			{SCENES.map(([C, d], i) => <Sequence
				key={i}
				from={STARTS[i]}
				durationInFrames={d}
				style={{
					scale: 1.016
				}}
			><C /></Sequence>)}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
			<div style={{position: 'absolute', left: 0, bottom: 0, height: 4, width: `${(f / TOTAL) * 100}%`, background: `linear-gradient(90deg,${GOLD},#5ea8ff)`}} />
			<AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};
export {SA, A_DUR};
