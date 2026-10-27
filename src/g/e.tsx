// 05 序卦：文王卦序 64 步，每 13 帧一卦，序卦传因果链 + 螺旋轨道 + 8×8 进度格
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Ball, Beam, Glow, Points, Nebula, project, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, Verse, Cap, Burst, Stamp, shake, useF} from './kit';
import {HexG, Chapter, Scan} from './fx';
import {KW, KEY, XUGUA, TRI_XIANG, zong, cuo, same} from './data';
import {LOG_E} from './ev';

export const E_DUR = 1020;
const JADE = '#5fe0b0', GOLD = '#ffd27a', ROSE = '#ff7aa8', CY = '#7fe0ff', YANG = '#ffe7b0', YIN = '#5ea8ff';
const STEP = 13;
export const XU_START = (i: number) => (i < 30 ? 60 + i * STEP : 500 + (i - 30) * STEP);
const curIdx = (f: number) => {
	if (f < 60) return -1;
	if (f < 450) return Math.min(29, Math.floor((f - 60) / STEP));
	if (f < 500) return 29;
	return Math.min(63, 30 + Math.floor((f - 500) / STEP));
};
const hpos = (i: number): V3 => [(i - 32) * 1.25 + (i >= 30 ? 2.5 : 0), Math.sin(i * 0.7) * 1.6, Math.cos(i * 0.7) * 1.6];
const gridP = (i: number): [number, number] => [1395 + (i % 8) * 60, 250 + Math.floor(i / 8) * 68];
const full = (i: number) => { const g = KW[i]; return g.up === g.lo ? `${g.name}为${TRI_XIANG[g.up]}` : `${TRI_XIANG[g.up]}${TRI_XIANG[g.lo]}${g.name}`; };
const rel = (i: number) => (i % 2 === 0 ? '' : same(zong(KW[i - 1].lines), KW[i].lines) ? '综' : '错');

const VERSE: [number, string][] = [[0, '上经 · 三十卦 · 天道'], [450, '下经 · 三十四卦 · 人事'], [942, '物不可穷也 · 故受之以未济 · 终焉']];
const CAP: [number, string][] = [[0, '序卦传：逐卦说明为什么"受之以"下一卦'], [100, '有生必有养，有养必有争，有争必有众 —— 一条社会生成链'], [190, '物极必反：泰后是否，否后同人'], [330, '剥穷上反下而为复：衰到尽头，一阳回到底部'], [400, '上经以乾坤始、坎离终：从天地到水火'], [450, '下经以咸恒始：有天地万物，然后有男女夫妇'], [620, '损而不已必益，益而不已必决 —— 增减相继'], [760, '困乎上者必反下 · 井道不可不革 · 革物者莫若鼎'], [942, '既济之后偏偏是未济：终点就是下一轮的起点']];

