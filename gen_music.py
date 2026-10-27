"""象数 v2 配乐：每章不同配器 + 按画面事件类型发声（木=竹击 金=钟 水=水滴 土=闷雷 火=爆燃 …）
读取 timeline.json（由 dump_tl.mts 导出），输出 public/music.wav
"""
import json, sys
import numpy as np
from scipy.signal import butter, lfilter
from scipy.io import wavfile

TL = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'timeline.json'))
SR = 44100
DUR = TL['total'] / TL['fps']
N = int(SR * DUR)
BEAT, S16 = 0.5, 0.125
L = np.zeros(N); R = np.zeros(N)
send = np.zeros((2, N))
rng = np.random.default_rng(23)
STARTS = [s / 30 for s in TL['starts']]
NAMES = TL['names']
EV = [(f / 30, k, v) for f, k, v in TL['ev']]

# 每章配器：drums 鼓密度(0-4), arp 古筝密度(0-3), tick 木鱼钟摆, bright 亮度
DEF = dict(drums=1, arp=2, tick=0, bright=0.5)
STYLE = {
    'intro': dict(drums=0, arp=1, tick=0, bright=0.4),
    'genesis': dict(drums=2, arp=3, tick=0, bright=0.7),
    'fangyuan': dict(drums=1, arp=2, tick=1, bright=0.6),
    'cuozong': dict(drums=3, arp=2, tick=0, bright=0.6),
    'hubian': dict(drums=2, arp=3, tick=2, bright=0.8),
    'xugua': dict(drums=3, arp=3, tick=1, bright=0.8),
    'xiaoxi': dict(drums=1, arp=2, tick=1, bright=0.5),
    'bagong': dict(drums=4, arp=3, tick=0, bright=0.8),
    'outro': dict(drums=0, arp=1, tick=0, bright=0.4),
}


def sec_id(t):
    i = max(j for j, s in enumerate(STARTS) if s <= t + 1e-9)
    return NAMES[i]


def style(t):
    return STYLE.get(sec_id(t), DEF)


def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)


PENTA = [0, 3, 5, 7, 10]


def scale(deg, base=62):
    o, d = divmod(int(deg), 5)
    return base + 12 * o + PENTA[d]


def lp(x, fc, o=2):
    b, a = butter(o, min(0.99, fc / (SR / 2))); return lfilter(b, a, x)


def hp(x, fc, o=2):
    b, a = butter(o, fc / (SR / 2), 'high'); return lfilter(b, a, x)


def bp(x, f1, f2):
    b, a = butter(2, [f1 / (SR / 2), min(0.99, f2 / (SR / 2))], 'band'); return lfilter(b, a, x)


def add(sig, start, pan=0.0, gain=1.0, wet=0.0):
    i0 = int(start * SR)
    if i0 >= N or i0 < 0: return
    sig = sig[: N - i0] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(sig)] += sig * gl; R[i0:i0 + len(sig)] += sig * gr
    if wet:
        send[0, i0:i0 + len(sig)] += sig * gl * wet; send[1, i0:i0 + len(sig)] += sig * gr * wet


def T(d): return np.arange(int(d * SR)) / SR


def zheng(m, dur=1.6, bright=0.5):
    p = SR / mtof(m); Ni = int(p); n = int(dur * SR)
    ex = np.zeros(n); ex[:Ni] = lp(rng.uniform(-1, 1, Ni), 1500 + 7000 * bright)
    a = np.zeros(Ni + 2); a[0] = 1; a[Ni] = -0.498; a[Ni + 1] = -0.498
    y = lfilter([1], a, ex) * np.exp(-T(dur) * 1.1)
    return y / (np.max(np.abs(y)) + 1e-9)


def taiko(size=1.0):
    t = T(1.2)
    body = np.sin(2 * np.pi * np.cumsum(52 + 30 / size + 70 * np.exp(-t * 22)) / SR) * np.exp(-t * (5 / size))
    return np.tanh((body + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 30) * 0.6) * 2)


def gong():
    t = T(6); y = np.zeros(len(t))
    for r, a in [(1, 1), (1.52, .7), (2.31, .5), (2.9, .35), (3.7, .25), (4.4, .2), (5.9, .12)]:
        y += a * np.sin(2 * np.pi * np.cumsum(92 * r * (1 + 0.04 * np.exp(-t * 1.5))) / SR + rng.random() * 6) * np.exp(-t * (0.55 + r * 0.22))
    y += hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 6) * 0.25
    return y * np.minimum(1, t / 0.008) / np.max(np.abs(y))


def bell(m, dur=2.2):
    t = T(dur); f = mtof(m)
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 1.6), (2.76, .5, 3), (5.4, .25, 5), (8.9, .12, 8)])
    return y * np.minimum(1, t / 0.002)


