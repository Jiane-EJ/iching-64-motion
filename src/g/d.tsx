// 04 互变：互卦（中四爻）64→16→4 · 变卦：六维超立方体，一爻一边，三百八十四爻
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Ball, Beam, Points, Glow, Nebula, Ring, orbit, project, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, Verse, Cap, Log, L3, Burst, Stamp, shake, useF} from './kit';
import {HexG, Segs, Chapter, Count, Scan} from './fx';
import {KW, BY_V, byName, hu, bian, same, yangN, gv, type Lines} from './data';
import {LOG_D, toLog} from './ev';

export const D_DUR = 780;
const VIO = '#b58cff', CY = '#7fe0ff', GOLD = '#ffd27a', YANG = '#ffe7b0', YIN = '#5ea8ff';
const VERSE: [number, string][] = [[0, '互体 · 取中四爻'], [60, '若夫杂物撰德 · 非其中爻不备'], [150, '六十四 → 十六 → 四'], [300, '终归 乾 · 坤 · 既济 · 未济'], [360, '爻者 · 言乎变者也'], [420, '一爻动 · 本卦之卦'], [520, '阴自下长 · 阳自下复'], [640, '九六为动 · 七八不变']];
const CAP: [number, string][] = [[4, '互卦：取二三四爻作下卦，三四五爻作上卦'], [60, '屯的互卦是剥，剥的互卦是坤，坤的互卦还是坤'], [100, '既济互出未济，未济又互回既济 —— 两卦循环'], [150, '对 64 卦全部取互：只剩 16 个不同的结果'], [240, '再取一次：只剩 4 个 —— 乾、坤、既济、未济'], [360, '64 卦正好是六维立方体的 64 个顶点；改一爻 = 沿一条边走一步'], [420, '乾动一爻，可去 6 个卦：姤 同人 履 小畜 大有 夬'], [520, '每步只变一爻：乾 → 坤 是一阴自下而长，坤 → 乾 是一阳来复'], [640, '筮得九、六为动爻，七、八不动；每卦可往 64 卦，共 4096 种'], [720, '64 × 6 = 384 条爻辞，就是这 192 条边的两端']];

/* ── 互卦机制 ── */
const HU_DEMO: [number, string, number][] = [[0, '屯', 34], [34, '剥', 26], [60, '坤', 40], [100, '既济', 25], [125, '未济', 25]];
const LineR: React.FC<{x: number; y: number; w: number; v: number; color: string}> = ({x, y, w, v, color}) => {
	const h = w * 0.12, gap = w * 0.2, half = (w - gap * (1 - v)) / 2;
	return <g><rect x={x - w / 2} y={y - h / 2} width={half} height={h} fill={color} rx={2} /><rect x={x + w / 2 - half} y={y - h / 2} width={half} height={h} fill={color} rx={2} /></g>;
};
const ly = (cy: number, w: number, k: number) => cy + (2.5 - k) * w * 0.21;

/* ── 漏斗：64 → 16 → 4 ── */
const HU16 = [...new Set(KW.map((g) => gv(hu(g.lines)).v))];
const HU4 = [...new Set(HU16.map((v) => gv(hu(BY_V[v].lines)).v))];
const p64 = (i: number, f: number): V3 => { const a = (i / 64) * 6.28 + f * 0.004; return [Math.cos(a) * 9, 2.6, Math.sin(a) * 9]; };
const p16 = (i: number, f: number): V3 => { const a = (i / 16) * 6.28 - f * 0.006; return [Math.cos(a) * 5, 0, Math.sin(a) * 5]; };
const p4 = (i: number, f: number): V3 => { const a = (i / 4) * 6.28 + f * 0.01; const r = i >= 2 ? 1.6 : 2.2; return [Math.cos(a) * r, -2.6 + (i >= 2 ? Math.sin(f * 0.15 + i * 3.14) * 0.5 : 0), Math.sin(a) * r]; };