export const SE: React.FC = () => {
	const f = useF();
	const ci = curIdx(f);
	const ct = ci >= 0 ? f - XU_START(ci) : 0;
	const hold = (f >= 450 && f < 500) || f >= 942;
	const [sx, sy] = shake(f, [60, 450, 500, 942], 10);
	// 相机：沿螺旋跟随当前卦
	const fi = f < 60 ? -4 + f / 15 : ci + clamp(ct / STEP) * (hold ? 0 : 1) + (f >= 942 ? -eo((f - 942) / 50) * 30 : 0);
	const fc: V3 = [(fi - 32) * 1.25 + (fi >= 30 ? 2.5 : 0), 0, 0];
	const zoomOut = f >= 942 ? eo((f - 942) / 50) : 0;
	const cam = {pos: [fc[0] - 1 - zoomOut * 4, 3.2 + zoomOut * 8, 13 + zoomOut * 22] as V3, look: [fc[0] + 0.6, -1.6, 0] as V3};
	const G = ci >= 0 ? KW[ci] : KW[0];
	const r = ci >= 0 ? rel(ci) : '';
	const t = eo(ct / 7);
	// 综：从上一卦旋转而来；错：从上一卦翻色而来
	const lines = ci > 0 && r === '错' ? KW[ci - 1].lines.map((v) => lerp(v, 1 - v, t)) : G.lines;
	const rot = r === '综' ? 180 * (1 - t) : 0;
	const done = ci < 0 ? 0 : ci + 1;
	const card = f < 60 ? {t: f, a: '上经', b: '乾坤 → 坎离', c: '30 卦 · 天道'} : f >= 450 && f < 500 ? {t: f - 450, a: '下经', b: '咸恒 → 既济未济', c: '34 卦 · 人事'} : null;

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<Stage3D cam={cam} dial={false}>
				<Nebula color={JADE} color2={GOLD} n={600} />
				{KW.map((g, i) => {
					const p = hpos(i);
					const on = i <= ci;
					const isC = i === ci;
					return (
						<group key={i}>
							{i > 0 ? <Beam a={hpos(i - 1)} b={p} color={i % 2 ? (rel(i) === '综' ? CY : ROSE) : JADE} r={i % 2 ? 0.05 : 0.02} opacity={on ? 0.9 : 0.15} p={isC ? eo(ct / 6) : 1} /> : null}
							<Ball pos={p} color={isC ? '#fff' : g.lines[5] ? YANG : YIN} r={isC ? 0.24 + 0.1 * pulse(ct, 0, 8) : 0.15} glow={isC ? 1.3 : on ? 0.8 : 0.3} opacity={on ? 1 : 0.35} />
						</group>
					);
				})}
				<Points n={400} color={JADE} size={0.12} fn={(i) => { const u = (rand(i) * 64 + f * 0.05) % 64; const p = hpos(Math.floor(u)), q = hpos(Math.min(63, Math.floor(u) + 1)); const s = u % 1; return [lerp(p[0], q[0], s) + (rand(i + 1) - 0.5) * 0.5, lerp(p[1], q[1], s) + (rand(i + 2) - 0.5) * 0.5, lerp(p[2], q[2], s)]; }} />
				{ci >= 0 ? <Glow pos={hpos(ci)} color={JADE} size={2 + 3 * pulse(ct, 0, 10)} opacity={0.45} /> : null}
			</Stage3D>

			{/* 当前卦 */}
			{ci >= 0 && !card && f < 942 ? (
				<div style={{position: 'absolute', left: 70, top: 220, width: 560}}>
					<div style={{fontFamily: MONO, fontSize: 22, color: JADE, letterSpacing: 4}}>#{String(G.kw).padStart(2, '0')} / 64 · {ci < 30 ? '上经' : '下经'}</div>
					<svg width={300} height={250} style={{display: 'block', overflow: 'visible'}}>
						<HexG x={130} y={125} w={190} lines={lines} color={YANG} yin={YIN} rot={rot} glow={8 + 14 * pulse(ct, 6, 6)} />
					</svg>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
						<span style={{fontFamily: XING, fontSize: 92, color: '#fff', textShadow: `0 0 24px ${JADE}`, transform: `scale(${1 + 0.15 * pulse(ct, 0, 6)})`, display: 'inline-block'}}>{G.name}</span>
						<span style={{fontFamily: KAI, fontSize: 30, color: GOLD}}>{full(ci)}</span>
					</div>
					<div style={{fontFamily: KAI, fontSize: 28, color: 'rgba(240,230,210,0.85)'}}>卦德 · <span style={{color: '#fff', fontSize: 34}}>{KEY[G.name]}</span>{r ? <span style={{marginLeft: 18, color: r === '综' ? CY : ROSE}}>与{KW[ci - 1].name}相{r}</span> : null}</div>
				</div>
			) : null}
			{/* 序卦传因果句 */}
			{ci >= 0 && !card ? (
				<div style={{position: 'absolute', left: 560, top: 760, width: 800, textAlign: 'center'}}>
					<div style={{fontFamily: KAI, fontSize: 26, color: 'rgba(240,230,210,0.6)'}}>{ci > 0 ? `${KW[ci - 1].name} → 故受之以 → ${G.name}` : '乾 · 元亨利贞'}</div>
					<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 46, color: '#fff', textShadow: `0 0 16px ${JADE}`, marginTop: 4}}>
						{Array.from(XUGUA[ci]).map((c, k) => <span key={k} style={{opacity: clamp((ct - k * 0.35) / 2)}}>{c}</span>)}
					</div>
				</div>
			) : null}
			{/* 进度格：文王序 8×8，路径蛇行 */}
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<polyline points={Array.from({length: done}).map((_, i) => gridP(i).join(',')).join(' ')} fill="none" stroke={JADE} strokeWidth={2} opacity={0.5} />
				{KW.map((g, i) => {
					const [x, y] = gridP(i);
					const on = i < done;
					const isC = i === ci;
					return (
						<g key={i} opacity={on ? 1 : 0.15}>
							{isC ? <rect x={x - 28} y={y - 30} width={56} height={62} fill="none" stroke="#fff" strokeWidth={2} /> : null}
							{i === 30 ? <line x1={x - 32} y1={y - 34} x2={x - 32} y2={y + 34} stroke={GOLD} strokeWidth={3} /> : null}
							<HexG x={x} y={y - 6} w={isC ? 34 : 28} lines={g.lines} color={on ? (i < 30 ? YANG : '#ffc0d6') : '#888'} yin={on ? YIN : '#666'} />
							<text x={x} y={y + 25} fill={isC ? '#fff' : 'rgba(240,230,210,0.7)'} fontFamily={KAI} fontSize={14} textAnchor="middle">{g.name}</text>
						</g>
					);
				})}
				{ci > 0 && ct < 8 ? (() => { const [x0, y0] = gridP(ci - 1), [x1, y1] = gridP(ci); const u = eo(ct / 6); return <circle cx={lerp(x0, x1, u)} cy={lerp(y0, y1, u)} r={7} fill="#fff" style={{filter: `drop-shadow(0 0 8px ${JADE})`}} />; })() : null}
				{f >= 942 ? (() => { const [x0, y0] = gridP(63), [x1, y1] = gridP(0); const u = eo((f - 950) / 30); return <path d={`M${x0},${y0} C${x0 + 160},${y0 + 120} ${x1 - 160},${y1 - 180} ${x1},${y1}`} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray={`${1400 * u} 1400`} style={{filter: `drop-shadow(0 0 8px ${GOLD})`}} />; })() : null}
				{[60, 450, 500].map((t, k) => <Burst key={k} x={960} y={540} t={f - t} color={k === 1 ? GOLD : JADE} r={400} n={40} seed={k} />)}
			</svg>
			<div style={{position: 'absolute', left: 1395, top: 200, fontFamily: MONO, fontSize: 16, color: JADE, letterSpacing: 3}}>KING WEN · {done}/64</div>
			{/* 上经 / 下经 标题卡 */}
			{card ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: clamp(card.t / 5) * (1 - sm(win(card.t, 42, 50)))}}>
					<div style={{fontFamily: XING, fontSize: 150, color: '#fff', textShadow: `0 0 40px ${JADE}`, transform: `scale(${1.5 - 0.5 * eo(card.t / 10)})`, letterSpacing: 30}}>{card.a}</div>
					<div style={{fontFamily: KAI, fontSize: 40, color: GOLD, letterSpacing: 8}}>{card.b}</div>
					<div style={{fontFamily: MONO, fontSize: 24, color: JADE, letterSpacing: 6, marginTop: 6}}>{card.c}</div>
				</div>
			) : null}
			{f >= 942 ? (
				<div style={{position: 'absolute', left: 120, top: 300, fontFamily: KAI, fontSize: 30, color: '#f6efe2', lineHeight: 1.9, opacity: clamp((f - 946) / 8)}}>
					<div>上经 <span style={{color: GOLD}}>乾坤</span>（天地）始 · <span style={{color: GOLD}}>坎离</span>（水火）终</div>
					<div>下经 <span style={{color: ROSE}}>咸恒</span>（夫妇）始 · <span style={{color: ROSE}}>既济未济</span>（水火交）终</div>
					<div style={{color: JADE}}>32 对 · 28 综 · 4 错 · 首尾相接</div>
				</div>
			) : null}
			<Stamp x={1610} y={860} t={f - 960} text="终而复始" color={GOLD} size={56} life={60} />
			<Chapter f={f} no="05 · KING WEN SEQUENCE" title="序卦" sub="文王卦序 · 序卦传 · 因果相受" color={JADE} />
			<Verse f={f} items={VERSE} color={JADE} tag="序卦传" />
			<Cap f={f} items={CAP} color={JADE} />
			<Scan f={f} hits={[60, 450, 500, 942]} color={JADE} />
		</AbsoluteFill>
	);
};
export {LOG_E};
