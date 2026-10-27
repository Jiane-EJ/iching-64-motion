// 卦象图元：SVG 卦、3D 卦（爻可连续形变）、线段云、标题条、扫描/故障效果
import React from 'react';
import * as THREE from 'three';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, eo, pulse} from './kit';
import type {V3} from '../t3';

/* ─────────── SVG 卦：lines 自下而上，取值 0..1 连续（0 阴 1 阳，中间为形变） ─────────── */
export const HexG: React.FC<{x: number; y: number; w: number; lines: number[]; color: string; yin?: string; lh?: number; rot?: number; op?: number; hl?: number[]; hlc?: string; glow?: number; sx?: number}> = ({x, y, w, lines, color, yin, lh, rot = 0, op = 1, hl, hlc = '#fff', glow = 0, sx = 1}) => {
	const h = lh ?? w * 0.12;
	const pitch = h * 1.75;
	const n = lines.length;
	const gap = w * 0.2;
	if (op <= 0.01) return null;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${sx},1)`} opacity={op} style={glow ? {filter: `drop-shadow(0 0 ${glow}px ${color})`} : undefined}>
			{lines.map((v, i) => {
				const cy = ((n - 1) / 2 - i) * pitch - h / 2;
				const half = (w - gap * (1 - clamp(v))) / 2;
				const c = hl && hl[i] > 0 ? hlc : v < 0.5 && yin ? yin : color;
				const o = hl && hl[i] > 0 ? 1 : 1;
				return (
					<g key={i} opacity={o}>
						<rect x={-w / 2} y={cy} width={half} height={h} fill={c} rx={h * 0.15} />
						<rect x={w / 2 - half} y={cy} width={half} height={h} fill={c} rx={h * 0.15} />
					</g>
				);
			})}
		</g>
	);
};
export const hexH = (w: number, n = 6, lh?: number) => { const h = lh ?? w * 0.12; return (n - 1) * h * 1.75 + h; };

/* ─────────── 3D 卦：每爻两块，宽度随 v 合拢；可每爻异色 ─────────── */
export const Hex3D: React.FC<{lines: number[]; pos?: V3; rot?: V3; color: string; colors?: string[]; w?: number; scale?: number; emissive?: number; op?: number}> = ({lines, pos = [0, 0, 0], rot = [0, 0, 0], color, colors, w = 3, scale = 1, emissive = 0.5, op = 1}) => {
	const gap = w * 0.2;
	const n = lines.length;
	return (
		<group position={pos} rotation={rot} scale={scale}>
			{lines.map((v, i) => {
				const y = (i - (n - 1) / 2) * 0.62;
				const half = (w - gap * (1 - clamp(v))) / 2;
				const c = colors?.[i] ?? color;
				return [-1, 1].map((s) => (
					<mesh key={i * 2 + (s > 0 ? 1 : 0)} position={[s * (w / 2 - half / 2), y, 0]}>
						<boxGeometry args={[half, 0.36, 0.5]} />
						<meshStandardMaterial color={c} emissive={c} emissiveIntensity={emissive} metalness={0.4} roughness={0.3} transparent={op < 1} opacity={op} />
					</mesh>
				));
			})}
		</group>
	);
};

/* ─────────── 线段集合（加法混合） ─────────── */
export const Segs: React.FC<{pts: number[]; color: string; opacity?: number}> = ({pts, color, opacity = 0.6}) => {
	const arr = new Float32Array(pts);
	return (
		<lineSegments>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[arr, 3]} count={arr.length / 3} array={arr} itemSize={3} />
			</bufferGeometry>
			<lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
		</lineSegments>
	);
};

/* ─────────── 章节角标：左上，编号 + 标题 + 子标题，进场故障抖动 ─────────── */
export const Chapter: React.FC<{f: number; no: string; title: string; sub: string; color: string}> = ({f, no, title, sub, color}) => {
	const j = f < 10 ? (rand(f * 3.1) - 0.5) * 18 * (1 - f / 10) : 0;
	return (
		<div style={{position: 'absolute', left: 48, top: 30, opacity: clamp(f / 4)}}>
			<div style={{fontFamily: MONO, fontSize: 15, color, letterSpacing: 6}}>{no}</div>
			<div style={{position: 'relative', fontFamily: XING, fontSize: 52, color: '#f6efe2', lineHeight: 1.05, transform: `translateX(${j}px)`}}>
				{f < 10 ? <span style={{position: 'absolute', left: 4, color: '#ff2a55', opacity: 0.6, mixBlendMode: 'screen'}}>{title}</span> : null}
				{f < 10 ? <span style={{position: 'absolute', left: -4, color: '#2affee', opacity: 0.6, mixBlendMode: 'screen'}}>{title}</span> : null}
				<span style={{position: 'relative'}}>{title}</span>
			</div>
			<div style={{fontFamily: KAI, fontSize: 20, color: 'rgba(240,230,210,0.75)', letterSpacing: 3, marginTop: 2}}>{sub}</div>
			<div style={{height: 2, width: 240 * eo(f / 14), background: color, marginTop: 6, boxShadow: `0 0 10px ${color}`}} />
		</div>
	);
};

/* ─────────── 大数字计数器 ─────────── */
export const Count: React.FC<{x: number; y: number; v: number; label: string; color: string; size?: number; hit?: number}> = ({x, y, v, label, color, size = 64, hit = 0}) => (
	<div style={{position: 'absolute', left: x, top: y, textAlign: 'center', transform: `translate(-50%,-50%) scale(${1 + 0.35 * hit})`}}>
		<div style={{fontFamily: MONO, fontSize: size, color: '#fff', textShadow: `0 0 ${16 + 30 * hit}px ${color}`, fontWeight: 700, lineHeight: 1}}>{Math.round(v)}</div>
		<div style={{fontFamily: KAI, fontSize: 20, color, letterSpacing: 4, marginTop: 4}}>{label}</div>
	</div>
);

/* ─────────── 扫描线 + 冲击闪光（全屏 SVG 叠加） ─────────── */
export const Scan: React.FC<{f: number; hits: number[]; color: string}> = ({f, hits, color}) => {
	let k = 0;
	for (const h of hits) k = Math.max(k, pulse(f, h, 10));
	const y = (f * 23) % 1080;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
			<rect x={0} y={y} width={1920} height={2} fill={color} opacity={0.12} />
			{k > 0 ? Array.from({length: 7}).map((_, i) => <rect key={i} x={0} y={rand(f * 7 + i) * 1080} width={1920} height={2 + rand(f + i) * 10} fill={i % 2 ? '#ff2a55' : '#2affee'} opacity={0.25 * k} />) : null}
			{k > 0 ? <rect x={0} y={0} width={1920} height={1080} fill={color} opacity={0.12 * k} /> : null}
		</svg>
	);
};

/* ─────────── 屏幕坐标下的连线流光（虚线滚动） ─────────── */
export const Flow: React.FC<{d: string; color: string; t: number; w?: number; op?: number; len?: number}> = ({d, color, t, w = 2, op = 0.9, len = 2000}) => (
	<path d={d} fill="none" stroke={color} strokeWidth={w} opacity={op} strokeDasharray={`${len * clamp(t)} ${len}`} strokeLinecap="round" />
);
