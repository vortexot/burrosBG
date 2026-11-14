"""Desenho de som procedural + mixagem com a narração.

uso: python3 tools/sfx.py <narracao.wav 44.1k mono> <saida.wav>
Todos os eventos estão sincronizados com a linha do tempo do vídeo (render/timeline.js).
"""
import sys
import numpy as np

SR = 44100
TOTAL = 155.5
T_END = 154.15          # corte seco para o preto
N = int(TOTAL * SR)
rng = np.random.default_rng(7)


def t_axis(n):
    return np.arange(n) / SR


def env_ad(n, a, d):
    """envelope ataque/decay exponencial"""
    t = t_axis(n)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e


def lp_fft(x, fc, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def bp_fft(x, f0, q):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    bw = f0 / q
    H = np.exp(-0.5 * ((f - f0) / bw) ** 2)
    return np.fft.irfft(X * H, len(x))


def hp_fft(x, fc, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * H, len(x))


def reverb(x, secs=2.5, mix=0.35, damp=3000):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-t_axis(n) * 6.9 / secs)
    ir = lp_fft(ir, damp)
    ir /= np.sqrt(np.sum(ir ** 2) * (SR / 2) / damp)
    L = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:len(x)]
    return x * (1 - mix) + y * mix * 1.2


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i] * gain


def fade(n, fi, fo):
    e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    return e


def curve(points, n=N):
    """automação: lista de (tempo, valor) -> envelope linear"""
    ts = np.array([p[0] for p in points]); vs = np.array([p[1] for p in points])
    return np.interp(t_axis(n), ts, vs)


def _n(x):
    return x / max(np.abs(x).max(), 1e-12)


def db(x):
    return 10 ** (x / 20)


# --------------------------------------------------------------------------
bed = np.zeros(N)      # motor/estrada
mus = np.zeros(N)      # drones / pads
fx = np.zeros(N)       # efeitos pontuais
t = t_axis(N)

# ---- motor e estrada --------------------------------------------------------
brown = np.cumsum(rng.standard_normal(N)); brown -= lp_fft(brown, 2)
road = lp_fft(brown, 160); road /= np.abs(road).max()
rumble = hp_fft(lp_fft(rng.standard_normal(N), 900), 120); rumble /= np.abs(rumble).max()
rpm = curve([(0, 1), (125.6, 1), (126.6, 1.55), (131, 1.25), (138, 1.0), (155.5, 1.0)])
phase = np.cumsum(2 * np.pi * 46 * rpm / SR)
engine = 0.5 * np.sin(phase) + 0.25 * np.sin(2 * phase + 0.3) + 0.12 * np.sin(3 * phase)
engine *= 1 + 0.08 * np.sin(2 * np.pi * 0.7 * t)
bed = 0.55 * road + 0.10 * rumble + 0.22 * engine
bed_lvl = curve([(0, -30), (124.0, -30), (124.6, -26), (125.7, -24), (126.6, -18), (127.2, -22), (131, -29), (149, -31), (154.1, -33)])
bed *= db(bed_lvl) * 3.2
bed *= curve([(0, 0), (1.0, 1), (155, 1)])

# ---- drone de tensão --------------------------------------------------------
def drone(freqs, det=0.4):
    s = np.zeros(N)
    for k, f in enumerate(freqs):
        s += np.sin(2 * np.pi * f * t + 2 * np.pi * det * np.sin(2 * np.pi * 0.07 * (k + 1) * t)) / (k + 1) ** 0.3
    return s / len(freqs)
dark = drone([55, 58.3, 82.4, 110.2, 116.5])
dark *= 1 + 0.3 * np.sin(2 * np.pi * 0.23 * t)
dark_lvl = curve([(0, -60), (8, -40), (17.3, -38), (20.8, -27), (21.3, -34), (26.3, -32), (35.8, -27), (46, -25), (49.9, -33),
                  (62.5, -30), (66.4, -33), (84.9, -27), (101.4, -28), (106, -27), (112.7, -29), (121.9, -25), (124.1, -60),
                  (149.2, -60), (152, -36), (154.1, -26)])
mus += dark * db(dark_lvl) * 2.2
# shimmer agudo (pressão)
hiss = bp_fft(rng.standard_normal(N), 5200, 3); hiss /= np.abs(hiss).max()
hiss_lvl = curve([(0, -80), (17.3, -80), (20.5, -46), (21.3, -70), (40.4, -46), (46.2, -70), (112.7, -48), (121.9, -40), (124.1, -80),
                  (149.2, -80), (154.1, -40)])
