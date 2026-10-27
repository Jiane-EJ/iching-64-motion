// 03 错综：错（阴阳全反）· 综（上下颠倒）· 文王 32 对"非覆即变" · 三十六宫
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Nebula, Points, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, spring, Verse, Cap, Log, Burst, Stamp, shake, useF} from './kit';
import {HexG, Hex3D, Chapter, Count, Scan} from './fx';
import {KW, byName, cuo, zong, same} from './data';
import {LOG_C, toLog} from './ev';

export const C_DUR = 660;
const ROSE = '#ff7aa8', CY = '#7fe0ff', GOLD = '#ffd27a', YANG = '#ffe7b0', YIN = '#5ea8ff';
const VERSE: [number, string][] = [[0, '错 · 旁通'], [100, '综 · 反对'], [200, '二二相耦 · 非覆即变'], [300, '覆者表里视之 · 遂成两卦'], [380, '变者反覆唯成一卦 · 则变以对之'], [460, '反复不衰者八'], [540, '三十六宫都是春']];
const CAP: [number, string][] = [[4, '错：六爻阴阳全部翻转 —— 屯变为鼎'], [50, '乾↔坤 · 泰↔否 · 随↔蛊 · 既济↔未济'], [100, '综：把卦倒过来看 —— 屯从对面看就是蒙'], [150, '需↔讼 · 师↔比 · 损↔益 · 晋↔明夷'], [200, '文王卦序两两成对，共 32 对'], [290, '其中 28 对是"综"（倒过来）'], [380, '倒过来还是自己的 8 卦，只好用"错"配对：4 对'], [420, '泰否、随蛊、渐归妹、既济未济：既错又综'], [460, '综卦本是一卦两读：56 ÷ 2 + 8 = 36'], [560, '上经 30 卦 = 18 宫，下经 34 卦 = 18 宫 —— 上下对半']];

type Demo = {a: string; kind: 'cuo' | 'zong'};
const DEMOS: [number, Demo, number][] = [
	[0, {a: '屯', kind: 'cuo'}, 50], [50, {a: '乾', kind: 'cuo'}, 12], [62, {a: '泰', kind: 'cuo'}, 12], [74, {a: '随', kind: 'cuo'}, 12], [86, {a: '既济', kind: 'cuo'}, 14],
	[100, {a: '屯', kind: 'zong'}, 50], [150, {a: '需', kind: 'zong'}, 12], [162, {a: '师', kind: 'zong'}, 12], [174, {a: '损', kind: 'zong'}, 12], [186, {a: '晋', kind: 'zong'}, 14],
];
const pairKind = (i: number) => (same(zong(KW[i * 2].lines), KW[i * 2 + 1].lines) ? 'zong' : 'cuo');
const pairBoth = (i: number) => same(zong(KW[i * 2].lines), cuo(KW[i * 2].lines));
const symm = (n: string) => ['乾', '坤', '颐', '大过', '坎', '离', '中孚', '小过'].includes(n);
// 墙：4 列 × 8 行
const wallP = (i: number): [number, number] => [470 + (i % 4) * 375, 205 + Math.floor(i / 4) * 86];
// 三十六宫：上经 18（前三行）· 下经 18（后三行）
const GONG36: {a: number; b: number | null}[] = [];
for (let i = 0; i < 32; i++) {
	if (pairKind(i) === 'zong') GONG36.push({a: i * 2, b: i * 2 + 1});
	else { GONG36.push({a: i * 2, b: null}); GONG36.push({a: i * 2 + 1, b: null}); }
}
const gongP = (k: number): [number, number] => [560 + (k % 6) * 160, 230 + Math.floor(k / 6) * 108];

