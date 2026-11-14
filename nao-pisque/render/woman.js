'use strict';
// ---------------------------------------------------------------------------
// A mulher (roupa roxa, brincos dourados, sorriso estranho), suas mãos de
// dedos compridos, o mundo "lado" (banco de trás, janela) e o efeito de
// rachar/desfazer no amanhecer.
// ---------------------------------------------------------------------------
let SB, SBD, WL, WLC, SHARDS = [], CRACKS = [], SIDE_TREES = [];
const SOX = 260, SOY = 300;
const WOMAN_BASE = { x: 610, y: 700, s: 1.22 };

const SKIN = {
  night: { base: '#bdb2aa', shade: '#5a514f', hi: '#e2d9d1', deep: '#33292e' },
  dawn: { base: '#e6c7ad', shade: '#8a5e4a', hi: '#fff0dd', deep: '#5a3a30' },
};

// ------------------------------ mão comprida -------------------------------
// pulso na origem, dedos apontando para +x (antes da rotação)
function drawLongHand(c, x, y, s, rot, o = {}) {
  const sk = SKIN[o.light || 'night'];
  const curl = o.curl || 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s * (o.flip ? -1 : 1));
  c.lineCap = 'round'; c.lineJoin = 'round';
  // palma / dorso da mão
  const palm = () => {
    c.beginPath(); c.moveTo(-30, -44);
    c.bezierCurveTo(40, -58, 110, -70, 152, -60);
    c.bezierCurveTo(176, -30, 172, 30, 140, 60);
    c.bezierCurveTo(90, 66, 30, 62, -30, 46); c.closePath();
  };
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.save(); c.translate(4, 10); palm(); c.fill(); c.restore();
  palm();
  let g = c.createLinearGradient(0, -60, 0, 60);
  g.addColorStop(0, sk.hi); g.addColorStop(0.45, sk.base); g.addColorStop(1, sk.shade);
  c.fillStyle = g; c.fill();
  // tendões
  c.strokeStyle = rgba(sk.shade, 0.45); c.lineWidth = 3;
  for (const ty of [-40, -14, 12, 38]) { c.beginPath(); c.moveTo(0, ty * 0.6); c.quadraticCurveTo(70, ty * 0.85, 140, ty * 1.05); c.stroke(); }
  // dedos (mínimo -> indicador)
  const F = [
    { bx: 136, by: 46, a: 0.18, L: 168, w: 22 },
    { bx: 156, by: 16, a: 0.07, L: 214, w: 25 },
    { bx: 162, by: -18, a: -0.02, L: 236, w: 26 },
    { bx: 150, by: -50, a: -0.12, L: 214, w: 25 },
  ];
  const tw = o.twitch || [0, 0, 0, 0];
  F.forEach((f, i) => longFinger(c, f.bx, f.by, f.a, f.L, f.w, curl + tw[i], sk, o.nails ?? true));
  // polegar
  longFinger(c, 40, 46, 0.95, 120, 28, curl * 0.5, sk, o.nails ?? true, [0.5, 0.5]);
  // nós dos dedos
  c.fillStyle = rgba(sk.hi, 0.35);
  for (const f of F) { c.beginPath(); c.ellipse(f.bx - 6, f.by - 4, 9, 6, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function longFinger(c, bx, by, ang, L, w, curl, sk, nails, segsIn) {
  const segs = segsIn || [0.46, 0.30, 0.24];
  const bends = [0.22, 0.5, 0.42];
  let x = bx, y = by, a = ang; const pts = [[x, y]], angs = [];
  for (let i = 0; i < segs.length; i++) {
    a += bends[i] * curl; angs.push(a);
    x += Math.cos(a) * L * segs[i]; y += Math.sin(a) * L * segs[i]; pts.push([x, y]);
  }
  const ws = [w, w * 0.86, w * 0.74, w * 0.66];
  const pass = (col, k, ox, oy) => {
    c.strokeStyle = col;
    for (let i = 0; i < segs.length; i++) {
      c.lineWidth = ws[i] * k;
      c.beginPath(); c.moveTo(pts[i][0] + ox, pts[i][1] + oy); c.lineTo(pts[i + 1][0] + ox, pts[i + 1][1] + oy); c.stroke();
    }
  };
  pass('rgba(0,0,0,0.45)', 1.2, 2, 7);
  pass(sk.shade, 1.0, 0, 1.5);
  pass(sk.base, 0.82, 0, -0.5);
  pass(rgba(sk.hi, 0.45), 0.28, 0, -w * 0.18);
  // vincos das articulações
  c.strokeStyle = rgba(sk.deep, 0.55); c.lineWidth = 2;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i], aa = angs[i - 1] + Math.PI / 2, ww = ws[i] * 0.35;
    for (const off of [-4, 3]) {
      c.beginPath();
      c.moveTo(px + Math.cos(angs[i - 1]) * off + Math.cos(aa) * ww, py + Math.sin(angs[i - 1]) * off + Math.sin(aa) * ww);
      c.lineTo(px + Math.cos(angs[i - 1]) * off - Math.cos(aa) * ww, py + Math.sin(angs[i - 1]) * off - Math.sin(aa) * ww);
      c.stroke();
    }
  }
  if (nails) {
    const [tx, ty] = pts[pts.length - 1], na = angs[angs.length - 1], nw = ws[segs.length - 1] * 0.42;
    c.save(); c.translate(tx, ty); c.rotate(na);
    c.beginPath(); c.moveTo(-16, -nw);
    c.bezierCurveTo(8, -nw * 1.08, 30, -nw * 0.5, 42, 0);
    c.bezierCurveTo(30, nw * 0.5, 8, nw * 1.08, -16, nw);
    c.quadraticCurveTo(-22, 0, -16, -nw); c.closePath();
    const g = c.createLinearGradient(0, -nw, 0, nw);
    g.addColorStop(0, '#e0303c'); g.addColorStop(0.5, '#a50d18'); g.addColorStop(1, '#4e050b');
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(40,0,0,0.6)'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(255,230,230,0.75)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-10, -nw * 0.45); c.quadraticCurveTo(10, -nw * 0.6, 28, -nw * 0.15); c.stroke();
    c.restore();
  }
}

