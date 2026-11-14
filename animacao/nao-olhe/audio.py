"""Trilha sonora: narração + efeitos sintetizados (numpy puro).
uso: python3 audio.py audio/narracao.mp3 saida.wav
"""
import sys, subprocess, wave
import numpy as np

SR = 44100
T_END = 146.0
CUT = 142.85          # corte para preto
N = int(T_END * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def load_narr(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    out = np.zeros(N, np.float32); out[:min(N, len(x))] = x[:N]
    return out


def fft_band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    return np.fft.irfft(X * m, len(x)).astype(np.float32)


def env(a, b, fade_in=0.5, fade_out=0.5):
    e = np.zeros(N, np.float32)
    i0, i1 = int(a * SR), int(b * SR)
    seg = np.ones(i1 - i0, np.float32)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: seg[:fi] *= np.linspace(0, 1, fi)
    if fo: seg[-fo:] *= np.linspace(1, 0, fo)
    e[i0:i1] = seg
    return e


def keys(pts):
    ts = [p[0] for p in pts]; vs = [p[1] for p in pts]
    return np.interp(t, ts, vs).astype(np.float32)


def place(dst, sig, at, gain=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n > 0: dst[i:i + n] += sig[:n] * gain


def tone(freq, dur, decay=None):
    tt = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * tt)
    if decay: s *= np.exp(-tt / decay)
    return s.astype(np.float32)


white = rng.standard_normal(N).astype(np.float32)
brown = np.cumsum(white); brown -= np.convolve(brown, np.ones(4410) / 4410, 'same'); brown /= np.abs(brown).max()

L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
def add(sig, pan=0.0, g=1.0):
    global L, R
    L += sig * g * np.sqrt(0.5 * (1 - pan)); R += sig * g * np.sqrt(0.5 * (1 + pan))

# ---------- motor / estrada ----------
eng_amt = keys([(0, 0.7), (100, 0.75), (105.3, 0.8), (108, 1.6), (114.5, 1.5), (117, 0.6), (121, 0.45), (142.85, 0.45)])
eng_f = keys([(0, 42), (105.3, 44), (109, 68), (114, 70), (118, 46), (121, 38), (146, 38)])
ph = np.cumsum(eng_f) / SR * 2 * np.pi
engine = (0.5 * np.sin(ph) + 0.25 * np.sin(2 * ph + 0.3) + 0.12 * np.sin(3 * ph)) * (1 + 0.15 * np.sin(2 * np.pi * 0.3 * t))
road = fft_band(white, 60, 420) * 0.6 + brown * 0.5
add((engine * 0.22 + road * 0.10) * eng_amt, 0, 1.0)
# emendas da pista (batidinhas)
seam = np.zeros(N, np.float32)
thump = tone(70, 0.12, 0.03) + fft_band(rng.standard_normal(int(0.12 * SR)).astype(np.float32), 100, 600)[:int(0.12 * SR)] * 0.3
for k in np.arange(0.3, 121, 0.73): place(seam, thump, k, 0.12)
add(seam, 0, 1)

# ---------- drone de tensão ----------
drone_amt = keys([(0, 0.15), (7.75, 0.25), (32.7, 0.35), (36.5, 0.6), (50, 0.5), (76, 0.75), (78.8, 1.0), (100, 1.0), (115, 0.8), (118, 0.0),
                  (131, 0.0), (134, 0.45), (142.85, 0.9)])
dr = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate([55, 55.45, 82.6, 110.9, 164.2])) / 5
dr *= (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * t))
add(dr.astype(np.float32) * drone_amt * 0.16, 0, 1)
# zumbido agudo dissonante (cena 5)
wh = (np.sin(2 * np.pi * 1480 * t) + np.sin(2 * np.pi * 1523 * t)) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 5.3 * t))
add(wh.astype(np.float32) * env(78.8, 100.1, 2.0, 0.3) * 0.012, 0.3, 1)

# ---------- batimentos (cena 5) ----------
hb = np.zeros(N, np.float32); beat = tone(52, 0.25, 0.06) + tone(90, 0.25, 0.03) * 0.5
tb = 78.9
while tb < 100:
    bpm = np.interp(tb, [78.9, 100], [72, 108])
    place(hb, beat, tb, 0.8); place(hb, beat, tb + 0.28, 0.55)
    tb += 60 / bpm
add(hb, 0, 0.5)

# ---------- stingers ----------
def boom(dur=2.5):
    tt = np.arange(int(dur * SR)) / SR
    f = 30 + 70 * np.exp(-tt * 3)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.9)
    nz = fft_band(rng.standard_normal(len(tt)).astype(np.float32), 80, 2500) * np.exp(-tt / 0.15)
    return (s + nz * 0.6).astype(np.float32)

def riser(dur):
    tt = np.arange(int(dur * SR)) / SR
    nz = fft_band(rng.standard_normal(len(tt)).astype(np.float32), 300, 6000)
    return (nz * (tt / dur) ** 3).astype(np.float32)