mus += hiss * db(hiss_lvl) * 3
# zumbido (tinnitus) nos olhos e no final
tin = np.sin(2 * np.pi * 3150 * t)
tin_lvl = curve([(0, -90), (40.4, -90), (41.5, -44), (46.1, -42), (46.22, -90), (150.5, -90), (154.1, -34)])
mus += tin * db(tin_lvl)
# pad do amanhecer (mais aberto)
pad = drone([220, 277.2, 329.6, 440, 554.4], det=0.15)
pad = lp_fft(pad, 2200)
pad_lvl = curve([(0, -90), (127.2, -90), (129.4, -34), (137.9, -36), (141.6, -44), (145.7, -90)])
mus += pad * db(pad_lvl) * 2

# ---- batimentos cardíacos ---------------------------------------------------
def thump(gain=1.0):
    n = int(0.25 * SR); tt = t_axis(n)
    f = 52 + 30 * np.exp(-tt * 30)
    return _n(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.004, 0.07)) * gain
for a, b, bpm, g in [(84.9, 101.3, 72, 0.15), (112.7, 121.9, 112, 0.12), (149.2, 154.1, 92, 0.1)]:
    x = a
    while x < b:
        place(fx, thump(g), x); place(fx, thump(g * 0.6), x + 0.22)
        x += 60 / bpm

# ---- celular vibrando --------------------------------------------------------
def buzz(dur, gain):
    n = int(dur * SR); tt = t_axis(n)
    s = np.sign(np.sin(2 * np.pi * 172 * tt)) * 0.6 + np.sin(2 * np.pi * 344 * tt) * 0.3
    s = lp_fft(s, 1400) * (0.75 + 0.25 * np.sin(2 * np.pi * 31 * tt))
    return _n(s * fade(n, 0.015, 0.03)) * gain
for a, d, g in [(50.0, 0.55, 0.16), (50.85, 0.5, 0.16), (54.3, 0.3, 0.09), (59.12, 0.3, 0.09)]:
    place(fx, buzz(d, g), a)
def blip(f, g):
    n = int(0.35 * SR); tt = t_axis(n)
    return _n((np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 1.5 * tt)) * env_ad(n, 0.005, 0.09)) * g
for a in (54.3, 59.12):
    place(fx, blip(880, 0.12), a); place(fx, blip(1320, 0.08), a + 0.08)

# ---- unhas tocando a tela dela ------------------------------------------------
def tick(g):
    n = int(0.03 * SR)
    return _n(hp_fft(rng.standard_normal(n), 2500) * env_ad(n, 0.0008, 0.006)) * g
x = 107.6
while x < 110.8:
    place(fx, tick(0.5), x); x += 0.11 + rng.random() * 0.12

# ---- papel ------------------------------------------------------------------
def rustle(dur, g):
    n = int(dur * SR)
    s = bp_fft(rng.standard_normal(n), 3000, 0.8)
    crack = (rng.random(n) < 0.0016) * rng.standard_normal(n) * 0.8
    am = np.abs(lp_fft(rng.standard_normal(n), 12)); am /= am.max()
    return _n((s * am + hp_fft(crack, 1500)) * fade(n, 0.05, 0.1)) * g
place(fx, rustle(1.4, 0.45), 68.8)
place(fx, rustle(1.8, 0.6), 70.5)
place(fx, rustle(1.6, 0.55), 89.35)

# ---- impactos / sustos ------------------------------------------------------
def impact(g, low=38, tail=1.6):
    n = int(tail * SR); tt = t_axis(n)
    f = low + 90 * np.exp(-tt * 12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.003, tail / 4)
    s += lp_fft(rng.standard_normal(n), 900) * env_ad(n, 0.002, 0.12) * 0.6
    return _n(s) * g
def riser(dur, g, f0=200, f1=1800):
    n = int(dur * SR); tt = t_axis(n)
    nz = rng.standard_normal(n)
    s = bp_fft(nz, (f0 + f1) / 2, 0.5)
    fr = np.linspace(f0, f1, n)
    s = 0.6 * s + 0.4 * np.sin(2 * np.pi * np.cumsum(fr) / SR)
    return _n(s * (tt / dur) ** 2.2) * g
