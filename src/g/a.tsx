// 01 生成：太极 → 两仪 → 四象 → 八卦 → 六十四；八卦相错成方阵；八卦象性；二进制与三百八十四爻
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage3D, Ball, Beam, Points, Glow, Nebula, orbit, project, type V3} from '../t3';
import {KAI, XING, MONO, rand} from '../lib';
import {clamp, lerp, eo, sm, win, pulse, spring, Verse, Cap, Log, L3, Burst, Stamp, shake, useF} from './kit';
import {HexG, Hex3D, Chapter, Count, Scan} from './fx';
import {TRI, TRI_LINES, TRI_XIANG, TRI_XING, TRI_JIA, TRI_XT_DIR, TRI_HT_DIR, TRI_BODY, TRI_ANIMAL, TRI_EL, EL_C, XT, BY_V, KW} from './data';
import {LOG_A, toLog} from './ev';

export const A_DUR = 900;
const GOLD = '#ffd27a', YANG = '#ffe7b0', YIN = '#5ea8ff';
const LV = [0, 30, 70, 115, 230, 280, 330]; // 各层出现帧
const LVN = ['太极', '两仪', '四象', '八卦', '十六', '三十二', '六十四'];
const SIXIANG = ['太阳', '少阴', '少阳', '太阴'];
const R = (k: number) => k * 1.55;
// 第 k 层第 j 个节点（日晕式二叉树，j 的二进制位 0 = 阳）
const nodeP = (k: number, j: number, spin: number): V3 => {
	if (k === 0) return [0, 0, 0];
	const a = ((j + 0.5) / 2 ** k) * Math.PI * 2 + spin;
	return [Math.cos(a) * R(k), Math.sin(k * 0.9 + spin * 3) * 0.12, Math.sin(a) * R(k)];
};
const bitYang = (j: number) => (j % 2 === 0 ? 1 : 0);
const full = (g: {name: string; up: number; lo: number}) => (g.up === g.lo ? `${g.name}为${TRI_XIANG[g.up]}` : `${TRI_XIANG[g.up]}${TRI_XIANG[g.lo]}${g.name}`);

const VERSE: [number, string][] = [[0, '易有太极'], [30, '是生两仪'], [70, '两仪生四象'], [115, '四象生八卦'], [230, '八卦相重'], [330, '六十四卦'], [380, '八卦相错 · 因而重之'], [500, '乾健 · 坤顺 · 震动 · 巽入'], [580, '坎陷 · 离丽 · 艮止 · 兑说'], [660, '阴 ⚋ = 0 · 阳 ⚊ = 1'], [800, '六爻 × 六十四卦 = 三百八十四爻']];
const CAP: [number, string][] = [[4, '一个未分的整体：太极'], [30, '一分为二：阳 ⚊ 与 阴 ⚋'], [70, '再分：四种两爻组合 —— 四象'], [115, '再分：八种三爻组合 —— 八卦（先天序）'], [230, '每一层都"加一倍"：邵雍称之为加一倍法'], [330, '第六层：2⁶ = 64，六十四卦全部出现'], [380, '另一种生法：八个上卦 × 八个下卦 = 64'], [440, '卦名读法：先上象，后下象，再卦名 —— 如"水雷屯"'], [500, '八卦各有象、性、家人、方位（说卦传）'], [660, '把阴记作 0、阳记作 1，每一卦就是一个 6 位二进制数'], [724, '先天序恰好是 0 到 63 的顺序 —— 莱布尼茨曾为此惊叹'], [800, '每卦六爻，共三百八十四爻，每一爻都可能变动']];