export const SC: React.FC = () => {
	const f = useF();
	const [sx, sy] = shake(f, [40, 140, 200, 460], 10);
	const cam = {pos: [0, 0, 14] as V3, look: [0, 0, 0] as V3};
	// 当前演示
	let di = 0;
	DEMOS.forEach(([at], i) => { if (f >= at) di = i; });
	const [dAt, demo, dLen] = DEMOS[di];
	const dt = f - dAt;
	const A = byName(demo.a);
	const B = demo.kind === 'cuo' ? cuo(A.lines) : zong(A.lines);
	const BG = KW.find((g) => same(g.lines, B))!;
	const mt = demo.kind === 'cuo' ? (dLen > 20 ? 34 : 9) : dLen > 20 ? 30 : 9; // 形变时长
	const u = eo(dt / mt);
	const fly = dLen > 20 ? eo(dt / 24) : 1;
	const flip = demo.kind === 'zong' ? u : 0;
	const lines = demo.kind === 'cuo' ? A.lines.map((v, k) => lerp(v, 1 - v, sm(clamp((dt - k * (dLen > 20 ? 4 : 1)) / (dLen > 20 ? 8 : 4))))) : A.lines;
	const colors = lines.map((v) => (v > 0.5 ? YANG : YIN));
	const showDemo = f < 205;

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<Stage3D cam={cam} dial={false}>
				<Nebula color={ROSE} color2={CY} n={600} />
				{showDemo ? (
					<group>
						<Hex3D lines={A.lines} colors={A.lines.map((v) => (v ? YANG : YIN))} color={YANG} pos={[-4, 0.2, 0]} scale={0.75} rot={[0, Math.sin(f * 0.05) * 0.25, 0]} op={0.9} />
						<Hex3D lines={lines} colors={colors} color={YANG} pos={[lerp(-4, 4, fly), 0.2 + Math.sin(fly * Math.PI) * 1.2, Math.sin(fly * Math.PI) * 2]} scale={0.75 + 0.15 * pulse(dt, mt, 10)} rot={[0, (demo.kind === 'cuo' ? (1 - u) * 6.28 : 0) + Math.sin(f * 0.05) * 0.25, Math.PI * flip]} emissive={0.6 + 0.8 * pulse(dt, mt, 10)} />
						<Points n={240} color={demo.kind === 'cuo' ? ROSE : CY} size={0.18} fn={(i) => { const t = (f * 0.02 + rand(i)) % 1; const a = rand(i + 4) * 6.28; return [lerp(-4, 4, t), 0.2 + Math.cos(a) * (0.6 + Math.sin(t * Math.PI) * 1.8), Math.sin(a) * (0.6 + Math.sin(t * Math.PI) * 1.8)]; }} />
					</group>
				) : null}
			</Stage3D>
			{showDemo ? (
				<div style={{position: 'absolute', inset: 0, opacity: 1 - sm(win(f, 195, 205))}}>
					<div style={{position: 'absolute', left: 535, top: 790, width: 200, textAlign: 'center', fontFamily: XING, fontSize: 60, color: '#fff'}}>{A.name}</div>
					<div style={{position: 'absolute', left: 1185, top: 790, width: 200, textAlign: 'center', fontFamily: XING, fontSize: 60, color: '#fff', opacity: clamp((dt - mt + 4) / 4), transform: `scale(${1 + 0.4 * pulse(dt, mt, 8)})`}}>{BG.name}</div>
					<div style={{position: 'absolute', left: 860, top: 470, width: 200, textAlign: 'center'}}>
						<div style={{fontFamily: XING, fontSize: 96, color: demo.kind === 'cuo' ? ROSE : CY, textShadow: `0 0 24px ${demo.kind === 'cuo' ? ROSE : CY}`}}>{demo.kind === 'cuo' ? '错' : '综'}</div>
						<div style={{fontFamily: MONO, fontSize: 20, color: '#fff'}}>{demo.kind === 'cuo' ? 'yin ⟷ yang' : 'rotate 180°'}</div>
					</div>
					{/* 综：上下两只眼 —— 同一卦，两边各看一卦 */}
					{demo.kind === 'zong' && dLen > 20 ? (
						<svg width={1920} height={1080} style={{position: 'absolute'}}>
							{[0, 1].map((k) => { const y = k ? 900 : 180; const x = 540 + 0; const o = clamp((dt - 6 - k * 6) / 6); return <g key={k} opacity={o}><ellipse cx={x + 95} cy={y} rx={40} ry={18} fill="none" stroke={CY} strokeWidth={3} /><circle cx={x + 95 + Math.sin(f * 0.2) * 6} cy={y} r={8} fill={CY} /><text x={x + 160} y={y + 8} fill={CY} fontFamily={KAI} fontSize={22}>{k ? `从下看：${A.name}` : `从上看：${BG.name}`}</text></g>; })}
						</svg>
					) : null}
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						<Burst x={1330} y={560} t={dt - mt} color={demo.kind === 'cuo' ? ROSE : CY} r={dLen > 20 ? 260 : 150} n={30} seed={di * 5} />
					</svg>
					{/* 小例子条 */}
					<div style={{position: 'absolute', left: 1500, top: 230, fontFamily: KAI, fontSize: 24, lineHeight: 1.7}}>
						{DEMOS.filter(([at, d]) => d.kind === demo.kind && f >= at).map(([at, d]) => { const a = byName(d.a); const b = KW.find((g) => same(g.lines, d.kind === 'cuo' ? cuo(a.lines) : zong(a.lines)))!; return <div key={at} style={{color: at === dAt ? '#fff' : 'rgba(240,230,210,0.5)'}}>{a.name} → {b.name}</div>; })}
					</div>
				</div>
			) : null}

			{/* —— 32 对之墙 —— */}
			{f >= 200 && f < 470 ? (
				<svg width={1920} height={1080} style={{position: 'absolute', opacity: clamp((f - 200) / 6) * (1 - sm(win(f, 460, 470)))}}>
					{Array.from({length: 32}).map((_, i) => {
						const lt = f - 205 - i * 5;
						if (lt < 0) return null;
						const [x, y] = wallP(i);
						const a = KW[i * 2], b = KW[i * 2 + 1];
						const k = pairKind(i);
						const t = eo((lt - 4) / 10);
						const both = pairBoth(i);
						const s8 = f >= 380 && f < 460 && (symm(a.name));
						const bLines = k === 'cuo' ? a.lines.map((v) => lerp(v, 1 - v, t)) : a.lines;
						const col = k === 'cuo' ? ROSE : CY;
						const hl = (f >= 420 && both) || s8;
						return (
							<g key={i} opacity={clamp(lt / 4)}>
								{hl ? <rect x={x - 150} y={y - 38} width={330} height={78} fill={s8 ? ROSE : GOLD} opacity={0.14 + 0.1 * Math.sin(f * 0.3)} /> : null}
								<text x={x - 130} y={y + 6} fill="rgba(240,230,210,0.5)" fontFamily={MONO} fontSize={13}>{a.kw}·{b.kw}</text>
								<HexG x={x - 50} y={y - 6} w={42} lines={a.lines} color={YANG} yin={YIN} />
								<text x={x - 50} y={y + 34} fill="#f6efe2" fontFamily={KAI} fontSize={16} textAnchor="middle">{a.name}</text>
								<HexG x={x + 60} y={y - 6} w={42} lines={bLines} color={YANG} yin={YIN} rot={k === 'zong' ? 180 * t : 0} glow={pulse(lt, 14, 8) * 12} />
								<text x={x + 60} y={y + 34} fill="#f6efe2" fontFamily={KAI} fontSize={16} textAnchor="middle" opacity={clamp((lt - 10) / 4)}>{b.name}</text>
								<text x={x + 5} y={y + 2} fill={col} fontFamily={XING} fontSize={26} textAnchor="middle">{k === 'cuo' ? '错' : '综'}</text>
								{both && f >= 420 ? <text x={x + 120} y={y + 2} fill={GOLD} fontFamily={XING} fontSize={20}>亦错</text> : null}
							</g>
						);
					})}
				</svg>
			) : null}
			{f >= 200 && f < 470 ? (
				<>
					<Count x={150} y={420} v={Array.from({length: 32}).filter((_, i) => pairKind(i) === 'zong' && f - 205 - i * 5 >= 0).length} label="综 · 反对" color={CY} />
					<Count x={150} y={580} v={Array.from({length: 32}).filter((_, i) => pairKind(i) === 'cuo' && f - 205 - i * 5 >= 0).length} label="错 · 旁通" color={ROSE} />
					{f >= 380 ? <div style={{position: 'absolute', left: 60, top: 700, fontFamily: KAI, fontSize: 22, color: ROSE, width: 200, lineHeight: 1.5}}>反复不衰 8 卦：乾 坤 颐 大过 坎 离 中孚 小过</div> : null}
				</>
			) : null}

			{/* —— 三十六宫 —— */}
			{f >= 460 ? (
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					{GONG36.map((gg, k) => {
						const lt = f - 462 - k * 1.5;
						const a = KW[gg.a];
						const [x0, y0] = wallP(Math.floor(gg.a / 2));
						const [x1, y1] = gongP(k);
						const u2 = eo(lt / 18);
						const x = lerp(x0 - 50 + (gg.b === null && gg.a % 2 ? 110 : 0), x1, u2), y = lerp(y0, y1, u2);
						const swing = gg.b !== null ? 180 * sm((Math.sin((f - 480) * 0.12 + k * 0.4) + 1) / 2) : 0;
						const upper = k < 18;
						const col = upper ? YANG : '#ffc0d6';
						return (
							<g key={k} opacity={clamp(lt / 3)}>
								{f >= 560 ? <rect x={x1 - 74} y={y1 - 50} width={148} height={100} fill={upper ? GOLD : ROSE} opacity={0.08} /> : null}
								<HexG x={x} y={y - 8} w={46} lines={a.lines} color={col} yin={upper ? '#9cc8ff' : '#c49bff'} rot={swing} />
								<text x={x} y={y + 38} fill="#f6efe2" fontFamily={KAI} fontSize={17} textAnchor="middle" opacity={u2}>{gg.b === null ? a.name : swing < 90 ? `${a.name}/${KW[gg.b].name}` : `${KW[gg.b].name}/${a.name}`}</text>
							</g>
						);
					})}
					{f >= 560 ? <><text x={500} y={340} fill={GOLD} fontFamily={XING} fontSize={30} textAnchor="end" opacity={clamp((f - 560) / 8)}>上经 18</text><text x={500} y={666} fill={ROSE} fontFamily={XING} fontSize={30} textAnchor="end" opacity={clamp((f - 570) / 8)}>下经 18</text></> : null}
				</svg>
			) : null}
			{f >= 460 ? <Count x={1650} y={460} v={lerp(64, 36, eo((f - 470) / 50))} label="宫" color={GOLD} size={96} hit={pulse(f, 520, 14)} /> : null}
			{f >= 460 ? <div style={{position: 'absolute', left: 1560, top: 560, fontFamily: MONO, fontSize: 22, color: '#f6efe2', opacity: clamp((f - 500) / 8), lineHeight: 1.6}}>56 ÷ 2 = 28<br />+ 8 = 36</div> : null}
			<Stamp x={1650} y={800} t={f - 540} text="三十六宫都是春 —— 邵雍" color={GOLD} size={34} life={110} />
			<Chapter f={f} no="03 · INVERSE / REVERSE" title="错综" sub="旁通与反对 · 二二相耦 · 非覆即变" color={ROSE} />
			<Verse f={f} items={VERSE} color={ROSE} tag="孔颖达 · 周易正义" />
			<Cap f={f} items={CAP} color={ROSE} />
			{f < 200 ? <Log f={f} items={toLog(LOG_C)} color={ROSE} x={60} y={760} /> : null}
			<Scan f={f} hits={[40, 140, 200, 380, 460, 520]} color={ROSE} />
		</AbsoluteFill>
	);
};