/* ── 超立方体：二十面体六轴投影 ── */
const PHI = 1.618;
const AX: V3[] = ([[0, 1, PHI], [0, 1, -PHI], [1, PHI, 0], [1, -PHI, 0], [PHI, 0, 1], [-PHI, 0, 1]] as V3[]).map((v) => { const l = Math.hypot(...v); return v.map((x) => (x / l) * 2.1) as V3; });
const hpos = (l: Lines, s: number): V3 => { const p: V3 = [0, 0, 0]; l.forEach((b, k) => { for (let d = 0; d < 3; d++) p[d] += (b - 0.5) * AX[k][d] * s; }); return p; };
const EDGES: [number, number, number][] = [];
for (let v = 0; v < 64; v++) for (let k = 0; k < 6; k++) { const w = gv(bian(BY_V[v].lines, k)).v; if (w > v) EDGES.push([v, w, k]); }
const WALK = ['乾', '姤', '遯', '否', '观', '剥', '坤', '复', '临', '泰', '大壮', '夬', '乾'];
const QIAN6 = [0, 1, 2, 3, 4, 5].map((k) => gv(bian(byName('乾').lines, k)));
const YAO = ['初', '二', '三', '四', '五', '上'];

export const SD: React.FC = () => {
	const f = useF();
	const [sx, sy] = shake(f, [34, 60, 240, 300, 360, 640], 10);
	// —— 互卦机制 ——
	let hi = 0;
	HU_DEMO.forEach(([at], i) => { if (f >= at) hi = i; });
	const [hAt, hName, hLen] = HU_DEMO[hi];
	const ht = f - hAt;
	const HA = byName(hName), HB = gv(hu(HA.lines));
	const SRC = [1, 2, 3, 2, 3, 4];
	// —— 漏斗 ——
	const fT = f - 150;
	const funnelCam = orbit(21 - eo(fT / 200) * 3, 0.8 + f * 0.006, 10 - eo(fT / 200) * 2, [0, -0.6, 0]);
	// —— 超立方 ——
	const hT = f - 360;
	const open = eo(hT / 40) + 0.08 * pulse(hT, 40, 14);
	const cubeCam = orbit(13 - 1.5 * sm(win(hT, 200, 300)) + 1.5 * sm(win(hT, 280, 420)), 0.3 + hT * (hT > 280 ? 0.02 : 0.008), 3 + Math.sin(hT * 0.01) * 2, [0, 0, 0]);
	const cam = f < 360 ? funnelCam : cubeCam;
	const qv = byName('乾').v;
	const q6 = clamp(Math.floor((hT - 60) / 12), -1, 5);
	const wk = (hT - 160) / 10;
	const wI = clamp(Math.floor(wk), 0, 12);
	const wu = clamp(wk - wI);
	const curW = byName(WALK[wI]), nxtW = byName(WALK[Math.min(12, wI + 1)]);
	const wPos = (() => { const a = hpos(curW.lines, open), b = hpos(nxtW.lines, open); const t = sm(wu); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)] as V3; })();
	const edgePts: number[] = [];
	EDGES.forEach(([a, b]) => { edgePts.push(...hpos(BY_V[a].lines, open), ...hpos(BY_V[b].lines, open)); });
	const wave = hT >= 280 ? (hT - 280) * 0.08 : -9;

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			{f >= 140 ? (
				<Stage3D cam={cam} dial={false}>
					<Nebula color={VIO} color2={CY} n={600} />
					{f < 360 ? (
						<group>
							{KW.map((g, i) => {
								const t0 = 170 + (i % 16) * 2;
								const a = p64(i, f);
								const m = HU16.indexOf(gv(hu(g.lines)).v);
								const b = p16(m, f);
								const u = eo((f - t0) / 22);
								return (
									<group key={i}>
										<Ball pos={a} color={g.lines[5] ? YANG : YIN} r={0.16} glow={0.8} opacity={clamp((f - 150 - i * 0.3) / 6)} />
										{f >= t0 ? <Beam a={a} b={b} p={u} color={VIO} r={0.012} opacity={0.5} /> : null}
										{f >= t0 && u < 1 ? <Ball pos={[lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]} color="#fff" r={0.08} glow={1.4} /> : null}
									</group>
								);
							})}
							{HU16.map((v, m) => {
								const a = p16(m, f), on = clamp((f - 190) / 10);
								const c = HU4.indexOf(gv(hu(BY_V[v].lines)).v);
								const b = p4(c, f);
								const u = eo((f - 240 - m * 2) / 20);
								return (
									<group key={'m' + v}>
										<Ball pos={a} color={VIO} r={0.28 + 0.15 * pulse(f, 192, 12)} glow={1.2} opacity={on} />
										{f >= 240 + m * 2 ? <Beam a={a} b={b} p={u} color={GOLD} r={0.03} opacity={0.7} /> : null}
									</group>
								);
							})}
							{HU4.map((v, c) => { const p = p4(c, f); const on = clamp((f - 255) / 10); return <group key={'c' + v}><Ball pos={p} color={c < 2 ? (BY_V[v].lines[0] ? YANG : YIN) : GOLD} r={0.55 + 0.2 * pulse(f, 300, 14)} glow={1.8} opacity={on} />{c < 2 && f > 300 ? <Ring r={0.9} color={GOLD} rot={[Math.PI / 2, 0, f * 0.1]} pos={p} opacity={0.6} /> : null}</group>; })}
						</group>
					) : (
						<group rotation={[0.3, hT * 0.004, 0]}>
							<Segs pts={edgePts} color={VIO} opacity={0.35 + 0.25 * pulse(hT, 280, 30)} />
							{EDGES.map(([a, b, k], i) => {
								// 波：按爻位分组依次点亮（每一条边 = 一爻之变）
								const w = pulse(wave, k * 1.2 + (yangN(BY_V[a].lines) * 0.3), 1.2);
								const isQ = q6 >= 0 && (a === qv || b === qv) && k <= q6;
								if (!w && !isQ) return null;
								return <Beam key={i} a={hpos(BY_V[a].lines, open)} b={hpos(BY_V[b].lines, open)} color={isQ ? GOLD : ['#ff7aa8', '#ffd27a', '#7fe0ff', '#4cd38a', '#b58cff', '#ff9f5a'][k]} r={isQ ? 0.05 : 0.035} opacity={isQ ? 1 : w} />;
							})}
							{BY_V.map((g) => { const n = yangN(g.lines); const c = n >= 4 ? YANG : n <= 2 ? YIN : '#d9cfbd'; const hot = (g.v === qv && hT >= 60 && hT < 160) || (hT >= 60 && hT < 160 && q6 >= 0 && QIAN6.slice(0, q6 + 1).some((x) => x.v === g.v)); return <Ball key={g.v} pos={hpos(g.lines, open)} color={hot ? '#fff' : c} r={hot ? 0.18 : 0.1} glow={hot ? 1.6 : 0.7} />; })}
							{hT >= 160 && hT < 290 ? <><Ball pos={wPos} color="#fff" r={0.22} glow={2.4} /><Points n={60} color={GOLD} size={0.18} fn={(i) => { const tt = Math.max(0, wk - i * 0.05); const j = clamp(Math.floor(tt), 0, 12); const a = hpos(byName(WALK[j]).lines, open), b = hpos(byName(WALK[Math.min(12, j + 1)]).lines, open); const s = sm(tt - j); return [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)]; }} /></> : null}
						</group>
					)}
				</Stage3D>
			) : null}

			{/* —— 互卦机制（SVG） —— */}
			{f < 150 ? (
				<svg width={1920} height={1080} style={{position: 'absolute', opacity: 1 - sm(win(f, 140, 150))}}>
					{(() => {
						const W = 220, X0 = 620, X1 = 1300, CYc = 560;
						const out: React.ReactNode[] = [];
						HA.lines.forEach((v, k) => {
							const inMid = k >= 1 && k <= 4;
							out.push(<g key={'a' + k} opacity={inMid ? 1 : 0.3}><LineR x={X0} y={ly(CYc, W, k)} w={W} v={v} color={v ? YANG : YIN} /></g>);
						});
						// 括号：2–4 下互，3–5 上互
						out.push(<rect key="b1" x={X0 - W / 2 - 30} y={ly(CYc, W, 3) - 14} width={10} height={ly(CYc, W, 1) - ly(CYc, W, 3) + 28} fill={CY} opacity={clamp(ht / 4)} />);
						out.push(<rect key="b2" x={X0 + W / 2 + 20} y={ly(CYc, W, 4) - 14} width={10} height={ly(CYc, W, 2) - ly(CYc, W, 4) + 28} fill={GOLD} opacity={clamp((ht - 3) / 4)} />);
						out.push(<text key="t1" x={X0 - W / 2 - 46} y={ly(CYc, W, 2) + 8} fill={CY} fontFamily={KAI} fontSize={22} textAnchor="end">二三四 → 下</text>);
						out.push(<text key="t2" x={X0 + W / 2 + 44} y={ly(CYc, W, 3) + 8} fill={GOLD} fontFamily={KAI} fontSize={22}>三四五 → 上</text>);
						SRC.forEach((s, k) => {
							const u = eo((ht - 6 - k * 2) / 12);
							const x = lerp(X0, X1, u), y = lerp(ly(CYc, W, s), ly(CYc, W, k), u) - Math.sin(u * Math.PI) * (k < 3 ? -60 : 60);
							const v = HA.lines[s];
							out.push(<g key={'m' + k} opacity={clamp((ht - 6 - k * 2) / 3)}><LineR x={x} y={y} w={W} v={v} color={k < 3 ? CY : GOLD} /></g>);
						});
						out.push(<text key="n0" x={X0} y={CYc + 190} fill="#fff" fontFamily={XING} fontSize={60} textAnchor="middle">{HA.name}</text>);
						out.push(<text key="n1" x={X1} y={CYc + 190} fill="#fff" fontFamily={XING} fontSize={60} textAnchor="middle" opacity={clamp((ht - 20) / 4)}>{HB.name}</text>);
						out.push(<text key="ar" x={(X0 + X1) / 2} y={CYc + 16} fill={VIO} fontFamily={XING} fontSize={64} textAnchor="middle">互</text>);
						if (same(HA.lines, HB.lines) && ht > 22) out.push(<circle key="fx" cx={X1} cy={CYc} r={170 + Math.sin(f * 0.3) * 6} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray="10 8" />);
						out.push(<Burst key="bu" x={X1} y={CYc} t={ht - 20} color={VIO} r={220} n={26} seed={hi * 3} />);
						return out;
					})()}
				</svg>
			) : null}
			{f < 150 ? (
				<div style={{position: 'absolute', left: 1530, top: 300, fontFamily: KAI, fontSize: 26, lineHeight: 1.8, color: '#f6efe2'}}>
					{HU_DEMO.filter(([at]) => f >= at).map(([at, n]) => <div key={at} style={{opacity: at === hAt ? 1 : 0.45}}>{n} → {gv(hu(byName(n).lines)).name}{same(hu(byName(n).lines), byName(n).lines) ? '（不动）' : ''}</div>)}
				</div>
			) : null}

			{/* —— 漏斗标签 —— */}
			{f >= 150 && f < 360 ? (
				<>
					{HU16.map((v, m) => <L3 key={v} cam={cam} p={[p16(m, f)[0], 0.65, p16(m, f)[2]]} text={BY_V[v].name} color={VIO} size={20} op={clamp((f - 195) / 8) * (1 - sm(win(f, 340, 360)))} />)}
					{HU4.map((v, c) => <L3 key={'c' + v} cam={cam} p={[p4(c, f)[0], p4(c, f)[1] - 1.1, p4(c, f)[2]]} text={BY_V[v].name} color={GOLD} size={38} font={XING} op={clamp((f - 262) / 8)} />)}
					<Count x={110} y={360} v={64} label="本卦" color={YANG} size={52} />
					<Count x={110} y={500} v={f < 190 ? 0 : 16} label="一次互" color={VIO} size={52} hit={pulse(f, 192, 12)} />
					<Count x={110} y={640} v={f < 260 ? 0 : 4} label="二次互" color={GOLD} size={52} hit={pulse(f, 262, 12)} />
					{f >= 300 ? <div style={{position: 'absolute', left: 1500, top: 380, fontFamily: KAI, fontSize: 26, color: '#f6efe2', lineHeight: 1.7, opacity: clamp((f - 300) / 8)}}>乾 ⟲ 自互<br />坤 ⟲ 自互<br /><span style={{color: GOLD}}>既济 ⇄ 未济</span><br /><span style={{fontSize: 20, opacity: 0.7}}>全部 64 卦，两步之内归此四卦</span></div> : null}
				</>
			) : null}

			{/* —— 超立方体读数 —— */}
			{f >= 360 ? (
				<>
					{hT >= 60 && hT < 160 ? QIAN6.map((g, k) => k <= q6 ? <L3 key={k} cam={cubeCam} p={((): V3 => { const p = hpos(g.lines, open); const c = Math.cos(0.3), s = Math.sin(0.3), a = hT * 0.004; const x1 = p[0] * Math.cos(a) + p[2] * Math.sin(a), z1 = -p[0] * Math.sin(a) + p[2] * Math.cos(a); return [x1, p[1] * c - z1 * s, p[1] * s + z1 * c]; })()} text={`${YAO[k]} → ${g.name}`} color={GOLD} size={22} box /> : null) : null}
					<div style={{position: 'absolute', left: 70, top: 260, width: 300}}>
						{(() => {
							const g = hT < 60 ? byName('乾') : hT < 160 ? (q6 >= 0 ? QIAN6[q6] : byName('乾')) : hT < 290 ? curW : byName('乾');
							const flipK = hT >= 60 && hT < 160 ? q6 : -1;
							const from = byName('乾');
							const lines = hT >= 160 && hT < 290 ? curW.lines.map((v, k) => (v !== nxtW.lines[k] ? lerp(v, nxtW.lines[k], sm(wu * 2 - 0.5)) : v)) : hT >= 60 && hT < 160 ? from.lines.map((v, k) => (k === flipK ? lerp(v, 1 - v, sm(((hT - 60) % 12) / 6)) : v)) : g.lines;
							return (
								<>
									<div style={{fontFamily: MONO, fontSize: 16, color: VIO, letterSpacing: 4}}>{hT < 160 ? 'Q6 · 6-CUBE' : hT < 290 ? 'WALK · 消息' : '384 YAO'}</div>
									<svg width={260} height={230}><HexG x={130} y={115} w={180} lines={lines} color={YANG} yin={YIN} glow={10} hl={lines.map((_, k) => (k === flipK ? 1 : 0))} hlc={GOLD} /></svg>
									<div style={{fontFamily: XING, fontSize: 56, color: '#fff'}}>{hT >= 160 && hT < 290 ? curW.name : g.name}</div>
									{hT >= 160 && hT < 290 ? <div style={{fontFamily: KAI, fontSize: 22, color: GOLD}}>第 {wI} 步 · 阳爻 {yangN(curW.lines)}</div> : null}
								</>
							);
						})()}
					</div>
					{hT >= 280 ? (
						<div style={{position: 'absolute', left: 1480, top: 240, width: 380, opacity: clamp((hT - 280) / 8)}}>
							<div style={{fontFamily: MONO, fontSize: 16, color: VIO, letterSpacing: 4}}>大衍筮法 · 概率</div>
							{([['老阴 6 ⚋→⚊', 1, '#ff7aa8'], ['少阳 7 ⚊', 5, YANG], ['少阴 8 ⚋', 7, YIN], ['老阳 9 ⚊→⚋', 3, '#ff9f5a']] as [string, number, string][]).map(([k, n, c], i) => (
								<div key={k} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 8}}>
									<span style={{fontFamily: KAI, fontSize: 22, color: c, width: 150}}>{k}</span>
									<div style={{height: 14, width: 190 * (n / 7) * eo((hT - 290 - i * 5) / 14), background: c, boxShadow: `0 0 8px ${c}`}} />
									<span style={{fontFamily: MONO, fontSize: 16, color: '#f6efe2'}}>{n}/16</span>
								</div>
							))}
							<div style={{fontFamily: KAI, fontSize: 22, color: '#f6efe2', marginTop: 18, lineHeight: 1.6}}>顶点 64 · 边 192 · 每卦 6 邻<br />乾 → 坤 最远 6 步<br />之卦 64 × 64 = 4096</div>
						</div>
					) : null}
					{hT >= 330 ? <Count x={1660} y={880} v={Math.min(384, (hT - 330) * 12)} label="爻 = 64 × 6" color={GOLD} size={72} hit={pulse(hT, 362, 12)} /> : null}
				</>
			) : null}
			<Stamp x={1660} y={860} t={f - 300} text="归于四卦" color={GOLD} size={46} life={56} />
			<Stamp x={1640} y={170} t={hT - 362} text="焦氏易林 · 4096" color={VIO} size={34} life={70} />
			<Chapter f={f} no="04 · NUCLEAR / MUTATION" title="互变" sub="互卦取中爻 · 变卦动一爻" color={VIO} />
			<Verse f={f} items={VERSE} color={VIO} tag="系辞" />
			<Cap f={f} items={CAP} color={VIO} />
			<Scan f={f} hits={[34, 60, 150, 240, 300, 360, 640]} color={VIO} />
		</AbsoluteFill>
	);
};