// 八卦特有运动：粒子随象而动
const triFx = (t: number, f: number) => (i: number): V3 => {
	const u = rand(i), v = rand(i + 7), w = rand(i + 13);
	switch (t) {
		case 0: { const y = ((f * 0.06 + u * 8) % 8) - 2; return [(v - 0.5) * 9, y, (w - 0.5) * 5]; } // 天：星升
		case 1: { const r = ((f * 0.05 + u * 4) % 4); const a = v * 6.28; return [Math.cos(a) * r, -2 + Math.sin(r * 3 - f * 0.2) * 0.12, Math.sin(a) * r]; } // 泽：涟漪
		case 2: { const life = (f * 0.05 + u) % 1; return [(v - 0.5) * 2.4 * (1 - life), -2 + life * 5, (w - 0.5) * 2 * (1 - life)]; } // 火：焰
		case 3: { const s = Math.floor(f / 3); const k = i % 40; const y = 3 - k * 0.16; return [Math.sin(k * 1.7 + s) * 0.6 * (k % 2 ? 1 : -1) + (v - 0.5) * 0.15, y, 0]; } // 雷：闪
		case 4: { const a = u * 6.28 + f * 0.08; const r = 0.5 + v * 3; return [Math.cos(a) * r, (w - 0.5) * 4 + Math.sin(a * 2) * 0.3, Math.sin(a) * r]; } // 风：旋
		case 5: { const y = 3 - ((f * 0.12 + u * 6) % 6); return [(v - 0.5) * 7, y, (w - 0.5) * 3]; } // 水：下注
		case 6: { const x = (u - 0.5) * 8; const pk = Math.max(0, 2.6 - Math.abs(x) * 0.9 - Math.abs(x - 2) * 0.4); return [x, -2 + pk * v, (w - 0.5) * 3]; } // 山：静峰
		default: { return [(u - 0.5) * 9, -2.2 + Math.sin(u * 20 + f * 0.04) * 0.05, (v - 0.5) * 6]; } // 地：平铺
	}
};