// ---------------------------- a mulher (corpo) ------------------------------
function hairBackPath(c) {
  c.beginPath(); c.moveTo(-150, -110);
  c.bezierCurveTo(-160, -250, 160, -250, 150, -110);
  c.bezierCurveTo(178, 10, 200, 220, 224, 450);
  c.quadraticCurveTo(200, 488, 150, 470); c.lineTo(-150, 470);
  c.quadraticCurveTo(-200, 488, -224, 450);
  c.bezierCurveTo(-200, 220, -178, 10, -150, -110); c.closePath();
}
function facePath(c) {
  c.beginPath(); c.moveTo(0, -172);
  c.bezierCurveTo(86, -172, 128, -110, 126, -30);
  c.bezierCurveTo(124, 52, 100, 112, 62, 146);
  c.quadraticCurveTo(26, 178, 0, 179);
  c.quadraticCurveTo(-26, 178, -62, 146);
  c.bezierCurveTo(-100, 112, -124, 52, -126, -30);
  c.bezierCurveTo(-128, -110, -86, -172, 0, -172); c.closePath();
}
function hairCurtain(c, s) {
  c.beginPath();
  c.moveTo(s * 4, -180);
  c.bezierCurveTo(s * 60, -176, s * 108, -120, s * 116, -60);
  c.bezierCurveTo(s * 124, 0, s * 116, 70, s * 112, 130);
  c.bezierCurveTo(s * 112, 220, s * 128, 330, s * 152, 470);
  c.lineTo(s * 226, 462);
  c.bezierCurveTo(s * 200, 300, s * 182, 120, s * 172, -20);
  c.bezierCurveTo(s * 166, -150, s * 110, -222, s * 4, -180); c.closePath();
}

