// ---------- cenários ----------
const ROAD = { speed: 28, lampGap: 60 };

// silhueta de árvores no horizonte (estática)
function treeLine(x) { return 18 + noise1(x * 0.012) * 14 + noise1(x * 0.05 + 7) * 8 + Math.max(0, noise1(x * 0.09 + 3)) * 16; }

// ---------- estrada vista pelo para-brisa (ou para trás, reverse=true) ----------
// opts: t, dist (metros percorridos), dawn 0..1, swerve px, signs [{d0, lines}], reverse
function drawRoadView(ctx, x0, y0, w, h, o) {
  const dawn = o.dawn || 0, rev = !!o.reverse;
  const hy = y0 + h * (o.hor ?? 0.42), vpx = x0 + w / 2 + (o.swerve || 0);
  const bottom = y0 + h, z0 = 4.2, K = (bottom - hy) * z0, camH = 1.3, f = K / camH;
  const sx = (X, z) => vpx + X * f / z, sy = (z, Y = 0) => hy + (camH - Y) * f / z;
  // céu
  let g = ctx.createLinearGradient(0, y0, 0, hy + 10);
  g.addColorStop(0, col(mixc('#03060f', '#2b3f73', dawn))); g.addColorStop(0.7, col(mixc('#0a1428', '#d77a62', dawn)));
  g.addColorStop(1, col(mixc('#16233d', '#ffc27a', dawn)));
  ctx.fillStyle = g; ctx.fillRect(x0, y0, w, hy - y0 + 2);
  if (dawn < 0.9) { // lua
    const mx = x0 + w * 0.78, my = y0 + h * 0.12;
    radial(ctx, mx, my, 110, '#9fb6e0', 0.18 * (1 - dawn));
    ctx.fillStyle = col('#dfe8f8', 0.85 * (1 - dawn)); ctx.beginPath(); ctx.arc(mx, my, 16, 0, TAU); ctx.fill();
    // estrelas
    const r = rng(9); ctx.fillStyle = `rgba(200,215,255,${0.5 * (1 - dawn)})`;
    for (let i = 0; i < 40; i++) { const px = x0 + r() * w, py = y0 + r() * (hy - y0) * 0.8; ctx.fillRect(px, py, 2, 2); }
  }
  if (dawn > 0) radial(ctx, vpx + w * 0.25 * (rev ? -1 : 1), hy, w * 0.9, '#ffb060', 0.5 * dawn);
  // árvores/morros
  ctx.fillStyle = col(mixc('#04070d', '#3b2a3c', dawn));
  ctx.beginPath(); ctx.moveTo(x0, hy + 2);
  for (let x = x0; x <= x0 + w + 8; x += 8) ctx.lineTo(x, hy - treeLine(x + 3000));
  ctx.lineTo(x0 + w, hy + 2); ctx.closePath(); ctx.fill();
  // chão
  g = ctx.createLinearGradient(0, hy, 0, bottom);
  g.addColorStop(0, col(mixc('#05070c', '#3a3038', dawn))); g.addColorStop(1, col(mixc('#020305', '#2a2426', dawn)));
  ctx.fillStyle = g; ctx.fillRect(x0, hy, w, bottom - hy);
  // asfalto
  const zf = 400;
  ctx.fillStyle = col(mixc('#0b0d12', '#4a454a', dawn));
  ctx.beginPath(); ctx.moveTo(sx(-5.6, z0 * 0.6), sy(z0 * 0.6)); ctx.lineTo(sx(-5.6, zf), sy(zf)); ctx.lineTo(sx(5.4, zf), sy(zf)); ctx.lineTo(sx(5.4, z0 * 0.6), sy(z0 * 0.6)); ctx.closePath(); ctx.fill();
  // farol iluminando o asfalto
  if (!rev) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(vpx, bottom + h * 0.05, 10, vpx, bottom, (bottom - hy) * 1.25);
    hg.addColorStop(0, `rgba(255,236,200,${0.32 * (1 - dawn * 0.8)})`); hg.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = hg; ctx.fillRect(x0, hy, w, bottom - hy); ctx.restore();
  } else {
    radial(ctx, vpx, bottom + 20, (bottom - hy) * 1.1, '#ff2a1a', 0.22 * (1 - dawn * 0.7));
  }
  const dist = o.dist || 0;
  // faixas: bordas contínuas + centro tracejado
  const line = (X, wd, color, dash) => {
    ctx.fillStyle = color;
    if (!dash) {
      ctx.beginPath(); ctx.moveTo(sx(X - wd, z0 * 0.6), sy(z0 * 0.6)); ctx.lineTo(sx(X - wd, zf), sy(zf)); ctx.lineTo(sx(X + wd, zf), sy(zf)); ctx.lineTo(sx(X + wd, z0 * 0.6), sy(z0 * 0.6)); ctx.fill();
      return;
    }
    const per = 12, len = 4.5, off = ((rev ? -dist : dist) % per + per) % per;
    for (let k = 0; k < 40; k++) {
      const za = k * per - off + 1, zb = za + len; if (zb < 1) continue; const a = Math.max(za, 1.2);
      ctx.beginPath(); ctx.moveTo(sx(X - wd, a), sy(a)); ctx.lineTo(sx(X - wd, zb), sy(zb)); ctx.lineTo(sx(X + wd, zb), sy(zb)); ctx.lineTo(sx(X + wd, a), sy(a)); ctx.fill();
    }
  };
  line(-5.3, 0.08, `rgba(220,220,210,${0.35 + dawn * 0.3})`);
  line(5.1, 0.08, `rgba(230,230,220,${0.5 + dawn * 0.3})`);
  line(-1.85, 0.09, `rgba(235,190,70,${0.75})`, true);
  // balizadores com refletores
  const off2 = ((rev ? -dist : dist) % 25 + 25) % 25;
  for (let k = 0; k < 14; k++) {
    const z = k * 25 - off2 + 2; if (z < 1.5) continue;
    for (const X of [6.2, -6.6]) {
      const px = sx(X, z), py0 = sy(z), py1 = sy(z, 1.0), ww = Math.max(1, 0.12 * f / z);
      ctx.fillStyle = col(mixc('#1a1d24', '#8a8a90', dawn)); ctx.fillRect(px - ww / 2, py1, ww, py0 - py1);
      const rc = X > 0 ? (rev ? '#ff3020' : '#ff9a30') : '#e8f0ff';
      ctx.fillStyle = col(rc, rev ? 0.6 : 0.95); ctx.fillRect(px - ww / 2, py1, ww, Math.max(1, (py0 - py1) * 0.18));
      if (!rev && z < 60) radial(ctx, px, py1, ww * 3, rc, 0.25);
    }
  }
  // postes de luz de sódio (lado esquerdo)
  const offL = ((rev ? -dist : dist) % ROAD.lampGap + ROAD.lampGap) % ROAD.lampGap;
  for (let k = 0; k < 8; k++) {
    const z = k * ROAD.lampGap - offL + 6; if (z < 1.2) continue;
    const X = -8.5, px = sx(X, z), pb = sy(z), pt = sy(z, 9), ww = Math.max(1.5, 0.25 * f / z);
    ctx.strokeStyle = col(mixc('#0a0c12', '#5a5258', dawn)); ctx.lineWidth = ww; ctx.beginPath(); ctx.moveTo(px, pb); ctx.lineTo(px, pt); ctx.lineTo(sx(X + 3.2, z), sy(z, 9.4)); ctx.stroke();
    const lx = sx(X + 3.2, z), ly = sy(z, 9.2);
    if (dawn < 0.95) { radial(ctx, lx, ly, Math.min(260, 2.6 * f / z), '#ff9838', 0.45 * (1 - dawn)); ctx.fillStyle = col('#ffd9a0', 1 - dawn); ctx.beginPath(); ctx.arc(lx, ly, Math.max(1.5, 0.35 * f / z), 0, TAU); ctx.fill();
      // poça de luz no chão
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,150,60,${0.12 * (1 - dawn)})`; ctx.beginPath(); ctx.ellipse(lx, sy(z), 4 * f / z, 1.1 * f / z, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  // placas
  for (const s of (o.signs || [])) {
    const z = s.d0 - (dist - (s.at || 0));
    if (z < 2.2 || z > 260) continue;
    const X = rev ? -6.5 : 6.5, Xw = 5.2, Y0 = 2.6, Y1 = 5.4;
    const l = sx(X, z), r = sx(X + Xw, z), tp = sy(z, Y1), bt = sy(z, Y0);
    ctx.fillStyle = col(mixc('#0d0f14', '#4a4a50', dawn)); const pw = Math.max(1.5, 0.15 * f / z);
    ctx.fillRect(l + (r - l) * 0.15, bt, pw, sy(z) - bt); ctx.fillRect(l + (r - l) * 0.85, bt, pw, sy(z) - bt);
    const lit = clamp(1.4 - z / 60) * (1 - dawn * 0.5) + 0.25;
    ctx.fillStyle = col(mulc('#0f6a3a', 0.35 + lit * 0.75)); rrect(ctx, l, tp, r - l, bt - tp, (r - l) * 0.03); ctx.fill();
    ctx.strokeStyle = col('#e8f2ea', 0.4 + lit * 0.5); ctx.lineWidth = Math.max(1, (r - l) * 0.012); rrect(ctx, l + (r - l) * 0.03, tp + (bt - tp) * 0.06, (r - l) * 0.94, (bt - tp) * 0.88, (r - l) * 0.025); ctx.stroke();
    if (r - l > 30) {
      ctx.fillStyle = col('#f2f6f0', 0.45 + lit * 0.55); ctx.textBaseline = 'middle';
      const n = s.lines.length;
      s.lines.forEach((tx, i) => { ctx.font = `600 ${(bt - tp) * (n > 1 ? 0.26 : 0.4)}px Inter`; ctx.textAlign = 'center'; ctx.fillText(tx, (l + r) / 2, tp + (bt - tp) * ((i + 0.5) / n * 0.86 + 0.07)); });
    }
  }
  if (dawn < 1 && o.fog !== false) { // névoa baixa
    const fg = ctx.createLinearGradient(0, hy - 60, 0, hy + 80); fg.addColorStop(0, 'rgba(60,80,120,0)'); fg.addColorStop(0.5, `rgba(60,80,120,${0.18 * (1 - dawn)})`); fg.addColorStop(1, 'rgba(60,80,120,0)');
    ctx.fillStyle = fg; ctx.fillRect(x0, hy - 60, w, 140);
  }
}

const SIGNS = [
  { at: 0, d0: 150, lines: ['BR-116', 'POSTO 24H  12 km'] },
  { at: 0, d0: 1150, lines: ['SÃO PAULO', '214 km'] },
  { at: 0, d0: 2600, lines: ['POSTO 24H  3 km'] },
];

// ---------- espelho retrovisor ----------
function drawMirror(ctx, cx, cy, w, h, content, opts = {}) {
  ctx.save();
  // haste
  if (opts.stem !== false) { ctx.fillStyle = '#07080c'; ctx.fillRect(cx - w * 0.04, cy - h * 1.6, w * 0.08, h * 1.2); }
  rrect(ctx, cx - w / 2 - 14, cy - h / 2 - 14, w + 28, h + 28, h * 0.34); ctx.fillStyle = '#08090d'; ctx.fill();
  ctx.strokeStyle = 'rgba(140,170,210,0.25)'; ctx.lineWidth = 3; ctx.stroke();
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.28); ctx.save(); ctx.clip();
  ctx.fillStyle = '#020306'; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.translate(cx, cy); content(ctx);
  ctx.restore();
  // reflexo do vidro
  ctx.save(); rrect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.28); ctx.clip();
  const g = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
  g.addColorStop(0, 'rgba(180,210,255,0.10)'); g.addColorStop(0.35, 'rgba(180,210,255,0.0)'); g.addColorStop(0.42, 'rgba(180,210,255,0.07)'); g.addColorStop(0.5, 'rgba(180,210,255,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
  ctx.restore();
}

// ---------- vista traseira (câmera olhando para o banco de trás) ----------
// o: t, dist, dawn, L, boy (P|null), wom (P|null), womX, womY, womS, boyX, boyY, extra(ctx) desenha por cima, rays
const REAR = { boyX: 285, boyY: 890, boyS: 0.92, seatY: 1050 };
function drawRearView(ctx, o) {
  const L = o.L, dawn = o.dawn || 0;
  ctx.fillStyle = col(mixc('#05070c', '#2a1e1c', dawn)); ctx.fillRect(-200, -200, W + 400, H + 400);
  // vidro traseiro
  const win = (x) => { x.beginPath(); x.moveTo(170, 330); x.quadraticCurveTo(540, 290, 910, 330); x.lineTo(990, 760); x.quadraticCurveTo(540, 790, 90, 760); x.closePath(); };
  ctx.save(); win(ctx); ctx.clip();
  drawRoadView(ctx, 60, 280, 960, 520, { dist: o.dist, dawn, reverse: true, hor: 0.5, signs: [] });
  ctx.restore();
  // desembaçador
  ctx.strokeStyle = `rgba(255,120,80,${0.08 + dawn * 0.05})`; ctx.lineWidth = 2;
  for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(140 + k * 3, 420 + k * 42); ctx.quadraticCurveTo(540, 400 + k * 42, 940 - k * 3, 420 + k * 42); ctx.stroke(); }
  // colunas C + teto
  ctx.fillStyle = col(mixc('#0a0c12', '#3a2a26', dawn));
  ctx.beginPath(); ctx.moveTo(-200, -200); ctx.lineTo(W + 200, -200); ctx.lineTo(W + 200, 900); ctx.lineTo(990, 760); ctx.lineTo(910, 330); ctx.quadraticCurveTo(540, 290, 170, 330); ctx.lineTo(90, 760); ctx.lineTo(-200, 900); ctx.closePath(); ctx.fill();
  // janelas laterais nas pontas (luzes passando)
  for (const s of [-1, 1]) {
    const xx = s < 0 ? 0 : W - 70;
    ctx.save(); ctx.beginPath(); ctx.rect(xx, 420, 70, 360); ctx.clip();
    ctx.fillStyle = col(mixc('#060a14', '#c98a6a', dawn)); ctx.fillRect(xx, 420, 70, 360);
    const lv = sodiumLevel(o.t || 0, 2.14, s * 0.3); radial(ctx, xx + 35, 560, 160, '#ff9a3c', lv * 0.6 * (1 - dawn));
    ctx.restore();
  }
  // tampão traseiro
  ctx.fillStyle = col(mixc('#07080c', '#2e2220', dawn)); ctx.beginPath(); ctx.moveTo(60, 770); ctx.quadraticCurveTo(540, 800, 1020, 770); ctx.lineTo(1080, 860); ctx.lineTo(0, 860); ctx.closePath(); ctx.fill();
  // raios de sol pelo vidro traseiro
  if (o.rays) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const bw = [[330, 70, 0.10], [520, 130, 0.08], [700, 50, 0.12], [820, 110, 0.07]];
    bw.forEach(([x, wd, a], k) => {
      const al = a * o.rays * (0.8 + 0.2 * Math.sin((o.t || 0) * 0.9 + k * 2));
      const g = ctx.createLinearGradient(x, 400, x - 380, 1800); g.addColorStop(0, `rgba(255,205,130,${al})`); g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - wd * 0.3, 400); ctx.lineTo(x + wd * 0.3, 400); ctx.lineTo(x - 300 + wd * 1.6, 1900); ctx.lineTo(x - 420 - wd * 1.6, 1900); ctx.closePath(); ctx.fill();
    });
    radial(ctx, 700, 450, 520, '#ffb868', 0.25 * o.rays);
    ctx.restore();
  }
  // encostos de cabeça + banco
  const seatC = mixc('#262830', '#5a4640', dawn * 0.6);
  const seat = (x, y, w, h, r) => { rrect(ctx, x, y, w, h, r); ctx.fillStyle = lc(seatC, L, 1.25); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke(); };
  seat(860, 640, 180, 150, 50); seat(160, 640, 180, 150, 50);
  ctx.fillStyle = lc(seatC, L, 1.05);
  rrect(ctx, 20, 760, 1040, 900, 90); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = lca('#000', L, 0.4); ctx.lineWidth = 4;
  for (const x of [380, 720]) { ctx.beginPath(); ctx.moveTo(x, 790); ctx.lineTo(x, 1600); ctx.stroke(); }
  // personagens
  if (o.wom) {
    ctx.save(); ctx.translate(o.womX ?? 600, o.womY ?? 860); ctx.scale(o.womS ?? 0.95, o.womS ?? 0.95);
    if (o.womDraw) o.womDraw(ctx); else drawChar(ctx, 'wom', o.wom, o.womL || L);
    ctx.restore();
  }
  if (o.boy) {
    ctx.save(); ctx.translate(o.boyX ?? REAR.boyX, o.boyY ?? REAR.boyY); ctx.scale(REAR.boyS, REAR.boyS);
    drawChar(ctx, 'boy', Object.assign({ beltSide: 1 }, o.boy), L);
    ctx.restore();
  }
  if (o.extra) o.extra(ctx);
  // assento (frente)
  ctx.fillStyle = lc(mixc(seatC, '#000', 0.2), L, 1.1); rrect(ctx, -40, 1480, 1160, 600, 80); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
}

// ---------- interior olhando para frente (do banco de trás) ----------
// o: t, dist, dawn, swerve, roll, L, mirror(ctx) conteúdo do espelho, speed (km/h p/ ponteiro), dadTurn
function drawCabinForward(ctx, o) {
  const L = o.L, dawn = o.dawn || 0;
  ctx.fillStyle = '#030408'; ctx.fillRect(-300, -300, W + 600, H + 600);
  const ws = (x) => { x.beginPath(); x.moveTo(30, 360); x.quadraticCurveTo(540, 300, 1050, 360); x.lineTo(1160, 1060); x.quadraticCurveTo(540, 1030, -80, 1060); x.closePath(); };
  ctx.save(); ws(ctx); ctx.clip();
  ctx.save(); if (o.roll) { ctx.translate(540, 900); ctx.rotate(-o.roll * 0.6); ctx.translate(-540, -900); }
  drawRoadView(ctx, -200, 300, 1480, 760, { dist: o.dist, dawn, swerve: o.swerve || 0, signs: o.signs || SIGNS, hor: 0.45 });
  ctx.restore();
  // reflexos no vidro
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rg = ctx.createLinearGradient(100, 360, 900, 1000); rg.addColorStop(0, 'rgba(120,200,255,0.0)'); rg.addColorStop(0.55, 'rgba(120,200,255,0.05)'); rg.addColorStop(0.6, 'rgba(120,200,255,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 300, W, 760); ctx.restore();
  ctx.restore();
  // teto + colunas
  ctx.fillStyle = col(mixc('#06070b', '#2d2522', dawn));
  ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(W + 300, -300); ctx.lineTo(W + 300, 1100); ctx.lineTo(1160, 1060); ctx.lineTo(1050, 360); ctx.quadraticCurveTo(540, 300, 30, 360); ctx.lineTo(-80, 1060); ctx.lineTo(-300, 1100); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col(mixc('#0b0d13', '#3a302c', dawn)); ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(30, 360); ctx.lineTo(-80, 1060); ctx.lineTo(-300, 1100); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W + 300, 0); ctx.lineTo(1050, 360); ctx.lineTo(1160, 1060); ctx.lineTo(W + 300, 1100); ctx.fill();
  // painel
  ctx.fillStyle = col(mixc('#05060a', '#2a201e', dawn)); ctx.beginPath(); ctx.moveTo(-300, 1080); ctx.quadraticCurveTo(540, 1000, W + 300, 1080); ctx.lineTo(W + 300, H + 300); ctx.lineTo(-300, H + 300); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,200,230,0.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, 1080); ctx.quadraticCurveTo(540, 1000, W + 300, 1080); ctx.stroke();
  // central multimídia
  rrect(ctx, 470, 1080, 160, 90, 10); ctx.fillStyle = `rgba(40,110,140,${0.35 * (o.dash ?? 1)})`; ctx.fill();
  radial(ctx, 550, 1110, 220, '#3ad0e0', 0.12 * (o.dash ?? 1));
  // painel de instrumentos (atrás do volante)
  radial(ctx, 300, 1090, 260, '#40d8ff', 0.22 * (o.dash ?? 1));
  // volante (aro visível)
  ctx.strokeStyle = '#0a0b0f'; ctx.lineWidth = 34; ctx.beginPath(); ctx.ellipse(300, 1230, 250, 150, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,190,230,0.2)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(300, 1213, 250, 150, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  // pai (de costas)
  ctx.save(); ctx.translate(300 + (o.dadDX || 0), 770); ctx.scale(1.08, 1.08); drawDadBack(ctx, L, { turn: o.dadTurn || 0 }); ctx.restore();
  // mãos no volante
  for (const s of [-1, 1]) {
    const hx = 300 + s * 225, hy = 1150;
    ctx.fillStyle = lc(CH.dad.skin, L, 0.8); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, hy, 34, 44, s * 0.4, 0, TAU); ctx.fill(); ctx.stroke();
  }
  // bancos dianteiros (encostos em primeiro plano)
  const seatC = mixc('#1c1e25', '#4a3a34', dawn * 0.6);
  const seat = (cx, hy) => {
    rrect(ctx, cx - 130, hy, 260, 185, 60); ctx.fillStyle = lc(seatC, L, 1.3); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = lc(seatC, L, 1.1); ctx.fillRect(cx - 40, hy + 180, 22, 70); ctx.fillRect(cx + 18, hy + 180, 22, 70);
    rrect(ctx, cx - 250, hy + 240, 500, 1000, 110); ctx.fillStyle = lc(seatC, L, 1.2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = lca('#000', L, 0.35); ctx.lineWidth = 3; rrect(ctx, cx - 190, hy + 520, 380, 300, 40); ctx.stroke();
  };
  seat(300, 905); seat(800, 860);
  // espelho
  drawMirror(ctx, 540, 250, 360, 112, o.mirror || (() => {}));
  // luzes passando
  if (dawn < 0.9) sodiumSweep(ctx, (o.t || 0), 2.14, 0.13 * (1 - dawn), 0.4);
}

// conteúdo do espelho: banco traseiro espelhado. o = opções de drawRearView + sc (escala), cx (centro do mundo a mostrar)
function mirrorRear(o) {
  return (ctx) => {
    ctx.save(); ctx.scale(-o.sc, o.sc); ctx.translate(-(o.cx ?? 540), -(o.cy ?? 860));
    drawRearView(ctx, o); ctx.restore();
    ctx.fillStyle = `rgba(4,8,20,${o.dark ?? 0.25})`; ctx.fillRect(-2000, -2000, 4000, 4000);
  };
}

// ---------- fundo para close do menino (banco traseiro, porta à esquerda) ----------
function drawBoyBG(ctx, o) {
  const L = o.L, dawn = o.dawn || 0, t = o.t || 0;
  ctx.fillStyle = col(mixc('#05070c', '#3a2a26', dawn)); ctx.fillRect(-300, -300, W + 600, H + 600);
  // janela lateral
  ctx.save(); ctx.beginPath(); ctx.moveTo(-300, 260); ctx.lineTo(380, 300); ctx.lineTo(420, 900); ctx.lineTo(-300, 980); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(0, 260, 0, 980); g.addColorStop(0, col(mixc('#060b18', '#e9a27a', dawn))); g.addColorStop(1, col(mixc('#0b1424', '#ffcf94', dawn))); ctx.fillStyle = g; ctx.fillRect(-300, 200, 800, 900);
  // paisagem passando
  const sp = (o.speed ?? 1);
  ctx.fillStyle = col(mixc('#020306', '#4a3440', dawn));
  ctx.beginPath(); ctx.moveTo(-300, 980); for (let x = -300; x <= 440; x += 10) ctx.lineTo(x, 780 - treeLine(x + t * 260 * sp) * 2.2); ctx.lineTo(440, 980); ctx.fill();
  if (dawn < 0.95) { for (let k = 0; k < 3; k++) { const x = 600 - (((t * 900 * sp) + k * 450) % 1350); radial(ctx, x, 470, 140, '#ffa04a', 0.55 * (1 - dawn)); ctx.fillStyle = col('#ffe0b0', 0.9 * (1 - dawn)); ctx.beginPath(); ctx.arc(x, 470, 8, 0, TAU); ctx.fill(); } }
  if (dawn > 0) radial(ctx, 120, 760, 700, '#ffb060', 0.5 * dawn);
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(-300, 260); ctx.lineTo(380, 300); ctx.lineTo(420, 900); ctx.stroke();
  // porta
  ctx.fillStyle = col(mixc('#090b10', '#3a2c28', dawn)); ctx.beginPath(); ctx.moveTo(-300, 980); ctx.lineTo(420, 900); ctx.lineTo(500, 2300); ctx.lineTo(-300, 2300); ctx.fill();
  // encosto atrás do menino
  const seatC = mixc('#202229', '#5a4640', dawn * 0.6);
  rrect(ctx, 300, 330, 620, 330, 110); ctx.fillStyle = lc(seatC, L, 1.25); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  rrect(ctx, 180, 600, 1100, 1700, 120); ctx.fillStyle = lc(seatC, L, 1.1); ctx.fill(); ctx.stroke();
  if (dawn < 0.9) sodiumSweep(ctx, t, 2.14, 0.12 * (1 - dawn), -0.3, 0.5);
}

// ---------- celular ----------
const PHONE = { w: 520, h: 1060, r: 70 };
// state: {msgs:[{text, at, big}], t, typing:[t0,t1], clock, name, cleared}
function drawChatUI(ctx, w, h, s) {
  ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, w, h);
  // status bar
  ctx.fillStyle = '#e9edf5'; ctx.font = '600 26px Inter'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(s.clock || '03:17', 44, 46);
  ctx.textAlign = 'right'; ctx.fillText('▮▮▮  21%', w - 40, 46);
  ctx.fillStyle = '#000'; rrect(ctx, w / 2 - 70, 24, 140, 42, 21); ctx.fill();
  // header
  ctx.fillStyle = '#151820'; ctx.fillRect(0, 84, w, 120);
  ctx.strokeStyle = '#9aa6ba'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(52, 128); ctx.lineTo(36, 144); ctx.lineTo(52, 160); ctx.stroke();
  ctx.fillStyle = '#6d4b7a'; ctx.beginPath(); ctx.arc(110, 144, 38, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2e8f5'; ctx.font = '600 34px Inter'; ctx.textAlign = 'center'; ctx.fillText('M', 110, 146);
  ctx.textAlign = 'left'; ctx.fillStyle = '#f3f5f9'; ctx.font = '600 36px Inter'; ctx.fillText(s.name || 'Mãe', 166, 128);
  ctx.fillStyle = '#7fd08a'; ctx.font = '400 24px Inter'; ctx.fillText(s.typingNow ? 'digitando…' : 'online', 166, 168);
  ctx.fillStyle = '#1e222c'; ctx.fillRect(0, 203, w, 2);
  // mensagens (de baixo para cima)
  let y = h - 150;
  ctx.fillStyle = '#151820'; ctx.fillRect(0, h - 120, w, 120);
  rrect(ctx, 30, h - 96, w - 140, 70, 35); ctx.fillStyle = '#232733'; ctx.fill();
  ctx.fillStyle = '#6a7284'; ctx.font = '400 28px Inter'; ctx.fillText('Mensagem', 64, h - 60);
  ctx.fillStyle = '#2f7a5a'; ctx.beginPath(); ctx.arc(w - 64, h - 61, 34, 0, TAU); ctx.fill();
  const items = [];
  if (s.typingNow) items.push({ typing: true });
  for (let i = s.msgs.length - 1; i >= 0; i--) { const m = s.msgs[i]; if (s.t >= m.at) items.push(m); }
  ctx.save(); ctx.beginPath(); ctx.rect(0, 206, w, h - 326); ctx.clip();
  for (const m of items) {
    const big = m.big, fs = big ? 64 : 34, lh = fs * 1.25, maxW = w * 0.72 - 48;
    ctx.font = `${big ? 700 : 400} ${fs}px Inter`;
    const lines = m.typing ? [''] : wrapText(ctx, m.text, maxW);
    const bw = m.typing ? 120 : Math.max(...lines.map(l => ctx.measureText(l).width)) + 48 + (big ? 0 : 90);
    const bh = m.typing ? 70 : lines.length * lh + 34 + (big ? 0 : 0);
    const ap = m.typing ? 1 : easeOut((s.t - m.at) / 0.25);
    y -= bh;
    ctx.save(); ctx.translate(26, y + bh); ctx.scale(lerp(0.6, 1, ap), lerp(0.6, 1, ap)); ctx.globalAlpha = ap; ctx.translate(-26, -(y + bh));
    rrect(ctx, 26, y, bw, bh, 30); ctx.fillStyle = big ? '#2a1418' : '#232733'; ctx.fill();
    if (m.typing) { for (let k = 0; k < 3; k++) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(s.t * 7 - k * 0.9)); ctx.fillStyle = `rgba(200,210,225,${a})`; ctx.beginPath(); ctx.arc(26 + 34 + k * 26, y + 35, 8, 0, TAU); ctx.fill(); } }
    else {
      ctx.fillStyle = big ? '#ff4a52' : '#eef1f6'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      lines.forEach((l, i) => ctx.fillText(l, 26 + 24, y + 17 + fs * 0.95 + i * lh));
      if (!big) { ctx.fillStyle = '#7d8596'; ctx.font = '400 20px Inter'; ctx.textAlign = 'right'; ctx.fillText(m.time || '03:17', 26 + bw - 18, y + bh - 16); }
    }
    ctx.restore();
    y -= 22;
  }
  ctx.restore();
}
function wrapText(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const wd of words) { const tt = cur ? cur + ' ' + wd : wd; if (ctx.measureText(tt).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = tt; }
  if (cur) lines.push(cur); return lines;
}
function drawPhone(ctx, cx, cy, sc, state, opts = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(opts.rot || 0); ctx.scale(sc, sc);
  const { w, h, r } = PHONE;
  if (opts.glow !== false) radial(ctx, 0, 0, h * 0.95, '#a8c8ff', 0.18 * (opts.bright ?? 1));
  rrect(ctx, -w / 2 - 16, -h / 2 - 16, w + 32, h + 32, r + 14); ctx.fillStyle = '#0a0b0e'; ctx.fill(); ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 4; ctx.stroke();
  rrect(ctx, -w / 2, -h / 2, w, h, r); ctx.save(); ctx.clip(); ctx.translate(-w / 2, -h / 2);
  if (opts.off) { ctx.fillStyle = '#030305'; ctx.fillRect(0, 0, w, h); } else { drawChatUI(ctx, w, h, state); ctx.fillStyle = `rgba(0,0,0,${1 - (opts.bright ?? 1)})`; ctx.fillRect(0, 0, w, h); }
  ctx.restore();
  // brilho do vidro
  ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, r); ctx.clip(); const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  ctx.restore();
}

// ---------- papel com as regras (pré-renderizado) ----------
const RULES = [
  'Regras do papai para viagens — Página 2',
  '1. Todos devem usar o cinto de segurança.',
  '2. Nada de celular depois da meia-noite.',
  '3. Se eu parar de piscar… NÃO RESPONDA À MAMÃE.',
  '4. Ela só se move quando você pisca.',
  '5. Nunca diga o nome dela.',
  '6. AGUENTE ATÉ O AMANHECER.',
];
let PAPER = null, PAPER_LINES = [];
function buildPaper() {
  const pw = 900, ph = 1260; const c = document.createElement('canvas'); c.width = pw; c.height = ph; const x = c.getContext('2d');
  // forma amassada
  const r = rng(42); const edge = [];
  const N = 14; for (let i = 0; i < N; i++) edge.push([lerp(0, pw, i / N) + (r() - 0.5) * 10, 6 + r() * 14]);
  for (let i = 0; i < N; i++) edge.push([pw - 6 - r() * 14, lerp(0, ph, i / N) + (r() - 0.5) * 10]);
  for (let i = 0; i < N; i++) edge.push([lerp(pw, 0, i / N) + (r() - 0.5) * 10, ph - 6 - r() * 14]);
  for (let i = 0; i < N; i++) edge.push([6 + r() * 14, lerp(ph, 0, i / N) + (r() - 0.5) * 10]);
  x.beginPath(); edge.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
  x.fillStyle = '#ebe4d2'; x.fill(); x.save(); x.clip();
  // facetas de vinco
  for (let i = 0; i < 70; i++) {
    const cx = r() * pw, cy = r() * ph, rad = 60 + r() * 200; x.beginPath();
    for (let k = 0; k < 3; k++) { const a = r() * TAU; x.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
    x.closePath(); x.fillStyle = r() < 0.5 ? `rgba(255,255,250,${0.06 + r() * 0.08})` : `rgba(90,70,40,${0.05 + r() * 0.08})`; x.fill();
  }
  x.strokeStyle = 'rgba(90,70,40,0.22)'; x.lineWidth = 2;
  for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(r() * pw, r() * ph); x.lineTo(r() * pw, r() * ph); x.stroke(); }
  // pauta
  x.strokeStyle = 'rgba(80,120,190,0.35)'; x.lineWidth = 2; for (let y = 200; y < ph - 30; y += 74) { x.beginPath(); x.moveTo(0, y); x.lineTo(pw, y); x.stroke(); }
  x.strokeStyle = 'rgba(200,70,70,0.4)'; x.beginPath(); x.moveTo(90, 0); x.lineTo(90, ph); x.stroke();
  // mancha
  x.fillStyle = 'rgba(120,80,40,0.10)'; x.beginPath(); x.ellipse(700, 1080, 120, 80, 0.4, 0, TAU); x.fill();
  // texto à mão
  const ink = '#1d2f6e';
  x.fillStyle = ink; x.textBaseline = 'alphabetic';
  x.font = '700 50px Caveat'; x.save(); x.translate(110, 140); x.rotate(-0.015); x.fillText('Regras do papai para viagens', 0, 0); x.font = '700 42px Caveat'; x.fillText('— Página 2', 520, 52); x.restore();
  x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(110, 150); x.quadraticCurveTo(400, 158, 640, 146); x.stroke();
  const items = [
    ['1. Todos devem usar o', 'cinto de segurança.'],
    ['2. Nada de celular depois', 'da meia-noite.'],
    ['3. Se eu parar de piscar…', 'NÃO RESPONDA À MAMÃE.'],
    ['4. Ela só se move quando', 'você pisca.'],
    ['5. Nunca diga o nome dela.'],
    ['6. AGUENTE ATÉ O', 'AMANHECER.'],
  ];
  let y = 262; PAPER_LINES = [];
  items.forEach((it, i) => {
    const y0 = y;
    it.forEach((ln, j) => {
      const caps = ln === ln.toUpperCase() && /[A-Z]/.test(ln);
      x.save(); x.translate(110 + (j ? 46 : 0), y); x.rotate((r() - 0.5) * 0.02 - (i === 5 ? 0.03 : 0));
      x.font = caps ? '700 56px Kalam' : '400 50px Caveat'; x.fillStyle = caps ? '#14204d' : ink; x.fillText(ln, 0, 0);
      if (caps) { const ww = x.measureText(ln).width; x.strokeStyle = '#14204d'; x.lineWidth = 3.5; x.beginPath(); x.moveTo(0, 12); x.quadraticCurveTo(ww / 2, 18, ww, 10); x.stroke(); x.beginPath(); x.moveTo(4, 22); x.quadraticCurveTo(ww / 2, 27, ww - 6, 20); x.stroke(); }
      x.restore(); y += 74;
    });
    PAPER_LINES.push([y0 - 50, y - 50]); y += 74 * 0.55;
  });
  x.restore();
  x.strokeStyle = 'rgba(60,50,30,0.5)'; x.lineWidth = 2; x.beginPath(); edge.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke();
  PAPER = c;
}
let FABRIC = null;
function buildFabric() {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 2200; const x = c.getContext('2d');
  x.fillStyle = '#2a2c33'; x.fillRect(0, 0, 1400, 2200);
  const r = rng(7); for (let i = 0; i < 9000; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)'; x.fillRect(r() * 1400, r() * 2200, 2 + r() * 3, 2 + r() * 3); }
  x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 6; for (const yy of [300, 1900]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(1400, yy); x.stroke(); }
  x.setLineDash([14, 10]); x.strokeStyle = 'rgba(160,160,170,0.18)'; x.lineWidth = 3; for (const yy of [318, 1882]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(1400, yy); x.stroke(); }
  FABRIC = c;
}

// ---------- velocímetro ----------
function drawSpeedo(ctx, cx, cy, R, kmh, t) {
  ctx.fillStyle = '#020306'; ctx.fillRect(-500, -500, W + 1000, H + 1000);
  radial(ctx, cx, cy, R * 1.5, '#1aa8d8', 0.18);
  ctx.strokeStyle = '#11151c'; ctx.lineWidth = 40; ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(140,200,240,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R + 12, 0, TAU); ctx.stroke();
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = v => lerp(a0, a1, v / 220);
  for (let v = 0; v <= 220; v += 10) {
    const a = ang(v), big = v % 20 === 0, red = v >= 160;
    ctx.strokeStyle = red ? '#ff4a3a' : '#bfe8ff'; ctx.lineWidth = big ? 7 : 3;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * (big ? 0.84 : 0.9), cy + Math.sin(a) * R * (big ? 0.84 : 0.9)); ctx.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98); ctx.stroke();
    if (big) { ctx.fillStyle = red ? '#ff6a5a' : '#d6f0ff'; ctx.font = `600 ${R * 0.1}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(v, cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7); }
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(80,200,255,0.25)'; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(cx, cy, R * 0.98, a0, ang(kmh)); ctx.stroke(); ctx.restore();
  const a = ang(kmh) + Math.sin(t * 40) * 0.006 * (kmh / 100);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
  ctx.shadowColor = '#ff3a2a'; ctx.shadowBlur = 30; ctx.fillStyle = '#ff3b2b';
  ctx.beginPath(); ctx.moveTo(-R * 0.12, -8); ctx.lineTo(R * 0.92, -2); ctx.lineTo(R * 0.92, 2); ctx.lineTo(-R * 0.12, 8); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0d0f14'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a4350'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#d6f0ff'; ctx.font = `700 ${R * 0.2}px Inter`; ctx.textAlign = 'center'; ctx.fillText(Math.round(kmh), cx, cy + R * 0.42);
  ctx.font = `400 ${R * 0.07}px Inter`; ctx.fillStyle = '#86a8c0'; ctx.fillText('km/h', cx, cy + R * 0.56);
}

