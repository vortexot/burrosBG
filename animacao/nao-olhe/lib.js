// ---------- utilidades gerais ----------
const W = 1080, H = 1920, FPS = 30;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const lin = t => clamp(t);

function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function shake(t, amp, freq = 9, seed = 0) { return [noise1(t * freq + seed) * amp, noise1(t * freq + seed + 57.3) * amp]; }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

// keyframes: [[t, v], ...]  v = número ou array
function kf(t, keys, e = easeIO) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const u = e((t - t0) / Math.max(1e-6, t1 - t0));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], u)) : lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- cores ----------
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function rgbs(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
function mixc(a, b, t) { const A = typeof a === 'string' ? hex2rgb(a) : a, B = typeof b === 'string' ? hex2rgb(b) : b; return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; }
function mulc(a, k) { const A = typeof a === 'string' ? hex2rgb(a) : a; return [A[0] * k, A[1] * k, A[2] * k]; }
function col(c, a = 1) { return rgbs(typeof c === 'string' ? hex2rgb(c) : c, a); }

// Iluminação: L = {tint, tintA, bright, rim, rimA, rimDir(rad), shA, shDir(rad), glow:{x,y,r,c,a}}
const LIGHT = {
  night: { tint: '#1d2c52', tintA: 0.42, bright: 0.66, rim: '#7ad8ff', rimA: 0.55, rimDir: -0.6, shA: 0.55, shDir: 0.9 },
  nightDim: { tint: '#152140', tintA: 0.55, bright: 0.48, rim: '#6cc6f0', rimA: 0.35, rimDir: -0.6, shA: 0.6, shDir: 0.9 },
  phone: { tint: '#1d2c52', tintA: 0.38, bright: 0.74, rim: '#cfe6ff', rimA: 0.7, rimDir: 1.57, shA: 0.55, shDir: -1.57 },
  dawn: { tint: '#ff9a5a', tintA: 0.18, bright: 1.0, rim: '#ffd590', rimA: 0.75, rimDir: -2.4, shA: 0.42, shDir: 0.6 },
  dawnSoft: { tint: '#f0a070', tintA: 0.2, bright: 0.92, rim: '#ffe1a8', rimA: 0.55, rimDir: -2.2, shA: 0.4, shDir: 0.6 },
};
function mixLight(A, B, t) {
  const o = {};
  for (const k of Object.keys(A)) {
    if (typeof A[k] === 'number') o[k] = lerp(A[k], B[k], t);
    else if (typeof A[k] === 'string') o[k] = '#' + mixc(A[k], B[k], t).map(v => (v | 0).toString(16).padStart(2, '0')).join('');
    else o[k] = t < .5 ? A[k] : B[k];
  }
  return o;
}
function lc(base, L, extra = 1) { return col(mulc(mixc(base, L.tint, L.tintA), L.bright * extra)); }
function lca(base, L, a, extra = 1) { return col(mulc(mixc(base, L.tint, L.tintA), L.bright * extra), a); }

// sombreamento de uma forma já definida pelo pathFn (em coords locais, bbox aprox r)
function shadeShape(ctx, pathFn, L, r, opts = {}) {
  ctx.save();
  pathFn(ctx); ctx.clip();
  const sd = L.shDir, d = r * 1.2;
  let g = ctx.createLinearGradient(-Math.cos(sd) * d, -Math.sin(sd) * d, Math.cos(sd) * d, Math.sin(sd) * d);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(5,6,14,${L.shA * (opts.sh ?? 1)})`);
  ctx.fillStyle = g; ctx.fillRect(-r * 6, -r * 6, r * 12, r * 12);
  if (L.glow) {
    const G = L.glow; const gg = ctx.createRadialGradient(G.x, G.y, 0, G.x, G.y, G.r);
    gg.addColorStop(0, col(G.c, G.a)); gg.addColorStop(1, col(G.c, 0));
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.fillRect(-r * 6, -r * 6, r * 12, r * 12);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  if (L.rimA > 0.01 && opts.rim !== false) {
    ctx.save(); pathFn(ctx); ctx.clip();
    const rd = L.rimDir, rx = Math.cos(rd) * r, ry = Math.sin(rd) * r;
    const g2 = ctx.createLinearGradient(-rx * 0.2, -ry * 0.2, rx, ry);
    g2.addColorStop(0, col(L.rim, 0)); g2.addColorStop(0.6, col(L.rim, 0)); g2.addColorStop(1, col(L.rim, L.rimA * (opts.rimK ?? 1)));
    ctx.strokeStyle = g2; ctx.lineWidth = (opts.rimW ?? 10); pathFn(ctx); ctx.stroke();
    ctx.restore();
  }
}

// ---------- pós-produção ----------
let GRAIN = [], VIGN = null;
function initPost() {
  for (let k = 0; k < 6; k++) {
    const c = document.createElement('canvas'); c.width = 540; c.height = 960;
    const x = c.getContext('2d'); const id = x.createImageData(540, 960); const r = rng(1000 + k * 77);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); GRAIN.push(c);
  }
  VIGN = document.createElement('canvas'); VIGN.width = W; VIGN.height = H;
  const v = VIGN.getContext('2d'); const g = v.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.68);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
  v.fillStyle = g; v.fillRect(0, 0, W, H);
}
function post(ctx, frame, opts = {}) {
  ctx.save();
  ctx.globalAlpha = opts.vign ?? 1; ctx.drawImage(VIGN, 0, 0);
  ctx.globalAlpha = opts.grain ?? 0.075; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(GRAIN[frame % GRAIN.length], 0, 0, W, H);
  ctx.restore();
}

// câmera: centraliza ponto (x,y) com zoom z e rotação r; sx/sy = tremor em px de tela
function applyCam(ctx, c) {
  ctx.translate(W / 2 + (c.sx || 0), H / 2 + (c.sy || 0));
  ctx.rotate(c.r || 0); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function capsule(ctx, x1, y1, x2, y2, w) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); }
function radial(ctx, x, y, r, c, a, comp = 'lighter') {
  ctx.save(); ctx.globalCompositeOperation = comp;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col(c, a)); g.addColorStop(1, col(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// faixa de luz de poste de sódio atravessando a cena
function sodiumSweep(ctx, t, period, strength, ang = 0.35, phase = 0, color = '#ff9a3c') {
  const f = ((t + phase) / period) % 1; if (f < 0 || f > 0.55) return;
  const u = f / 0.55; const k = Math.sin(u * Math.PI);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cx = lerp(W * 1.6, -W * 0.6, u);
  const dx = Math.cos(ang) * 700, dy = Math.sin(ang) * 700;
  const g = ctx.createLinearGradient(cx - dx, H / 2 - dy, cx + dx, H / 2 + dy);
  g.addColorStop(0, col(color, 0)); g.addColorStop(0.45, col(color, strength * k * 0.6)); g.addColorStop(0.5, col(color, strength * k)); g.addColorStop(0.55, col(color, strength * k * 0.6)); g.addColorStop(1, col(color, 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function sodiumLevel(t, period, phase = 0) { const f = ((t + phase) / period) % 1; return f < 0.55 ? Math.sin(f / 0.55 * Math.PI) : 0; }
function fillScreen(ctx, c, a = 1, comp = 'source-over') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = comp; ctx.fillStyle = col(c, a); ctx.fillRect(0, 0, W, H); ctx.restore(); }
