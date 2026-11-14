'use strict';
// ---------------------------------------------------------------------------
// Núcleo: utilitários, câmera, pós-processamento, textos e legendas.
// Tudo é determinístico: renderFrame(t) sempre desenha o mesmo quadro.
// ---------------------------------------------------------------------------
const W = 1080, H = 1920, FPS = 30;
const T_END = 154.15;      // corte seco para preto
const T_TOTAL = 155.5;     // duração total (com preto final)

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0; let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eout = t => 1 - Math.pow(1 - t, 3);
const ein = t => t * t * t;
const esin = t => -(Math.cos(Math.PI * t) - 1) / 2;
const P = (t, a, b, f = eio) => f(clamp((t - a) / (b - a)));
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function vn(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 101.3), hash(i + 1 + seed * 101.3), u) * 2 - 1;
}
function hx(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mixc(a, b, t) {
  const pa = hx(a), pb = hx(b);
  return `rgb(${Math.round(lerp(pa[0], pb[0], t))},${Math.round(lerp(pa[1], pb[1], t))},${Math.round(lerp(pa[2], pb[2], t))})`;
}
function rgba(h, a) { const p = hx(h); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
// câmera: o ponto (x,y) do mundo vai para o centro da tela, com zoom z
function camera(c, x, y, z, rot = 0) {
  c.translate(W / 2, H / 2); if (rot) c.rotate(rot); c.scale(z, z); c.translate(-x, -y);
}
function shake(t, amp, freq = 9, seed = 1) { return [vn(t * freq, seed) * amp, vn(t * freq, seed + 7) * amp]; }
// interpola uma lista de keyframes [{t, ...valores}] com easing suave
function keys(t, list) {
  if (t <= list[0].t) return Object.assign({}, list[0]);
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i], b = list[i + 1];
    if (t < b.t) {
      const k = (b.ease || eio)(clamp((t - a.t) / (b.t - a.t)));
      const o = {};
      for (const key in a) if (typeof a[key] === 'number') o[key] = lerp(a[key], b[key] ?? a[key], k);
      return o;
    }
  }
  return Object.assign({}, list[list.length - 1]);
}

// ----------------------------- pós-processamento ---------------------------
let GRAIN = [], VIG, VIG2, TMP, TMP2;
function initPost() {
  const r = rng(77);
  for (let k = 0; k < 6; k++) {
    const c = mk(540, 960), g = c.getContext('2d');
    const id = g.createImageData(540, 960);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 128 + (r() + r() - 1) * 150;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); GRAIN.push(c);
  }
  VIG = mk(W, H); {
    const g = VIG.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H * 0.47, H * 0.18, W / 2, H * 0.5, H * 0.72);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  VIG2 = mk(W, H); { // vinheta pesada para momentos de pânico
    const g = VIG2.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H * 0.5, H * 0.08, W / 2, H * 0.5, H * 0.6);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  TMP = mk(W, H); TMP2 = mk(W, H);
}

// borrão de movimento horizontal aproximado (para giros de cabeça)
function motionBlur(c, px, py = 0) {
  const n = 9;
  if (Math.abs(px) + Math.abs(py) < 2) return;
  const g = TMP.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'copy'; g.drawImage(cv, 0, 0);
  g.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= n; i++) {
    c.globalAlpha = 0.35 / Math.sqrt(i);
    c.drawImage(TMP, px * i / n, py * i / n);
  }
  c.restore();
}

