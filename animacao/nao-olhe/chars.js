// ---------- personagens (aparência fixa — usados em todas as cenas) ----------
const CH = {
  // PAI: ~40 anos, cabelo preto curto, barba por fazer, jaqueta verde-oliva sobre camiseta cinza
  dad: { skin: '#c48a62', hair: '#17110d', iris: '#3c2817', lip: '#93584a', sclera: '#e4ded3', rx: 100, ry: 124, jaw: 0.9, chin: 0.46,
    eyeX: 40, eyeY: -6, eyeW: 25, eyeH: 11, irisR: 9.5, browY: -33, browW: 29, browT: 10, noseL: 46, noseW: 15, mouthY: 64, mouthW: 30,
    cloth: '#3b452f', cloth2: '#585b60' },
  // MENINO: ~10 anos, cabelo castanho bagunçado, moletom amarelo-mostarda
  boy: { skin: '#e3ac84', hair: '#4b2c18', iris: '#5b391f', lip: '#b56b5c', sclera: '#f1ece3', rx: 100, ry: 112, jaw: 0.8, chin: 0.38,
    eyeX: 40, eyeY: 8, eyeW: 29, eyeH: 16, irisR: 12.5, browY: -22, browW: 25, browT: 7, noseL: 26, noseW: 10, mouthY: 60, mouthW: 21,
    cloth: '#d49b1f', cloth2: '#9e6c0d' },
  // MULHER: pálida, cabelo preto longo e liso, vestido antigo creme
  wom: { skin: '#dcd6cc', hair: '#0b090c', iris: '#3d3f46', lip: '#8e5a5e', sclera: '#ece8e1', rx: 86, ry: 126, jaw: 0.64, chin: 0.28,
    eyeX: 35, eyeY: -4, eyeW: 26, eyeH: 12.5, irisR: 10, browY: -32, browW: 25, browT: 5, noseL: 38, noseW: 10, mouthY: 58, mouthW: 22,
    cloth: '#c8bda4', cloth2: '#8f8571' },
};
const OUT = '#0c0a10';
function lch(base, L, extra = 1) { return col(mulc(mixc(base, L.tint, L.tintA * 0.35), Math.min(1, L.bright) * extra)); }

function headPath(ctx, c, yaw) {
  const rx = c.rx, ry = c.ry, j = c.jaw, ch = c.chin;
  const o = yaw * rx * 0.1, cs = yaw * rx * 0.22;
  const sr = 1 - Math.max(0, yaw) * 0.1 + Math.max(0, -yaw) * 0.04;
  const sl = 1 - Math.max(0, -yaw) * 0.1 + Math.max(0, yaw) * 0.04;
  ctx.beginPath();
  ctx.moveTo(o, -ry);
  ctx.bezierCurveTo(o + rx * 0.62 * sr, -ry, o + rx * sr, -ry * 0.62, o + rx * sr, -ry * 0.12);
  ctx.bezierCurveTo(o + rx * sr, ry * 0.28, o + rx * j * sr * 1.04, ry * 0.48, o + rx * j * sr + cs * 0.5, ry * 0.64);
  ctx.bezierCurveTo(o + rx * j * sr * 0.78 + cs * 0.7, ry * 0.86, rx * ch * sr + cs, ry, cs, ry);
  ctx.bezierCurveTo(-rx * ch * sl + cs, ry, -rx * j * sl * 0.78 + cs * 0.7, ry * 0.86, o - rx * j * sl + cs * 0.5, ry * 0.64);
  ctx.bezierCurveTo(o - rx * j * sl * 1.04, ry * 0.48, o - rx * sl, ry * 0.28, o - rx * sl, -ry * 0.12);
  ctx.bezierCurveTo(o - rx * sl, -ry * 0.62, o - rx * 0.62 * sl, -ry, o, -ry);
  ctx.closePath();
}