def whoosh(dur, g):
    n = int(dur * SR); tt = t_axis(n)
    s = bp_fft(rng.standard_normal(n), 900, 0.7)
    return _n(s * np.sin(np.pi * tt / dur) ** 2) * g
for a, g in [(24.3, 0.25), (28.0, 0.18), (48.42, 0.3), (106.9, 0.22), (112.72, 0.3)]:
    place(fx, riser(0.9, 0.08), a - 0.9)
    place(fx, impact(g), a)
place(fx, riser(1.4, 0.35), 121.92 - 1.4)
place(fx, impact(0.7, 32, 2.2), 121.92)
for a, d, g in [(26.3, 1.7, 0.4), (105.9, 1.0, 0.35), (116.3, 1.0, 0.35), (128.2, 1.2, 0.3), (112.75, 0.75, 0.2)]:
    place(fx, whoosh(d, g), a)
place(fx, whoosh(0.55, 0.5), 124.08)          # queda
place(fx, impact(0.9, 45, 1.0), 124.62)       # bate no chão
# piscadas: abafado grave
def blinkfx(g):
    n = int(0.3 * SR); tt = t_axis(n)
    return _n(lp_fft(rng.standard_normal(n), 220) * np.sin(np.pi * tt / 0.3) ** 2) * g
for a in (20.95, 35.78, 46.22, 48.42, 101.38, 112.72):
    place(fx, blinkfx(0.35), a - 0.15)

# ---- respiração dela no seu ouvido ------------------------------------------
n = int(4.5 * SR); tt = t_axis(n)
breath = bp_fft(rng.standard_normal(n), 1300, 0.9) * (np.maximum(0, np.sin(2 * np.pi * 0.42 * tt)) ** 2)
place(fx, _n(breath * fade(n, 0.5, 0.4)), 117.3, 0.08)

# ---- rachaduras e desfazer -----------------------------------------------------
def ping(g):
    n = int(0.25 * SR); tt = t_axis(n)
    f = 2400 + rng.random() * 3500
    return _n((np.sin(2 * np.pi * f * tt) * env_ad(n, 0.0005, 0.05) + hp_fft(rng.standard_normal(n), 3000) * env_ad(n, 0.0005, 0.008))) * g
x = 131.6
while x < 133.7:
    place(fx, ping(0.1 + 0.1 * rng.random()), x); x += 0.04 + rng.random() * 0.13 * (1 - (x - 131.6) / 3)
n = int(4.0 * SR); tt = t_axis(n)
dust = hp_fft(rng.standard_normal(n), 2500) * (rng.random(n) < 0.04) * 3
dust = bp_fft(dust, 6000, 1.2) + bp_fft(rng.standard_normal(n), 5000, 1.5) * 0.4
place(fx, _n(dust * np.sin(np.pi * tt / 4.0) ** 1.5), 133.0, 0.3)
place(fx, impact(0.35, 70, 1.2), 133.0)

# ---- revelações finais -------------------------------------------------------
place(fx, impact(0.2, 40, 1.8), 144.12)   # "ainda são quatro e sete"
place(fx, impact(0.3, 30, 2.2), 147.56)    # "seis e doze"
place(fx, riser(4.9, 0.15, 120, 2400), 149.25)

# ---- reverberação ----
fx = reverb(fx, 2.2, 0.3)
mus = reverb(mus, 3.5, 0.4, 2000) * db(-6)
bed *= db(3)

# ---- narração + ducking -------------------------------------------------------
vo = np.fromfile(sys.argv[1], dtype=np.int16).astype(np.float64) / 32768
v = np.zeros(N); v[:min(N, len(vo))] = vo[:N]
envv = np.sqrt(np.maximum(lp_fft(v ** 2, 4), 0)); envv /= max(envv.max(), 1e-9)
duck = 1 - 0.6 * np.clip(envv * 6, 0, 1)
mix_m = v * 1.0 + (bed + mus) * duck + fx * (1 - 0.2 * np.clip(envv * 4, 0, 1))
# estéreo: leve espalhamento dos efeitos
L = mix_m + 0.08 * np.roll(mus, 400) ; R = mix_m + 0.08 * np.roll(mus, -400)
# respiração mais à direita (ela está à direita)
st = np.stack([L, R], 1)
# corte seco
cut = int(T_END * SR); st[cut:] = 0
st[:int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))[:, None]
st /= np.abs(st).max() / 0.89
out = (st * 32767).astype(np.int16)
import wave
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('ok', sys.argv[2], st.shape)