// --------------------------- piscar (suas pálpebras) ------------------------
// closure 0 = olhos abertos, 1 = fechados
function eyelids(c, k) {
  if (k <= 0.001) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const h = (H / 2 + 140) * eout(k);
  const curve = 220 * (1 - k * 0.6);
  const lid = (top) => {
    c.beginPath();
    if (top) {
      c.moveTo(-10, -10); c.lineTo(W + 10, -10); c.lineTo(W + 10, h - curve);
      c.quadraticCurveTo(W / 2, h + curve, -10, h - curve);
    } else {
      c.moveTo(-10, H + 10); c.lineTo(W + 10, H + 10); c.lineTo(W + 10, H - h + curve);
      c.quadraticCurveTo(W / 2, H - h - curve, -10, H - h + curve);
    }
    c.closePath();
  };
  c.shadowColor = 'rgba(40,0,0,0.9)'; c.shadowBlur = 90;
  c.fillStyle = '#030101';
  lid(true); c.fill(); lid(false); c.fill();
  c.shadowBlur = 0;
  if (k > 0.92) { c.globalAlpha = (k - 0.92) / 0.08; c.fillRect(0, 0, W, H); }
  c.restore();
}
// piscadas do espectador/protagonista: [pico, duração]
const BLINKS = [[20.95, 0.42], [35.78, 0.36], [46.22, 0.30], [48.42, 0.30], [101.38, 0.34], [112.72, 0.28]];
function blinkAmount(t) {
  let k = 0;
  for (const [p, d] of BLINKS) {
    const x = Math.abs(t - p) / (d / 2);
    if (x < 1) k = Math.max(k, Math.cos(x * Math.PI / 2) ** 0.6);
  }
  // abertura inicial
  if (t < 1.4) k = Math.max(k, 1 - P(t, 0.15, 1.4, eout));
  // abrir os olhos depois de se jogar no chão (127.2)
  return k;
}

// ------------------------------- textos -------------------------------------
function spacedText(c, s, x, y, spacing) {
  // desenha texto centralizado com espaçamento entre letras
  const chars = [...s];
  let total = 0; const ws = chars.map(ch => { const w = c.measureText(ch).width; total += w + spacing; return w; });
  total -= spacing;
  let cx = x - total / 2;
  const al = c.textAlign; c.textAlign = 'left';
  chars.forEach((ch, i) => { c.fillText(ch, cx, y); cx += ws[i] + spacing; });
  c.textAlign = al;
}
function strokeFill(c, s, x, y, stroke, lw, fill) {
  c.lineJoin = 'round'; c.miterLimit = 2;
  c.strokeStyle = stroke; c.lineWidth = lw; c.strokeText(s, x, y);
  c.fillStyle = fill; c.fillText(s, x, y);
}

// ------------------------------- legendas -----------------------------------
// CAPS vem de captions.js (gerado a partir da transcrição com timestamps)
const CAP_HIDE = [[53.3, 56.45], [58.95, 60.75], [72.7, 84.75], [91.6, 101.2], [120.45, 121.75], [121.9, 123.95], [151.3, 154.2]];
function drawCaptions(t) {
  if (typeof CAPS === 'undefined' || t >= T_END) return;
  for (const [a, b] of CAP_HIDE) if (t >= a && t < b) return;
  const cap = CAPS.find(k => t >= k.a && t < k.b);
  if (!cap) return;
  const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const appear = clamp((t - cap.a) / 0.12);
  const y = 1452;
  c.font = '700 66px Oswald'; c.textBaseline = 'alphabetic';
  const words = cap.words;
  const sp = c.measureText(' ').width;
  const widths = words.map(w => c.measureText(w.w).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  let x = W / 2 - total / 2;
  const sc = 0.92 + 0.08 * eout(appear);
  c.translate(W / 2, y); c.scale(sc, sc); c.translate(-W / 2, -y);
  c.globalAlpha = appear;
  words.forEach((w, i) => {
    const active = t >= w.s - 0.03;
    const now = t >= w.s - 0.03 && t < (words[i + 1] ? words[i + 1].s - 0.03 : cap.b);
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(0,0,0,0.92)'; c.lineWidth = 12; c.strokeText(w.w, x, y);
    c.fillStyle = now ? '#ff3b30' : (active ? '#ffffff' : 'rgba(255,255,255,0.55)');
    c.fillText(w.w, x, y);
    x += widths[i] + sp;
  });
  c.restore();
}
