import React from 'react';
import {interpolate, Easing, useCurrentFrame} from 'remotion';

export const W = 1920;
export const H = 1080;
export const FPS = 30;

// 每章一套色板：Main 在渲染前按当前场景设置 THEME，子组件读取 C.cyan / C.mag 时自动换色
export type Theme = {a: string; b: string; bg: [string, string]; glow: string};
export const THEMES: Record<string, Theme> = {
	open: {a: '#e6c27a', b: '#e8432f', bg: ['#241a10', '#0a0806'], glow: 'rgba(230,194,122,0.07)'},
	overview: {a: '#e6c27a', b: '#e8432f', bg: ['#22180f', '#0a0806'], glow: 'rgba(232,67,47,0.06)'},
	yinyang: {a: '#ece8df', b: '#8fa3bd', bg: ['#1b1c20', '#050506'], glow: 'rgba(200,210,230,0.05)'},
	wuxing: {a: '#9fe3b0', b: '#ff6a3c', bg: ['#141a10', '#060805'], glow: 'rgba(76,211,138,0.06)'},
	qi: {a: '#5fd6c4', b: '#b9f5ea', bg: ['#0a211e', '#030a09'], glow: 'rgba(95,214,196,0.08)'},
	tiangan: {a: '#f0a35a', b: '#ffd27a', bg: ['#2a1708', '#0a0503'], glow: 'rgba(240,163,90,0.07)'},
	dizhi: {a: '#8fb0ff', b: '#c49bff', bg: ['#111633', '#04050c'], glow: 'rgba(120,150,255,0.07)'},
	ganzhi: {a: '#d29a52', b: '#5fd6c4', bg: ['#21170c', '#070504'], glow: 'rgba(210,154,82,0.07)'},
	heluo: {a: '#ffd76a', b: '#6aa8ff', bg: ['#0b1236', '#02030a'], glow: 'rgba(106,168,255,0.08)'},
	bagua: {a: '#f2efe8', b: '#e8432f', bg: ['#191919', '#040404'], glow: 'rgba(255,255,255,0.04)'},
	zhouyi: {a: '#d9a85e', b: '#b0402a', bg: ['#3a2814', '#120b05'], glow: 'rgba(217,168,94,0.08)'},
	hex64: {a: '#7fe0ff', b: '#ffffff', bg: ['#08202a', '#020709'], glow: 'rgba(127,224,255,0.07)'},
	ming: {a: '#f2c14e', b: '#e8432f', bg: ['#2a1e08', '#0a0703'], glow: 'rgba(242,193,78,0.08)'},
	bu: {a: '#d08a4a', b: '#f2d3a0', bg: ['#26170c', '#090503'], glow: 'rgba(208,138,74,0.08)'},
	xiang: {a: '#6fd39a', b: '#5fb8ff', bg: ['#0c2018', '#030907'], glow: 'rgba(111,211,154,0.07)'},
	yi: {a: '#ff7a6a', b: '#ffd0c8', bg: ['#2a0e0e', '#0a0303'], glow: 'rgba(255,90,80,0.08)'},
	shan: {a: '#bcd6ff', b: '#e6f0ff', bg: ['#141c2a', '#05070b'], glow: 'rgba(188,214,255,0.08)'},
	unify: {a: '#ffd27a', b: '#e8432f', bg: ['#2a1a08', '#080503'], glow: 'rgba(255,210,122,0.09)'},
	outro: {a: '#e6c27a', b: '#ff3b2f', bg: ['#220a08', '#060202'], glow: 'rgba(255,59,47,0.07)'},
};
let THEME: Theme = THEMES.open;
export const setTheme = (t: Theme) => { THEME = t; };
export const getTheme = () => THEME;
export const C = {
	bg: '#0c0a08',
	get cyan() { return THEME.a; },
	get mag() { return THEME.b; },
	amber: '#f0a35a',
	green: '#4cd38a',
	violet: '#a98bff',
	red: '#ff3b2f',
	blue: '#3d9bff',
	white: '#f2e8d5',
	dim: 'rgba(230,215,190,0.42)',
	grid: 'rgba(230,200,140,0.07)',
};

export const MONO = '"JetBrains Mono", "SF Mono", Menlo, Monaco, monospace';
export const SANS = '"Songti SC", "STSong", "PingFang SC", serif';
export const KAI = 'KaiX, "Songti SC", serif';
export const XING = 'XingX, KaiX, serif';

export const ip = (
	f: number,
	inp: number[],
	out: number[],
	ease: (t: number) => number = Easing.bezier(0.2, 0.8, 0.2, 1),
) =>
	interpolate(f, inp, out, {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});