function drawWomanFigure(c, p) {
  const sk = SKIN[p.light || 'night'];
  const smile = p.smile ?? 0.7;
  c.save(); c.translate(p.x, p.y); c.scale(p.s, p.s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  // cabelo de trás
  hairBackPath(c);
  let g = c.createLinearGradient(0, -240, 0, 480);
  g.addColorStop(0, '#16131b'); g.addColorStop(1, '#050407');
  c.fillStyle = g; c.fill();
  // pele do colo
  c.beginPath(); c.ellipse(0, 340, 110, 110, 0, 0, Math.PI * 2);
  c.fillStyle = sk.shade; c.fill();
  // pescoço
  c.beginPath(); c.moveTo(-52, 100); c.lineTo(52, 100); c.bezierCurveTo(54, 200, 60, 250, 80, 300); c.lineTo(-80, 300); c.bezierCurveTo(-60, 250, -54, 200, -52, 100); c.closePath();
  g = c.createLinearGradient(0, 100, 0, 300); g.addColorStop(0, sk.deep); g.addColorStop(0.35, sk.shade); g.addColorStop(1, sk.base);
  c.fillStyle = g; c.fill();
  c.strokeStyle = rgba(sk.deep, 0.5); c.lineWidth = 3;
  c.beginPath(); c.moveTo(-20, 180); c.quadraticCurveTo(-30, 240, -46, 290); c.stroke();
  c.beginPath(); c.moveTo(20, 180); c.quadraticCurveTo(30, 240, 46, 290); c.stroke();
  // clavículas
  c.strokeStyle = rgba(sk.deep, 0.35); c.lineWidth = 4;
  c.beginPath(); c.moveTo(-90, 318); c.quadraticCurveTo(-40, 330, -10, 320); c.stroke();
  c.beginPath(); c.moveTo(90, 318); c.quadraticCurveTo(40, 330, 10, 320); c.stroke();
  // blusa roxa
  const blouse = () => {
    c.beginPath(); c.moveTo(-84, 290);
    c.quadraticCurveTo(-210, 300, -300, 352);
    c.bezierCurveTo(-370, 390, -392, 540, -384, 720);
    c.lineTo(-400, 1320); c.lineTo(400, 1320); c.lineTo(384, 720);
    c.bezierCurveTo(392, 540, 370, 390, 300, 352);
    c.quadraticCurveTo(210, 300, 84, 290);
    c.lineTo(0, 440); c.closePath();
  };
  blouse();
  g = c.createRadialGradient(-40, 560, 40, 0, 600, 720);
  g.addColorStop(0, '#6a2f8a'); g.addColorStop(0.5, '#47195f'); g.addColorStop(1, '#1a0824');
  c.fillStyle = g; c.fill();
  c.save(); blouse(); c.clip();
  c.strokeStyle = 'rgba(15,2,22,0.55)'; c.lineWidth = 10;
  const folds = [[-200, 560, -60, 640, 60, 600], [-260, 760, -120, 820, 20, 800], [80, 700, 180, 760, 290, 720], [-150, 980, 0, 1040, 160, 990]];
  for (const f of folds) { c.beginPath(); c.moveTo(f[0], f[1]); c.quadraticCurveTo(f[2], f[3], f[4], f[5]); c.stroke(); }
  c.strokeStyle = 'rgba(170,110,210,0.22)'; c.lineWidth = 6;
  for (const f of folds) { c.beginPath(); c.moveTo(f[0] + 10, f[1] - 14); c.quadraticCurveTo(f[2], f[3] - 16, f[4] - 10, f[5] - 14); c.stroke(); }
  // separação dos braços
  c.strokeStyle = 'rgba(10,0,15,0.6)'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(-262, 440); c.quadraticCurveTo(-280, 700, -270, 1000); c.stroke();
  c.beginPath(); c.moveTo(262, 440); c.quadraticCurveTo(280, 700, 270, 1000); c.stroke();
  // luz de borda da janela (lado direito)
  g = c.createLinearGradient(240, 0, 400, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, p.light === 'dawn' ? 'rgba(255,170,90,0.45)' : 'rgba(110,140,200,0.32)');
  c.fillStyle = g; c.fillRect(200, 300, 220, 1100);
  c.restore();
  // gola
  c.strokeStyle = '#7b3d9c'; c.lineWidth = 9;
  c.beginPath(); c.moveTo(-84, 292); c.lineTo(0, 438); c.lineTo(84, 292); c.stroke();
  // braço esquerdo (lado da tela) estendido até o seu joelho
  if (p.reach !== false) {
    c.strokeStyle = '#3b1550'; c.lineWidth = 150;
    c.beginPath(); c.moveTo(-320, 420); c.quadraticCurveTo(-390, 760, -470, 980); c.lineTo(-760, 1400); c.stroke();
    c.strokeStyle = 'rgba(160,100,200,0.25)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-255, 430); c.quadraticCurveTo(-318, 760, -400, 980); c.lineTo(-680, 1400); c.stroke();
  }
  // braço direito descansando no colo
  c.strokeStyle = '#33114a'; c.lineWidth = 130;
  c.beginPath(); c.moveTo(330, 430); c.quadraticCurveTo(390, 760, 360, 990); c.quadraticCurveTo(300, 1160, 150, 1240); c.stroke();
  c.strokeStyle = 'rgba(160,110,210,0.28)'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(392, 450); c.quadraticCurveTo(452, 760, 420, 990); c.stroke();
  // celular dela (no colo)
  if (p.phone) {
    c.save(); c.translate(90, 1250); c.rotate(-0.12);
    drawPhoneBody(c, 0, 0, 0.8, p.phone);
    c.restore();
    // mão segurando por baixo; a unha comprida toca o campo de texto
    const tap = p.phoneTap || 0;
    drawLongHand(c, 330, 1700, 0.55, -Math.PI * 0.74, { curl: 0.25 - tap * 0.12, light: p.light });
  }
  // cinto de segurança
  if (p.belt !== false) drawBelt(c);
  c.restore();
  // cabeça (com inclinação)
  c.save(); c.translate(p.x, p.y); c.scale(p.s, p.s);
  c.translate(0, 150); c.rotate(p.tilt || 0); c.translate(0, -150);
  drawWomanHead(c, p, sk, smile);
  c.restore();
}
function drawBelt(c) {
  c.lineCap = 'butt';
  const path = () => { c.beginPath(); c.moveTo(330, 230); c.quadraticCurveTo(60, 640, -360, 1240); };
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 62; c.save(); c.translate(6, 12); path(); c.stroke(); c.restore();
  c.strokeStyle = '#141418'; c.lineWidth = 56; path(); c.stroke();
  c.strokeStyle = '#2d2d34'; c.lineWidth = 46; path(); c.stroke();
  c.setLineDash([12, 10]); c.strokeStyle = 'rgba(190,190,210,0.18)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(316, 222); c.quadraticCurveTo(46, 632, -374, 1232); c.stroke();
  c.beginPath(); c.moveTo(344, 238); c.quadraticCurveTo(74, 648, -346, 1248); c.stroke();
  c.setLineDash([]);
  // fivela
  c.save(); c.translate(-330, 1200); c.rotate(-0.95);
  c.fillStyle = '#5c6068'; c.beginPath(); c.roundRect(-40, -34, 80, 68, 10); c.fill();
  c.fillStyle = '#1a1b1f'; c.fillRect(-22, -12, 44, 24);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-36, -30, 72, 5);
  c.restore();
}
function drawWomanHead(c, p, sk, smile) {
  // rosto
  facePath(c);
  let g = c.createRadialGradient(-14, -30, 20, 0, -10, 210);
  g.addColorStop(0, sk.hi); g.addColorStop(0.5, sk.base); g.addColorStop(1, sk.shade);
  c.fillStyle = g; c.fill();
  c.save(); facePath(c); c.clip();
  // bochechas fundas e mandíbula
  for (const s of [-1, 1]) {
    g = c.createRadialGradient(s * 92, 60, 5, s * 92, 60, 80);
    g.addColorStop(0, rgba(sk.deep, 0.38)); g.addColorStop(1, rgba(sk.deep, 0));
    c.fillStyle = g; c.fillRect(s * 92 - 90, -30, 180, 180);
  }
  g = c.createLinearGradient(0, 110, 0, 180); g.addColorStop(0, rgba(sk.deep, 0)); g.addColorStop(1, rgba(sk.deep, 0.45));
  c.fillStyle = g; c.fillRect(-130, 100, 260, 90);
  // órbitas
  for (const s of [-1, 1]) {
    g = c.createRadialGradient(s * 52, -24, 8, s * 52, -24, 66);
    g.addColorStop(0, 'rgba(50,30,45,0.55)'); g.addColorStop(1, 'rgba(50,30,45,0)');
    c.fillStyle = g; c.fillRect(s * 52 - 70, -95, 140, 140);
  }
  // luz lateral da janela
  g = c.createLinearGradient(-130, 0, 130, 0);
  if (p.light === 'dawn') { g.addColorStop(0, 'rgba(80,30,20,0.25)'); g.addColorStop(0.6, 'rgba(255,160,80,0)'); g.addColorStop(1, 'rgba(255,170,90,0.45)'); }
  else { g.addColorStop(0, 'rgba(10,15,40,0.38)'); g.addColorStop(0.6, 'rgba(10,15,40,0)'); g.addColorStop(1, 'rgba(140,170,230,0.3)'); }
  c.fillStyle = g; c.fillRect(-140, -190, 280, 380);
  // sobrancelhas finas e altas
  c.strokeStyle = '#1b1419'; c.lineWidth = 5.5;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 18, -70); c.quadraticCurveTo(s * 62, -98, s * 100, -72); c.stroke(); }
  // olhos arregalados, sem emoção
  for (const s of [-1, 1]) womanEye(c, s * 52, -24, s, p);
  // nariz
  c.strokeStyle = rgba(sk.deep, 0.35); c.lineWidth = 4;
  c.beginPath(); c.moveTo(-10, -18); c.quadraticCurveTo(-14, 20, -20, 46); c.stroke();
  c.fillStyle = rgba(sk.hi, 0.5); c.beginPath(); c.ellipse(2, 44, 10, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = rgba(sk.deep, 0.7);
  c.beginPath(); c.ellipse(-12, 56, 7, 4, 0.3, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(13, 56, 7, 4, -0.3, 0, Math.PI * 2); c.fill();
  // sorriso largo demais
  drawSmile(c, smile, sk);
  c.restore();
  // rachaduras (amanhecer)
  if (p.crack) drawCracks(c, p.crack);
  // franja / cortinas de cabelo
  for (const s of [-1, 1]) {
    hairCurtain(c, s);
    g = c.createLinearGradient(s * 100, -200, s * 200, 400);
    g.addColorStop(0, '#1d1922'); g.addColorStop(1, '#060508');
    c.fillStyle = g; c.fill();
    c.save(); hairCurtain(c, s); c.clip();
    const r = rng(s > 0 ? 31 : 37);
    for (let i = 0; i < 26; i++) {
      const u = r();
      c.strokeStyle = r() < 0.5 ? 'rgba(90,85,105,0.22)' : 'rgba(0,0,0,0.4)'; c.lineWidth = 1.5 + r() * 2;
      c.beginPath(); c.moveTo(s * (10 + u * 120), -185 + r() * 20);
      c.bezierCurveTo(s * (110 + u * 40), -110, s * (120 + u * 50), 120, s * (140 + u * 80), 470); c.stroke();
    }
    c.restore();
  }
  // risca do cabelo
  c.strokeStyle = rgba(sk.shade, 0.6); c.lineWidth = 3; c.beginPath(); c.moveTo(0, -182); c.lineTo(4, -150); c.stroke();
  // brincos dourados (argolas)
  for (const s of [-1, 1]) {
    const ex = s * 128, ey = 104, sw = Math.sin((p.t || 0) * 1.7 + s) * 0.08;
    c.save(); c.translate(ex, 66); c.rotate(sw); c.translate(-ex, -66);
    c.fillStyle = '#c9982e'; c.beginPath(); c.arc(ex, 66, 6, 0, Math.PI * 2); c.fill();
    const gg = c.createLinearGradient(ex - 30, ey - 30, ex + 30, ey + 30);
    gg.addColorStop(0, '#fff1a8'); gg.addColorStop(0.35, '#d7a73a'); gg.addColorStop(0.7, '#7a5310'); gg.addColorStop(1, '#e7c25a');
    c.strokeStyle = gg; c.lineWidth = 7;
    c.beginPath(); c.arc(ex, ey, 30, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,250,220,0.95)'; c.beginPath(); c.arc(ex - s * 18, ey - 22, 3.5, 0, Math.PI * 2); c.fill();
    c.restore();
  }
}
function womanEye(c, ex, ey, s, p) {
  const ew = 40, up = 21 * (p.eyeOpen ?? 1), lo = 17 * (p.eyeOpen ?? 1);
  c.save(); c.translate(ex, ey);
  const shape = () => { c.beginPath(); c.moveTo(-ew, 2); c.bezierCurveTo(-ew * 0.5, -up * 1.35, ew * 0.5, -up * 1.35, ew, 0); c.bezierCurveTo(ew * 0.5, lo * 1.3, -ew * 0.5, lo * 1.3, -ew, 2); c.closePath(); };
  c.save(); shape(); c.clip();
  let g = c.createRadialGradient(0, 0, 3, 0, 0, ew);
  g.addColorStop(0, '#f3eee6'); g.addColorStop(0.7, '#d9d1c8'); g.addColorStop(1, '#9a8f8c');
  c.fillStyle = g; c.fillRect(-ew, -40, ew * 2, 80);
  const gx = (p.gaze || 0) * 10, gy = p.gazeY || 0;
  c.fillStyle = '#141011'; c.beginPath(); c.arc(gx, gy, 11.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(80,60,60,0.6)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#000'; c.beginPath(); c.arc(gx, gy, 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(gx - 4, gy - 4, 2.2, 0, Math.PI * 2); c.fill();
  g = c.createLinearGradient(0, -up * 1.3, 0, 0); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(-ew, -up * 1.4, ew * 2, up * 1.4);
  c.restore();
  c.strokeStyle = '#0b0809'; c.lineWidth = 4.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-ew - 2, 2); c.bezierCurveTo(-ew * 0.5, -up * 1.35, ew * 0.5, -up * 1.35, ew + 3, -1); c.stroke();
  c.lineWidth = 2;
  for (let i = 0; i < 7; i++) { const u = (i + 1) / 8, x = lerp(-ew, ew, u), y = -Math.sin(u * Math.PI) * up * 1.0; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 2 + (u - .5) * 8, y - 7); c.stroke(); }
  c.strokeStyle = 'rgba(160,60,70,0.7)'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(-ew + 2, 3); c.bezierCurveTo(-ew * 0.5, lo * 1.3, ew * 0.5, lo * 1.3, ew - 2, 1); c.stroke();
  c.strokeStyle = 'rgba(40,20,30,0.35)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-ew * 0.7, lo * 1.3 + 12); c.quadraticCurveTo(0, lo * 1.3 + 22, ew * 0.7, lo * 1.3 + 10); c.stroke();
  c.restore();
}
function drawSmile(c, m, sk) {
  const cw = 58 + 46 * m, cy = 104 - 14 * m, open = 10 + 12 * m;
  // dobras do sorriso
  c.strokeStyle = rgba(sk.deep, 0.42); c.lineWidth = 4;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 30, 58); c.quadraticCurveTo(s * (cw + 6), 72, s * (cw + 10), cy + 16); c.stroke(); }
  // boca aberta
  const mouth = () => {
    c.beginPath(); c.moveTo(-cw, cy);
    c.bezierCurveTo(-cw * 0.55, cy + 6, -cw * 0.25, 96, 0, 98);
    c.bezierCurveTo(cw * 0.25, 96, cw * 0.55, cy + 6, cw, cy);
    c.bezierCurveTo(cw * 0.6, cy + open * 1.7, -cw * 0.6, cy + open * 1.7, -cw, cy); c.closePath();
  };
  mouth(); c.fillStyle = '#1e0508'; c.fill();
  c.save(); mouth(); c.clip();
  // dentes de cima
  c.fillStyle = '#e8e0cc';
  c.beginPath(); c.moveTo(-cw, cy - 2); c.bezierCurveTo(-cw * 0.55, cy + 4, -cw * 0.25, 94, 0, 96); c.bezierCurveTo(cw * 0.25, 94, cw * 0.55, cy + 4, cw, cy - 2);
  c.lineTo(cw, cy + 8); c.bezierCurveTo(cw * 0.5, cy + open * 0.95, -cw * 0.5, cy + open * 0.95, -cw, cy + 8); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(80,60,50,0.55)'; c.lineWidth = 1.6;
  for (let i = -6; i <= 6; i++) { const x = i * cw / 7; c.beginPath(); c.moveTo(x, 90); c.lineTo(x * 0.98, cy + open * 0.95); c.stroke(); }
  // dentes de baixo (sombra)
  c.fillStyle = 'rgba(200,190,170,0.5)';
  c.beginPath(); c.ellipse(0, cy + open * 1.55, cw * 0.55, 7, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  // lábios (batom escuro)
  c.fillStyle = '#6d1622';
  c.beginPath(); c.moveTo(-cw - 2, cy);
  c.bezierCurveTo(-cw * 0.55, cy - 4, -cw * 0.3, 82, -12, 84); c.quadraticCurveTo(0, 88, 12, 84);
  c.bezierCurveTo(cw * 0.3, 82, cw * 0.55, cy - 4, cw + 2, cy);
  c.bezierCurveTo(cw * 0.55, cy + 6, cw * 0.25, 96, 0, 98);
  c.bezierCurveTo(-cw * 0.25, 96, -cw * 0.55, cy + 6, -cw - 2, cy); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-cw, cy + 1);
  c.bezierCurveTo(-cw * 0.6, cy + open * 1.7, cw * 0.6, cy + open * 1.7, cw, cy + 1);
  c.bezierCurveTo(cw * 0.6, cy + open * 1.7 + 16, -cw * 0.6, cy + open * 1.7 + 16, -cw, cy + 1); c.closePath();
  c.fillStyle = '#7d1c2a'; c.fill();
  c.fillStyle = 'rgba(255,200,200,0.25)'; c.beginPath(); c.ellipse(0, cy + open * 1.7 + 6, cw * 0.3, 3.5, 0, 0, Math.PI * 2); c.fill();
  // cantos da boca afundados
  c.fillStyle = rgba(sk.deep, 0.6);
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * (cw + 3), cy, 4, 0, Math.PI * 2); c.fill(); }
}