# ── 事件音色 ──
def sfx(kind, v):
    if kind == 'gong': return [(gong(), 0, .5, .5), (taiko(1.7), 0, .9, .3)]
    if kind == 'drum': return [(taiko(1.4), 0, .55 + .3 * v, .25)]
    if kind == 'whoosh':
        t = T(0.7); x = rng.standard_normal(len(t)); env = np.sin(np.pi * t / 0.7) ** 2
        lo, hi = lp(x, 900), hp(x, 2500); q = t / 0.7
        return [((lo * (1 - q) + hi * q) * env, -0.35, .16 * v, .4)]
    if kind == 'chime': return [(bell(scale(3 + v * 8, 62)), 0.3 * np.sin(v * 9), .16 + .08 * v, .6)]
    if kind == 'coin':
        t = T(0.5); y = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * dc) for fr, dc in [(3150, 14), (4720, 18), (6180, 24)])
        y2 = np.concatenate([np.zeros(int(0.06 * SR)), y * 0.6])[: len(y)]
        return [((y + y2) / 3, 0.4, .2 * v + .05, .3)]
    if kind == 'heart':
        t = T(0.5); th = np.sin(2 * np.pi * 58 * t) * np.exp(-t * 18)
        y = th + np.concatenate([np.zeros(int(0.17 * SR)), th * 0.7])[: len(th)]
        return [(np.tanh(y * 2), 0, .55 * v + .1, 0)]
    if kind == 'breath':
        t = T(1.6); env = np.sin(np.pi * t / 1.6) ** 2
        return [(bp(rng.standard_normal(len(t)), 300, 1800) * env, 0, .22 * v, .6)]
    if kind == 'seal':
        t = T(0.4); y = np.sin(2 * np.pi * 120 * t) * np.exp(-t * 26) + lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 40) * 0.5
        return [(y, 0, .4 * v + .1, .2)]
    if kind == 'crack':
        t = T(0.35); y = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 22) * (rng.random(len(t)) > 0.7)
        return [(y, 0.2, .45 * v, .2), (taiko(0.6) * 0.5, 0, .2 * v, 0)]
    if kind == 'brush':
        t = T(0.4); env = np.sin(np.pi * t / 0.4)
        return [(bp(rng.standard_normal(len(t)), 800, 4000) * env, -0.3, .1 * v + .03, .3)]
    if kind == 'tick':
        t = T(0.08); return [(np.sin(2 * np.pi * 1650 * t) * np.exp(-t * 90), 0.5, .1 * v + .02, 0)]
    if kind == 'click':
        t = T(0.03); return [(hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200), -0.4, .2 * v, 0)]
    if kind == 'wood':
        t = T(0.25); y = np.sin(2 * np.pi * np.cumsum(700 - 150 * t / 0.25) / SR) * np.exp(-t * 30) + 0.4 * np.sin(2 * np.pi * 1420 * t) * np.exp(-t * 50)
        return [(y, -0.5, .3 * v, .3)]
    if kind == 'fire':
        t = T(0.7); nz = rng.standard_normal(len(t)); q = t / 0.7; whoomp = (lp(nz, 300) * (1 - q) + lp(nz, 2800) * q) * np.sin(np.pi * q)
        crack = hp(rng.standard_normal(len(t)), 3000) * (rng.random(len(t)) > 0.97) * np.exp(-t * 3)
        return [(whoomp + crack, 0.3, .35 * v, .3)]
    if kind == 'earth':
        t = T(1.0); y = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t * 12)) / SR) * np.exp(-t * 4) + lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 6) * 0.5
        return [(np.tanh(y * 2), 0, .55 * v, .2)]
    if kind == 'metal':
        t = T(1.4); y = sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t * d) for fr, a, d in [(820, 1, 2.5), (1130, .7, 3), (1690, .5, 4), (2310, .35, 5), (3170, .2, 7)])
        return [(y * np.minimum(1, t / 0.001) / 2, 0.4, .32 * v, .5)]
    if kind == 'water':
        t = T(0.3); y = np.sin(2 * np.pi * np.cumsum(380 + 900 * (t / 0.3) ** 2) / SR) * np.exp(-t * 14)
        return [(y, -0.2, .3 * v, .5)]
    if kind == 'zap':
        t = T(1.2); y = np.sign(np.sin(2 * np.pi * 70 * t)) * hp(rng.standard_normal(len(t)), 1500) * (np.sin(2 * np.pi * 9 * t) > 0) * np.exp(-t * 2)
        return [(y, 0, .2 * v, .2)]
    return []


