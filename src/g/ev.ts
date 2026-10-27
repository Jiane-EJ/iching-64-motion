// 事件日志（画面 Log 与配乐事件共用；纯数据，供 dump_tl 读取）
export type Ev = [number, string, string]; // 帧, 文字, 音色
export const toLog = (e: Ev[]): [number, string][] => e.filter(([, s]) => s).map(([a, s]) => [a, s]);

export const LOG_A: Ev[] = [
	[0, '太极 · 1', 'gong'], [30, '分 → 阳 ⚊ / 阴 ⚋', 'drum'], [70, '分 → 四象 ×4', 'drum'], [115, '分 → 八卦 ×8', 'drum'],
	[230, '加一倍 → 16', 'drum'], [280, '加一倍 → 32', 'drum'], [330, '加一倍 → 64', 'gong'],
	[380, '', 'whoosh'], [430, '', 'chime'], [500, '', 'whoosh'],
	...[0, 1, 2, 3, 4, 5, 6, 7].map((i): Ev => [500 + i * 20, '', ['metal', 'water', 'fire', 'zap', 'whoosh', 'water', 'earth', 'earth'][i]]),
	[660, '', 'whoosh'], ...Array.from({length: 16}, (_, i): Ev => [660 + i * 4, '', 'click']), [724, '', 'chime'], [730, '', 'seal'],
	[800, '', 'crack'], [832, '', 'gong'], [834, '', 'seal'],
];

export const LOG_B: Ev[] = [
	[0, '64 卦飞入圆周', 'whoosh'], [70, '乾南 · 坤北', 'chime'], [150, '初爻 · 二分', 'drum'], [162, '二爻 · 四分', 'wood'], [174, '三爻 · 八分', 'wood'], [186, '四爻 · 十六分', 'wood'], [198, '五爻 · 三十二分', 'wood'], [210, '上爻 · 六十四分', 'drum'],
	[240, '扫描：复 → 乾', 'whoosh'], [285, '扫描：姤 → 坤', 'whoosh'], [330, '方图落定', 'gong'], [400, '外层 乾坤', 'click'], [417, '二层 兑艮', 'click'], [434, '三层 离坎', 'click'], [451, '中心 震巽', 'chime'],
	[475, '泰 ↔ 否 对角', 'metal'], [520, '对径连线 32 对', 'crack'], [560, '全卦取错', 'zap'], [620, '阳生于复', 'chime'], [640, '圆天方地', 'seal'],
];

export const LOG_C: Ev[] = [
	[0, '屯 · 六爻全翻', 'whoosh'], ...[0, 1, 2, 3, 4, 5].map((k): Ev => [k * 4 + 2, '', 'click']), [34, '屯 错 → 鼎', 'crack'],
	[50, '乾 → 坤', 'zap'], [62, '泰 → 否', 'zap'], [74, '随 → 蛊', 'zap'], [86, '既济 → 未济', 'zap'],
	[100, '屯 · 倒转 180°', 'whoosh'], [130, '屯 综 → 蒙', 'drum'], [150, '需 → 讼', 'wood'], [162, '师 → 比', 'wood'], [174, '损 → 益', 'wood'], [186, '晋 → 明夷', 'wood'],
	[200, '', 'gong'], ...Array.from({length: 32}, (_, i): Ev => [219 + i * 5, '', 'tick']),
	[380, '', 'metal'], [420, '', 'chime'], [460, '', 'whoosh'], [520, '', 'gong'], [540, '', 'seal'], [560, '', 'chime'],
];

export const LOG_D: Ev[] = [
	[0, '', 'whoosh'], [26, '', 'chime'], [34, '', 'whoosh'], [54, '', 'chime'], [82, '', 'metal'], [100, '', 'whoosh'], [125, '', 'whoosh'],
	[150, '', 'gong'], ...Array.from({length: 16}, (_, i): Ev => [170 + i * 2, '', 'click']), [192, '', 'drum'], [240, '', 'whoosh'], [262, '', 'drum'], [300, '', 'gong'],
	[360, '', 'zap'], [400, '', 'chime'], ...Array.from({length: 6}, (_, i): Ev => [420 + i * 12, '', 'wood']),
	...Array.from({length: 12}, (_, i): Ev => [520 + i * 10, '', i < 6 ? 'water' : 'fire']), [640, '', 'crack'], [690, '', 'tick'], [722, '', 'seal'],
];

const xs = (i: number) => (i < 30 ? 60 + i * 13 : 500 + (i - 30) * 13);
export const LOG_E: Ev[] = [
	[0, '', 'gong'], ...Array.from({length: 64}, (_, i): Ev => [xs(i), '', i % 2 ? 'wood' : 'click']),
	...[11, 23, 41, 43].map((i): Ev => [xs(i), '', 'drum']), [450, '', 'gong'], [942, '', 'whoosh'], [960, '', 'seal'], [980, '', 'chime'],
];

export const LOG_F: Ev[] = [
	[0, '', 'gong'], ...Array.from({length: 12}, (_, i): Ev => [20 + i * 22, '', i < 6 ? 'fire' : 'water']), [152, '', 'crack'], [284, '', 'gong'], [300, '', 'seal'],
	[400, '', 'gong'], ...Array.from({length: 7}, (_, i): Ev => [416 + i * 20, '', i >= 5 ? 'chime' : 'wood']), [570, '', 'whoosh'], ...Array.from({length: 8}, (_, i): Ev => [580 + i * 4, '', 'click']),
	[700, '', 'drum'], [760, '', 'metal'], [780, '', 'metal'], [820, '', 'whoosh'], [857, '', 'gong'], [870, '', 'seal'],
];