export const SA: React.FC = () => {
	const f = useF();
	const lvl = LV.filter((t) => f >= t).length - 1;
	const spin = f * 0.004;
	// 相机：随层数后拉
	const back = eo(win(f, 0, 360)) * 1;
	const camR = lerp(5, 22, back) + spring(f - 330, 0.05, 0.15, 3);
	const camH = lerp(3, 15, back);
	const fade3 = 1 - sm(win(f, 375, 395)) + sm(win(f, 650, 680)) * 0.3;
	const cam = f >= 500 && f < 660 ? {pos: [0, 0, 14] as V3, look: [0, 0, 0] as V3} : orbit(camR, 0.6 + f * 0.008, camH, [0, 0, 0]);
	const [sx, sy] = shake(f, LV.slice(1), 10);
	const nodes: {k: number; j: number; p: V3}[] = [];
	for (let k = 0; k <= Math.min(lvl, 6); k++) for (let j = 0; j < 2 ** k; j++) nodes.push({k, j, p: nodeP(k, j, spin)});

	// —— 八卦相错方阵 ——
	const mT = f - 380;
	const M = {x: 520, y: 230, c: 80};
	const scan = Math.floor(clamp((f - 430) / 70) * 63.99);
	const cur = XT[scan] ?? XT[0];
	// —— 八卦详解 ——
	const tI = clamp(Math.floor((f - 500) / 20), 0, 7);
	const tT = (f - 500) % 20;
	// —— 二进制 ——
	const bv = f < 660 ? 0 : f < 724 ? f - 660 : 63;
	const bG = BY_V[bv];
	const bits = bG.lines.map((x) => x);

	return (
		<AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
			<div style={{position: 'absolute', inset: 0, opacity: f < 380 ? 1 : f < 500 ? 1 - sm(win(f, 375, 395)) : 1}}>
				<Stage3D cam={cam} dial={false}>
					<Nebula color={GOLD} color2={YIN} n={700} />
					{f < 395 || f >= 650 ? (
						<group>
							<Ball pos={[0, 0, 0]} color={GOLD} r={0.5 + 0.4 * pulse(f, 0, 30) + (f < 30 ? Math.sin(f * 0.6) * 0.06 : 0)} glow={1.6} opacity={fade3} />
							{nodes.filter((n) => n.k > 0).map(({k, j, p}) => {
								const lt = f - LV[k];
								const pp = nodeP(k - 1, j >> 1, spin);
								const g = eo(lt / 12);
								const pos: V3 = [lerp(pp[0], p[0], g), lerp(pp[1], p[1], g), lerp(pp[2], p[2], g)];
								const c = bitYang(j) ? YANG : YIN;
								return (
									<group key={k * 100 + j}>
										<Beam a={pp} b={p} p={g} color={c} r={0.025 + 0.02 * (6 - k) / 6} opacity={0.75 * fade3} />
										<Ball pos={pos} color={c} r={0.24 - k * 0.025 + 0.15 * pulse(f, LV[k], 12)} glow={k < 4 ? 1.2 : 0.7} opacity={fade3} />
									</group>
								);
							})}
							{/* 每次分裂：一圈冲击波 */}
							{LV.slice(1).map((t, k) => f >= t && f < t + 24 ? <Glow key={k} pos={[0, 0, 0]} color={k % 2 ? YIN : YANG} size={R(k + 1) * 3 * eo((f - t) / 24)} opacity={0.5 * (1 - (f - t) / 24)} /> : null)}
							<Points n={500} color={GOLD} size={0.12} fn={(i) => { const a = rand(i) * 6.28 + spin; const r = ((f * 0.05 + rand(i + 3) * 10) % 10); return [Math.cos(a) * r, (rand(i + 5) - 0.5) * 0.4, Math.sin(a) * r]; }} />
						</group>
					) : null}
					{f >= 500 && f < 660 ? (
						<group>
							<Hex3D lines={TRI_LINES[tI].map((x) => x)} pos={[-3.78, -0.2, 0]} rot={[0.15, (1 - eo(tT / 10)) * 3 + Math.sin(f * 0.05) * 0.35, 0]} color={EL_C[TRI_EL[tI]]} scale={0.62 + 0.2 * pulse(tT, 0, 8)} emissive={0.6} />
							<Points n={260} color={EL_C[TRI_EL[tI]]} size={0.22} fn={(i) => { const p = triFx(tI, f)(i); return [p[0] * 0.42 - 3.78, p[1] * 0.42 - 0.2, p[2] * 0.42]; }} />
						</group>
					) : null}
				</Stage3D>
			</div>
			{/* 3D 节点标签 */}
			{f < 380 ? nodes.filter((n) => n.k >= 1 && n.k <= 3 || (n.k === 6 && f > 345)).map(({k, j, p}) => {
				const lt = f - LV[k];
				const txt = k === 1 ? (j ? '阴 ⚋' : '阳 ⚊') : k === 2 ? SIXIANG[j] : k === 3 ? TRI[j] : XT[j].name;
				const fadeOld = k < lvl - 1 ? 0.35 : 1;
				return <L3 key={k * 100 + j} cam={cam} p={[p[0], p[1] + 0.5, p[2]]} text={txt} color={k === 6 ? (bitYang(j) ? YANG : '#9cc8ff') : bitYang(j) ? YANG : '#9cc8ff'} size={k === 6 ? 14 : k === 3 ? 26 : 30} op={clamp(lt / 6) * fadeOld * (k === 6 ? clamp((f - 345) / 10) : 1)} />;
			}) : null}
			{/* 层级读数 */}
			{f < 380 ? (
				<div style={{position: 'absolute', left: 60, top: 300}}>
					{LVN.map((n, k) => {
						const on = k <= lvl;
						return (
							<div key={n} style={{display: 'flex', alignItems: 'baseline', gap: 14, opacity: on ? (k === lvl ? 1 : 0.5) : 0.15, transform: `translateX(${k === lvl ? 14 * eo((f - LV[k]) / 8) : 0}px)`}}>
								<span style={{fontFamily: MONO, fontSize: 18, color: GOLD, width: 50}}>2^{k}</span>
								<span style={{fontFamily: MONO, fontSize: 30, color: '#fff', width: 60, textShadow: k === lvl ? `0 0 14px ${GOLD}` : 'none'}}>{2 ** k}</span>
								<span style={{fontFamily: KAI, fontSize: 28, color: '#f6efe2'}}>{n}</span>
							</div>
						);
					})}
				</div>
			) : null}
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{LV.slice(1).map((t, k) => { const q = project(cam, [0, 0, 0]); return <Burst key={k} x={q.x} y={q.y} t={f - t} color={k % 2 ? YIN : YANG} r={200 + k * 60} n={30} seed={k * 9} />; })}
			</svg>

			{/* —— 八卦相错方阵 —— */}
			{f >= 380 && f < 500 ? (
				<div style={{position: 'absolute', inset: 0, opacity: clamp(mT / 8) * (1 - sm(win(f, 490, 500)))}}>
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						{TRI.map((t, c) => <g key={'u' + c} opacity={clamp((mT - c * 2) / 6)}><HexG x={M.x + c * M.c + M.c / 2} y={M.y - 52} w={36} lines={TRI_LINES[c]} color={GOLD} /><text x={M.x + c * M.c + M.c / 2} y={M.y - 14} fill={GOLD} fontFamily={KAI} fontSize={18} textAnchor="middle">{t}{TRI_XIANG[c]}</text></g>)}
						{TRI.map((t, r) => <g key={'l' + r} opacity={clamp((mT - r * 2) / 6)}><HexG x={M.x - 70} y={M.y + r * M.c + M.c / 2 - 6} w={36} lines={TRI_LINES[r]} color={YIN} /><text x={M.x - 22} y={M.y + r * M.c + M.c / 2 + 26} fill={YIN} fontFamily={KAI} fontSize={16} textAnchor="middle">{t}</text></g>)}
						<text x={M.x + 4 * M.c} y={M.y - 84} fill={GOLD} fontFamily={KAI} fontSize={20} textAnchor="middle" letterSpacing={6}>上 卦 →</text>
						<text x={M.x - 120} y={M.y + 4 * M.c} fill={YIN} fontFamily={KAI} fontSize={20} textAnchor="middle" transform={`rotate(-90 ${M.x - 120} ${M.y + 4 * M.c})`} letterSpacing={6}>下 卦 →</text>
						{Array.from({length: 64}).map((_, i) => {
							const r = Math.floor(i / 8), c = i % 8;
							const g = XT[r * 8 + c];
							const lt = mT - (r + c) * 2.4;
							if (lt < 0) return null;
							const on = r * 8 + c === scan && f >= 430;
							const cx = M.x + c * M.c + M.c / 2, cy = M.y + r * M.c + M.c / 2;
							return (
								<g key={i}>
									{on ? <rect x={cx - M.c / 2 + 2} y={cy - M.c / 2 + 2} width={M.c - 4} height={M.c - 4} fill="none" stroke="#fff" strokeWidth={3} /> : null}
									<HexG x={cx} y={cy - 8} w={34 * (1 + 0.6 * pulse(lt, 0, 8))} lines={g.lines.map((x, k) => k < 3 ? x : x)} color={on ? '#fff' : r === c ? GOLD : '#d9cfbd'} hl={g.lines.map((_, k) => (on ? 0 : k < 3 ? 0 : 0))} op={clamp(lt / 4)} />
									<text x={cx} y={cy + 30} fill={on ? '#fff' : 'rgba(230,220,200,0.7)'} fontFamily={KAI} fontSize={15} textAnchor="middle" opacity={clamp(lt / 4)}>{g.name}</text>
								</g>
							);
						})}
						{/* 行列十字光 */}
						{f >= 430 ? <><rect x={M.x} y={M.y + Math.floor(scan / 8) * M.c} width={8 * M.c} height={M.c} fill={YIN} opacity={0.1} /><rect x={M.x + (scan % 8) * M.c} y={M.y} width={M.c} height={8 * M.c} fill={GOLD} opacity={0.1} /></> : null}
					</svg>
					{f >= 430 ? (
						<div style={{position: 'absolute', left: 1260, top: 300, width: 520}}>
							<svg width={200} height={200} style={{display: 'block'}}>
								<HexG x={100} y={100} w={140} lines={cur.lines} color="#fff" hl={[1, 1, 1, 0, 0, 0]} hlc={YIN} glow={12} />
							</svg>
							<div style={{fontFamily: KAI, fontSize: 26, color: GOLD, marginTop: 10}}>上 {TRI[cur.up]}（{TRI_XIANG[cur.up]}）</div>
							<div style={{fontFamily: KAI, fontSize: 26, color: '#9cc8ff'}}>下 {TRI[cur.lo]}（{TRI_XIANG[cur.lo]}）</div>
							<div style={{fontFamily: XING, fontSize: 64, color: '#fff', textShadow: `0 0 18px ${GOLD}`}}>{full(cur)}</div>
							<div style={{fontFamily: MONO, fontSize: 18, color: 'rgba(230,220,200,0.7)'}}>先天 #{scan + 1} · 文王 #{cur.kw}</div>
						</div>
					) : null}
					<Count x={1500} y={880} v={Math.min(64, Math.max(0, Math.floor(mT / 1.1)))} label="8 × 8" color={GOLD} size={56} />
				</div>
			) : null}

			{/* —— 八卦象性表 —— */}
			{f >= 500 && f < 660 ? (
				<div style={{position: 'absolute', inset: 0, opacity: clamp((f - 500) / 6) * (1 - sm(win(f, 650, 660)))}}>
					<svg width={1920} height={1080} style={{position: 'absolute'}}>
						{TRI.map((t, i) => {
							// 先天八卦圆：乾南（上）坤北（下），离东（左）坎西（右）
							const ang = [-90, -135, 180, 135, -45, 0, 45, 90][i] * Math.PI / 180;
							const cx = 560 + Math.cos(ang) * 250, cy = 560 + Math.sin(ang) * 250;
							const on = i === tI;
							return <g key={t}><HexG x={cx} y={cy} w={on ? 64 : 46} lines={TRI_LINES[i]} color={on ? EL_C[TRI_EL[i]] : 'rgba(230,220,200,0.45)'} rot={(ang * 180) / Math.PI + 90} glow={on ? 10 : 0} lh={on ? 9 : 7} /><text x={560 + Math.cos(ang) * 330} y={560 + Math.sin(ang) * 330 + 10} fill={on ? '#fff' : 'rgba(230,220,200,0.5)'} fontFamily={XING} fontSize={on ? 36 : 26} textAnchor="middle">{t}</text></g>;
						})}
						<circle cx={560} cy={560} r={200} fill="none" stroke={GOLD} strokeOpacity={0.25} strokeDasharray="4 8" />
					</svg>
					<div style={{position: 'absolute', left: 1080, top: 210, width: 760}}>
						<div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
							<span style={{fontFamily: XING, fontSize: 120 * (1 + 0.2 * pulse(tT, 0, 6)), color: '#fff', textShadow: `0 0 30px ${EL_C[TRI_EL[tI]]}`}}>{TRI[tI]}</span>
							<span style={{fontFamily: KAI, fontSize: 60, color: EL_C[TRI_EL[tI]]}}>{TRI_XIANG[tI]}</span>
							<span style={{fontFamily: MONO, fontSize: 30, color: GOLD}}>{TRI_LINES[tI].slice().reverse().join('')}₂ · 先天{tI + 1}</span>
						</div>
						{([['性', TRI_XING[tI]], ['家', TRI_JIA[tI]], ['身', TRI_BODY[tI]], ['兽', TRI_ANIMAL[tI]], ['先天', TRI_XT_DIR[tI]], ['后天', TRI_HT_DIR[tI]], ['五行', TRI_EL[tI]]] as [string, string][]).map(([k, v], q) => (
							<div key={k} style={{display: 'inline-block', width: 240, marginTop: 14, opacity: clamp((tT - q) / 3), transform: `translateY(${(1 - eo((tT - q) / 5)) * 16}px)`}}>
								<span style={{fontFamily: KAI, fontSize: 22, color: 'rgba(230,220,200,0.6)', marginRight: 12}}>{k}</span>
								<span style={{fontFamily: KAI, fontSize: 38, color: '#fff'}}>{v}</span>
							</div>
						))}
					</div>
				</div>
			) : null}

			{/* —— 二进制 —— */}
			{f >= 660 ? (
				<div style={{position: 'absolute', inset: 0, opacity: clamp((f - 660) / 6)}}>
					{f < 800 ? (
						<>
							<svg width={1920} height={1080} style={{position: 'absolute'}}>
								<HexG x={520} y={560} w={300} lines={bits} color="#fff" yin={YIN} glow={16} />
								{bits.map((b, k) => <text key={k} x={720} y={560 + ((5 / 2) - k) * 63 + 14} fill={b ? GOLD : YIN} fontFamily={MONO} fontSize={52} fontWeight={700}>{b}</text>)}
								<text x={810} y={575} fill="#fff" fontFamily={MONO} fontSize={60}>= {bv}</text>
								<text x={520} y={810} fill={GOLD} fontFamily={XING} fontSize={64} textAnchor="middle">{bG.name}</text>
							</svg>
							{/* 64 格二进制表 */}
							<div style={{position: 'absolute', left: 1080, top: 210, width: 780, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', rowGap: 6}}>
								{Array.from({length: 64}).map((_, v) => {
									const g = BY_V[v];
									const on = v <= bv;
									return (
										<div key={v} style={{textAlign: 'center', opacity: on ? (v === bv ? 1 : 0.75) : 0.12, transform: v === bv ? 'scale(1.3)' : undefined}}>
											<div style={{fontFamily: MONO, fontSize: 13, color: v === bv ? '#fff' : GOLD}}>{g.lines.join('')}</div>
											<div style={{fontFamily: KAI, fontSize: 17, color: '#f6efe2'}}>{v} {g.name}</div>
										</div>
									);
								})}
							</div>
							<Stamp x={1460} y={900} t={f - 730} text="1703 · 莱布尼茨 · 二进制" color={GOLD} size={30} life={70} />
						</>
					) : null}
					{f >= 800 ? (() => {
						const t = f - 800;
						return (
							<>
								<svg width={1920} height={1080} style={{position: 'absolute'}}>
									{Array.from({length: 384}).map((_, i) => {
										const g = KW[Math.floor(i / 6)], k = i % 6;
										const gx = 360 + (Math.floor(i / 6) % 16) * 76, gy = 300 + Math.floor(i / 96) * 120 + (5 - k) * 12;
										const a = rand(i) * 6.28, d = 300 + rand(i + 1) * 500;
										const ex = 960 + Math.cos(a) * d, ey = 540 + Math.sin(a) * d * 0.6;
										const u = eo(t / 26);
										const back2 = sm(win(t, 60, 90));
										const x = lerp(lerp(gx, ex, u), gx, back2), y = lerp(lerp(gy, ey, u), gy, back2);
										const yang = g.lines[k];
										const lit = Math.floor((t * 8) % 384) === i;
										return yang ? <rect key={i} x={x - 26} y={y} width={52} height={7} fill={lit ? '#fff' : GOLD} opacity={0.9} /> : <g key={i}><rect x={x - 26} y={y} width={22} height={7} fill={YIN} /><rect x={x + 4} y={y} width={22} height={7} fill={YIN} /></g>;
									})}
								</svg>
								<Count x={960} y={860} v={Math.min(384, t * 12)} label="爻" color={GOLD} size={84} hit={pulse(t, 32, 12)} />
								<Stamp x={1640} y={930} t={t - 34} text="64 × 6 = 384" color={GOLD} size={40} life={66} />
							</>
						);
					})() : null}
				</div>
			) : null}

			<Chapter f={f} no="01 · GENESIS" title="生成" sub="太极 → 两仪 → 四象 → 八卦 → 六十四卦" color={GOLD} />
			<Verse f={f} items={VERSE} color={GOLD} tag="系辞 · 说卦" />
			<Cap f={f} items={CAP} color={GOLD} />
			{f < 380 ? <Log f={f} items={toLog(LOG_A)} color={GOLD} /> : null}
			<Scan f={f} hits={[...LV.slice(1), 380, 500, 660, 800, 832]} color={GOLD} />
		</AbsoluteFill>
	);
};