def screech(dur=1.6):
    tt = np.arange(int(dur * SR)) / SR; s = np.zeros_like(tt)
    for k, f0 in enumerate([620, 655, 930, 987, 1240]):
        f = f0 * (1 + 0.25 * tt / dur) + 8 * np.sin(2 * np.pi * 7 * tt + k)
        p = np.cumsum(f) / SR * 2 * np.pi
        s += np.sign(np.sin(p)) * 0.3 + np.sin(p)
    s *= np.minimum(1, tt / 0.05) * np.exp(-tt / 0.7)
    return (s / 6).astype(np.float32)

fx = np.zeros(N, np.float32)
place(fx, boom(), 36.5, 0.45)
place(fx, riser(0.85), 40.25, 0.25); place(fx, boom(), 41.1, 0.85)
place(fx, riser(2.8), 76.0, 0.35); place(fx, boom(3.0), 78.82, 1.0)
place(fx, screech(), 83.15, 0.35)
place(fx, boom(), 100.04, 0.55)
place(fx, boom(1.6), 109.78, 0.6)
add(fx, 0, 0.5)

# papel amassado
rust = np.zeros(N, np.float32)
for k in range(14):
    d = int(0.05 * SR); seg = fft_band(rng.standard_normal(d).astype(np.float32), 1500, 9000)[:d] * np.hanning(d)
    place(rust, seg, 7.75 + rng.random() * 0.7, 0.4)
add(rust, -0.2, 0.45)

# ---------- celular vibrando ----------
def buzz(strength=1.0):
    dur = 0.55; tt = np.arange(int(dur * SR)) / SR
    carrier = np.sign(np.sin(2 * np.pi * 172 * tt)) * 0.5 + np.sin(2 * np.pi * 172 * tt) * 0.5
    am = ((tt % 0.27) < 0.19).astype(float) * (tt < 0.5)
    rattle = fft_band(rng.standard_normal(len(tt)).astype(np.float32), 900, 3500) * 0.25
    return ((carrier + rattle) * am * strength).astype(np.float32)
bz = np.zeros(N, np.float32)
for at, s in [(51.25, 1), (52.6, .55), (58.9, .55), (72.3, .55), (88.55, 1), (90.9, .55), (136.7, 1), (141.54, 1)]:
    place(bz, buzz(s), at, 1)
add(bz, 0.15, 0.09)

# ---------- fuga: aceleração e pneu ----------
tire = fft_band(white, 1800, 3600) * (1 + 0.5 * np.sin(2 * np.pi * 9 * t))
add(tire * env(112.35, 114.0, 0.08, 0.6) * 0.16, -0.3, 1)
woosh = fft_band(white, 200, 1500)
add(woosh * env(107.4, 109.8, 0.3, 0.4) * 0.07, 0.4, 1)

# ---------- amanhecer ----------
pad = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate([220, 277.2, 329.6, 440, 554.4])) / 5
pad *= (1 + 0.2 * np.sin(2 * np.pi * 0.4 * t))
add(pad.astype(np.float32) * env(115.0, 126.0, 3.0, 4.0) * 0.06, 0, 1)
shim = sum(np.sin(2 * np.pi * f * t) for f in [1760, 2217, 2637, 3520]) / 4
add(shim.astype(np.float32) * env(118.9, 121.5, 0.05, 2.4) * 0.03, 0.2, 1)
sw = np.zeros(N, np.float32); place(sw, riser(1.4), 117.6, 0.25); add(sw, 0.2, 1)

# ---------- corte final ----------
cutmask = np.ones(N, np.float32); ci = int(CUT * SR); cutmask[ci:] = 0
L *= cutmask; R *= cutmask

# ducking pela narração
narr = load_narr(sys.argv[1] if len(sys.argv) > 1 else 'audio/narracao.mp3')
ne = np.abs(narr); k = int(0.25 * SR)
ne = np.convolve(ne, np.ones(k) / k, 'same'); ne /= ne.max()
duck = 1 - 0.45 * np.clip(ne * 3, 0, 1)
L *= duck; R *= duck

narr *= cutmask  # narração já terminou antes do corte
L += narr * 0.9; R += narr * 0.9

# notificação final (no corte), depois silêncio absoluto
ding = np.zeros(N, np.float32)
d1 = tone(1318.5, 0.6, 0.12) + 0.4 * tone(2637, 0.6, 0.06)
d2 = tone(1975.5, 0.9, 0.18) + 0.4 * tone(3951, 0.9, 0.08)
place(ding, d1, CUT + 0.02, 0.26); place(ding, d2, CUT + 0.14, 0.26)
L += ding; R += ding

mix = np.stack([L, R], 1)
mix /= max(1e-6, np.abs(mix).max()) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[2] if len(sys.argv) > 2 else 'mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', mix.shape)
