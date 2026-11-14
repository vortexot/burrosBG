'use strict';
// ---------------------------------------------------------------------------
// Objetos: celulares (seu e o dela), papel com as regras, suas mãos,
// visão do colo e do assoalho.
// ---------------------------------------------------------------------------
let PAGE1, PAGE2, PAGEBACK, LAPB, FLOOR;
const PAGE = { w: 860, h: 1120 };
const RULE_Y = {}; // centro (y no papel) de cada regra, para a câmera

// ------------------------------- celular ------------------------------------
// logical screen 390 x 844; corpo 414 x 868, centrado na origem
function drawPhoneBody(c, x, y, s, scr) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(-207 + 8, -434 + 14, 414, 868, 62); c.fill();
  c.beginPath(); c.roundRect(-207, -434, 414, 868, 62);
  const g = c.createLinearGradient(-207, 0, 207, 0); g.addColorStop(0, '#3a3c42'); g.addColorStop(0.5, '#15161a'); g.addColorStop(1, '#2c2e33');
  c.fillStyle = g; c.fill();
  c.beginPath(); c.roundRect(-201, -428, 402, 856, 57); c.fillStyle = '#050505'; c.fill();
  c.save(); c.beginPath(); c.roundRect(-195, -422, 390, 844, 52); c.clip();
  c.translate(-195, -422);
  if (scr) drawScreen(c, scr);
  c.restore();
  // ilha
  c.fillStyle = '#000'; c.beginPath(); c.roundRect(-58, -410, 116, 34, 17); c.fill();
  // reflexo no vidro
  c.save(); c.beginPath(); c.roundRect(-195, -422, 390, 844, 52); c.clip();
  const r = c.createLinearGradient(-195, -422, 195, 422);
  r.addColorStop(0, 'rgba(255,255,255,0.06)'); r.addColorStop(0.35, 'rgba(255,255,255,0)'); r.addColorStop(0.62, 'rgba(255,255,255,0)'); r.addColorStop(0.68, 'rgba(255,255,255,0.05)'); r.addColorStop(0.75, 'rgba(255,255,255,0)');
  c.fillStyle = r; c.fillRect(-195, -422, 390, 844);
  c.restore();
  c.restore();
}
function wrapLines(c, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function statusBar(c, time, dim) {
  c.fillStyle = dim ? 'rgba(255,255,255,0.9)' : '#fff';
  c.font = '600 19px Inter'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillText(time, 46, 30);
  // sinal + bateria
  for (let i = 0; i < 4; i++) c.fillRect(290 + i * 7, 36 - i * 4, 5, 4 + i * 4);
  c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); c.roundRect(326, 23, 30, 14, 4); c.stroke();
  c.fillStyle = '#fff'; c.fillRect(329, 26, 8, 8); c.fillRect(358, 27, 2.5, 6);
}
function bubble(c, text, y, out, k, color) {
  if (k <= 0) return 0;
  c.font = '400 25px Inter';
  const lines = wrapLines(c, text, 250);
  const tw = Math.max(...lines.map(l => c.measureText(l).width));
  const bw = tw + 36, bh = lines.length * 33 + 44;
  const bx = out ? 390 - 14 - bw : 14;
  c.save();
  const ox = out ? bx + bw : bx, oy = y + bh;
  const sc = 0.6 + 0.4 * eout(clamp(k));
  c.globalAlpha = clamp(k * 1.6);
  c.translate(ox, oy); c.scale(sc, sc); c.translate(-ox, -oy);
  c.fillStyle = color || (out ? '#6b3fd4' : '#26262a');
  c.beginPath(); c.roundRect(bx, y, bw, bh, 22); c.fill();
  c.fillStyle = '#f4f4f6'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  lines.forEach((l, i) => c.fillText(l, bx + 18, y + 34 + i * 33));
  c.font = '400 14px Inter'; c.fillStyle = 'rgba(255,255,255,0.55)'; c.textAlign = 'right';
  c.fillText('4:07', bx + bw - (out ? 38 : 14), y + bh - 10);
  if (out) { // dois "checks" azuis
    c.strokeStyle = '#8fd0ff'; c.lineWidth = 2;
    for (const dx of [0, 6]) { c.beginPath(); c.moveTo(bx + bw - 32 + dx, y + bh - 15); c.lineTo(bx + bw - 28 + dx, y + bh - 11); c.lineTo(bx + bw - 21 + dx, y + bh - 20); c.stroke(); }
  }
  c.restore();
  return bh;
}
function typingBubble(c, y, t, out) {
  const bx = out ? 390 - 14 - 92 : 14;
  c.fillStyle = out ? '#6b3fd4' : '#26262a'; c.beginPath(); c.roundRect(bx, y, 92, 52, 24); c.fill();
  for (let i = 0; i < 3; i++) {
    const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 0.9));
    c.fillStyle = `rgba(230,230,235,${a})`; c.beginPath(); c.arc(bx + 26 + i * 20, y + 26 - a * 3, 6, 0, Math.PI * 2); c.fill();
  }
}
function drawScreen(c, s) {
  const bright = s.bright ?? 1;
  if (s.type === 'lock') {
    let g = c.createLinearGradient(0, 0, 390, 844);
    g.addColorStop(0, '#1b1530'); g.addColorStop(0.5, '#0b1022'); g.addColorStop(1, '#05060c');
    c.fillStyle = g; c.fillRect(0, 0, 390, 844);
    g = c.createRadialGradient(300, 650, 10, 300, 650, 400); g.addColorStop(0, 'rgba(120,60,160,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, 390, 844);
    statusBar(c, '', true);
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.font = '600 21px Inter'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText(s.date || 'sábado, 14 de novembro', 195, 132);
    c.fillStyle = '#fff'; c.font = '500 128px Oswald'; c.fillText(s.time, 195, 270);
    if (s.notif) {
      const k = clamp(s.notif);
      c.save(); c.globalAlpha = k; c.translate(0, (1 - eout(k)) * -40);
      c.fillStyle = 'rgba(60,60,70,0.75)'; c.beginPath(); c.roundRect(14, 330, 362, 96, 22); c.fill();
      c.fillStyle = '#34c759'; c.beginPath(); c.roundRect(28, 350, 40, 40, 10); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(48, 368, 12, 10, 0, 0, Math.PI * 2); c.fill();
      c.textAlign = 'left'; c.font = '700 20px Inter'; c.fillText('Mãe', 82, 362);
      c.font = '400 19px Inter'; c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillText(s.notifText || '1 nova mensagem', 82, 392);
      c.textAlign = 'right'; c.font = '400 15px Inter'; c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillText('agora', 362, 362);
      c.restore();
    }
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.roundRect(130, 818, 130, 6, 3); c.fill();
  } else {
    const her = s.type === 'herchat';
    c.fillStyle = '#0a0a0c'; c.fillRect(0, 0, 390, 844);
    statusBar(c, s.time || '4:07');
    // cabeçalho
    c.fillStyle = '#141417'; c.fillRect(0, 50, 390, 86);
    c.strokeStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(0, 136); c.lineTo(390, 136); c.stroke();
    c.strokeStyle = '#4da3ff'; c.lineWidth = 3.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(28, 78); c.lineTo(16, 93); c.lineTo(28, 108); c.stroke();
    const ag = c.createLinearGradient(50, 70, 96, 116);
    if (her) { ag.addColorStop(0, '#3a7bd5'); ag.addColorStop(1, '#1c3f7a'); } else { ag.addColorStop(0, '#e0628a'); ag.addColorStop(1, '#8a2a52'); }
    c.fillStyle = ag; c.beginPath(); c.arc(70, 93, 24, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.font = '700 22px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(her ? 'F' : 'M', 70, 94);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = '700 23px Inter'; c.fillText(her ? 'Filho' : 'Mãe', 108, 90);
    c.font = '400 16px Inter'; c.fillStyle = s.typing ? '#34c759' : 'rgba(255,255,255,0.55)';
    c.fillText(s.typing ? 'digitando…' : 'online', 108, 114);
    // data
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.roundRect(150, 156, 90, 28, 14); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.font = '600 14px Inter'; c.textAlign = 'center'; c.fillText('HOJE', 195, 175);
    let y = 204;
    const msgs = s.msgs || [];
    for (const m of msgs) { const h = bubble(c, m.text, y, her, m.k); y += h + 14; }
    if (s.typing && s.typingBubble !== false) typingBubble(c, y, s.t || 0, her);
    // campo de digitar
    c.fillStyle = '#141417'; c.fillRect(0, 752, 390, 92);
    c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(58, 768, 270, 44, 22); c.stroke();
    c.font = '400 20px Inter'; c.textAlign = 'left';
    if (s.draft) {
      c.fillStyle = '#fff'; c.fillText(s.draft, 76, 798);
      if (Math.floor((s.t || 0) * 2.4) % 2 === 0) { const w = c.measureText(s.draft).width; c.fillStyle = '#4da3ff'; c.fillRect(78 + w, 778, 2.5, 26); }
    } else { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillText('Mensagem', 76, 798); }
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(22, 790); c.lineTo(42, 790); c.moveTo(32, 780); c.lineTo(32, 800); c.stroke();
    c.beginPath(); c.roundRect(347, 778, 16, 22, 8); c.stroke(); c.beginPath(); c.moveTo(355, 806); c.lineTo(355, 812); c.stroke();
  }
  if (bright < 1) { c.fillStyle = `rgba(0,0,0,${1 - bright})`; c.fillRect(0, 0, 390, 844); }
}

// ------------------------------ suas mãos -----------------------------------
const MYSKIN = { base: '#9a6c55', shade: '#4a2e24', hi: '#c99a7e' };
// mão genérica (dedos para -y); pinch 0..1 fecha os dedos
function drawMyHand(c, x, y, s, rot, pinch, light) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const sk = MYSKIN;
  c.beginPath(); c.roundRect(-62, -150, 124, 170, 46);
  const g = c.createLinearGradient(0, -150, 0, 20); g.addColorStop(0, sk.hi); g.addColorStop(1, sk.shade);
  c.fillStyle = g; c.fill();
  const fx = [-44, -15, 15, 44], fl = [78, 92, 88, 66];
  fx.forEach((x0, i) => {
    const L = fl[i] * (1 - pinch * 0.35), a = -Math.PI / 2 + (i - 1.5) * 0.08 + pinch * (1.5 - i) * 0.15;
    const ex = x0 + Math.cos(a) * L, ey = -140 + Math.sin(a) * L;
    c.strokeStyle = sk.shade; c.lineWidth = 31; c.beginPath(); c.moveTo(x0, -140); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = sk.base; c.lineWidth = 25; c.beginPath(); c.moveTo(x0, -140); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = rgba(sk.hi, 0.6); c.lineWidth = 7; c.beginPath(); c.moveTo(x0 - 4, -140); c.lineTo(ex - 4, ey + 4); c.stroke();
    c.fillStyle = 'rgba(240,200,190,0.55)'; c.beginPath(); c.ellipse(ex, ey + 6, 8, 11, a + Math.PI / 2, 0, Math.PI * 2); c.fill();
  });
  // polegar
  const ta = -Math.PI * 0.72 + pinch * 0.5;
  c.strokeStyle = sk.shade; c.lineWidth = 36; c.beginPath(); c.moveTo(-50, -50); c.lineTo(-50 + Math.cos(ta) * 90, -50 + Math.sin(ta) * 90); c.stroke();
  c.strokeStyle = sk.base; c.lineWidth = 29; c.beginPath(); c.moveTo(-50, -50); c.lineTo(-50 + Math.cos(ta) * 90, -50 + Math.sin(ta) * 90); c.stroke();
  // manga
  c.fillStyle = '#16181d'; c.beginPath(); c.roundRect(-80, 0, 160, 140, 20); c.fill();
  c.restore();
}
// mão segurando algo pela borda inferior: side -1 = esquerda, 1 = direita
// origem = canto inferior do objeto segurado; só o polegar aparece na frente
function drawHoldHand(c, side, x, y, s, glow) {
  c.save(); c.translate(x, y); c.scale(-s * side, s);
  const sk = MYSKIN;
  const lit = (col, k) => mixc(col, '#c4d0ec', k * glow);
  // manga do moletom
  c.beginPath(); c.moveTo(-260, 560); c.bezierCurveTo(-250, 380, -200, 260, -150, 210); c.lineTo(60, 250); c.bezierCurveTo(80, 360, 90, 460, 110, 560); c.closePath();
  let g = c.createLinearGradient(0, 210, 0, 560); g.addColorStop(0, '#20232a'); g.addColorStop(1, '#08090b');
  c.fillStyle = g; c.fill();
  c.strokeStyle = `rgba(140,170,220,${0.2 * glow})`; c.lineWidth = 3; c.beginPath(); c.moveTo(-150, 212); c.lineTo(60, 252); c.stroke();
  // palma (base da mão, atrás/abaixo do objeto)
  c.beginPath(); c.moveTo(-170, 240);
  c.bezierCurveTo(-200, 120, -150, 10, -60, -10);
  c.bezierCurveTo(10, -24, 60, 20, 70, 90);
  c.bezierCurveTo(78, 150, 70, 210, 60, 252); c.closePath();
  g = c.createLinearGradient(0, -20, 0, 250);
  g.addColorStop(0, lit(sk.base, 0.25)); g.addColorStop(0.6, sk.shade); g.addColorStop(1, '#2a1a14');
  c.fillStyle = g; c.fill();
  // dedo indicador curvado pela lateral do objeto
  c.beginPath(); c.moveTo(-120, 30);
  c.bezierCurveTo(-150, -40, -120, -120, -60, -140);
  c.bezierCurveTo(-30, -146, -20, -118, -40, -104);
  c.bezierCurveTo(-80, -80, -90, -20, -70, 20); c.closePath();
  g = c.createLinearGradient(-150, 0, -30, 0); g.addColorStop(0, sk.shade); g.addColorStop(1, lit(sk.base, 0.2));
  c.fillStyle = g; c.fill();
  // polegar sobre a frente do objeto (forma cheia, afunilada)
  c.save(); c.translate(-10, 40); c.rotate(-0.62);
  c.beginPath(); c.moveTo(-34, 60);
  c.bezierCurveTo(-40, 0, -34, -70, -24, -112);
  c.bezierCurveTo(-18, -138, 18, -140, 24, -112);
  c.bezierCurveTo(32, -70, 40, 0, 40, 60); c.closePath();
  g = c.createLinearGradient(-40, 0, 40, 0);
  g.addColorStop(0, sk.shade); g.addColorStop(0.45, lit(sk.base, 0.35)); g.addColorStop(0.8, lit(sk.hi, 0.3)); g.addColorStop(1, sk.shade);
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(40,20,15,0.45)'; c.lineWidth = 2; c.stroke();
  // unha
  c.beginPath(); c.ellipse(0, -108, 15, 21, 0, 0, Math.PI * 2);
  c.fillStyle = lit('#d9ab98', 0.35); c.fill(); c.strokeStyle = 'rgba(90,50,40,0.5)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-4, -114, 5, 9, 0, 0, Math.PI * 2); c.fill();
  // vinco da articulação
  c.strokeStyle = 'rgba(60,30,20,0.45)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-26, -40); c.quadraticCurveTo(0, -34, 28, -40); c.stroke();
  c.restore();
  c.restore();
}

// ---------------------------------- papel ------------------------------------
function paperBase(seed) {
  const C = mk(PAGE.w, PAGE.h), g = C.getContext('2d'); const r = rng(seed);
  g.fillStyle = '#e8dfc7'; g.fillRect(0, 0, PAGE.w, PAGE.h);
  let gr = g.createRadialGradient(430, 560, 100, 430, 560, 760);
  gr.addColorStop(0, 'rgba(255,250,235,0.35)'); gr.addColorStop(1, 'rgba(120,90,40,0.35)');
  g.fillStyle = gr; g.fillRect(0, 0, PAGE.w, PAGE.h);
  for (let i = 0; i < 9; i++) {
    const x = r() * PAGE.w, y = r() * PAGE.h, rr = 40 + r() * 140;
    gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,110,50,${0.05 + r() * 0.08})`); gr.addColorStop(1, 'rgba(150,110,50,0)');
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  const id = g.getImageData(0, 0, PAGE.w, PAGE.h);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 16; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return [C, g];
}
function ruledLines(g) {
  g.strokeStyle = 'rgba(70,110,170,0.35)'; g.lineWidth = 2;
  for (let y = 210; y < PAGE.h - 40; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(PAGE.w, y); g.stroke(); }
  g.strokeStyle = 'rgba(200,60,60,0.45)'; g.beginPath(); g.moveTo(96, 0); g.lineTo(96, PAGE.h); g.stroke();
}
function creases(g) {
  for (const y of [560]) {
    let gr = g.createLinearGradient(0, y - 14, 0, y + 14);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.48, 'rgba(90,70,40,0.25)'); gr.addColorStop(0.52, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, y - 14, PAGE.w, 28);
  }
  let gr = g.createLinearGradient(416, 0, 444, 0);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.48, 'rgba(90,70,40,0.18)'); gr.addColorStop(0.52, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(416, 0, 28, PAGE.h);
  // bordas gastas
  g.strokeStyle = 'rgba(110,80,40,0.35)'; g.lineWidth = 6; g.strokeRect(3, 3, PAGE.w - 6, PAGE.h - 6);
}
function handText(g, text, x, y, size, color, rot, r, weight = 700) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.font = `${weight} ${size}px Caveat`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = color; g.globalAlpha = 0.9; g.fillText(text, 0, 0);
  g.globalAlpha = 0.35; g.fillText(text, 0.8, 0.6);
  g.restore();
  g.font = `${weight} ${size}px Caveat`;
  return g.measureText(text).width;
}
function buildPaper() {
  const ink = '#1d2558', red = '#8e0f12';
  // página 1
  {
    const [C, g] = paperBase(31); ruledLines(g); const r = rng(5);
    const tw = handText(g, 'Dad’s road trip rules', 150, 150, 84, ink, -0.025, r);
    g.strokeStyle = rgba(ink, 0.75); g.lineWidth = 4; g.beginPath(); g.moveTo(150, 168); g.bezierCurveTo(300, 180, 520, 160, 150 + tw + 10, 160); g.stroke();
    RULE_Y.title = 125;
    let y = 290;
    const rule = (key, lines, opts = {}) => {
      const y0 = y;
      lines.forEach((ln, i) => {
        const size = ln.size || 62, col = ln.red ? red : ink;
        const w = handText(g, ln.t, ln.x ?? 120, y, size, col, (r() - .5) * 0.02 + (ln.rot || 0), r);
        if (ln.under) { g.strokeStyle = rgba(red, 0.85); g.lineWidth = 5; g.beginPath(); g.moveTo((ln.x ?? 120) - 4, y + 12); g.bezierCurveTo(300, y + 20, 500, y + 6, (ln.x ?? 120) + w + 8, y + 14); g.stroke(); }
        y += (ln.lh || 64);
      });
      RULE_Y[key] = (y0 + y - 64) / 2 - 16;
      y += opts.gap ?? 64;
    };
    rule('r1', [{ t: '1. Cintos de segurança' }, { t: 'colocados.', x: 160 }]);
    rule('r2', [{ t: '2. Nada de celulares' }, { t: 'depois da meia-noite.', x: 160 }]);
    rule('r3', [{ t: '3. Se eu parar de piscar…' }, { t: 'NÃO RESPONDA', x: 160, red: true, size: 72, lh: 70 }, { t: 'À MAMÃE.', x: 160, red: true, size: 72, under: true }]);
    creases(g); PAGE1 = C;
  }
  // página 2
  {
    const [C, g] = paperBase(57); ruledLines(g); const r = rng(9);
    handText(g, 'pág. 2', 650, 120, 52, rgba(ink, 0.8), -0.03, r);
    let y = 290;
    const rule = (key, lines, opts = {}) => {
      const y0 = y;
      lines.forEach(ln => {
        const size = ln.size || 62, col = ln.red ? red : ink;
        const w = handText(g, ln.t, ln.x ?? 120, y, size, col, (r() - .5) * 0.045 + (ln.rot || 0), r);
        if (ln.under) {
          g.strokeStyle = rgba(red, 0.9); g.lineWidth = 5;
          for (const o of [12, 26]) { g.beginPath(); g.moveTo((ln.x ?? 120) - 4, y + o); g.bezierCurveTo(300, y + o + 8, 500, y + o - 6, (ln.x ?? 120) + w + 8, y + o + 2); g.stroke(); }
        }
        y += (ln.lh || 64);
      });
      RULE_Y[key] = (y0 + y - 64) / 2 - 16;
      y += opts.gap ?? 64;
    };
    rule('r4', [{ t: '4. Ela só se move' }, { t: 'quando eu pisco.', x: 160 }]);
    rule('r5', [{ t: '5. Nunca diga' }, { t: 'o nome dela.', x: 160 }]);
    rule('r6', [{ t: '6. AGUENTE ATÉ', red: true, size: 80, lh: 78 }, { t: 'O AMANHECER.', x: 160, red: true, size: 80, under: true }]);
    creases(g); PAGE2 = C;
  }
  // verso dobrado
  {
    const [C, g] = paperBase(91); const r = rng(3);
    handText(g, 'Regras do papai', 210, 820, 70, rgba('#1d2558', 0.8), -0.04, r);
    handText(g, '(leia se ele parar de piscar)', 180, 900, 44, rgba('#1d2558', 0.6), -0.03, r, 500);
    creases(g); PAGEBACK = C;
  }
}

// ------------------------------- colo (celular) ------------------------------
function buildLap() {
  LAPB = mk(W + 200, H + 200); const g = LAPB.getContext('2d'); g.translate(100, 100);
  let gr = g.createLinearGradient(0, -100, 0, 900); gr.addColorStop(0, '#020203'); gr.addColorStop(1, '#07080b');
  g.fillStyle = gr; g.fillRect(-100, -100, W + 200, H + 200);
  // borda do banco da frente / tapete lá embaixo
  g.fillStyle = '#0c0d10'; g.beginPath(); g.roundRect(-60, -100, 520, 380, 30); g.fill(); g.beginPath(); g.roundRect(620, -100, 520, 360, 30); g.fill();
  g.fillStyle = '#060607'; g.fillRect(-100, 300, W + 200, 300);
  // assento traseiro dos lados
  g.fillStyle = '#0d0e12'; g.fillRect(-100, 600, 160, H); g.fillRect(1020, 600, 200, H);
  drawThigh(g, 300, 620, 470, -90, 15);
  drawThigh(g, 790, 610, 470, 90, 19);
  LAPB._ok = true;
}
function drawLap(c, t, o) {
  // o: {cam, phone:{...screen}, phoneScale, buzz, hand(bool), shakeAmp}
  const cm = o.cam;
  c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
  c.drawImage(LAPB, -100, -100);
  if (o.hand) {
    c.save();
    c.beginPath(); c.moveTo(1400, 560); c.quadraticCurveTo(1180, 580, 1040, 640); c.lineTo(1030, 790); c.quadraticCurveTo(1200, 780, 1400, 820); c.closePath();
    const g = c.createLinearGradient(1000, 0, 1300, 0); g.addColorStop(0, '#4a1d60'); g.addColorStop(1, '#1d0a28');
    c.fillStyle = g; c.fill(); c.restore();
    drawLongHand(c, 1060, 700, 1.25, Math.PI - 0.3, { flip: true, curl: 0.12 + 0.05 * Math.sin(t * 1.1), light: 'night' });
  }
  // brilho da tela
  const px = o.px ?? 540, py = o.py ?? 1080, ps = o.ps ?? 1.32;
  let bz = [0, 0];
  if (o.buzz) { bz = [Math.sin(t * 160) * 7 * o.buzz, Math.cos(t * 140) * 4 * o.buzz]; }
  c.save(); c.globalCompositeOperation = 'screen';
  const gl = c.createRadialGradient(px, py, 100, px, py, 900);
  gl.addColorStop(0, `rgba(120,140,200,${0.35 * (o.glow ?? 1)})`); gl.addColorStop(1, 'rgba(120,140,200,0)');
  c.fillStyle = gl; c.fillRect(-100, -100, W + 200, H + 200); c.restore();
  drawPhoneBody(c, px + bz[0], py + bz[1], ps, o.phone);
  if (o.buzz) {
    c.strokeStyle = `rgba(200,210,255,${0.5 * o.buzz})`; c.lineWidth = 5; c.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x = px + s * (300 + i * 26);
      c.beginPath(); c.moveTo(x, py - 100 + i * 10); c.lineTo(x, py + 100 - i * 10); c.stroke();
    }
  }
  drawHoldHand(c, -1, px - 250 + bz[0], py + 400 + bz[1], 1.25, 1);
  drawHoldHand(c, 1, px + 250 + bz[0], py + 400 + bz[1], 1.25, 1);
  c.restore();
}

// ------------------------------- cena do papel -------------------------------
// o: {cam, page:1|2, flip(0..1), unfold(null|0..1), shake, light}
function drawPaperScene(c, t, o) {
  const cm = o.cam;
  c.fillStyle = '#030304'; c.fillRect(0, 0, W, H);
  c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
  // colo escuro ao fundo
  c.globalAlpha = 0.5; c.drawImage(LAPB, -100, 100); c.globalAlpha = 1;
  const sh = shake(t, o.shake || 0, 11, 9);
  c.save(); c.translate(540 + sh[0], 960 + sh[1]); c.rotate(-0.025 + sh[0] * 0.002);
  const pw = PAGE.w, ph = PAGE.h;
  // sombra do papel
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(-pw / 2 + 18, -ph / 2 + 26, pw, ph);
  if (o.unfold != null) {
    const u = o.unfold; // 0 = dobrado ao meio, 1 = aberto
    // metade de baixo (sempre visível)
    c.drawImage(PAGE1, 0, 560, pw, 560, -pw / 2, 0, pw, 560);
    const sy = Math.cos((1 - u) * Math.PI); // -1 -> 1
    c.save(); c.scale(1, sy);
    if (sy < 0) { c.drawImage(PAGEBACK, 0, 560, pw, 560, -pw / 2, -560, pw, 560); }
    else c.drawImage(PAGE1, 0, 0, pw, 560, -pw / 2, -560, pw, 560);
    c.fillStyle = `rgba(0,0,0,${0.5 * (1 - Math.abs(sy))})`; c.fillRect(-pw / 2, -560, pw, 560);
    c.restore();
  } else {
    const f = o.flip || 0;
    const sx = Math.cos(f * Math.PI);
    c.save(); c.scale(Math.abs(sx) * (1 - 0.04 * Math.sin(f * Math.PI)), 1 + 0.03 * Math.sin(f * Math.PI));
    const img = (f < 0.5) ? (o.page === 2 ? PAGE2 : PAGE1) : PAGE2;
    c.drawImage(img, -pw / 2, -ph / 2);
    if (f > 0 && f < 1) { c.fillStyle = `rgba(0,0,0,${0.55 * (1 - Math.abs(sx))})`; c.fillRect(-pw / 2, -ph / 2, pw, ph); }
    c.restore();
  }
  c.restore();
  // mãos segurando
  const hy = 960 + ph / 2 - 40;
  drawHoldHand(c, -1, 540 - pw / 2 + 70 + sh[0], hy + sh[1], 1.15, 0.7);
  drawHoldHand(c, 1, 540 + pw / 2 - 70 + sh[0], hy + sh[1], 1.15, 0.7);
  c.restore();
  // luz da lanterna do celular (vem de baixo)
  const lx = W / 2, ly = H * 0.52;
  const g = c.createRadialGradient(lx, ly, 120 * cm.z, lx, ly, 980);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.92)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'soft-light';
  c.fillStyle = 'rgba(255,220,170,0.25)'; c.fillRect(0, 0, W, H); c.restore();
}

// --------------------------------- assoalho ---------------------------------
function buildFloor() {
  FLOOR = mk(W + 300, H + 300); const g = FLOOR.getContext('2d'); g.translate(150, 150);
  g.fillStyle = '#060607'; g.fillRect(-150, -150, W + 300, H + 300);
  // carpete
  const r = rng(44);
  const id = g.getImageData(0, 0, FLOOR.width, FLOOR.height);
  for (let i = 0; i < id.data.length; i += 4) { const n = 8 + r() * 18; id.data[i] = n; id.data[i + 1] = n + 1; id.data[i + 2] = n + 4; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  // trilhos do banco
  g.fillStyle = '#111215'; g.fillRect(-150, -150, W + 300, 420);
  g.fillStyle = '#23252b'; g.fillRect(80, 180, 18, 160); g.fillRect(420, 180, 18, 160); g.fillRect(640, 180, 18, 160); g.fillRect(980, 180, 18, 160);
  // tapete de borracha
  g.beginPath(); g.roundRect(70, 520, 940, 1300, 60); g.fillStyle = '#0d0e10'; g.fill();
  g.strokeStyle = 'rgba(120,130,150,0.12)'; g.lineWidth = 4; g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 8;
  for (let y = 600; y < 1780; y += 42) { g.beginPath(); g.moveTo(110, y); g.lineTo(970, y); g.stroke(); }
  g.strokeStyle = 'rgba(110,120,140,0.07)'; g.lineWidth = 3;
  for (let y = 604; y < 1780; y += 42) { g.beginPath(); g.moveTo(110, y); g.lineTo(970, y); g.stroke(); }
  // um papel de bala esquecido
  g.save(); g.translate(760, 980); g.rotate(0.4); g.fillStyle = '#4a1e24'; g.fillRect(-30, -12, 60, 24); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(-30, -12, 60, 4); g.restore();
  // tênis
  for (const [x, rot] of [[350, -0.12], [730, 0.1]]) {
    g.save(); g.translate(x, 1500); g.rotate(rot);
    g.beginPath(); g.ellipse(0, 0, 120, 280, 0, 0, Math.PI * 2); g.fillStyle = '#e3e3e6'; g.fill();
    g.beginPath(); g.ellipse(0, -30, 104, 250, 0, 0, Math.PI * 2); g.fillStyle = '#25262c'; g.fill();
    g.strokeStyle = '#d8d8dc'; g.lineWidth = 6;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-40, -60 + i * 34); g.lineTo(40, -50 + i * 34); g.stroke(); }
    g.restore();
  }
  // suas canelas descendo
  for (const x of [350, 730]) {
    const gg = g.createLinearGradient(0, 1400, 0, H + 150); gg.addColorStop(0, '#141a26'); gg.addColorStop(1, '#0a0d13');
    g.fillStyle = gg; g.beginPath(); g.moveTo(x - 140, H + 150); g.lineTo(x - 110, 1640); g.lineTo(x + 110, 1640); g.lineTo(x + 140, H + 150); g.closePath(); g.fill();
  }
}
function drawFloor(c, t, o) {
  const cm = o.cam;
  c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
  c.drawImage(FLOOR, -150, -150);
  c.restore();
  // faixas de luz passando (aceleração)
  if (o.strobe) {
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.9 + i * 0.37) % 1;
      const y = lerp(-500, H + 500, ph);
      const g = c.createLinearGradient(0, y - 220, 0, y + 220);
      g.addColorStop(0, 'rgba(255,170,90,0)'); g.addColorStop(0.5, `rgba(255,170,90,${0.18 * o.strobe})`); g.addColorStop(1, 'rgba(255,170,90,0)');
      c.fillStyle = g; c.fillRect(0, y - 220, W, 440);
    }
    c.restore();
  }
  if (o.dawn) {
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(255,180,110,${0.55 * o.dawn})`); g.addColorStop(1, `rgba(255,140,80,${0.12 * o.dawn})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  }
  c.fillStyle = `rgba(0,0,0,${o.dark ?? 0.35})`; c.fillRect(0, 0, W, H);
}
