// 公共组件：物理函数、原文条、白话字幕、实时读数、事件日志、3D 标签
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {KAI, XING, MONO, rand} from '../lib';
import {project, type Cam, type V3} from '../t3';

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const sm = (t: number) => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const eo = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const win = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const pulse = (f: number, at: number, d = 10) => (f >= at && f < at + d ? 1 - (f - at) / d : 0);

/* ─────────── 物理 ─────────── */
// 阻尼弹簧：t 时刻相对平衡位置的位移（初速冲量 v0）
export const spring = (t: number, k = 0.06, zeta = 0.12, v0 = 1) => {
	if (t < 0) return 0;
	const w = Math.sqrt(k), wd = w * Math.sqrt(Math.max(1e-4, 1 - zeta * zeta));
	return (v0 / wd) * Math.exp(-zeta * w * t) * Math.sin(wd * t);
};
// 弹簧趋近目标（临界阻尼）
export const approach = (t: number, w = 0.25) => (t <= 0 ? 0 : 1 - (1 + w * t) * Math.exp(-w * t));
// 抛体
export const ballistic = (t: number, p0: V3, v0: V3, g = -0.012): V3 => [p0[0] + v0[0] * t, p0[1] + v0[1] * t + 0.5 * g * t * t, p0[2] + v0[2] * t];
// 一维弹性碰撞（e 恢复系数）
export const collide = (m1: number, v1: number, m2: number, v2: number, e = 1) => {
	const p = m1 * v1 + m2 * v2;
	return [(p + m2 * e * (v2 - v1)) / (m1 + m2), (p + m1 * e * (v1 - v2)) / (m1 + m2)];
};
// 从 a 飞向 b：到达前直线加速，命中后按 mode 处理 —— absorb 吸收 / bounce 反弹 / pass 穿透
export const shot = (f: number, at: number, a: V3, b: V3, dur = 14, mode: 'absorb' | 'bounce' | 'stop' = 'absorb'): {p: V3; hit: number; alive: boolean} => {
	const t = f - at;
	if (t < 0) return {p: a, hit: -1, alive: false};
	if (t <= dur) { const u = Math.pow(t / dur, 1.6); return {p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)], hit: -1, alive: true}; }
	const h = t - dur;
	if (mode === 'absorb') return {p: b, hit: h, alive: h < 6};
	if (mode === 'stop') return {p: b, hit: h, alive: true};
	// 反弹：沿来向弹回并下坠
	const d: V3 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	const L = Math.hypot(...d) || 1;
	const v: V3 = [(d[0] / L) * 0.35, (d[1] / L) * 0.35 + 0.18, (d[2] / L) * 0.35];
	return {p: ballistic(h, b, v, -0.02), hit: h, alive: h < 40};
};

/* ─────────── 原文条：整句显示，当前小句高亮放大 ─────────── */
export const Verse: React.FC<{f: number; items: [number, string][]; color: string; tag?: string}> = ({f, items, color, tag}) => {
	let cur = -1;
	items.forEach(([at], i) => { if (f >= at) cur = i; });
	return (
		<div style={{position: 'absolute', top: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', padding: '0 220px'}}>
			{tag ? <span style={{fontFamily: MONO, fontSize: 14, color, letterSpacing: 3, marginRight: 14, opacity: 0.8}}>{tag}</span> : null}
			{items.map(([at, s], i) => {
				if (i < cur - 1 || i > cur + 1) return null;
				const tot = [cur - 1, cur, cur + 1].reduce((a, k) => a + (items[k]?.[1].length ?? 0), 0);
				if (tot > 30 && i !== cur && !(i === cur - 1 && (items[cur]?.[1].length ?? 0) < 14)) return null;
				const on = i === cur, past = i < cur;
				const lt = f - at;
				return (
					<span key={i} style={{fontFamily: KAI, fontSize: on ? 40 : 26, color: on ? '#fff8e6' : past ? 'rgba(240,230,210,0.55)' : 'rgba(240,230,210,0.22)', textShadow: on ? `0 0 ${12 + 14 * pulse(f, at, 12)}px ${color}` : 'none', letterSpacing: on ? 4 : 2, transform: on ? `scale(${1 + 0.25 * pulse(f, at, 8)})` : undefined, display: 'inline-block', transition: 'none'}}>
						{on ? Array.from(s).map((c, k) => <span key={k} style={{opacity: clamp((lt - k * 0.8) / 3)}}>{c}</span>) : s}
					</span>
				);
			})}
		</div>
	);
};

/* ─────────── 白话：底部，随节拍切换 ─────────── */
export const Cap: React.FC<{f: number; items: [number, string][]; color: string}> = ({f, items, color}) => {
	let cur = -1;
	items.forEach(([at], i) => { if (f >= at) cur = i; });
	if (cur < 0) return null;
	const [at, s] = items[cur];
	const lt = f - at;
	return (
		<div style={{position: 'absolute', bottom: 46, left: 0, right: 0, textAlign: 'center'}}>
			<span style={{display: 'inline-block', fontFamily: KAI, fontWeight: 700, fontSize: s.length > 34 ? 30 : 34, color: '#f6efe2', background: 'rgba(8,6,4,0.78)', padding: '6px 24px', borderBottom: `3px solid ${color}`, opacity: clamp(lt / 4), transform: `translateY(${(1 - eo(lt / 6)) * 14}px)`}}>
				{Array.from(s).slice(0, Math.floor(lt * 3.5)).join('')}
			</span>
		</div>
	);
};

/* ─────────── 实时读数面板 ─────────── */
export type Row = [string, number, string, string?]; // 标签 数值(0..1 画条) 文字 颜色
export const Hud: React.FC<{x: number; y: number; title: string; rows: Row[]; color: string; w?: number}> = ({x, y, title, rows, color, w = 300}) => (
	<div style={{position: 'absolute', left: x, top: y, width: w, background: 'rgba(6,5,4,0.72)', border: `1px solid ${color}55`, padding: '10px 12px'}}>
		<div style={{fontFamily: MONO, fontSize: 12, color, letterSpacing: 3, marginBottom: 6}}>{title}</div>
		{rows.map(([k, v, txt, c], i) => (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}>
				<span style={{fontFamily: KAI, fontSize: 18, color: c ?? '#e9dfcc', width: 64, whiteSpace: 'nowrap'}}>{k}</span>
				<div style={{flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', position: 'relative'}}>
					<div style={{width: `${clamp(v) * 100}%`, height: '100%', background: c ?? color, boxShadow: `0 0 8px ${c ?? color}`}} />
				</div>
				<span style={{fontFamily: MONO, fontSize: 13, color: '#cfc4ae', width: 62, textAlign: 'right'}}>{txt}</span>
			</div>
		))}
	</div>
);

/* ─────────── 事件日志：右下滚动 ─────────── */
export const Log: React.FC<{f: number; items: [number, string, string?][]; color: string; x?: number; y?: number}> = ({f, items, color, x = 1560, y = 700}) => {
	const vis = items.filter(([at]) => f >= at).slice(-7);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: 330}}>
			{vis.map(([at, s, c], i) => {
				const lt = f - at;
				const last = i === vis.length - 1;
				return (
					<div key={at + s} style={{fontFamily: MONO, fontSize: 14, color: last ? '#fff' : 'rgba(220,210,190,0.55)', marginTop: 3, opacity: clamp(lt / 3), transform: `translateX(${(1 - eo(lt / 6)) * 30}px)`, whiteSpace: 'nowrap'}}>
						<span style={{color: c ?? color}}>▸ {String(at).padStart(4, '0')}</span> <span style={{fontFamily: KAI, fontSize: 17}}>{s}</span>
					</div>
				);
			})}
		</div>
	);
};