// ------------------------------ rachaduras ---------------------------------
function buildCracks() {
  const r = rng(909);
  const grow = (x, y, a, len, w, d, t0) => {
    if (d > 5) return;
    const pts = [[x, y]]; const n = 7;
    for (let i = 0; i < n; i++) { a += (r() - .5) * 0.9; x += Math.cos(a) * len / n; y += Math.sin(a) * len / n; pts.push([x, y]); }
    CRACKS.push({ pts, w, t0, t1: t0 + 0.12 + d * 0.04 });
    const nb = d < 2 ? 3 : (r() < 0.6 ? 2 : 1);
    for (let i = 0; i < nb; i++) {
      const k = 2 + ((r() * (n - 2)) | 0);
      grow(pts[k][0], pts[k][1], a + (r() - .5) * 2.0, len * (0.5 + r() * 0.3), w * 0.65, d + 1, t0 + 0.1 + k * 0.02);
    }
  };
  const ox = 34, oy = -70;
  for (let i = 0; i < 7; i++) grow(ox, oy, i / 7 * Math.PI * 2 + r() * 0.4, 110 + r() * 60, 5, 0, r() * 0.15);
}
function drawCracks(c, k) {
  // k: 0..1 (progresso); usa coordenadas da cabeça
  c.save(); facePath(c); c.clip();
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const cr of CRACKS) {
    const u = clamp((k - cr.t0) / (cr.t1 - cr.t0));
    if (u <= 0) continue;
    const n = cr.pts.length - 1, m = u * n;
    c.beginPath(); c.moveTo(cr.pts[0][0], cr.pts[0][1]);
    for (let i = 1; i <= Math.ceil(m); i++) {
      const f = Math.min(1, m - (i - 1));
      c.lineTo(lerp(cr.pts[i - 1][0], cr.pts[i][0], f), lerp(cr.pts[i - 1][1], cr.pts[i][1], f));
    }
    c.strokeStyle = 'rgba(255,190,110,0.55)'; c.lineWidth = cr.w + 5; c.stroke();
    c.strokeStyle = '#1a0805'; c.lineWidth = cr.w; c.stroke();
    c.strokeStyle = 'rgba(255,235,190,0.9)'; c.lineWidth = Math.max(0.8, cr.w * 0.3); c.stroke();
  }
  c.restore();
}
function buildShards() {
  const r = rng(515);
  const cs = 54, x0 = -10, y0 = -10, nx = 21, ny = 37;
  const P2 = [];
  for (let j = 0; j <= ny; j++) { P2.push([]); for (let i = 0; i <= nx; i++) { const jx = (i > 0 && i < nx) ? (r() - .5) * cs * 0.7 : 0, jy = (j > 0 && j < ny) ? (r() - .5) * cs * 0.7 : 0; P2[j].push([x0 + i * cs + jx, y0 + j * cs + jy]); } }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const q = [P2[j][i], P2[j][i + 1], P2[j + 1][i + 1], P2[j + 1][i]];
    const tris = r() < 0.5 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : [[q[0], q[1], q[3]], [q[1], q[2], q[3]]];
    for (const tri of tris) {
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
      SHARDS.push({ tri, cx, cy, vx: (r() - .5) * 120, vy: -40 - r() * 140, spin: (r() - .5) * 5, jit: r() });
    }
  }
}

