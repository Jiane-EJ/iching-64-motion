// 06 消息 · 八宫：十二辟卦随月消长；京房八宫变爻法、世应、游魂归魂、八宫五行
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Ball, Points, Glow, Nebula, Ring, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, Verse, Cap, Burst, Stamp, shake, useF} from './kit';
import {HexG, Hex3D, Chapter, Count, Scan} from './fx';
import {XIAOXI, XX_ZHI, XX_MON, XX_QI, byName, yangN, GONG, GEN, SHI, PALACES, gv, TRI, TRI_EL, EL_C, XT} from './data';

export const F_DUR = 960;
const SUN = '#ff9f5a', GOLD = '#ffd27a', YANG = '#ffe7b0', YIN = '#5ea8ff', CY = '#7fe0ff';
const XS = 20, XL = 22; // 消息：每卦 22 帧
const VERSE: [number, string][] = [[0, '十二消息 · 十二辟卦'], [20, '一阳来复'], [152, '一阴始生'], [284, '复 · 其见天地之心乎'], [340, '阳息阴消 · 周而复始'], [400, '京房八宫'], [420, '本宫 · 一世 · 二世 · 三世 · 四世 · 五世'], [530, '游魂 · 归魂'], [570, '世应相隔 · 三位相应'], [820, '八宫各八 · 六十四卦无一重出']];
const CAP: [number, string][] = [[0, '汉代孟喜、京房的卦气说：用 12 个卦标记一年 12 个月'], [20, '冬至子月，一阳生于下：复；此后每月添一阳'], [130, '四月纯阳为乾；五月夏至，一阴生于下：姤'], [240, '十月纯阴为坤，到冬至，一阳又来'], [284, '一年就是阳爻从下往上爬，再被阴爻从下往上替换'], [400, '西汉京房：以八纯卦为宫，每宫统领八卦'], [420, '从下往上依次变爻：一世、二世……五世'], [530, '上爻不动，回头把四爻变回来：游魂'], [550, '再把下卦恢复本宫原样：归魂'], [570, '世爻是"我"，应爻与世相隔两位，彼此呼应'], [700, '八宫五行：乾兑金 · 震巽木 · 坎水 · 离火 · 艮坤土'], [820, '同样 64 卦换一种编组，就是纳甲筮法的骨架']];
const PEL = GONG.map((g) => TRI_EL[TRI.indexOf(g)]);
const gridP = (p: number, k: number): [number, number] => [470 + k * 140, 228 + p * 84];