/* ─────────── 3D 点上的标签 ─────────── */
export const L3: React.FC<{cam: Cam; p: V3; text: string; color: string; size?: number; op?: number; dy?: number; font?: string; box?: boolean}> = ({cam, p, text, color, size = 26, op = 1, dy = 0, font = KAI, box}) => {
	const q = project(cam, p);
	if (q.z > 1 || op <= 0) return null;
	return (
		<div style={{position: 'absolute', left: q.x, top: q.y + dy, transform: 'translate(-50%,-50%)', fontFamily: font, fontSize: size, color, opacity: op, whiteSpace: 'nowrap', textShadow: '0 0 6px #000, 0 0 12px #000', background: box ? 'rgba(8,6,4,0.8)' : undefined, border: box ? `1px solid ${color}` : undefined, padding: box ? '2px 10px' : undefined}}>
			{text}
		</div>
	);
};

/* ─────────── SVG 火花爆散（屏幕坐标） ─────────── */
export const Burst: React.FC<{x: number; y: number; t: number; color: string; n?: number; r?: number; seed?: number}> = ({x, y, t, color, n = 28, r = 140, seed = 0}) => {
	if (t < 0 || t > 26) return null;
	const u = t / 26;
	return (
		<g>
			<circle cx={x} cy={y} r={r * 0.8 * eo(u)} fill="none" stroke={color} strokeWidth={4 * (1 - u)} opacity={1 - u} />
			{Array.from({length: n}).map((_, i) => {
				const a = rand(i + seed) * Math.PI * 2, sp = 0.5 + rand(i + seed + 50);
				const d = r * sp * eo(u);
				return <line key={i} x1={x + Math.cos(a) * d * 0.6} y1={y + Math.sin(a) * d * 0.6 + u * u * 30} x2={x + Math.cos(a) * d} y2={y + Math.sin(a) * d + u * u * 40} stroke={color} strokeWidth={2.5} opacity={1 - u} strokeLinecap="round" />;
			})}
		</g>
	);
};

/* ─────────── 屏幕冲击（局部） ─────────── */
export const shake = (f: number, hits: number[], amp = 14) => {
	let a = 0;
	for (const h of hits) { const d = f - h; if (d >= 0 && d < 14) a += Math.exp(-d / 3.5); }
	return [(rand(f * 1.7) - 0.5) * 2 * amp * a, (rand(f * 2.3 + 5) - 0.5) * 2 * amp * a] as const;
};

/* ─────────── 角标：小块文字随意义闪现 ─────────── */
export const Stamp: React.FC<{x: number; y: number; t: number; text: string; color: string; size?: number; life?: number}> = ({x, y, t, text, color, size = 44, life = 40}) => {
	if (t < 0 || t > life) return null;
	const s = t < 5 ? 1.8 - 0.8 * (t / 5) : 1;
	return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(-6deg)`, fontFamily: XING, fontSize: size, color, border: `3px solid ${color}`, padding: '0 12px', opacity: clamp((life - t) / 8), textShadow: `0 0 12px ${color}`}}>{text}</div>;
};

export const useF = () => useCurrentFrame();