// ------------------------------ mundo "lado" --------------------------------
function sideWinPath(g) {
  g.beginPath(); g.moveTo(70, 300); g.lineTo(840, 262);
  g.quadraticCurveTo(1090, 256, 1240, 430); g.lineTo(1260, 980); g.lineTo(70, 980);
  g.quadraticCurveTo(30, 980, 30, 940); g.lineTo(30, 340); g.quadraticCurveTo(30, 302, 70, 300); g.closePath();
}
function buildSideBG(day) {
  const C = mk(W + 2 * SOX, H + 2 * SOY + 700), g = C.getContext('2d'); g.translate(SOX, SOY);
  const L = (a, b) => day ? b : a;
  let gr = g.createLinearGradient(0, -SOY, 0, H + 700);
  gr.addColorStop(0, L('#08090c', '#3a2a24')); gr.addColorStop(0.25, L('#13151b', '#5a4035')); gr.addColorStop(1, L('#050507', '#22160f'));
  g.fillStyle = gr; g.fillRect(-SOX, -SOY, W + 2 * SOX, H + 2 * SOY + 700);
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 4;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-SOX, 40 + i * 70); g.quadraticCurveTo(540, 10 + i * 70, W + SOX, 60 + i * 70); g.stroke(); }
  // janela
  g.globalCompositeOperation = 'destination-out'; sideWinPath(g); g.fill(); g.globalCompositeOperation = 'source-over';
  g.strokeStyle = L('#050506', '#1d130e'); g.lineWidth = 30; sideWinPath(g); g.stroke();
  g.strokeStyle = L('rgba(120,140,180,0.25)', 'rgba(255,190,130,0.4)'); g.lineWidth = 3; sideWinPath(g); g.stroke();
  // porta
  g.beginPath(); g.moveTo(700, 996); g.lineTo(W + SOX, 996); g.lineTo(W + SOX, H + 700); g.lineTo(700, H + 700); g.closePath();
  gr = g.createLinearGradient(0, 996, 0, 2200); gr.addColorStop(0, L('#1a1b21', '#6b4b3b')); gr.addColorStop(1, L('#060607', '#2a1a12'));
  g.fillStyle = gr; g.fill();
  g.strokeStyle = L('rgba(140,160,200,0.25)', 'rgba(255,200,150,0.4)'); g.lineWidth = 4; g.beginPath(); g.moveTo(700, 998); g.lineTo(W + SOX, 998); g.stroke();
  g.beginPath(); g.roundRect(820, 1290, 600, 90, 30); g.fillStyle = L('#101115', '#4a3328'); g.fill();
  g.strokeStyle = L('rgba(140,160,200,0.18)', 'rgba(255,200,150,0.3)'); g.lineWidth = 3; g.stroke();
  g.beginPath(); g.roundRect(900, 1140, 140, 34, 12); g.fillStyle = L('#2d3038', '#a68f80'); g.fill();
  // alto-falante
  g.fillStyle = L('rgba(0,0,0,0.5)', 'rgba(40,20,10,0.4)');
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(950 + i * 22 + (j % 2) * 11, 1560 + j * 22, 5, 0, Math.PI * 2); g.fill(); }
  // encosto do banco traseiro atrás dela
  g.beginPath(); g.moveTo(-SOX, 960); g.quadraticCurveTo(300, 900, 880, 960); g.lineTo(900, H + 700); g.lineTo(-SOX, H + 700); g.closePath();
  gr = g.createLinearGradient(0, 900, 0, 1900); gr.addColorStop(0, L('#22242b', '#7a5848')); gr.addColorStop(0.2, L('#15161b', '#4a3428')); gr.addColorStop(1, L('#08080a', '#1e130d'));
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 6;
  for (const x of [80, 360, 640]) { g.beginPath(); g.moveTo(x, 940); g.lineTo(x + 10, 1900); g.stroke(); }
  g.strokeStyle = L('rgba(130,150,190,0.25)', 'rgba(255,200,150,0.45)'); g.lineWidth = 3;
  g.beginPath(); g.moveTo(-SOX, 962); g.quadraticCurveTo(300, 902, 880, 962); g.stroke();
  // encosto de cabeça
  g.beginPath(); g.roundRect(468, 590, 290, 190, 60);
  gr = g.createLinearGradient(0, 590, 0, 780); gr.addColorStop(0, L('#2a2c33', '#8a6450')); gr.addColorStop(1, L('#0e0f12', '#3a281e'));
  g.fillStyle = gr; g.fill();
  g.fillStyle = L('#3a3e46', '#8a7a70'); g.fillRect(540, 780, 12, 190); g.fillRect(676, 780, 12, 190);
  // assento (embaixo do colo)
  g.beginPath(); g.moveTo(-SOX, 2100); g.quadraticCurveTo(400, 2040, 1000, 2100); g.lineTo(1000, H + 700); g.lineTo(-SOX, H + 700); g.closePath();
  g.fillStyle = L('#0d0e11', '#3b281f'); g.fill();
  // ruído de tecido
  const r = rng(day ? 2 : 3); g.fillStyle = 'rgba(255,255,255,0.02)';
  for (let i = 0; i < 9000; i++) g.fillRect(-SOX + r() * (W + 2 * SOX), 900 + r() * 1700, 2, 2);
  return C;
}
function buildSide() {
  SB = buildSideBG(false); SBD = buildSideBG(true);
  WL = mk(W, H); WLC = mk(W, H);
  const r = rng(71);
  for (let i = 0; i < 26; i++) SIDE_TREES.push({ x0: r() * 2600, h: 160 + r() * 260, w: 60 + r() * 90, layer: r() < 0.55 ? 0 : 1, spr: (r() * 4) | 0 });
  buildCracks(); buildShards();
}
function drawSideExterior(c, t, day) {
  c.save(); sideWinPath(c); c.clip();
  let g = c.createLinearGradient(0, 260, 0, 980);
  g.addColorStop(0, '#04060c'); g.addColorStop(0.6, '#0e1728'); g.addColorStop(1, '#070a10');
  c.fillStyle = g; c.fillRect(0, 240, 1300, 760);
  if (day > 0) {
    c.globalAlpha = day;
    g = c.createLinearGradient(0, 260, 0, 980);
    g.addColorStop(0, '#6d8fc0'); g.addColorStop(0.45, '#f0b48a'); g.addColorStop(0.75, '#ffd59a'); g.addColorStop(1, '#a5705a');
    c.fillStyle = g; c.fillRect(0, 240, 1300, 760);
    g = c.createRadialGradient(980, 720, 10, 980, 720, 620);
    g.addColorStop(0, 'rgba(255,250,225,1)'); g.addColorStop(0.12, 'rgba(255,220,150,0.85)'); g.addColorStop(0.5, 'rgba(255,170,100,0.3)'); g.addColorStop(1, 'rgba(255,150,90,0)');
    c.fillStyle = g; c.fillRect(0, 240, 1300, 760);
    c.globalAlpha = 1;
  } else {
    g = c.createRadialGradient(300, 380, 4, 300, 380, 200);
    g.addColorStop(0, 'rgba(220,230,255,0.85)'); g.addColorStop(0.07, 'rgba(170,190,240,0.3)'); g.addColorStop(1, 'rgba(120,140,200,0)');
    c.fillStyle = g; c.fillRect(100, 240, 420, 400);
  }
  const d = driveDist(t);
  // linha de árvores distante
  c.fillStyle = day ? mixc('#05070b', '#4a2c2a', day) : '#05070b';
  c.beginPath(); c.moveTo(0, 990);
  for (let x = 0; x <= 1300; x += 14) c.lineTo(x, 760 - 40 * Math.abs(vn((x - d * 3) * 0.01, 2)) - 20 * Math.abs(vn((x - d * 3) * 0.04, 4)));
  c.lineTo(1300, 990); c.closePath(); c.fill();
  // árvores próximas passando rápido (da esquerda para a direita)
  for (const tr of SIDE_TREES) {
    const sp = tr.layer ? 52 : 26;
    const x = ((tr.x0 + d * sp) % 2600) - 700;
    const sc = tr.layer ? 2.3 : 1.2;
    const spr = TREES[tr.spr] ? TREES[tr.spr].spr : TREES[0].spr;
    c.globalAlpha = tr.layer ? 0.95 : 0.85;
    c.drawImage(spr, x, 1000 - tr.h * sc, tr.w * sc, tr.h * sc);
  }
  c.globalAlpha = 1;
  // reflexo no vidro
  g = c.createLinearGradient(0, 300, 600, 980);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(170,190,230,0.06)'); g.addColorStop(0.55, 'rgba(170,190,230,0)');
  c.fillStyle = g; c.fillRect(0, 240, 1300, 760);
  c.restore();
}

