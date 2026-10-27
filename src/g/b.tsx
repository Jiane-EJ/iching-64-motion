// 02 方圆：邵雍先天六十四卦方圆图 —— 圆图阴阳消长、爻层加倍、方图四层、对宫皆错
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Ring, Nebula, Points, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, spring, Verse, Cap, Log, Burst, Stamp, shake, useF} from './kit';
import {HexG, Chapter, Scan} from './fx';
import {XT, TRI, TRI_XIANG, yangN} from './data';
import {LOG_B, toLog} from './ev';

export const B_DUR = 720;
const CY = '#7fe0ff', GOLD = '#ffd27a', YANG = '#ffe7b0', YIN = '#5ea8ff';
const CX = 960, CYY = 555, RC = 330;
// 圆图位置：乾在上（南），左半 乾→复，右半 姤→坤
const theta = (i: number) => (i < 32 ? 90 + (i + 0.5) * 5.625 : 90 - (i - 32 + 0.5) * 5.625) * Math.PI / 180;
const cpos = (i: number, r = RC): [number, number] => [CX + Math.cos(theta(i)) * r, CYY - Math.sin(theta(i)) * r];
// 方图位置：乾在右下，坤在左上
const SQ = {c: 50};
const spos = (i: number): [number, number] => { const r = Math.floor(i / 8), c = i % 8; return [CX - 4 * SQ.c + (7 - c) * SQ.c + SQ.c / 2, CYY - 4 * SQ.c + (7 - r) * SQ.c + SQ.c / 2]; };
// 上一章方阵位置（承接）
const mpos = (i: number): [number, number] => [520 + (i % 8) * 80 + 40, 230 + Math.floor(i / 8) * 80 + 32];
const layer = (i: number) => { const r = Math.floor(i / 8), c = i % 8; return Math.floor(Math.max(Math.abs(r - 3.5), Math.abs(c - 3.5))); };

const VERSE: [number, string][] = [[0, '乾南坤北 · 离东坎西'], [150, '天地定位 · 山泽通气'], [230, '雷风相薄 · 水火不相射'], [330, '圆于外者为阳 · 方于中者为阴'], [430, '乾坤定上下之位 · 泰否反其类'], [520, '八卦相错 · 数往者顺 · 知来者逆'], [620, '阳生于复 · 阴生于姤']];
const CAP: [number, string][] = [[6, '先天圆图：六十四卦按 0–63 的顺序绕成一圈'], [70, '乾在正南（上），坤在正北（下），左半 32 卦从乾到复，右半从姤到坤'], [150, '从内向外看：初爻一分为二，二爻四分，三爻八分……第六爻六十四分'], [240, '沿圆周走一圈：阳爻数从复开始增长到乾，再从姤开始消减到坤'], [330, '方图在圆内：下卦定行，上卦定列，乾在右下，坤在左上'], [400, '四层同心方框：外层乾坤，内层震巽 —— 中心正是"雷风相薄"'], [470, '对角线一条是八纯卦，另一条从泰到否，是"天地交"'], [520, '圆上任意两个正对的卦、方图中关于中心对称的两格 —— 阴阳全反'], [620, '一阳生于复（冬至），一阴生于姤（夏至）：圆图就是一年的阴阳']];