export const lin = (f: number, inp: number[], out: number[]) =>
	interpolate(f, inp, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

export const gauss = (i: number) => {
	const u = Math.max(1e-6, rand(i * 2.13 + 0.5));
	const v = rand(i * 3.71 + 9.1);
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// wavelength (nm) -> rgb
export const waveColor = (wl: number) => {
	let r = 0, g = 0, b = 0;
	if (wl < 380) return 'rgb(150,120,255)';
	if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
	else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
	else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
	else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
	else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
	else { r = 1; }
	return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
};

const GLYPHS = '乾坤震巽坎离艮兑甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥☰☷☳☴☵☲☶☱';
export const scramble = (text: string, f: number, start: number, perChar = 1.5) =>
	text
		.split('')
		.map((ch, i) => {
			const t = f - start - i * perChar;
			if (t >= 6 || ch === ' ') return ch;
			if (t < 0) return ' ';
			return GLYPHS[Math.floor(rand(i * 13 + f * 7) * GLYPHS.length)];
		})
		.join('');

export const typed = (text: string, f: number, start: number, cps = 1.2) => {
	const n = Math.floor(Math.max(0, f - start) * cps);
	return Array.from(text).slice(0, n).join('');
};

export const Typer: React.FC<{
	text: string;
	start: number;
	cps?: number;
	style?: React.CSSProperties;
	cursor?: boolean;
}> = ({text, start, cps = 1.2, style, cursor = true}) => {
	const f = useCurrentFrame();
	const s = typed(text, f, start, cps);
	const done = s.length >= Array.from(text).length;
	return (
		<span style={style}>
			{s}
			{cursor && f >= start && (!done || Math.floor(f / 8) % 2 === 0) ? (
				<span style={{opacity: 0.8}}>▌</span>
			) : null}
		</span>
	);
};

// HUD panel with corner brackets
export const Panel: React.FC<{
	x: number; y: number; w: number; h: number;
	label?: string; color?: string; appear?: number; children?: React.ReactNode;
}> = ({x, y, w, h, label, color = C.cyan, appear = 0, children}) => {
	const f = useCurrentFrame();
	const p = ip(f, [appear, appear + 10], [0, 1]);
	const flick = f - appear < 10 ? (rand(f * 3.3 + x) > 0.4 ? 1 : 0.3) : 1;
	const cl = 18;
	return (
		<div
			style={{
				position: 'absolute', left: x, top: y, width: w, height: h,
				opacity: p * flick,
				transform: `scale(${0.96 + 0.04 * p})`,
				background: 'rgba(40,28,14,0.32)',
				border: `1px solid ${color}22`,
				clipPath: `inset(-30px ${(1 - p) * 100}% -30px -30px)`,
			}}
		>
			<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				{[[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].map(([a, b, sx, sy], i) => (
					<path key={i} d={`M${a} ${b + sy * cl} L${a} ${b} L${a + sx * cl} ${b}`} stroke={color} strokeWidth={2} fill="none" />
				))}
			</svg>
			{label ? (
				<div style={{position: 'absolute', left: 12, top: -11, background: C.bg, padding: '0 8px', color, fontFamily: MONO, fontSize: 15, letterSpacing: 2}}>
					{label}
				</div>
			) : null}
			{children}
		</div>
	);
};

export const Fx: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
	<div style={{position: 'absolute', fontFamily: MONO, color: C.white, ...style}}>{children}</div>
);

// Caption bar, list of [startFrame, text]
export const Captions: React.FC<{items: [number, string][]; y?: number}> = ({items, y = 950}) => {
	const f = useCurrentFrame();
	let cur = -1;
	items.forEach(([s], i) => { if (f >= s) cur = i; });
	if (cur < 0) return null;
	const [s, text] = items[cur];
	const t = f - s;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: KAI, fontWeight: 700, fontSize: Array.from(text).length > 30 ? 34 : 42, color: C.white, letterSpacing: 3, textShadow: `0 0 18px ${C.mag}88`}}>
			<span style={{opacity: ip(t, [0, 4], [0, 1]), display: 'inline-block', transform: `translateY(${ip(t, [0, 6], [14, 0])}px)`, background: 'rgba(12,10,8,0.72)', padding: '6px 26px', borderLeft: `5px solid ${C.mag}`, borderRight: `5px solid ${C.mag}`}}>
				{typed(text, t, 0, 2.2)}
			</span>
		</div>
	);
};

// Fact list typed rapidly
export const Facts: React.FC<{items: [number, string, string?][]; x: number; y: number; size?: number; w?: number}> = ({items, x, y, size = 20, w = 560}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: MONO, fontSize: size, lineHeight: 1.55}}>
			{items.map(([s, txt, col], i) =>
				f >= s ? (
					<div key={i} style={{color: col ?? C.white, opacity: ip(f, [s, s + 3], [0, 1])}}>
						<span style={{color: C.dim}}>{'> '}</span>
						{typed(txt, f, s, 2.5)}
					</div>
				) : null,
			)}
		</div>
	);
};

export const svgPath = (pts: [number, number][]) =>
	pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

export const Axis: React.FC<{x: number; y: number; w: number; h: number; xl?: string; yl?: string; color?: string}> = ({x, y, w, h, xl, yl, color = C.dim}) => (
	<g>
		{Array.from({length: 11}).map((_, i) => (
			<line key={'g' + i} x1={x + (w * i) / 10} y1={y} x2={x + (w * i) / 10} y2={y + h} stroke={C.grid} />
		))}
		{Array.from({length: 6}).map((_, i) => (
			<line key={'h' + i} x1={x} y1={y + (h * i) / 5} x2={x + w} y2={y + (h * i) / 5} stroke={C.grid} />
		))}
		<line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={color} strokeWidth={1.5} />
		<line x1={x} y1={y} x2={x} y2={y + h} stroke={color} strokeWidth={1.5} />
		{xl ? <text x={x + w} y={y + h + 24} fill={color} fontFamily={MONO} fontSize={15} textAnchor="end">{xl}</text> : null}
		{yl ? <text x={x + 6} y={y - 8} fill={color} fontFamily={MONO} fontSize={15}>{yl}</text> : null}
	</g>
);

export const fmt = (n: number, d = 3) => n.toFixed(d);