// ---------- vista externa lateral ----------
// o: t, dist, dawn, speedK (borrão), heads [{x,c}], ghost (0..1 silhueta pálida no banco de trás)
function drawExterior(ctx, o) {
  const dawn = o.dawn || 0, d = o.dist || 0, hy = 1150;
  let g = ctx.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, col(mixc('#02040a', '#3a4f8a', dawn))); g.addColorStop(0.6, col(mixc('#071022', '#e98a6a', dawn))); g.addColorStop(1, col(mixc('#0e1a30', '#ffcf8a', dawn)));
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, hy + 300);
  if (dawn > 0) { const sy = lerp(hy + 60, hy - 120, dawn); radial(ctx, 820, sy, 700, '#ffb35a', 0.55 * dawn); ctx.fillStyle = col('#fff1c8', dawn); ctx.beginPath(); ctx.arc(820, sy, 70, 0, TAU); ctx.fill(); }
  else { radial(ctx, 830, 380, 160, '#9fb6e0', 0.2); ctx.fillStyle = '#dfe8f8'; ctx.beginPath(); ctx.arc(830, 380, 34, 0, TAU); ctx.fill(); const r = rng(3); ctx.fillStyle = 'rgba(200,215,255,0.6)'; for (let i = 0; i < 70; i++) ctx.fillRect(r() * W, r() * 900, 2, 2); }
  // morros em camadas (parallax)
  const layers = [[0.02, 160, '#0a1020', '#6a4a6a', 0.004], [0.08, 90, '#060a14', '#4a3448', 0.008], [0.3, 50, '#03050a', '#2a2030', 0.02]];
  layers.forEach(([par, amp, cn, cd, fr], i) => {
    ctx.fillStyle = col(mixc(cn, cd, dawn)); ctx.beginPath(); ctx.moveTo(-300, hy + 20);
    for (let x = -300; x <= W + 300; x += 12) ctx.lineTo(x, hy - amp * (0.6 + 0.4 * noise1((x + d * par * 40) * fr + i * 9)) - treeLine(x + d * par * 40) * (i === 2 ? 1.5 : 0));
    ctx.lineTo(W + 300, hy + 20); ctx.closePath(); ctx.fill();
  });
  // chão / acostamento
  ctx.fillStyle = col(mixc('#030407', '#2a2026', dawn)); ctx.fillRect(-300, hy, W + 600, H);
  ctx.fillStyle = col(mixc('#0c0e13', '#4a4248', dawn)); ctx.fillRect(-300, hy + 160, W + 600, 330);
  ctx.fillStyle = `rgba(230,230,220,${0.5 + dawn * 0.3})`; ctx.fillRect(-300, hy + 470, W + 600, 6);
  const dsh = ((d * 40) % 260 + 260) % 260; ctx.fillStyle = 'rgba(235,190,70,0.8)'; for (let x = -300 - dsh; x < W + 300; x += 260) ctx.fillRect(x, hy + 172, 150, 6);
  // postes passando (primeiro plano)
  const pg = 900, po = ((d * 40) % pg + pg) % pg;
  for (let x = W + 400 - po; x > -400; x -= pg) {
    ctx.fillStyle = col(mixc('#06070a', '#3a3036', dawn)); ctx.fillRect(x, hy - 560, 18, 1100);
    ctx.fillRect(x, hy - 560, 220, 14);
    if (dawn < 0.9) { radial(ctx, x + 210, hy - 540, 420, '#ff9838', 0.5 * (1 - dawn)); ctx.fillStyle = col('#ffe0b0', 1 - dawn); ctx.beginPath(); ctx.ellipse(x + 200, hy - 540, 26, 8, 0, 0, TAU); ctx.fill(); }
  }
  // guard-rail
  ctx.fillStyle = col(mixc('#1a1d24', '#8a8088', dawn)); ctx.fillRect(-300, hy + 560, W + 600, 34);
  for (let x = -300 - ((d * 52) % 120 + 120) % 120; x < W + 300; x += 120) ctx.fillRect(x, hy + 560, 12, 140);
  // carro
  drawCarSide(ctx, 540 + (o.carDX || 0), hy + 360 + (o.bounce || 0), 1.0, o);
  // linhas de velocidade
  if (o.speedK > 0) {
    const r = rng(Math.floor(o.t * 30)); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26 * o.speedK; i++) { const y = r() * H, x = r() * W, l = 200 + r() * 500; ctx.strokeStyle = `rgba(200,220,255,${0.08 + r() * 0.12})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); }
    ctx.restore();
  }
}
function drawCarSide(ctx, cx, cy, sc, o) {
  const dawn = o.dawn || 0;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(0, 105, 480, 26, 0, 0, TAU); ctx.fill();
  // farol (cone para a direita = frente)
  if (dawn < 0.95) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(460, 0, 1100, 0); g.addColorStop(0, `rgba(255,240,210,${0.45 * (1 - dawn)})`); g.addColorStop(1, 'rgba(255,240,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(460, 10); ctx.lineTo(1300, -120); ctx.lineTo(1300, 180); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const body = mixc('#1f2a38', '#4a5668', dawn);
  ctx.fillStyle = col(body); ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-470, 60); ctx.lineTo(-470, -10); ctx.quadraticCurveTo(-460, -60, -400, -70); ctx.lineTo(-300, -80);
  ctx.quadraticCurveTo(-220, -190, -120, -195); ctx.lineTo(150, -195); ctx.quadraticCurveTo(230, -190, 300, -90); ctx.lineTo(440, -70); ctx.quadraticCurveTo(480, -60, 480, -10); ctx.lineTo(480, 60); ctx.closePath(); ctx.fill(); ctx.stroke();
  // janelas
  const winC = mixc('#0a1222', '#ffd7a0', dawn * 0.6);
  ctx.fillStyle = col(winC);
  ctx.beginPath(); ctx.moveTo(-280, -85); ctx.quadraticCurveTo(-210, -175, -125, -178); ctx.lineTo(0, -178); ctx.lineTo(0, -85); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, -85); ctx.lineTo(18, -178); ctx.lineTo(145, -178); ctx.quadraticCurveTo(215, -172, 275, -90); ctx.closePath(); ctx.fill();
  // silhuetas dentro (pai na frente/direita, menino atrás/esquerda)
  ctx.save(); ctx.beginPath(); ctx.rect(-290, -180, 570, 98); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.beginPath(); ctx.ellipse(150, -110, 34, 42, 0, 0, TAU); ctx.fill(); ctx.fillRect(105, -80, 100, 40);
  ctx.beginPath(); ctx.ellipse(-150, -100, 28, 34, 0, 0, TAU); ctx.fill(); ctx.fillRect(-190, -75, 80, 40);
  if (o.ghost) { ctx.fillStyle = `rgba(215,212,205,${0.55 * o.ghost})`; ctx.beginPath(); ctx.ellipse(-60, -120, 24, 32, 0, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(0,0,0,${0.8 * o.ghost})`; ctx.beginPath(); ctx.ellipse(-60, -128, 30, 36, 0, Math.PI, TAU); ctx.fill(); ctx.fillRect(-90, -128, 60, 70); ctx.fillStyle = `rgba(230,230,230,${0.9 * o.ghost})`; ctx.fillRect(-70, -122, 6, 3); ctx.fillRect(-55, -122, 6, 3); }
  ctx.restore();
  ctx.strokeStyle = OUT; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(9, -180); ctx.lineTo(9, -84); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.moveTo(-460, -20); ctx.lineTo(470, -20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -80); ctx.lineTo(10, 55); ctx.stroke();
  ctx.strokeStyle = `rgba(160,200,255,${0.25 + dawn * 0.4})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, -82); ctx.quadraticCurveTo(-220, -190, -120, -195); ctx.lineTo(150, -195); ctx.stroke();
  // lanternas
  ctx.fillStyle = '#ff2a1a'; ctx.fillRect(-474, -50, 18, 40); radial(ctx, -470, -30, 140, '#ff2a1a', 0.45);
  ctx.fillStyle = '#fff4d8'; ctx.fillRect(462, -50, 18, 32);
  // rodas
  const spin = (o.dist || 0) * 3;
  for (const wx of [-300, 300]) {
    ctx.fillStyle = '#050608'; ctx.beginPath(); ctx.arc(wx, 60, 78, 0, TAU); ctx.fill();
    ctx.fillStyle = col(mixc('#3a3f48', '#9a9aa0', dawn)); ctx.beginPath(); ctx.arc(wx, 60, 44, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 8; for (let k = 0; k < 5; k++) { const a = spin + k * TAU / 5; ctx.beginPath(); ctx.moveTo(wx, 60); ctx.lineTo(wx + Math.cos(a) * 40, 60 + Math.sin(a) * 40); ctx.stroke(); }
  }
  ctx.restore();
}