// desenha o mundo "lado" completo
// o = { cam, day, woman:{...}|null (parâmetros relativos), shatter:t|null, emptyBelt }
function drawSide(c, t, o) {
  const cm = o.cam, day = o.day || 0;
  c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
  drawSideExterior(c, t, day);
  if (day < 1) c.drawImage(SB, -SOX, -SOY);
  if (day > 0) { c.globalAlpha = day; c.drawImage(SBD, -SOX, -SOY); c.globalAlpha = 1; }
  c.restore();
  if (o.woman) {
    const w = o.woman;
    const g = WL.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, W, H);
    g.save(); camera(g, cm.x, cm.y, cm.z, cm.rot || 0);
    // "mais perto": escala em torno de um ponto à esquerda (onde você está)
    const k = w.close || 0;
    const px = WOMAN_BASE.x + (w.dx || 0) - k * 120, py = WOMAN_BASE.y + (w.dy || 0) + k * 40;
    const s = WOMAN_BASE.s * (1 + k * 1.6);
    drawWomanFigure(g, Object.assign({ t, light: day > 0.5 ? 'dawn' : 'night' }, w, { x: px, y: py, s, belt: o.shatter == null }));
    g.restore();
    if (day > 0 && day <= 0.5) { // transição de luz
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = `rgba(255,150,80,${day * 0.5})`; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }
    if (o.shatter != null) drawShattered(c, o.shatter, o.shatterX, o.shatterY);
    else c.drawImage(WL, 0, 0);
  }
  if (o.emptyBelt) {
    c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
    c.translate(WOMAN_BASE.x, WOMAN_BASE.y); c.scale(WOMAN_BASE.s, WOMAN_BASE.s);
    drawBelt(c);
    c.restore();
  }
}
// k: tempo desde o início do desmanche (s)
function drawShattered(c, k, ox = 560, oy = 600) {
  const g = WLC.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'copy'; g.drawImage(WL, 0, 0); g.globalCompositeOperation = 'source-over';
  const loose = [];
  const wg = WL.getContext('2d');
  wg.save(); wg.setTransform(1, 0, 0, 1, 0, 0); wg.globalCompositeOperation = 'destination-out';
  wg.beginPath();
  for (const s of SHARDS) {
    const dist = Math.hypot(s.cx - ox, (s.cy - oy) * 0.8);
    const td = dist / 420 + s.jit * 0.35;
    const age = k - td;
    if (age > 0) { loose.push([s, age]); const [a, b, cc] = s.tri; wg.moveTo(a[0], a[1]); wg.lineTo(b[0], b[1]); wg.lineTo(cc[0], cc[1]); wg.closePath(); }
  }
  wg.fill(); wg.restore();
  c.drawImage(WL, 0, 0);
  for (const [s, age] of loose) {
    const life = 1.4; if (age > life) continue;
    const u = age / life;
    const dx = s.vx * age + (s.cx - ox) * 0.25 * age, dy = s.vy * age - 30 * age * age;
    c.save();
    c.globalAlpha = (1 - u) ** 1.5;
    c.translate(s.cx + dx, s.cy + dy); c.rotate(s.spin * age); c.scale(1 - u * 0.6, 1 - u * 0.6); c.translate(-s.cx, -s.cy);
    const [a, b, cc] = s.tri;
    c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.closePath(); c.clip();
    const minx = Math.max(0, Math.min(a[0], b[0], cc[0]) - 2), miny = Math.max(0, Math.min(a[1], b[1], cc[1]) - 2);
    const maxx = Math.min(W, Math.max(a[0], b[0], cc[0]) + 2), maxy = Math.min(H, Math.max(a[1], b[1], cc[1]) + 2);
    if (maxx > minx && maxy > miny) c.drawImage(WLC, minx, miny, maxx - minx, maxy - miny, minx, miny, maxx - minx, maxy - miny);
    // borda incandescente
    c.strokeStyle = `rgba(255,210,150,${0.5 * (1 - u)})`; c.lineWidth = 2; c.stroke();
    c.restore();
  }
  // poeira dourada
  const r = rng(808);
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 160; i++) {
    const bx = 150 + r() * 800, by = 300 + r() * 1300, t0 = r() * 3.5;
    const age = k - t0; if (age < 0 || age > 2.5) continue;
    const u = age / 2.5;
    c.fillStyle = `rgba(255,${200 + r() * 50},${140 + r() * 60},${(1 - u) * 0.8})`;
    c.beginPath(); c.arc(bx + Math.sin(age * 2 + i) * 20, by - age * 90, 1.5 + r() * 3, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