function drawEye(ctx, x, y, w, h, open, lx, ly, c, P, L, s) {
  const lineC = '#120c0e';
  if (open < 0.1) {
    ctx.strokeStyle = lineC; ctx.lineWidth = c === CH.dad ? 4 : 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + h * 0.7, x + w, y); ctx.stroke();
    if (c !== CH.dad) { ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { const u = 0.2 + k * 0.2, px = lerp(x - w, x + w, u), py = y + Math.sin(u * Math.PI) * h * 0.35; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (u - 0.5) * 6, py + 6); ctx.stroke(); } }
    return;
  }
  const oh = h * open, ix = x - s * w, ox = x + s * w;
  // sombra da órbita
  ctx.save(); const sgr = ctx.createRadialGradient(x, y - oh * 0.3, 2, x, y - oh * 0.3, w * 1.35);
  sgr.addColorStop(0, 'rgba(20,8,12,0.16)'); sgr.addColorStop(1, 'rgba(20,8,12,0)'); ctx.fillStyle = sgr;
  ctx.beginPath(); ctx.ellipse(x, y - oh * 0.3, w * 1.35, h * 1.4 + oh * 0.4, 0, 0, TAU); ctx.fill(); ctx.restore();
  const eyePath = () => {
    ctx.beginPath(); ctx.moveTo(ix, y + 1);
    ctx.bezierCurveTo(lerp(ix, ox, 0.25), y - oh * 1.32, lerp(ix, ox, 0.72), y - oh * 1.32, ox, y - 2);
    ctx.bezierCurveTo(lerp(ix, ox, 0.7), y + oh * 1.05, lerp(ix, ox, 0.3), y + oh * 1.05, ix, y + 1);
    ctx.closePath();
  };
  ctx.save(); eyePath(); ctx.fillStyle = lc(c.sclera, L, 1.08); ctx.fill(); ctx.clip();
  const ir = c.irisR * (P.irisK ?? 1);
  const icx = x + lx * w * 0.55, icy = y - oh * 0.12 + ly * oh * 0.55;
  const g = ctx.createRadialGradient(icx, icy, ir * 0.2, icx, icy, ir);
  g.addColorStop(0, lc(mixc(c.iris, '#ffffff', 0.15), L, 1.1)); g.addColorStop(0.8, lc(c.iris, L)); g.addColorStop(1, '#0a0708');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(icx, icy, ir, 0, TAU); ctx.fill();
  ctx.fillStyle = '#050304'; ctx.beginPath(); ctx.arc(icx, icy, ir * 0.46 * (P.pupil ?? 1), 0, TAU); ctx.fill();
  if ((P.glint ?? 1) > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * (P.glint ?? 1)})`; ctx.beginPath(); ctx.arc(icx - ir * 0.35, icy - ir * 0.38, ir * 0.22, 0, TAU); ctx.fill(); }
  // sombra da pálpebra superior
  const sg = ctx.createLinearGradient(0, y - oh * 1.3, 0, y + oh * 0.2);
  sg.addColorStop(0, 'rgba(20,10,10,0.55)'); sg.addColorStop(1, 'rgba(20,10,10,0)');
  ctx.fillStyle = sg; ctx.fillRect(x - w * 1.2, y - oh * 1.5, w * 2.4, oh * 1.8);
  ctx.restore();
  // linhas das pálpebras
  ctx.strokeStyle = lineC; ctx.lineCap = 'round'; ctx.lineWidth = c === CH.dad ? 4 : (c === CH.wom ? 3.6 : 3.4);
  ctx.beginPath(); ctx.moveTo(ix, y + 1); ctx.bezierCurveTo(lerp(ix, ox, 0.25), y - oh * 1.32, lerp(ix, ox, 0.72), y - oh * 1.32, ox, y - 2); ctx.stroke();
  ctx.globalAlpha = 0.45; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(ox, y - 2); ctx.bezierCurveTo(lerp(ix, ox, 0.7), y + oh * 1.05, lerp(ix, ox, 0.3), y + oh * 1.05, ix, y + 1); ctx.stroke();
  // vinco
  ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lerp(ix, ox, 0.15), y - oh * 1.1 - 7); ctx.quadraticCurveTo(x, y - oh * 1.45 - 10, lerp(ix, ox, 0.9), y - oh * 0.9 - 7); ctx.stroke();
  // olheiras (mulher / pai cansado)
  if (P.bags) { ctx.globalAlpha = P.bags; ctx.strokeStyle = '#3a2430'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lerp(ix, ox, 0.15), y + oh * 1.0 + 6); ctx.quadraticCurveTo(x, y + oh * 1.25 + 10, lerp(ix, ox, 0.85), y + oh * 0.8 + 5); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

function drawBrow(ctx, x, y, w, t, s, P, color) {
  const raise = (P.brRaise || 0) * 11, ang = (P.brAngry || 0) * 11, wor = (P.brWorry || 0) * 11;
  const ix = x - s * w, ox = x + s * w;
  const iy = y - raise + ang - wor, oy = y - raise * 0.6 + wor * 0.35 - ang * 0.25;
  const my = (iy + oy) / 2 - 7 - raise * 0.2 + ang * 0.3;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(ix, iy - t * 0.45); ctx.quadraticCurveTo(x, my - t * 0.55, ox, oy - t * 0.05);
  ctx.quadraticCurveTo(x, my + t * 0.55, ix, iy + t * 0.55); ctx.closePath(); ctx.fill();
}

function drawMouth(ctx, c, P, L, fx) {
  const mx = fx * 1.1, my = c.mouthY;
  const cr = P.creep || 0, open = P.mOpen || 0, sm = P.smile || 0, sh = P.shout || 0;
  const w = c.mouthW * (1 + cr * 1.75 + (P.mWide || 0) + sh * 0.25);
  const cu = sm * 8 + cr * 40;
  const lipD = lc(mixc(c.lip, '#000', 0.35), L);
  if (open < 0.04 && cr < 0.04) {
    ctx.strokeStyle = lipD; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx - w, my - cu); ctx.quadraticCurveTo(mx, my + sm * 7 + 2 - (P.clench || 0) * 3, mx + w, my - cu); ctx.stroke();
    ctx.strokeStyle = lca(c.lip, L, 0.55); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(mx - w * 0.5, my + 11 + sm * 3); ctx.quadraticCurveTo(mx, my + 16 + sm * 4, mx + w * 0.5, my + 11 + sm * 3); ctx.stroke();
    return;
  }
  const oy = open * (24 + sh * 30);
  const upY = my - 2 - open * 5 - cu * 0.15, loY = my + 4 + oy + cr * 12;
  const mpath = () => {
    ctx.beginPath(); ctx.moveTo(mx - w, my - cu);
    ctx.bezierCurveTo(mx - w * 0.55, upY - 3, mx + w * 0.55, upY - 3, mx + w, my - cu);
    ctx.bezierCurveTo(mx + w * 0.75, loY + cu * 0.25, mx - w * 0.75, loY + cu * 0.25, mx - w, my - cu); ctx.closePath();
  };
  mpath(); ctx.fillStyle = '#1e070a'; ctx.fill();
  ctx.save(); mpath(); ctx.clip();
  const teethC = lc(cr > 0.2 ? '#e2dccb' : '#ece6da', L, 1.05);
  ctx.fillStyle = teethC;
  const th = 9 + cr * 9 + sh * 3;
  ctx.beginPath(); ctx.moveTo(mx - w * 1.1, upY - 10); ctx.lineTo(mx + w * 1.1, upY - 10);
  ctx.lineTo(mx + w * 1.1, my - cu * 0.55 + th); ctx.quadraticCurveTo(mx, upY + th + 6, mx - w * 1.1, my - cu * 0.55 + th); ctx.fill();
  if (cr > 0.2) {
    ctx.beginPath(); ctx.moveTo(mx - w * 1.1, loY + 10); ctx.lineTo(mx + w * 1.1, loY + 10);
    ctx.lineTo(mx + w * 1.1, my - cu * 0.6 + 4); ctx.quadraticCurveTo(mx, loY - th, mx - w * 1.1, my - cu * 0.6 + 4); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,35,0.55)'; ctx.lineWidth = 1.6;
    for (let k = -6; k <= 6; k++) { const px = mx + k * w / 7; ctx.beginPath(); ctx.moveTo(px, upY - 4 + Math.abs(k) * -2.2); ctx.lineTo(px, loY + 4); ctx.stroke(); }
  }
  if (sh > 0.2) { ctx.fillStyle = '#7a2a30'; ctx.beginPath(); ctx.ellipse(mx, loY - 4, w * 0.6, 10, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = lipD; ctx.lineWidth = 3; mpath(); ctx.stroke();
  if (cr > 0.3) { // dobras esticadas nas bochechas
    ctx.strokeStyle = lca('#3a2228', L, 0.45 * cr); ctx.lineWidth = 2.4;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(mx + s * w * 0.55, my - 52); ctx.quadraticCurveTo(mx + s * w * 1.12, my - cu - 10, mx + s * w * 1.05, my - cu + 8); ctx.stroke(); }
  }
}

function drawNose(ctx, c, fx, yaw, L) {
  const nx = fx + yaw * 16, ny = c.eyeY + c.noseL, nw = c.noseW;
  const side = yaw >= 0 ? 1 : -1;
  ctx.save();
  ctx.fillStyle = lca('#000000', L, 0.18); ctx.beginPath(); ctx.ellipse(nx, ny + 10, nw * 1.2, 6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = lca(mixc(c.skin, '#2a1510', 0.6), L, 0.55); ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(fx + side * 9, c.eyeY + 10); ctx.quadraticCurveTo(nx + side * nw * 0.6, ny - c.noseL * 0.4, nx + side * nw * 0.95, ny - 4); ctx.stroke();
  ctx.lineWidth = 2.6; ctx.strokeStyle = lca(mixc(c.skin, '#2a1510', 0.65), L, 0.8);
  ctx.beginPath(); ctx.moveTo(nx - nw, ny - 2); ctx.quadraticCurveTo(nx - nw * 0.5, ny + 6, nx, ny + 4); ctx.quadraticCurveTo(nx + nw * 0.5, ny + 6, nx + nw, ny - 2); ctx.stroke();
  ctx.fillStyle = lca('#1a0c0a', L, 0.7);
  ctx.beginPath(); ctx.ellipse(nx - nw * 0.45, ny + 1, 3.2, 2, 0.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(nx + nw * 0.45, ny + 1, 3.2, 2, -0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,225,0.12)'; ctx.beginPath(); ctx.ellipse(nx - side * 2, ny - 12, 4, 9, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawEar(ctx, x, y, s, c, L, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, sc);
  ctx.fillStyle = lc(c.skin, L, 0.9); ctx.strokeStyle = OUT; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-4, -26); ctx.bezierCurveTo(14, -34, 26, -10, 18, 8); ctx.bezierCurveTo(14, 22, 6, 30, -4, 26); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = lca('#3a1f18', L, 0.5); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(2, -18); ctx.bezierCurveTo(14, -18, 16, 2, 6, 12); ctx.stroke();
  ctx.restore();
}

// ---------- cabelos ----------
function hairDadFront(ctx, c, yaw, L) {
  const rx = c.rx, ry = c.ry, o = yaw * rx * 0.1;
  ctx.beginPath();
  ctx.moveTo(o + rx * 0.99, -ry * 0.02);
  ctx.bezierCurveTo(o + rx * 1.08, -ry * 0.45, o + rx * 1.02, -ry * 1.02, o + rx * 0.1, -ry * 1.1);
  ctx.bezierCurveTo(o - rx * 0.7, -ry * 1.12, o - rx * 1.1, -ry * 0.6, o - rx * 0.99, -ry * 0.02);
  ctx.lineTo(o - rx * 0.9, -ry * 0.04);
  ctx.bezierCurveTo(o - rx * 0.86, -ry * 0.32, o - rx * 0.78, -ry * 0.52, o - rx * 0.55, -ry * 0.6);
  ctx.bezierCurveTo(o - rx * 0.2, -ry * 0.7, o + rx * 0.15, -ry * 0.62, o + rx * 0.3, -ry * 0.7);
  ctx.bezierCurveTo(o + rx * 0.55, -ry * 0.62, o + rx * 0.82, -ry * 0.55, o + rx * 0.88, -ry * 0.3);
  ctx.lineTo(o + rx * 0.9, -ry * 0.04); ctx.closePath();
  ctx.fillStyle = lch(c.hair, L, 1.2); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = lca('#8aa0c0', L, 0.18); ctx.lineWidth = 2.2;
  for (let k = 0; k < 7; k++) { const u = k / 6; ctx.beginPath(); ctx.moveTo(o + lerp(-rx * 0.7, rx * 0.7, u), -ry * 1.0); ctx.quadraticCurveTo(o + lerp(-rx * 0.6, rx * 0.8, u) + 10, -ry * 0.85, o + lerp(-rx * 0.6, rx * 0.75, u) + 4, -ry * 0.68); ctx.stroke(); }
}
function hairBoyFront(ctx, c, yaw, L, t = 0) {
  const rx = c.rx, ry = c.ry, o = yaw * rx * 0.12;
  ctx.beginPath();
  ctx.moveTo(o + rx * 1.02, ry * 0.05);
  ctx.bezierCurveTo(o + rx * 1.2, -ry * 0.5, o + rx * 1.0, -ry * 1.2, o + rx * 0.2, -ry * 1.22);
  ctx.lineTo(o + rx * 0.05, -ry * 1.36); ctx.lineTo(o - rx * 0.15, -ry * 1.2); ctx.lineTo(o - rx * 0.4, -ry * 1.3); ctx.lineTo(o - rx * 0.55, -ry * 1.12);
  ctx.bezierCurveTo(o - rx * 1.12, -ry * 1.0, o - rx * 1.22, -ry * 0.4, o - rx * 1.02, ry * 0.05);
  ctx.lineTo(o - rx * 0.92, -ry * 0.1);
  // franja em mechas
  const fr = [[-0.86, -0.42], [-0.7, -0.22], [-0.58, -0.46], [-0.38, -0.2], [-0.2, -0.44], [0.0, -0.17], [0.16, -0.42], [0.36, -0.2], [0.5, -0.45], [0.7, -0.24], [0.82, -0.44], [0.92, -0.12]];
  for (const [fx, fy] of fr) ctx.lineTo(o + rx * fx + yaw * 10, ry * fy);
  ctx.closePath();
  ctx.fillStyle = lch(c.hair, L, 1.15); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = lca('#d79a64', L, 0.25); ctx.lineWidth = 2.4;
  for (let k = 0; k < 8; k++) { const u = k / 7; ctx.beginPath(); ctx.moveTo(o + lerp(-rx * 0.8, rx * 0.8, u), -ry * 1.05); ctx.quadraticCurveTo(o + lerp(-rx * 0.7, rx * 0.9, u), -ry * 0.75, o + lerp(-rx * 0.75, rx * 0.8, u) - 6, -ry * 0.5); ctx.stroke(); }
}
function hairWomBack(ctx, c, L, sway = 0) {
  const rx = c.rx, ry = c.ry;
  ctx.beginPath();
  ctx.moveTo(0, -ry * 1.12);
  ctx.bezierCurveTo(rx * 1.3, -ry * 1.1, rx * 1.28, -ry * 0.1, rx * 1.3 + sway, ry * 1.2);
  ctx.bezierCurveTo(rx * 1.35 + sway, ry * 2.0, rx * 1.55 + sway, ry * 2.6, rx * 1.4 + sway, ry * 3.0);
  ctx.lineTo(-rx * 1.4 + sway, ry * 3.0);
  ctx.bezierCurveTo(-rx * 1.55 + sway, ry * 2.6, -rx * 1.35 + sway, ry * 2.0, -rx * 1.3 + sway, ry * 1.2);
  ctx.bezierCurveTo(-rx * 1.28, -ry * 0.1, -rx * 1.3, -ry * 1.1, 0, -ry * 1.12);
  ctx.closePath(); ctx.fillStyle = lch(c.hair, L, 1.1); ctx.fill();
}
function hairWomFront(ctx, c, yaw, L, sway = 0) {
  const rx = c.rx, ry = c.ry, o = yaw * rx * 0.1;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(o + s * 4, -ry * 1.1);
    ctx.bezierCurveTo(o + s * rx * 0.9, -ry * 1.12, o + s * rx * 1.18, -ry * 0.6, o + s * rx * 1.14, ry * 0.2);
    ctx.bezierCurveTo(o + s * rx * 1.12 + sway, ry * 1.2, o + s * rx * 1.25 + sway, ry * 2.0, o + s * rx * 1.05 + sway, ry * 2.75);
    ctx.lineTo(o + s * rx * 0.72 + sway, ry * 2.6);
    ctx.bezierCurveTo(o + s * rx * 0.86 + sway * 0.6, ry * 1.8, o + s * rx * 0.8, ry * 1.0, o + s * rx * 0.8, ry * 0.3);
    ctx.bezierCurveTo(o + s * rx * 0.82, -ry * 0.35, o + s * rx * 0.55, -ry * 0.8, o + s * 2, -ry * 0.92);
    ctx.closePath();
    ctx.fillStyle = lch(c.hair, L, 1.25); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = lca('#7d8aa8', L, 0.16); ctx.lineWidth = 1.8;
    for (let k = 0; k < 6; k++) { const u = k / 5; ctx.beginPath(); ctx.moveTo(o + s * lerp(rx * 0.2, rx * 1.0, u), -ry * 0.95 + u * 40); ctx.bezierCurveTo(o + s * lerp(rx * 0.85, rx * 1.15, u), -ry * 0.2, o + s * lerp(rx * 0.85, rx * 1.15, u) + sway * 0.5, ry * 1.2, o + s * lerp(rx * 0.8, rx * 1.1, u) + sway, ry * 2.4); ctx.stroke(); }
  }
}

// ---------- cabeça completa (frente / 3/4) ----------
// P: yaw, eye, eyeL, eyeR, lookX, lookY, pupil, irisK, brRaise, brAngry, brWorry, mOpen, smile, creep, shout, clench, sweat, glint, bags
function drawHead(ctx, who, P, L) {
  const c = CH[who], yaw = P.yaw || 0, rx = c.rx, ry = c.ry;
  const fx = yaw * rx * 0.36;
  // orelhas
  if (who !== 'wom') {
    if (yaw < 0.55) drawEar(ctx, rx * (0.97 - Math.max(0, yaw) * 0.12) + yaw * 6, c.eyeY + 18, 1, c, L, 1 - Math.max(0, yaw) * 0.4);
    if (yaw > -0.55) drawEar(ctx, -rx * (0.97 - Math.max(0, -yaw) * 0.12) + yaw * 6, c.eyeY + 18, -1, c, L, 1 - Math.max(0, -yaw) * 0.4);
  }
  const hp = (x) => headPath(x, c, yaw);
  hp(ctx); ctx.fillStyle = lc(c.skin, L); ctx.fill();
  // barba por fazer
  if (who === 'dad') {
    ctx.save(); hp(ctx); ctx.clip();
    const g = ctx.createRadialGradient(fx * 1.1, ry * 0.95, 10, fx * 1.1, ry * 0.95, ry * 0.7);
    g.addColorStop(0, 'rgba(30,22,20,0.4)'); g.addColorStop(0.55, 'rgba(30,22,20,0.26)'); g.addColorStop(1, 'rgba(30,22,20,0)');
    ctx.fillStyle = g; ctx.fillRect(-rx * 1.2, 0, rx * 2.4, ry * 1.3);
    ctx.restore();
  }
  // bochechas
  if (who === 'boy') { ctx.fillStyle = lca('#e8705a', L, 0.18); for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 52, 40, 22, 12, 0, 0, TAU); ctx.fill(); } }
  if (who === 'wom') { ctx.save(); hp(ctx); ctx.clip(); ctx.fillStyle = lca('#4a3a52', L, 0.18); for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * 52, 30, 18, 34, s * 0.2, 0, TAU); ctx.fill(); } ctx.restore(); }
  shadeShape(ctx, hp, L, rx * 1.1, { rimW: 12 });
  hp(ctx); ctx.strokeStyle = OUT; ctx.lineWidth = 3.4; ctx.stroke();

  // olhos
  for (const s of [-1, 1]) {
    const ws = 1 - s * yaw * 0.38;
    const ex = fx + s * c.eyeX * (1 - s * yaw * 0.32);
    const open = (s < 0 ? P.eyeL : P.eyeR) ?? (P.eye ?? 1);
    drawEye(ctx, ex, c.eyeY, c.eyeW * ws, c.eyeH, open, (P.lookX || 0), (P.lookY || 0), c, P, L, s);
    drawBrow(ctx, ex + s * 2, c.browY - Math.max(0, open - 1) * 8, c.browW * ws, c.browT, s, P, lch(c.hair, L, 1.3));
  }
  drawNose(ctx, c, fx, yaw, L);
  drawMouth(ctx, c, P, L, fx);
  if (P.sweat) {
    ctx.fillStyle = `rgba(210,230,255,${0.7 * P.sweat})`;
    const sy = -60 + ((P.sweatT || 0) % 1) * 90;
    ctx.beginPath(); ctx.ellipse(-rx * 0.72 + fx, sy, 4, 6.5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rx * 0.62 + fx, -40, 3, 5, 0, 0, TAU); ctx.fill();
  }
  // cabelo da frente
  if (who === 'dad') hairDadFront(ctx, c, yaw, L);
  if (who === 'boy') hairBoyFront(ctx, c, yaw, L);
  if (who === 'wom') hairWomFront(ctx, c, yaw, L, P.sway || 0);
}

// ---------- tronco / roupas ----------
function torsoPath(ctx, c, sw, bottom) {
  const rx = c.rx, ry = c.ry;
  ctx.beginPath();
  ctx.moveTo(-rx * 0.55, ry * 1.2);
  ctx.bezierCurveTo(-rx * 1.2, ry * 1.4, -rx * sw * 0.95, ry * 1.5, -rx * sw, ry * 2.1);
  ctx.bezierCurveTo(-rx * sw * 1.08, ry * 2.6, -rx * sw * 1.1, ry * 3.2, -rx * sw * 1.1, bottom);
  ctx.lineTo(rx * sw * 1.1, bottom);
  ctx.bezierCurveTo(rx * sw * 1.1, ry * 3.2, rx * sw * 1.08, ry * 2.6, rx * sw, ry * 2.1);
  ctx.bezierCurveTo(rx * sw * 0.95, ry * 1.5, rx * 1.2, ry * 1.4, rx * 0.55, ry * 1.2);
  ctx.closePath();
}
function drawTorso(ctx, who, L, P = {}) {
  const c = CH[who], rx = c.rx, ry = c.ry;
  const bottom = ry * 7.5;
  // pescoço
  const nw = who === 'wom' ? 0.33 : (who === 'boy' ? 0.38 : 0.46);
  ctx.beginPath(); ctx.moveTo(-rx * nw, ry * 0.4); ctx.lineTo(-rx * nw * 1.05, ry * 1.45); ctx.lineTo(rx * nw * 1.05, ry * 1.45); ctx.lineTo(rx * nw, ry * 0.4); ctx.closePath();
  ctx.fillStyle = lc(c.skin, L, 0.82); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, ry * 0.85, rx * nw * 1.2, ry * 0.18, 0, 0, TAU); ctx.fill();
  const sw = who === 'dad' ? 2.35 : (who === 'boy' ? 1.85 : 1.75);
  const tp = (x) => torsoPath(x, c, sw, bottom);
  tp(ctx); ctx.fillStyle = lc(c.cloth, L); ctx.fill();
  if (who === 'dad') {
    // camiseta em V
    ctx.fillStyle = lc(c.cloth2, L); ctx.beginPath(); ctx.moveTo(-rx * 0.55, ry * 1.25); ctx.lineTo(0, ry * 2.4); ctx.lineTo(rx * 0.55, ry * 1.25); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lc(c.skin, L, 0.8); ctx.beginPath(); ctx.moveTo(-rx * 0.42, ry * 1.25); ctx.quadraticCurveTo(0, ry * 1.75, rx * 0.42, ry * 1.25); ctx.closePath(); ctx.fill();
    // golas
    ctx.fillStyle = lc(mixc(c.cloth, '#000', 0.15), L);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * rx * 0.5, ry * 1.15); ctx.lineTo(s * rx * 1.15, ry * 1.55); ctx.lineTo(s * rx * 0.75, ry * 2.0); ctx.lineTo(s * rx * 0.62, ry * 2.6); ctx.lineTo(s * rx * 0.2, ry * 2.35); ctx.closePath(); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke(); }
    ctx.strokeStyle = lca('#000', L, 0.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx * 0.2, ry * 2.35); ctx.lineTo(rx * 0.25, bottom); ctx.stroke();
  } else if (who === 'boy') {
    ctx.fillStyle = lc(c.cloth2, L); ctx.beginPath(); ctx.moveTo(-rx * 0.62, ry * 1.2); ctx.quadraticCurveTo(0, ry * 1.95, rx * 0.62, ry * 1.2); ctx.quadraticCurveTo(0, ry * 1.55, -rx * 0.62, ry * 1.2); ctx.fill();
    ctx.strokeStyle = lc('#f4ead2', L); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * rx * 0.28, ry * 1.6); ctx.quadraticCurveTo(s * rx * 0.34, ry * 2.1, s * rx * 0.26, ry * 2.5); ctx.stroke(); }
    ctx.strokeStyle = lca('#000', L, 0.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-rx * 0.9, ry * 3.6); ctx.quadraticCurveTo(0, ry * 3.75, rx * 0.9, ry * 3.6); ctx.stroke();
  } else {
    // vestido antigo com gola alta de renda
    ctx.fillStyle = lc(c.cloth2, L); ctx.beginPath(); ctx.moveTo(-rx * 0.5, ry * 1.05); ctx.quadraticCurveTo(0, ry * 1.32, rx * 0.5, ry * 1.05); ctx.lineTo(rx * 0.56, ry * 1.38); ctx.quadraticCurveTo(0, ry * 1.6, -rx * 0.56, ry * 1.38); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = lca('#f2ece0', L, 0.5); ctx.lineWidth = 2;
    for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.arc(k * rx * 0.1, ry * 1.42 + Math.abs(k) * -1.5, 6, 0, Math.PI); ctx.stroke(); }
    ctx.fillStyle = lca('#000', L, 0.2);
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(0, ry * (1.75 + k * 0.32), 5, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = lca('#000', L, 0.25); ctx.lineWidth = 2.5;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * rx * 0.9, ry * 2.0); ctx.quadraticCurveTo(s * rx * 1.0, ry * 3.0, s * rx * 0.8, ry * 4.2); ctx.stroke(); }
  }
  shadeShape(ctx, tp, L, rx * 2.4, { rimW: 14 });
  tp(ctx); ctx.strokeStyle = OUT; ctx.lineWidth = 3.4; ctx.stroke();
  // cinto de segurança (todos usam — regra 1) — a mulher não
  if (who !== 'wom' && P.belt !== false) {
    const s = P.beltSide ?? 1;
    ctx.save(); tp(ctx); ctx.clip();
    ctx.fillStyle = lc('#22252c', L, 1.1); ctx.beginPath();
    ctx.moveTo(s * rx * 1.25, ry * 1.45); ctx.lineTo(s * rx * 1.6, ry * 1.65); ctx.lineTo(-s * rx * 1.4, bottom); ctx.lineTo(-s * rx * 1.9, bottom); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = lca('#8a93a8', L, 0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s * rx * 1.6, ry * 1.65); ctx.lineTo(-s * rx * 1.4, bottom); ctx.stroke();
    ctx.restore();
  }
}
function drawHood(ctx, L) {
  const c = CH.boy, rx = c.rx, ry = c.ry;
  ctx.beginPath(); ctx.moveTo(-rx * 1.1, ry * 1.35); ctx.bezierCurveTo(-rx * 1.35, ry * 0.4, rx * 1.35, ry * 0.4, rx * 1.1, ry * 1.35); ctx.closePath();
  ctx.fillStyle = lc(CH.boy.cloth2, L); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
}

// personagem completo; o pivô é o centro da cabeça. P.tilt gira só a cabeça (no pescoço)
function drawChar(ctx, who, P, L) {
  const c = CH[who];
  ctx.save();
  ctx.save();
  if (P.tilt || P.headDX || P.headDY) { ctx.translate(0, c.ry * 0.9); ctx.rotate(P.tilt || 0); ctx.translate(P.headDX || 0, -c.ry * 0.9 + (P.headDY || 0)); }
  if (who === 'wom') hairWomBack(ctx, c, L, P.sway || 0);
  ctx.restore();
  if (who === 'boy') drawHood(ctx, L);
  if (P.torso !== false) drawTorso(ctx, who, L, P);
  if (P.beforeHead) P.beforeHead(ctx);
  if (P.tilt || P.headDX || P.headDY) { ctx.translate(0, c.ry * 0.9); ctx.rotate(P.tilt || 0); ctx.translate(P.headDX || 0, -c.ry * 0.9 + (P.headDY || 0)); }
  drawHead(ctx, who, P, L);
  ctx.restore();
}

// PAI visto de trás (do banco traseiro)
function drawDadBack(ctx, L, P = {}) {
  const c = CH.dad, rx = c.rx, ry = c.ry * 0.98, turn = P.turn || 0;
  // ombros/jaqueta
  ctx.beginPath(); ctx.moveTo(-rx * 0.6, ry * 0.9);
  ctx.bezierCurveTo(-rx * 1.6, ry * 1.1, -rx * 2.4, ry * 1.3, -rx * 2.5, ry * 2.4); ctx.lineTo(-rx * 2.6, ry * 4.5); ctx.lineTo(rx * 2.6, ry * 4.5); ctx.lineTo(rx * 2.5, ry * 2.4);
  ctx.bezierCurveTo(rx * 2.4, ry * 1.3, rx * 1.6, ry * 1.1, rx * 0.6, ry * 0.9); ctx.closePath();
  const sp = (x) => { x.beginPath(); x.moveTo(-rx * 0.6, ry * 0.9); x.bezierCurveTo(-rx * 1.6, ry * 1.1, -rx * 2.4, ry * 1.3, -rx * 2.5, ry * 2.4); x.lineTo(-rx * 2.6, ry * 4.5); x.lineTo(rx * 2.6, ry * 4.5); x.lineTo(rx * 2.5, ry * 2.4); x.bezierCurveTo(rx * 2.4, ry * 1.3, rx * 1.6, ry * 1.1, rx * 0.6, ry * 0.9); x.closePath(); };
  ctx.fillStyle = lc(c.cloth, L); ctx.fill(); shadeShape(ctx, sp, L, rx * 2.5); sp(ctx); ctx.strokeStyle = OUT; ctx.lineWidth = 3.4; ctx.stroke();
  // gola
  ctx.fillStyle = lc(mixc(c.cloth, '#000', 0.2), L); ctx.beginPath(); ctx.moveTo(-rx * 0.75, ry * 0.75); ctx.quadraticCurveTo(0, ry * 1.15, rx * 0.75, ry * 0.75); ctx.lineTo(rx * 0.85, ry * 1.1); ctx.quadraticCurveTo(0, ry * 1.4, -rx * 0.85, ry * 1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
  // pescoço
  ctx.fillStyle = lc(c.skin, L, 0.75); ctx.beginPath(); ctx.moveTo(-rx * 0.5, ry * 0.3); ctx.lineTo(-rx * 0.55, ry * 0.95); ctx.quadraticCurveTo(0, ry * 1.1, rx * 0.55, ry * 0.95); ctx.lineTo(rx * 0.5, ry * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
  // orelhas
  drawEar(ctx, rx * 0.95, 4, 1, c, L); drawEar(ctx, -rx * 0.95, 4, -1, c, L);
  // bochecha aparecendo quando vira
  if (Math.abs(turn) > 0.02) {
    const s = Math.sign(turn), a = Math.abs(turn);
    ctx.fillStyle = lc(c.skin, L, 0.85); ctx.beginPath(); ctx.ellipse(s * rx * (0.82 + a * 0.15), ry * 0.35, rx * 0.25 * a + 6, ry * 0.42, s * 0.2, 0, TAU); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  }
  // cabeça (nuca com cabelo curto)
  const hp = (x) => { x.beginPath(); x.ellipse(0, 0, rx * 0.98, ry, 0, 0, TAU); };
  hp(ctx); ctx.fillStyle = lc(c.skin, L, 0.8); ctx.fill();
  ctx.save(); hp(ctx); ctx.clip();
  ctx.fillStyle = lch(c.hair, L, 1.2); ctx.beginPath(); ctx.moveTo(-rx * 1.2, -ry * 1.2); ctx.lineTo(rx * 1.2, -ry * 1.2); ctx.lineTo(rx * 1.2, ry * 0.25);
  ctx.bezierCurveTo(rx * 0.7, ry * 0.45, rx * 0.4, ry * 0.68, 0, ry * 0.72); ctx.bezierCurveTo(-rx * 0.4, ry * 0.68, -rx * 0.7, ry * 0.45, -rx * 1.2, ry * 0.25); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = lca('#8aa0c0', L, 0.16); ctx.lineWidth = 2.2;
  for (let k = 0; k < 10; k++) { const u = k / 9; ctx.beginPath(); ctx.moveTo(lerp(-rx * 0.8, rx * 0.8, u), -ry * 0.9); ctx.quadraticCurveTo(lerp(-rx * 0.9, rx * 0.9, u), 0, lerp(-rx * 0.7, rx * 0.7, u), ry * 0.55); ctx.stroke(); }
  ctx.restore();
  shadeShape(ctx, hp, L, rx, { rimW: 12 });
  hp(ctx); ctx.strokeStyle = OUT; ctx.lineWidth = 3.4; ctx.stroke();
}

// ---------- mãos ----------
function fingerChain(ctx, x, y, ang, segs, w, bends, skin, L, nail = null) {
  const pts = [[x, y]]; let a = ang, px = x, py = y;
  for (let i = 0; i < segs.length; i++) { a += bends[i] || 0; px += Math.cos(a) * segs[i]; py += Math.sin(a) * segs[i]; pts.push([px, py]); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < pts.length - 1; i++) {
      const ww = w * (1 - i * 0.09);
      ctx.strokeStyle = pass ? lc(skin, L) : OUT; ctx.lineWidth = pass ? ww : ww + 5;
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
    }
  }
  // dobras
  ctx.strokeStyle = lca('#2a1612', L, 0.35); ctx.lineWidth = 1.6;
  for (let i = 1; i < pts.length - 1; i++) { const [qx, qy] = pts[i]; const aa = Math.atan2(pts[i + 1][1] - qy, pts[i + 1][0] - qx) + Math.PI / 2; const ww = w * 0.32; ctx.beginPath(); ctx.moveTo(qx + Math.cos(aa) * ww, qy + Math.sin(aa) * ww); ctx.lineTo(qx - Math.cos(aa) * ww, qy - Math.sin(aa) * ww); ctx.stroke(); }
  if (nail) {
    const [tx, ty] = pts[pts.length - 1], [sx, sy] = pts[pts.length - 2]; const aa = Math.atan2(ty - sy, tx - sx);
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(aa); ctx.fillStyle = col(nail); ctx.beginPath(); ctx.ellipse(-w * 0.1, 0, w * 0.42 * (nail === '#2b2226' ? 1.5 : 1), w * 0.3, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  return pts;
}
function blob(ctx, pts, fill, w = 4) {
  ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath();
  ctx.strokeStyle = OUT; ctx.lineWidth = w + 10; ctx.stroke(); ctx.strokeStyle = fill; ctx.lineWidth = 10; ctx.stroke(); ctx.fillStyle = fill; ctx.fill();
}

// mão da mulher: dedos longos que esticam. stretch 0..1, curl 0..1. Orientação: ang = direção dos dedos
function drawWomHand(ctx, x, y, ang, sc, stretch, curl, L, t = 0, sleeve = true) {
  const c = CH.wom;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  if (sleeve) { // manga
    ctx.fillStyle = lc(c.cloth, L); ctx.strokeStyle = OUT; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(-60, -40); ctx.quadraticCurveTo(-240, -62, -460, -82); ctx.lineTo(-460, 86); ctx.quadraticCurveTo(-240, 60, -60, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = lca('#000', L, 0.3); ctx.lineWidth = 2.5; for (const k of [-0.5, 0.1, 0.6]) { ctx.beginPath(); ctx.moveTo(-90, k * 60); ctx.quadraticCurveTo(-250, k * 70 + 14, -440, k * 120); ctx.stroke(); }
    ctx.strokeStyle = lca('#f2ece0', L, 0.45); ctx.lineWidth = 2; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(-62, k * 12, 5, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
  }
  // pulso e palma
  blob(ctx, [[-70, -30], [10, -38], [52, -30], [60, 30], [10, 40], [-70, 28]], lc(c.skin, L));
  const k = 1 + stretch * 1.5;
  const fing = [[-34, 0.0, 1.0], [-12, 0.05, 1.12], [10, 0.1, 1.06], [30, 0.18, 0.86]];
  fing.forEach(([fy, a0, lk], i) => {
    const wob = Math.sin(t * 3 + i * 1.3) * 0.08 * (0.3 + stretch);
    fingerChain(ctx, 52, fy, a0 + wob, [34 * k * lk, 30 * k * lk, 24 * k * lk, stretch > 0.3 ? 18 * k * lk : 0].filter(v => v > 0), 15, [0, curl * 0.5 + wob, curl * 0.6, curl * 0.5], c.skin, L, '#2b2226');
  });
  fingerChain(ctx, 30, -34, -0.9, [30 * (1 + stretch * 0.6), 26 * (1 + stretch * 0.6)], 16, [0, 0.4 + curl * 0.3], c.skin, L, '#2b2226');
  ctx.restore();
}