export const SB: React.FC = () => {
	const f = useF();
	const [sx, sy] = shake(f, [150, 330, 520, 590], 9);
	const spin = f >= 520 ? Math.sin(win(f, 600, 720) * Math.PI) * 0 : 0;
	// 圆图上的扫描（复 → 乾 → 姤 → 坤）
	const sw = win(f, 240, 330);
	const swOrder = (k: number) => (k < 32 ? 31 - k : k); // 0..63 → 先天 index
	const swI = swOrder(Math.min(63, Math.floor(sw * 64)));
	const showSq = f >= 330;
	const ringL = f >= 150 && f < 340;
	const dia = Math.floor(clamp((f - 520) / 64) * 32); // 已连对径数
	const cam = {pos: [Math.sin(f * 0.004) * 4, 2 + Math.cos(f * 0.003), 22] as V3, look: [0, 0, 0] as V3};

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<Stage3D cam={cam} dial={false}>
				<Nebula color={CY} color2={GOLD} n={600} />
				<Ring r={9.5} color={CY} tube={0.02} rot={[Math.PI / 2 + 0.4, f * 0.004, 0]} opacity={0.4} />
				<Ring r={10.4} color={GOLD} tube={0.015} rot={[Math.PI / 2 - 0.3, -f * 0.006, 0.2]} opacity={0.35} />
				<Points n={300} color={YANG} size={0.12} fn={(i) => { const a = rand(i) * 6.28 + f * 0.01 * (rand(i + 2) - 0.5); const r = 8 + rand(i + 1) * 4; return [Math.cos(a) * r, Math.sin(a) * r, -2 + rand(i + 3) * 2]; }} />
			</Stage3D>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* 方位 */}
				{([['南 · 夏至', 60], ['北 · 冬至', -60], ['东 · 春分', 180], ['西 · 秋分', 0]] as [string, number][]).map(([t, ad], k) => (
					<text key={t} x={CX + Math.cos(ad * Math.PI / 180) * 455} y={CYY - Math.sin(ad * Math.PI / 180) * 440 + 8} fill={GOLD} fontFamily={KAI} fontSize={24} textAnchor="middle" opacity={clamp((f - 40 - k * 6) / 8)}>{t}</text>
				))}
				{/* 爻层加倍环 */}
				{ringL ? Array.from({length: 6}).map((_, k) => {
					const lt = f - 150 - k * 12;
					if (lt < 0) return null;
					const r0 = 90 + k * 34, r1 = r0 + 28;
					const segs = 2 ** (k + 1);
					return (
						<g key={k} opacity={clamp(lt / 6) * (1 - sm(win(f, 325, 340)))}>
							{Array.from({length: segs}).map((_, s) => {
								// 第 s 段对应先天 index 区间；该层爻 = 区间首卦第 k 爻
								const i0 = (s * 64) / segs, i1 = ((s + 1) * 64) / segs;
								const yang = XT[i0].lines[k];
								const a0 = theta(i0) + (i0 < 32 ? -1 : 1) * 0.5 * 5.625 * Math.PI / 180, a1 = theta(i1 - 1) + (i1 - 1 < 32 ? 1 : -1) * 0.5 * 5.625 * Math.PI / 180;
								const grow = eo(lt / 14);
								const am = a0 + (a1 - a0) * grow;
								const p = (r: number, a: number) => `${CX + Math.cos(a) * r},${CYY - Math.sin(a) * r}`;
								const large = Math.abs(am - a0) > Math.PI ? 1 : 0;
								const sweep = am > a0 ? 0 : 1;
								return <path key={s} d={`M${p(r1, a0)} A${r1},${r1} 0 ${large} ${sweep} ${p(r1, am)} L${p(r0, am)} A${r0},${r0} 0 ${large} ${1 - sweep} ${p(r0, a0)} Z`} fill={yang ? YANG : YIN} opacity={yang ? 0.85 : 0.55} stroke="#000" strokeWidth={1} />;
							})}
							<text x={CX + r0 + 14} y={CYY - 6} fill="#000" fontFamily={MONO} fontSize={14} textAnchor="middle">{k + 1}</text>
						</g>
					);
				}) : null}
				{/* 阳爻数柱（圆外） */}
				{f >= 240 ? XT.map((g, i) => {
					const k = i < 32 ? 31 - i : i;
					const on = k <= sw * 64;
					const n = yangN(g.lines);
					const [x0, y0] = cpos(i, RC + 34), [x1, y1] = cpos(i, RC + 34 + n * 8 * (on ? 1 : 0));
					return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={n >= 3 ? GOLD : YIN} strokeWidth={5} opacity={i === swI && f < 336 ? 1 : 0.7 * (1 - sm(win(f, 500, 520)))} />;
				}) : null}
				{/* 对径相错 */}
				{f >= 520 ? Array.from({length: 32}).map((_, k) => {
					if (k >= dia) return null;
					const i = k < 16 ? k * 2 : (k - 16) * 2 + 1;
					const [x0, y0] = cpos(i, RC - 24), [x1, y1] = cpos(63 - i, RC - 24);
					const lt = f - 520 - (k * 64) / 32;
					const hot = pulse(lt, 0, 10);
					return <line key={k} x1={x0} y1={y0} x2={lerp(x0, x1, eo(lt / 6))} y2={lerp(y0, y1, eo(lt / 6))} stroke={hot > 0 ? '#fff' : k % 2 ? YIN : GOLD} strokeWidth={1.2 + 3 * hot} opacity={0.65 * (1 - sm(win(f, 610, 625))) + 0.0} />;
				}) : null}
				{/* 阴阳消长曲线：圆图即一年（复起冬至） */}
				{f >= 620 ? (() => {
					const t = eo((f - 620) / 40);
					const pts: string[] = [];
					for (let k = 0; k <= 64 * t; k++) {
						const i = k < 32 ? 31 - k : Math.min(63, k);
						const r = 110 + yangN(XT[i].lines) * 30;
						const [x, y] = cpos(i, r);
						pts.push(`${x},${y}`);
					}
					return <polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={4} style={{filter: `drop-shadow(0 0 8px ${GOLD})`}} />;
				})() : null}
				{/* 64 卦：从上章方阵飞入圆周；第二份落入方图 */}
				{XT.map((g, i) => {
					const lt = f - i * 1.1;
					const u = eo(lt / 26);
					const [mx, my] = mpos(i), [cx, cy] = cpos(i);
					const x = lerp(mx, cx, u), y = lerp(my, cy, u);
					const rot = lerp(0, 90 - (theta(i) * 180) / Math.PI, u) + (1 - u) * 360 * (rand(i) - 0.5);
					const hot = (f >= 240 && f < 336 && i === swI) || (f >= 520 && pulse(f - 520 - ((i < 32 ? (i % 2 ? 16 + (i - 1) / 2 : i / 2) : ((63 - i) % 2 ? 16 + (63 - i - 1) / 2 : (63 - i) / 2)) * 2), 0, 12) > 0);
					const cuoT = f >= 560 ? sm(win(f, 560 + (i % 8) * 3, 580 + (i % 8) * 3)) * (1 - sm(win(f, 600, 620))) : 0;
					const lines = g.lines.map((v) => lerp(v, 1 - v, cuoT));
					return <HexG key={i} x={x} y={y} w={hot ? 34 : 26} lines={lines} color={hot ? '#fff' : g.lines[0] ? YANG : '#9cc8ff'} rot={rot} glow={hot ? 10 : 0} />;
				})}
				{/* 方图 */}
				{showSq ? XT.map((g, i) => {
					const lt = f - 330 - layer(i) * 0 - (7 - Math.floor(i / 8) + (7 - (i % 8))) * 1.6;
					if (lt < 0) return null;
					const [x, y] = spos(i);
					const L = layer(i);
					const diag = Math.floor(i / 8) === i % 8;
					const anti = Math.floor(i / 8) + (i % 8) === 7;
					const lw = f >= 400 && f < 470 ? Math.floor((f - 400) / 17) : -1; // 逐层点亮（外→内）
					const onL = lw >= 0 && 3 - L === lw % 4;
					const hd = f >= 430 && f < 520 && (diag && f < 475 || anti && f >= 475);
					const pairT = f >= 520 ? pulse(f - 520 - Math.min(i, 63 - i) * 2, 0, 12) : 0;
					const col = hd ? '#fff' : onL ? [GOLD, '#ff8a5a', CY, '#c49bff'][L] : '#d9cfbd';
					return (
						<g key={'s' + i} opacity={clamp(lt / 5) * (f > 605 ? Math.max(0.12, 1 - (f - 605) / 15) : 1)}>
							{onL || hd ? <rect x={x - SQ.c / 2 + 2} y={y - SQ.c / 2 + 2} width={SQ.c - 4} height={SQ.c - 4} fill={col} opacity={0.18} /> : null}
							{pairT > 0 ? <rect x={x - SQ.c / 2} y={y - SQ.c / 2} width={SQ.c} height={SQ.c} fill="none" stroke="#fff" strokeWidth={3 * pairT} /> : null}
							<HexG x={x} y={y - 6} w={26} lines={g.lines} color={col} />
							<text x={x} y={y + 21} fill={col} fontFamily={KAI} fontSize={12} textAnchor="middle" opacity={0.8}>{g.name}</text>
						</g>
					);
				}) : null}
				{/* 方图中心对称连线 */}
				{f >= 520 && f < 640 ? Array.from({length: 32}).map((_, i) => {
					const lt = f - 520 - i * 2;
					if (lt < 0) return null;
					const [x0, y0] = spos(i), [x1, y1] = spos(63 - i);
					return <line key={'p' + i} x1={x0} y1={y0} x2={lerp(x0, x1, eo(lt / 8))} y2={lerp(y0, y1, eo(lt / 8))} stroke={i % 2 ? GOLD : CY} strokeWidth={1.5} opacity={0.5 * (1 - sm(win(f, 620, 640)))} />;
				}) : null}
				{[150, 330, 520].map((t, k) => <Burst key={k} x={CX} y={CYY} t={f - t} color={k === 1 ? CY : GOLD} r={360} n={36} seed={k * 7} />)}
			</svg>
			{/* 扫描读数 */}
			{f >= 240 && f < 336 ? (
				<div style={{position: 'absolute', left: 1500, top: 330, width: 360}}>
					<div style={{fontFamily: MONO, fontSize: 16, color: CY, letterSpacing: 4}}>SWEEP · {sw * 64 < 32 ? '阳息 ↑' : '阴息 ↓'}</div>
					<svg width={200} height={190}><HexG x={100} y={95} w={150} lines={XT[swI].lines} color="#fff" yin={YIN} glow={10} /></svg>
					<div style={{fontFamily: XING, fontSize: 64, color: '#fff'}}>{XT[swI].name}</div>
					<div style={{fontFamily: KAI, fontSize: 24, color: GOLD}}>阳爻 {yangN(XT[swI].lines)} / 6</div>
					<div style={{display: 'flex', gap: 4, marginTop: 6}}>{Array.from({length: 6}).map((_, k) => <div key={k} style={{width: 44, height: 12, background: k < yangN(XT[swI].lines) ? GOLD : 'rgba(255,255,255,0.1)'}} />)}</div>
				</div>
			) : null}
			{f >= 400 && f < 520 ? (
				<div style={{position: 'absolute', left: 1480, top: 330, width: 400, fontFamily: KAI, color: '#f6efe2'}}>
					{['外层 · 乾坤 28 卦', '二层 · 兑艮 20 卦', '三层 · 离坎 12 卦', '中心 · 震巽 4 卦'].map((t, k) => <div key={t} style={{fontSize: 26, marginTop: 8, color: [GOLD, '#ff8a5a', CY, '#c49bff'][3 - k], opacity: f - 400 >= k * 17 ? 1 : 0.2}}>{t}</div>)}
					<div style={{fontSize: 24, marginTop: 20, color: f >= 430 && f < 475 ? '#fff' : 'rgba(240,230,210,0.35)'}}>╲ 乾 兑 离 震 巽 坎 艮 坤</div>
					<div style={{fontSize: 24, marginTop: 6, color: f >= 475 ? '#fff' : 'rgba(240,230,210,0.35)'}}>╱ 泰 损 既济 益 恒 未济 咸 否</div>
				</div>
			) : null}
			{f >= 520 ? <div style={{position: 'absolute', left: 1480, top: 360, fontFamily: XING, fontSize: 46, color: '#fff', opacity: clamp((f - 524) / 6), lineHeight: 1.5}}>对宫皆错<div style={{fontFamily: MONO, fontSize: 22, color: CY}}>i ⟷ 63 − i</div><div style={{fontFamily: KAI, fontSize: 24, color: GOLD}}>{Math.min(32, dia)} / 32 对</div></div> : null}
			<Stamp x={1660} y={800} t={f - 640} text="圆象天 · 方象地" color={GOLD} size={52} life={70} />
			<Chapter f={f} no="02 · SHAO YONG" title="方圆" sub="先天六十四卦方圆图 · 邵雍" color={CY} />
			<Verse f={f} items={VERSE} color={CY} tag="说卦 · 皇极经世" />
			<Cap f={f} items={CAP} color={CY} />
			<Log f={f} items={toLog(LOG_B)} color={CY} x={60} y={760} />
			<Scan f={f} hits={[150, 330, 520]} color={CY} />
		</AbsoluteFill>
	);
};