export const SF: React.FC = () => {
	const f = useF();
	const [sx, sy] = shake(f, [20, 152, 284, 400, 570, 820], 10);
	// —— 消息 ——
	const xi = clamp(Math.floor((f - XS) / XL), 0, 11);
	const xt = f - XS - xi * XL;
	const XG = byName(XIAOXI[xi]);
	const prev = byName(XIAOXI[(xi + 11) % 12]);
	const chg = XG.lines.findIndex((v, k) => v !== prev.lines[k]);
	const xLines = f < XS ? byName('坤').lines : XG.lines.map((v, k) => (k === chg ? lerp(prev.lines[k], v, sm(xt / 8)) : v));
	const yN = f < XS ? 0 : yangN(XG.lines);
	const ringA = -(f < XS ? 0 : xi + eo(xt / 10) - 1) * (Math.PI * 2 / 12);
	// —— 八宫 ——
	const g = f - 400;
	const step = clamp(Math.floor((g - 10) / 20), 0, 7);
	const st = g - 10 - step * 20;
	const QP = PALACES[0];
	const dLines = g < 10 ? QP[0] : QP[step].map((v, k) => (step > 0 && v !== QP[step - 1][k] ? lerp(QP[step - 1][k], v, sm(st / 8)) : v));
	const cam = {pos: [0, 2.5, 15] as V3, look: [0, 0.3, 0] as V3};

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<Stage3D cam={cam} dial={false}>
				<Nebula color={SUN} color2={YIN} n={600} />
				{f < 290 ? (
					<group position={[-3.6, -0.2, 0]}>
						{XIAOXI.map((n, i) => {
							const a = (i / 12) * Math.PI * 2 + ringA + Math.PI / 2;
							const G = byName(n);
							const isC = i === xi && f >= XS;
							return <Hex3D key={n} lines={G.lines} colors={G.lines.map((v) => (v ? YANG : YIN))} color={YANG} pos={[Math.cos(a) * 4.2, 0, Math.sin(a) * 4.2 - 1]} rot={[0, -a + Math.PI / 2, 0]} scale={isC ? 0.42 + 0.1 * pulse(xt, 0, 8) : 0.3} emissive={isC ? 1 : 0.35} op={isC ? 1 : 0.75} />;
						})}
						{/* 太阳高度 = 阳爻数 */}
						<Ball pos={[0, -2.2 + yN * 0.75, -1]} color={SUN} r={0.45 + yN * 0.05} glow={1.5 + yN * 0.25} />
						<Ring r={4.2} color={SUN} pos={[0, -1.4, -1]} opacity={0.35} />
						<Points n={300} color={yN >= 3 ? SUN : YIN} size={0.14} fn={(i) => { const a = rand(i) * 6.28; const r = 0.5 + rand(i + 1) * 3.5; const y = yN >= 3 ? ((f * 0.03 + rand(i + 2) * 4) % 4) - 2 : 2 - ((f * 0.03 + rand(i + 2) * 4) % 4); return [Math.cos(a) * r, y, Math.sin(a) * r - 1]; }} />
					</group>
				) : g >= 420 ? (
					<group>
						{XT.map((G, i) => {
							const p = PALACES.findIndex((L) => L.some((l) => gv(l).v === G.v));
							const a = (i / 64) * Math.PI * 2 + f * 0.01;
							const u = eo((g - 420 - p * 4) / 30);
							return <Ball key={i} pos={[Math.cos(a) * 5 * u, Math.sin(a) * 5 * u * 0.9, -2]} color={EL_C[PEL[p]]} r={0.18} glow={1.2} opacity={u} />;
						})}
					</group>
				) : null}
			</Stage3D>

			{/* —— 消息读数 —— */}
			{f < 400 ? (
				<>
					<div style={{position: 'absolute', left: 1120, top: 200, width: 700, opacity: 1 - sm(win(f, 280, 290))}}>
						<div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
							<svg width={220} height={220}><HexG x={110} y={110} w={170} lines={xLines} color={YANG} yin={YIN} glow={10} hl={xLines.map((_, k) => (k === chg && xt < 14 ? 1 : 0))} hlc={yN >= 6 || (chg >= 0 && XG.lines[chg]) ? SUN : '#9cc8ff'} /></svg>
							<div>
								<div style={{fontFamily: XING, fontSize: 96, color: '#fff', textShadow: `0 0 24px ${SUN}`, transform: `scale(${1 + 0.15 * pulse(xt, 0, 6)})`}}>{XG.name}</div>
								<div style={{fontFamily: KAI, fontSize: 32, color: GOLD}}>{XX_ZHI[xi]}月 · {XX_MON[xi]} · {XX_QI[xi]}</div>
								<div style={{fontFamily: KAI, fontSize: 26, color: xi < 6 ? SUN : CY}}>{xi < 6 ? `阳息 · ${yN} 阳` : `阴息 · ${6 - yN} 阴`}</div>
							</div>
						</div>
						<div style={{display: 'flex', gap: 6, marginTop: 20}}>{Array.from({length: 6}).map((_, k) => <div key={k} style={{flex: 1, height: 18, background: k < yN ? SUN : 'rgba(255,255,255,0.08)', boxShadow: k < yN ? `0 0 10px ${SUN}` : 'none'}} />)}</div>
					</div>
					{/* 全年曲线 */}
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						{(() => {
							const X0 = 1120, X1 = 1820, Y0 = 760, H = 180;
							const px = (i: number) => X0 + (i / 11) * (X1 - X0), py = (n: number) => Y0 - (n / 6) * H;
							const nUp = f < XS ? -1 : xi;
							return (
								<g opacity={f < 290 ? 1 : 0}>
									<line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(255,255,255,0.3)" />
									<polyline points={XIAOXI.slice(0, nUp + 1).map((n, i) => `${px(i)},${py(yangN(byName(n).lines))}`).join(' ')} fill="none" stroke={SUN} strokeWidth={4} />
									{XIAOXI.map((n, i) => <g key={n} opacity={i <= nUp ? 1 : 0.25}><circle cx={px(i)} cy={py(yangN(byName(n).lines))} r={i === nUp ? 9 : 5} fill={i === nUp ? '#fff' : SUN} /><text x={px(i)} y={Y0 + 28} fill="#f6efe2" fontFamily={KAI} fontSize={18} textAnchor="middle">{n}</text><text x={px(i)} y={Y0 + 50} fill={GOLD} fontFamily={KAI} fontSize={15} textAnchor="middle">{XX_ZHI[i]}</text></g>)}
								</g>
							);
						})()}
						{/* 总览：十二卦一字排开，阳爻自下而上爬升 */}
						{f >= 284 ? XIAOXI.map((n, i) => {
							const G = byName(n);
							const lt = f - 290 - i * 3;
							const x = 300 + i * 120, y = 560;
							const wave = (f - 300) * 0.25;
							return (
								<g key={n} opacity={clamp(lt / 6)}>
									<HexG x={x} y={y} w={84} lines={G.lines} color={YANG} yin={YIN} hl={G.lines.map((v, k) => (Math.abs(((wave - i) % 12 + 12) % 12 - k) < 0.6 ? 1 : 0))} hlc={SUN} />
									<text x={x} y={y + 80} fill="#fff" fontFamily={XING} fontSize={34} textAnchor="middle">{n}</text>
									<text x={x} y={y + 112} fill={GOLD} fontFamily={KAI} fontSize={20} textAnchor="middle">{XX_MON[i]}</text>
									<text x={x} y={y - 70} fill={SUN} fontFamily={MONO} fontSize={18} textAnchor="middle">{'●'.repeat(yangN(G.lines))}</text>
								</g>
							);
						}) : null}
						<Burst x={1230} y={310} t={xt - 6} color={SUN} r={180} n={22} seed={xi} />
					</svg>
					<Stamp x={960} y={330} t={f - 300} text="七日来复" color={SUN} size={50} life={90} />
				</>
			) : null}

			{/* —— 八宫：乾宫演示 —— */}
			{g >= 0 && g < 180 ? (
				<div style={{position: 'absolute', inset: 0, opacity: clamp(g / 6) * (1 - sm(win(g, 170, 180)))}}>
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						<HexG x={560} y={540} w={260} lines={dLines} color={YANG} yin={YIN} glow={12} />
						{(() => {
							const s = SHI[step], y = (k: number) => 540 + (2.5 - k) * 260 * 0.21;
							const yy = lerp(y(SHI[Math.max(0, step - 1)]), y(s), eo(st / 8));
							const ya = lerp(y((SHI[Math.max(0, step - 1)] + 3) % 6), y((s + 3) % 6), eo(st / 8));
							return <><text x={720} y={yy + 14} fill={GOLD} fontFamily={XING} fontSize={40}>世</text><text x={720} y={ya + 14} fill={CY} fontFamily={XING} fontSize={40}>应</text></>;
						})()}
						<text x={560} y={790} fill="#fff" fontFamily={XING} fontSize={72} textAnchor="middle">{gv(QP[step]).name}</text>
						<text x={560} y={300} fill={GOLD} fontFamily={KAI} fontSize={36} textAnchor="middle">乾宫 · {GEN[step]}</text>
						<Burst x={560} y={540} t={st - 6} color={step >= 6 ? CY : GOLD} r={260} n={28} seed={step * 4} />
					</svg>
					<div style={{position: 'absolute', left: 1000, top: 220, fontFamily: KAI, fontSize: 30, lineHeight: 1.62}}>
						{GEN.map((n, k) => (
							<div key={n} style={{opacity: k <= step ? (k === step ? 1 : 0.6) : 0.12, color: '#f6efe2', transform: `translateX(${k === step ? 16 * eo(st / 6) : 0}px)`}}>
								<span style={{display: 'inline-block', width: 90, color: k >= 6 ? CY : GOLD}}>{n}</span>
								<span style={{display: 'inline-block', width: 110, fontFamily: XING, fontSize: 34}}>{gv(QP[k]).name}</span>
								<span style={{fontSize: 22, color: 'rgba(240,230,210,0.7)'}}>{['六爻纯乾', '变初爻', '变二爻', '变三爻', '变四爻', '变五爻', '四爻复原', '下卦复原'][k]} · 世在{['上', '初', '二', '三', '四', '五', '四', '三'][k]}</span>
							</div>
						))}
					</div>
				</div>
			) : null}
			{/* —— 八宫全表 —— */}
			{g >= 170 && g < 440 ? (
				<svg width={1920} height={1080} style={{position: 'absolute', opacity: clamp((g - 170) / 6) * (1 - sm(win(g, 425, 440)))}}>
					{GEN.map((n, k) => <text key={n} x={gridP(0, k)[0]} y={196} fill={k >= 6 ? CY : GOLD} fontFamily={KAI} fontSize={22} textAnchor="middle" opacity={clamp((g - 172 - k * 2) / 6)}>{n}</text>)}
					{GONG.map((n, p) => (
						<g key={n} opacity={clamp((g - 176 - p * 4) / 6)}>
							<text x={360} y={gridP(p, 0)[1] + 10} fill={EL_C[PEL[p]]} fontFamily={XING} fontSize={34} textAnchor="middle">{n}</text>
							<text x={312} y={gridP(p, 0)[1] + 8} fill={EL_C[PEL[p]]} fontFamily={KAI} fontSize={18} textAnchor="middle">{PEL[p]}</text>
							{/* 世爻折线 */}
							{g >= 300 ? <polyline points={SHI.map((s, k) => { const [x, y] = gridP(p, k); return `${x + 30},${y - 4 + (2.5 - s) * 7}`; }).slice(0, Math.floor(clamp((g - 300 - p * 3) / 30) * 8)).join(' ')} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.8} /> : null}
						</g>
					))}
					{PALACES.map((L, p) => L.map((l, k) => {
						const lt = g - 180 - p * 4 - k * 3;
						if (lt < 0) return null;
						const [x, y] = gridP(p, k);
						const G = gv(l);
						const col = EL_C[PEL[p]];
						const flash = (g >= 360 && g < 380 && k === 6) || (g >= 380 && g < 400 && k === 7);
						return (
							<g key={p * 8 + k} transform={`translate(0,${(1 - eo(lt / 8)) * -30})`} opacity={clamp(lt / 4)}>
								{flash ? <rect x={x - 62} y={y - 38} width={124} height={76} fill={CY} opacity={0.2} /> : null}
								<HexG x={x - 18} y={y - 4} w={36} lines={l} color={col} yin={col} />
								<rect x={x + 3} y={y - 4 + (2.5 - SHI[k]) * 7.6 - 3} width={6} height={6} fill={GOLD} />
								<text x={x + 40} y={y + 4} fill="#f6efe2" fontFamily={KAI} fontSize={18} textAnchor="middle">{G.name}</text>
							</g>
						);
					}))}
				</svg>
			) : null}
			{g >= 260 && g < 440 ? <div style={{position: 'absolute', left: 1640, top: 300, fontFamily: KAI, fontSize: 24, color: '#f6efe2', lineHeight: 1.8, opacity: clamp((g - 260) / 8) * (1 - sm(win(g, 425, 440)))}}>{['金', '木', '水', '火', '土'].map((e) => <div key={e}><span style={{color: EL_C[e], fontFamily: XING, fontSize: 30}}>{e}</span> {GONG.filter((_, p) => PEL[p] === e).join(' ')}</div>)}<div style={{marginTop: 14, color: GOLD, fontSize: 22}}>■ 世爻<br />本宫上 · 一至五世逐位<br />游魂四 · 归魂三</div></div> : null}
			{g >= 420 ? (
				<>
					<Count x={960} y={540} v={Math.min(64, Math.max(0, (g - 425) * 2))} label="八宫 × 八卦" color={GOLD} size={96} hit={pulse(g, 457, 14)} />
					<div style={{position: 'absolute', left: 1450, top: 360, fontFamily: KAI, fontSize: 26, color: '#f6efe2', lineHeight: 1.8, opacity: clamp((g - 440) / 8)}}>{['金', '木', '水', '火', '土'].map((e) => <div key={e}><span style={{color: EL_C[e]}}>●</span> {e} · {GONG.filter((_, p) => PEL[p] === e).length * 8} 卦</div>)}</div>
				</>
			) : null}
			<Stamp x={960} y={760} t={g - 470} text="六十四卦 · 各归其宫" color={GOLD} size={46} life={80} />
			<Chapter f={f} no={f < 400 ? '06 · TWELVE SOVEREIGNS' : '07 · EIGHT PALACES'} title={f < 400 ? '消息' : '八宫'} sub={f < 400 ? '十二辟卦 · 孟喜卦气' : '京房八宫 · 世应 · 游魂归魂'} color={f < 400 ? SUN : GOLD} />
			<Verse f={f} items={VERSE} color={f < 400 ? SUN : GOLD} tag={f < 400 ? '卦气' : '京氏易传'} />
			<Cap f={f} items={CAP} color={f < 400 ? SUN : GOLD} />
			<Scan f={f} hits={[20, 152, 284, 400, 570, 820]} color={SUN} />
		</AbsoluteFill>
	);
};