# ── 铺底 ──
colors = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 62, 65], [45, 52, 57, 64]]
t0 = 0.0
while t0 < DUR:
    st = style(t0 + 0.1)
    t = T(6); x = np.zeros(len(t))
    for m in colors[int(t0 // 4) % 4]:
        for det in (-0.08, 0.07):
            x += 2 * ((t * mtof(m + det) + rng.random()) % 1) - 1
    x = lp(x, 350 + 700 * st['bright'], 2) / 8
    add(x * np.minimum(1, t / 1.0) * np.clip((6 - t) / 2, 0, 1), t0, 0, 0.4, wet=0.6)
    t0 += 4
t = T(DUR)
add((np.sin(2 * np.pi * mtof(38) * t) + 0.5 * np.sin(2 * np.pi * mtof(45) * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 16)) * np.clip((DUR - t) / 3, 0, 1), 0, 0, 0.12)

# ── 古筝 ──
ARP = [0, 2, 4, 5, 7, 5, 4, 2, 0, 3, 5, 7, 9, 7, 5, 3]
step, tt = 0, 0.0
while tt < DUR - 2:
    st = style(tt)
    a = st['arp']
    play = (a == 1 and step % 4 == 0) or (a == 2 and step % 2 == 0) or (a == 3 and step % 4 != 3)
    if play and tt > 1.0:
        deg = ARP[step % 16] + (5 if a == 3 and (step // 16) % 2 else 0)
        add(zheng(scale(deg, 50 if st['bright'] < 0.5 else 62), 1.4 if a > 1 else 2.4, st['bright']), tt, -0.5 if step % 2 else 0.5, 0.11 + 0.03 * a, wet=0.4)
    step += 1; tt += S16

# ── 节奏 ──
for b in range(int(DUR / BEAT)):
    tb = b * BEAT; st = style(tb); d = st['drums']; bb = b % 4
    if d >= 1 and bb == 0: add(taiko(1.3), tb, 0, 0.42)
    if d >= 2 and bb == 2: add(taiko(1.1), tb, 0.1, 0.34)
    if d >= 3 and bb in (1, 3): add(taiko(0.8), tb + BEAT / 2, -0.2, 0.26)
    if d >= 4 and b % 8 == 7:
        for k in range(4): add(taiko(0.6), tb + k * S16, 0.3 * (-1) ** k, 0.2 + 0.04 * k)
    if st['tick'] >= 1:  # 钟摆木鱼：时间主题
        tk = T(0.1); wb = np.sin(2 * np.pi * (900 if bb % 2 else 760) * tk) * np.exp(-tk * 60)
        add(wb, tb, 0.6 if bb % 2 else -0.6, 0.09)
        if st['tick'] >= 2: add(wb * 0.6, tb + BEAT / 2, 0, 0.05)
    if sec_id(tb) == 'jibing' and b % 2 == 0:  # 医：心跳底
        add(sfx('heart', 0.4)[0][0], tb, 0, 0.18)

# ── 场景切换刮奏 ──
for s in STARTS[1:]:
    for j in range(12):
        add(zheng(scale(j, 50), 1.2, 0.8), s - 0.36 + j * 0.03, -0.8 + j * 0.14, 0.07, wet=0.5)

# ── 事件 ──
for te, kind, v in EV:
    for sig, pan, g, wet in sfx(kind, v):
        add(sig, te, pan, g, wet)

# ── 笛：高能段旋律 ──
def dizi(m, dur):
    t = T(dur); f = mtof(m) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    return (y + bp(rng.standard_normal(len(t)), mtof(m) * 1.5, mtof(m) * 4) * 0.25) * np.minimum(1, t / 0.06) * np.clip((dur - t) / 0.12, 0, 1)

MOTIF = [[7, 6, 5, 4], [4, 3, 2, 3], [4, 5, 7, 8], [7, 5, 4, -1]]
bar, tb = 0, 0.0
while tb < DUR - 2:
    sid = sec_id(tb)
    if sid in ('genesis', 'xugua', 'bagong', 'xiaoxi', 'fangyuan'):
        g = 0.05 if sid in ('xiaoxi', 'fangyuan') else 0.07
        for q, dd in enumerate(MOTIF[bar % 4]):
            if dd < 0: continue
            hold = BEAT * (2 if q == 3 else 1) * (2 if sid in ('xiaoxi', 'fangyuan') else 1)
            if q * BEAT * (2 if sid in ('xiaoxi', 'fangyuan') else 1) < 2:
                add(dizi(scale(dd, 62), hold * 0.95), tb + q * BEAT * (2 if sid in ('xiaoxi', 'fangyuan') else 1), 0.15, g, wet=0.5)
    bar += 1; tb += 2.0

# ── 混响 + 母带 ──
def reverb(x):
    out = np.zeros_like(x)
    for d, g in ((1687, 0.86), (1601, 0.85), (2053, 0.84), (2251, 0.83)):
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g; out += lfilter([1], a, x)
    for d in (347, 113):
        b = np.zeros(d + 1); b[0] = -0.7; b[d] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -0.7; out = lfilter(b, a, out)
    return out * 0.14

L += reverb(send[0]); R += reverb(np.roll(send[1], 400))
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
fd = np.ones(N); fn = int(2.5 * SR); fd[-fn:] = np.linspace(1, 0, fn)
mix *= fd[:, None] * 0.9
wavfile.write(sys.argv[2] if len(sys.argv) > 2 else 'public/music.wav', SR, (mix * 32767).astype(np.int16))
print('ok', mix.shape)
