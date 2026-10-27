import {LOG_A, LOG_B, LOG_C, LOG_D, LOG_E, LOG_F} from './src/g/ev.ts';
// 场景时长（与各场景 *_DUR 一致）；八宫从 F+400 起另作一段配器
const DUR = [90, 900, 720, 660, 780, 1020, 960, 150];
const NAMES = ['intro', 'genesis', 'fangyuan', 'cuozong', 'hubian', 'xugua', 'xiaoxi', 'outro'];
const st: number[] = []; DUR.reduce((a, d) => (st.push(a), a + d), 0);
const total = DUR.reduce((a, b) => a + b, 0);
const logs = [null, LOG_A, LOG_B, LOG_C, LOG_D, LOG_E, LOG_F, null];
const ev: [number, string, number][] = [];
logs.forEach((L, i) => L?.forEach(([f, , k]) => ev.push([st[i] + f, k, 0.8])));
st.forEach((s, i) => { if (i > 0 && i < 7) ev.push([s, 'gong', 1]); });
const starts = [...st.slice(0, 7), st[6] + 400, st[7]];
const names = [...NAMES.slice(0, 7), 'bagong', 'outro'];
console.log(JSON.stringify({fps: 30, total, starts, names, ev}));
