// ---------- tomadas específicas ----------
const MSGS = [
  { text: 'Onde vocês estão? Seu pai ainda não chegou ao posto.', at: 52.6, time: '03:17' },
  { text: 'Não deixa ele encostar em você.', at: 58.9, time: '03:17' },
  { text: 'Meu amor, não escuta ele.', at: 72.3, time: '03:18' },
  { text: 'Você piscou, meu amor?', at: 90.9, time: '03:19' },
];
const TYPING = [[51.5, 52.6], [58.2, 58.9], [71.4, 72.3], [90.1, 90.9], [139.2, 141.54]];
const FINAL_MSG = { text: 'VOCÊ PISCOU?', at: 141.54, big: true };
const BUZZ = [51.25, 52.6, 58.9, 72.3, 88.55, 90.9, 136.7, 141.54];
function buzzAmt(t) { let a = 0; for (const b of BUZZ) { const d = t - b; if (d >= 0 && d < 0.55) a = Math.max(a, Math.sin(d / 0.55 * Math.PI)); } return a; }
function phoneState(t, final = false) {
  const typingNow = TYPING.some(([a, b]) => t >= a && t < b);
  return { t, msgs: final ? [FINAL_MSG] : MSGS, typingNow, clock: final ? '05:48' : (t < 72 ? '03:17' : '03:19'), name: 'Mãe' };
}

// close do celular (tela)
function shotPhone(ctx, t, cam, final = false) {
  ctx.fillStyle = '#020204'; ctx.fillRect(0, 0, W, H);
  const bz = buzzAmt(t);
  ctx.save(); applyCam(ctx, cam);
  // mãos/sombra ao redor
  radial(ctx, 540, 960, 1100, '#2a3a5a', 0.25);
  ctx.fillStyle = lc(CH.boy.skin, LIGHT.phone, 0.55);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(540 + s * 470, 1500, 120, 260, s * 0.2, 0, TAU); ctx.fill(); }
  drawPhone(ctx, 540 + Math.sin(t * 90) * 6 * bz, 960, 1.5, phoneState(t, final), { glow: true });
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(540 + s * 405, 1540); ctx.rotate(s * -0.5); ctx.fillStyle = lc(CH.boy.skin, LIGHT.phone, 0.85); ctx.strokeStyle = OUT; ctx.lineWidth = 4; rrect(ctx, -40, -150, 80, 260, 40); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

// colo do menino segurando o celular (visto de cima)
function shotLap(ctx, t, cam, o = {}) {
  const L = o.L || LIGHT.night, on = o.on ?? 1, bz = buzzAmt(t);
  ctx.fillStyle = '#04050a'; ctx.fillRect(0, 0, W, H);
  ctx.save(); applyCam(ctx, cam);
  ctx.drawImage(FABRIC, -160, -140);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-200, -200, 1500, 2400);
  const jeans = '#24324e';
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(540 + s * 190, 1500); ctx.rotate(s * 0.06); rrect(ctx, -170, -500, 340, 1200, 150); ctx.fillStyle = lc(jeans, L, 1.0); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = lca('#8aa0c8', L, 0.2); ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(s * 120, -480); ctx.lineTo(s * 130, 600); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  // moletom (barriga, mais escuro)
  ctx.fillStyle = lc(CH.boy.cloth2, L, 0.8); ctx.beginPath(); ctx.moveTo(-100, -200); ctx.lineTo(1180, -200); ctx.lineTo(1180, 700); ctx.quadraticCurveTo(540, 820, -100, 700); ctx.closePath(); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = lca('#000', L, 0.35); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(330, 520); ctx.quadraticCurveTo(540, 550, 750, 520); ctx.lineTo(790, 750); ctx.moveTo(330, 520); ctx.lineTo(290, 750); ctx.stroke();
  // cinto
  ctx.fillStyle = lc('#22252c', L, 1.1); ctx.beginPath(); ctx.moveTo(-100, 640); ctx.lineTo(1180, 520); ctx.lineTo(1180, 590); ctx.lineTo(-100, 710); ctx.fill();
  // mangas vindo dos ombros (cantos de cima) até as mãos
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(540 + s * 700, -200); ctx.lineTo(540 + s * 380, -200);
    ctx.quadraticCurveTo(540 + s * 300, 600, 540 + s * 160, 1060); ctx.lineTo(540 + s * 330, 1150);
    ctx.quadraticCurveTo(540 + s * 560, 700, 540 + s * 700, 300); ctx.closePath();
    ctx.fillStyle = lc(CH.boy.cloth, L, 0.85); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = lca('#000', L, 0.3); ctx.lineWidth = 3; for (const k of [0.3, 0.55]) { ctx.beginPath(); ctx.moveTo(540 + s * lerp(380, 700, k), 200); ctx.quadraticCurveTo(540 + s * lerp(300, 560, k) - s * 20, 700, 540 + s * lerp(170, 320, k), 1080); ctx.stroke(); }
    rrect(ctx, 540 + s * 245 - 95, 1060, 190, 70, 30); ctx.fillStyle = lc(CH.boy.cloth2, L, 0.9); ctx.fill(); ctx.stroke();
  }
  // luz da tela
  const glowA = on * 0.5;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(540, 980, 50, 540, 980, 900); gg.addColorStop(0, `rgba(150,180,240,${glowA * 0.6})`); gg.addColorStop(1, 'rgba(150,180,240,0)'); ctx.fillStyle = gg; ctx.fillRect(-200, -200, 1500, 2400); ctx.restore();
  // palmas atrás do celular
  const PL = Object.assign({}, L, { glow: null }); const skin = lc(CH.boy.skin, mixLight(L, LIGHT.phone, on), 0.9);
  const px = 540 + Math.sin(t * 90) * 7 * bz, py = 1000;
  for (const s of [-1, 1]) { ctx.fillStyle = skin; ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(px + s * 185, py + 170, 110, 150, s * 0.3, 0, TAU); ctx.fill(); ctx.stroke(); }
  drawPhone(ctx, px, py, 0.62, phoneState(t), { off: on < 0.05, bright: on, rot: -0.04 + Math.sin(t * 90) * 0.01 * bz });
  // dedos e polegares por cima das bordas
  const fL = mixLight(L, LIGHT.phone, on);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) fingerChain(ctx, px + s * 190, py + 40 + k * 70, s < 0 ? 0 : Math.PI, [42, 26], 30, [0, 0.4 * -s], CH.boy.skin, fL);
    fingerChain(ctx, px + s * 200, py + 300, s < 0 ? -0.9 : Math.PI + 0.9, [70, 50], 36, [0, -s * 0.3], CH.boy.skin, fL);
  }
  if (o.creep) drawWomHand(ctx, lerp(-420, -140, o.creep), 1180, -0.25, 1.15, 0.9 + o.creep * 0.2, 0.2, LIGHT.night, t);
  ctx.restore();
  ctx.save(); const vg = ctx.createRadialGradient(W / 2, H * 0.52, 200, W / 2, H * 0.52, H * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// fundo genérico + close do menino
function shotBoy(ctx, t, cam, P, o = {}) {
  const L = o.L || LIGHT.night;
  ctx.save(); applyCam(ctx, cam);
  drawBoyBG(ctx, { L, t, dawn: o.dawn || 0, speed: o.speed ?? 1 });
  ctx.save(); ctx.translate(560 + (o.dx || 0), 880 + (o.dy || 0)); ctx.scale(2.1, 2.1); drawChar(ctx, 'boy', Object.assign({ beltSide: -1 }, P), L); ctx.restore();
  if (o.after) o.after(ctx);
  ctx.restore();
}

// close do pai de perfil (câmera no banco do passageiro)
function shotDad(ctx, t, cam, P, o = {}) {
  const L = o.L || LIGHT.night;
  ctx.save(); applyCam(ctx, cam);
  ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); drawBoyBG(ctx, { L, t, dawn: o.dawn || 0, speed: o.speed ?? 1 }); ctx.restore();
  radial(ctx, 900, 1300, 700, '#40d8ff', 0.12);
  ctx.save(); ctx.translate(520, 860); ctx.scale(2.0, 2.0); drawChar(ctx, 'dad', Object.assign({ beltSide: 1, yaw: 0.5 }, P), L); ctx.restore();
  ctx.restore();
}

// mãos no volante
function drawFist(ctx, x, y, sc, s, tight, L, t) {
  const c = CH.dad; ctx.save(); ctx.translate(x + Math.sin(t * 47) * 1.5 * tight, y); ctx.scale(sc * s, sc);
  // antebraço / manga
  ctx.fillStyle = lc(c.cloth, L); ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-60, -170); ctx.lineTo(-260, -620); ctx.lineTo(60, -700); ctx.lineTo(120, -150); ctx.closePath(); ctx.fill(); ctx.stroke();
  // dorso da mão
  const skin = lc(c.skin, L, 0.95);
  blob(ctx, [[-90, -40], [-70, -170], [110, -190], [150, -60], [120, 10], [-80, 10]], skin);
  // tendões
  ctx.strokeStyle = lca('#3a1f18', L, 0.25 + tight * 0.4); ctx.lineWidth = 3;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-40 + k * 40, -170); ctx.lineTo(-60 + k * 52, -40); ctx.stroke(); }
  // dedos sobre o aro
  const kn = mixc(c.skin, '#f4e2d4', tight * 0.65);
  for (let k = 0; k < 4; k++) {
    const fx = -70 + k * 55, press = tight * 10;
    ctx.fillStyle = lc(c.skin, L, 0.9); ctx.strokeStyle = OUT; ctx.lineWidth = 4;
    rrect(ctx, fx - 26, -40 + press, 54, 110 - press, 26); ctx.fill(); ctx.stroke();
    ctx.fillStyle = lc(kn, L, 1.05); ctx.beginPath(); ctx.ellipse(fx + 1, -26 + press, 20, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = lca('#3a1f18', L, 0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 16, 20 + press * 0.5); ctx.lineTo(fx + 16, 20 + press * 0.5); ctx.stroke();
  }
  // polegar
  fingerChain(ctx, 120, -80, 1.9 - tight * 0.2, [70, 50], 44, [0, 0.4], c.skin, L, '#d8b8a8');
  ctx.restore();
}
function shotWheel(ctx, t, cam, tight) {
  const L = LIGHT.night;
  ctx.save(); applyCam(ctx, cam);
  ctx.fillStyle = '#020306'; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 900); ctx.clip(); drawRoadView(ctx, -300, -100, W + 600, 700, { dist: t * 28, signs: [], hor: 0.5 }); ctx.restore();
  ctx.fillStyle = '#05060a'; ctx.fillRect(-300, 580, W + 600, H);
  radial(ctx, 540, 1250, 700, '#40d8ff', 0.25);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 130; ctx.beginPath(); ctx.arc(540, 1900, 980, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
  ctx.strokeStyle = '#23272f'; ctx.lineWidth = 118; ctx.beginPath(); ctx.arc(540, 1900, 980, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
  ctx.strokeStyle = 'rgba(140,210,245,0.45)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(540, 1900, 1030, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; for (let k = 0; k < 40; k++) { const a = Math.PI * (1.08 + k * 0.021); ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * 935, 1900 + Math.sin(a) * 935); ctx.lineTo(540 + Math.cos(a) * 1030, 1900 + Math.sin(a) * 1030); ctx.stroke(); }
  sodiumSweep(ctx, t, 2.14, 0.08, 0.3);
  drawFist(ctx, 250, 1000, 1.25, 1, tight, L, t);
  drawFist(ctx, 830, 1000, 1.25, -1, tight, L, t + 1);
  sodiumSweep(ctx, t, 2.14, 0.12, 0.3);
  ctx.restore();
}

// pulso do menino agarrado
function shotWrist(ctx, t, cam, grip, pull, L) {
  ctx.save(); applyCam(ctx, cam);
  ctx.drawImage(FABRIC, -160, -140); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-300, -300, 1700, 2600);
  const pj = Math.sin(t * 13) * 18 * pull, px = pull * 60;
  // antebraço do menino
  ctx.save(); ctx.translate(px + pj, 0);
  ctx.fillStyle = lc(CH.boy.skin, L, 0.95); ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(150, 900); ctx.lineTo(760, 880); ctx.lineTo(760, 1060); ctx.lineTo(150, 1040); ctx.closePath(); ctx.fill(); ctx.stroke();
  blob(ctx, [[60, 870], [170, 880], [190, 1060], [40, 1090], [-20, 980]], lc(CH.boy.skin, L, 0.95));
  for (let k = 0; k < 4; k++) fingerChain(ctx, 50, 905 + k * 44, Math.PI, [40, 30], 36, [0, -0.9], CH.boy.skin, L);
  ctx.fillStyle = lc(CH.boy.cloth, L); rrect(ctx, 700, 830, 600, 290, 60); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = lca('#000', L, 0.3); ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(720 + k * 12, 850); ctx.lineTo(720 + k * 12, 1100); ctx.stroke(); }
  ctx.restore();
  // mão dela
  const gx = 430 + pj * 0.8 + px, gy = lerp(640, 860, easeOut(grip));
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(gx, 1050, 160 * grip, 30, 0, 0, TAU); ctx.fill();
  drawWomHand(ctx, gx, gy, Math.PI / 2 + 0.15, 1.35, 0.55, lerp(0.05, 0.75, grip), LIGHT.night, t);
  ctx.restore();
}

// mão esticando no banco
function shotReach(ctx, t, cam, stretch) {
  const L = LIGHT.night;
  ctx.save(); applyCam(ctx, cam);
  ctx.drawImage(FABRIC, -160, -140); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-300, -300, 1700, 2600);
  // perna + mão do menino à esquerda
  ctx.fillStyle = lc('#24324e', L); ctx.strokeStyle = OUT; ctx.lineWidth = 4; rrect(ctx, -200, 1000, 520, 1200, 160); ctx.fill(); ctx.stroke();
  ctx.fillStyle = lc(CH.boy.cloth, L); ctx.beginPath(); ctx.moveTo(-200, 300); ctx.lineTo(250, 700); ctx.lineTo(160, 860); ctx.lineTo(-200, 600); ctx.closePath(); ctx.fill(); ctx.stroke();
  blob(ctx, [[150, 780], [290, 830], [300, 960], [190, 1010], [120, 900]], lc(CH.boy.skin, L, 0.95));
  for (let k = 0; k < 4; k++) fingerChain(ctx, 270 + k * 10, 850 + k * 40, 0.6, [40, 28], 32, [0, 0.8], CH.boy.skin, L);
  radial(ctx, 900, 900, 700, '#7ad8ff', 0.08);
  // mão da mulher vindo da direita
  drawWomHand(ctx, 980 - stretch * 60, 980, Math.PI + 0.12, 1.15, stretch, 0.12 + Math.sin(t * 2) * 0.05, L, t);
  sodiumSweep(ctx, t, 2.14, 0.1, 0.3);
  ctx.restore();
}

// camada da mulher que se desfaz em luz
let WLAYER = null, WLX = null, EMB = [];
function womDissolveLayer(drawFn, amt, t) {
  if (!WLAYER) { WLAYER = document.createElement('canvas'); WLAYER.width = W; WLAYER.height = H; WLX = WLAYER.getContext('2d'); }
  WLX.setTransform(1, 0, 0, 1, 0, 0); WLX.clearRect(0, 0, W, H); drawFn(WLX);
  EMB = [];
  if (amt > 0) {
    WLX.setTransform(1, 0, 0, 1, 0, 0); WLX.globalCompositeOperation = 'destination-out';
    const r = rng(77);
    for (let i = 0; i < 2200; i++) {
      const x = r() * W, y = r() * H, th = r() * 0.85 + (1 - y / H) * 0.15 - (x / W) * 0.1; // queima de cima/direita
      const k = clamp((amt - th) / 0.2); if (k <= 0) continue;
      const rr = 8 + k * 60, gg = WLX.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, 'rgba(0,0,0,1)'); gg.addColorStop(0.55, 'rgba(0,0,0,0.9)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      WLX.fillStyle = gg; WLX.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      if (k < 1) EMB.push([x, y, rr, k]);
    }
    WLX.globalCompositeOperation = 'source-over';
  }
  return WLAYER;
}
function motes(ctx, t, amt, cx, cy) {
  if (amt <= 0 || amt >= 1.6) return; const r = rng(5);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 220; i++) {
    const st = r() * 0.9, life = amt - st; if (life < 0) continue;
    const x = cx + (r() - 0.5) * 420 + life * (120 + r() * 260), y = cy + (r() - 0.5) * 900 - life * (200 + r() * 300);
    const a = Math.max(0, 1 - life * 1.2) * 0.9;
    ctx.fillStyle = `rgba(255,${200 + r() * 40 | 0},140,${a})`; ctx.beginPath(); ctx.arc(x, y, 2 + r() * 4, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------- linha do tempo ----------
const T_END = 146.0;
const NIGHT_D = t => t * ROAD.speed;
// postura base da mulher
const WOM0 = { yaw: -0.3, lookX: -0.7, eye: 1.45, pupil: 0.55, bags: 0.5, glint: 0.6 };

const SHOTS = [
  // CENA 1 — A ESTRADA
  { a: 0, b: 7.75, f(ctx, t) {
    const cam = { x: 540, y: kf(t, [[0, 820], [4.0, 700], [7.75, 258]]), z: kf(t, [[0, 1.12], [4.0, 1.3], [7.75, 3.5]], easeIO) };
    const s = shake(t, 3, 3); cam.sx = s[0]; cam.sy = s[1];
    ctx.save(); applyCam(ctx, cam);
    drawCabinForward(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, mirror: mirrorRear({ sc: 0.36, cx: 840, cy: 880, dist: NIGHT_D(t), t, L: LIGHT.nightDim, boy: { lookX: 0.3 }, wom: Object.assign({}, WOM0, { yaw: 0.2, lookX: 0.4, glint: 1 }), womL: Object.assign({}, LIGHT.nightDim, { bright: 0.3, rimA: 0.25 }), womX: 840, womY: 860, dark: 0.35 }) });
    ctx.restore();
  } },
  // CENA 2 — AS REGRAS
  { a: 7.75, b: 32.7, f(ctx, t) {
    const lt = t - 7.75;
    const ruleKeys = [[7.75, -1], [8.6, 0], [11.8, 1], [15.6, 2], [22.3, 3], [26.2, 4], [29.4, 5]];
    let idx = -1; for (const [tt, i] of ruleKeys) if (t >= tt) idx = i;
    const ly = i => i < 0 ? 140 : (PAPER_LINES[i][0] + PAPER_LINES[i][1]) / 2;
    // câmera desliza entre as regras
    let cur = ly(-1), last = ly(-1), tStart = 7.75;
    for (const [tt, i] of ruleKeys) if (t >= tt) { last = cur; cur = ly(i); tStart = tt; }
    const u = easeIO((t - tStart) / 0.9); const focusY = lerp(last, cur, u);
    const paperX = 540, paperY = 980, rot = -0.07;
    const wy = paperY + (focusY - 630) * Math.cos(rot);
    const zoom = idx < 0 ? lerp(0.95, 1.12, easeIO(lt / 0.85)) : 1.14 + (idx === 2 || idx === 5 ? 0.1 * easeIO((t - tStart) / 3) : 0.03 * Math.sin(lt * 0.3));
    const cam = { x: 560 + Math.sin(lt * 0.25) * 12 - (focusY - 630) * Math.sin(rot), y: wy, z: zoom, r: 0.025 * Math.sin(lt * 0.2) };
    const s = shake(t, 2.2, 6); cam.sx = s[0]; cam.sy = s[1];
    ctx.save(); applyCam(ctx, cam);
    ctx.drawImage(FABRIC, -160, -140);
    ctx.save(); ctx.translate(paperX, paperY); ctx.rotate(rot); ctx.translate(-450, -630);
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.drawImage(PAPER, 0, 0); ctx.shadowColor = 'transparent';
    // luz focada na regra atual
    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createLinearGradient(0, focusY - 400, 0, focusY + 400);
    g.addColorStop(0, 'rgba(40,50,80,1)'); g.addColorStop(0.38, 'rgba(255,255,255,1)'); g.addColorStop(0.62, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(40,50,80,1)');
    ctx.fillStyle = g; ctx.fillRect(-100, -100, 1100, 1500);
    ctx.restore();
    ctx.restore();
    // luz do painel (azul-esverdeada) piscando
    const flick = [9.6, 16.3, 19.9, 24.7, 27.6, 30.3, 31.9].reduce((m, ft) => { const d = t - ft; return d > 0 && d < 0.35 ? Math.min(m, 0.25 + 0.75 * Math.abs(Math.sin(d * 40))) : m; }, 1);
    fillScreen(ctx, '#0a1830', 0.45 * (2 - flick) * 0.6, 'multiply');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const dg = ctx.createRadialGradient(W * 0.2, H * 1.05, 50, W * 0.2, H * 1.05, H * 0.9); dg.addColorStop(0, `rgba(60,210,230,${0.22 * flick})`); dg.addColorStop(1, 'rgba(60,210,230,0)'); ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (flick < 1) fillScreen(ctx, '#000', (1 - flick) * 0.55);
    sodiumSweep(ctx, t, 2.14, 0.1, 0.5);
  } },
  // CENA 3 — ELA ESTÁ OLHANDO
  { a: 32.7, b: 34.4, f(ctx, t) { const lt = t - 32.7;
    shotBoy(ctx, t, { x: 560, y: 900, z: 1.0 + lt * 0.03 }, { lookY: kf(t, [[32.7, 0.9], [33.9, 0.9], [34.3, -0.7]]), lookX: kf(t, [[33.9, 0], [34.3, -0.4]]), eye: kf(t, [[32.7, 0.75], [33.9, 0.75], [34.3, 1.0]]), brWorry: 0.4 });
  } },
  { a: 34.4, b: 39.3, f(ctx, t) { const lt = t - 34.4;
    const reveal = easeIO((t - 36.4) / 0.9);
    const cam = { x: 540, y: 250, z: 5.0 + lt * 0.12 };
    ctx.save(); applyCam(ctx, cam);
    drawCabinForward(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, mirror: mirrorRear({ sc: 0.52, cx: 820, cy: 840, dist: NIGHT_D(t), t, L: mixLight(LIGHT.nightDim, LIGHT.night, reveal), boy: { lookX: 0.3 }, wom: Object.assign({}, WOM0, { yaw: 0.25, lookX: 0.5, lookY: -0.1, eye: lerp(1.2, 1.55, reveal) }), womX: 840, womY: 850, dark: lerp(0.6, 0.12, reveal) }) });
    ctx.restore();
    if (t > 36.3 && t < 37.3) { const k = Math.sin((t - 36.3) / 1.0 * Math.PI); fillScreen(ctx, '#ff9a3c', 0.18 * k, 'lighter'); }
  } },
  { a: 39.3, b: 41.1, f(ctx, t) { const lt = t - 39.3;
    const eye = kf(t, [[39.3, 1.35], [39.9, 1.35], [40.25, 0], [40.6, 0], [40.85, 1.2]]);
    shotBoy(ctx, t, { x: 560, y: 760, z: 1.45 + lt * 0.08 }, { lookY: -0.75, lookX: -0.35, eye, brWorry: 1, brRaise: 0.5, mOpen: 0.15 });
  } },
  { a: 41.1, b: 42.45, f(ctx, t) { const lt = t - 41.1;
    const j = lt < 0.3 ? shake(t, 30 * (1 - lt / 0.3), 30) : [0, 0];
    const cam = { x: 540, y: 250, z: 6.0 + lt * 0.15, sx: j[0], sy: j[1] };
    ctx.save(); applyCam(ctx, cam);
    drawCabinForward(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, mirror: mirrorRear({ sc: 0.82, cx: 590, cy: 800, dist: NIGHT_D(t), t, L: LIGHT.night, boy: { lookX: 0.3 }, wom: Object.assign({}, WOM0, { yaw: 0.1, lookX: 0.3, lookY: 0, eye: 1.6, pupil: 0.45, tilt: 0.12 }), womX: 560, womY: 830, womS: 1.05, dark: 0.1 }) });
    ctx.restore();
  } },
  { a: 42.45, b: 45.9, f(ctx, t) { const lt = t - 42.45;
    const talk = (t > 43.3 && t < 45.5) ? Math.max(0, Math.sin(t * 17)) * 0.22 + 0.05 : 0.04;
    shotBoy(ctx, t, { x: 520, y: 880, z: 1.25 + lt * 0.03 }, { yaw: -0.38, lookX: kf(t, [[42.45, -0.2], [42.9, -0.95], [44.6, -0.95], [44.9, 0.2], [45.3, -0.9]]), lookY: -0.2, eye: 1.15, brWorry: 1, mOpen: talk });
  } },
  { a: 45.9, b: 48.0, f(ctx, t) { const lt = t - 45.9;
    shotWheel(ctx, t, { x: 540, y: 1000, z: 1.0 + lt * 0.05 }, easeIO(lt / 1.8));
  } },
  { a: 48.0, b: 50.15, f(ctx, t) { const lt = t - 48.0;
    shotDad(ctx, t, { x: 520, y: 760, z: 1.15 + lt * 0.06 }, { eye: 1.18, brAngry: 0.6, brWorry: 0.4, clench: 1, sweat: 1, sweatT: lt * 0.4, lookX: 0.6 });
  } },
  // CENA 4 — A MENSAGEM
  { a: 50.15, b: 52.3, f(ctx, t) { const lt = t - 50.15;
    shotLap(ctx, t, { x: 540, y: 1000, z: 1.0 + lt * 0.05 }, { on: easeOut((t - 51.25) / 0.3) });
  } },
  { a: 52.3, b: 55.6, f(ctx, t) { const lt = t - 52.3; shotPhone(ctx, t, { x: 540, y: 960, z: 1.0 + lt * 0.02 }); } },
  { a: 55.6, b: 58.4, f(ctx, t) { const lt = t - 55.6;
    const L = Object.assign({}, LIGHT.phone, { glow: { x: 0, y: 260, r: 320, c: '#bcd6ff', a: 0.25 } });
    shotBoy(ctx, t, { x: 560, y: 860, z: 1.3 + lt * 0.04 }, { lookY: 0.85, lookX: 0.05, eye: 0.85, brWorry: kf(t, [[55.6, 0.3], [57, 1]]), mOpen: 0.06 }, { L });
  } },
  { a: 58.4, b: 64.3, f(ctx, t) { const lt = t - 58.4; shotPhone(ctx, t, { x: 540, y: 900, z: 1.06 + lt * 0.03 }); } },
  { a: 64.3, b: 67.2, f(ctx, t) { const lt = t - 64.3;
    const L = Object.assign({}, LIGHT.phone, { glow: { x: 0, y: 260, r: 320, c: '#bcd6ff', a: 0.2 } });
    const talk = (t > 64.4 && t < 67.0) ? Math.max(0, Math.sin(t * 15)) * 0.3 + 0.05 : 0;
    shotBoy(ctx, t, { x: 520, y: 880, z: 1.2 + lt * 0.03 }, { yaw: -0.4, lookX: -0.95, lookY: -0.1, eye: 1.1, brWorry: 0.8, brRaise: 0.3, mOpen: talk }, { L });
  } },
  { a: 67.2, b: 70.9, f(ctx, t) { const lt = t - 67.2;
    const shout = easeOut((t - 68.9) / 0.25);
    const s = shake(t, 4 + shout * 22, 14);
    shotDad(ctx, t, { x: 520, y: 780, z: 1.2 + lt * 0.03 + shout * 0.15, sx: s[0], sy: s[1] }, { eye: 1.2 + shout * 0.1, brWorry: 1 - shout, brAngry: shout, mOpen: 0.15 + shout * 0.85 + Math.sin(t * 9) * 0.05 * (1 - shout), shout, sweat: 1, sweatT: lt * 0.4, lookX: 0.7 });
  } },
  { a: 70.9, b: 76.0, f(ctx, t) { const lt = t - 70.9; shotPhone(ctx, t, { x: 540, y: 880, z: 1.1 + lt * 0.035 }); } },
  { a: 76.0, b: 78.82, f(ctx, t) { const lt = t - 76.0;
    const u = easeIO(lt / 2.8);
    const cam = { x: lerp(300, 600, u), y: lerp(900, 860, u), z: 2.0, r: lerp(0, 0.04, u) };
    ctx.save(); applyCam(ctx, cam);
    drawRearView(ctx, { t, dist: NIGHT_D(t), L: LIGHT.nightDim, boy: { yaw: lerp(0, 0.45, u), lookX: lerp(0, 1, u), eye: 1.2, brWorry: 1 }, wom: Object.assign({}, WOM0), womX: 610, womY: 850, womL: Object.assign({}, LIGHT.nightDim, { bright: 0.25, rimA: 0.15 }) });
    ctx.restore();
    // escuridão: só uma réstia de luz no menino
    ctx.save(); const g = ctx.createRadialGradient(lerp(540, 0, u), 900, 100, lerp(540, 0, u), 900, 900); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.92)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  } },
  // CENA 5 — A DESCOBERTA
  { a: 78.82, b: 81.6, f(ctx, t) { const lt = t - 78.82;
    const fl = Math.max(0, 1 - lt / 0.5);
    const cam = { x: 450, y: 920, z: 1.3 + lt * 0.05 };
    ctx.save(); applyCam(ctx, cam);
    drawRearView(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, boy: { yaw: 0.35, lookX: 1, eye: 1.3, brWorry: 1, brRaise: 0.6, mOpen: 0.12 }, wom: Object.assign({}, WOM0, { lookX: -0.8 }), womX: 610, womY: 850 });
    ctx.restore();
    if (fl > 0) fillScreen(ctx, '#ffb070', 0.35 * fl, 'lighter');
  } },
  { a: 81.6, b: 83.15, f(ctx, t) { const lt = t - 81.6;
    const tilt = lerp(0, 0.5, easeIO(lt / 1.4));
    ctx.save(); applyCam(ctx, { x: 560, y: 900, z: 2.2 + lt * 0.08 });
    drawRearView(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, boy: { yaw: 0.35, lookX: 1, eye: 1.3, brWorry: 1 }, wom: Object.assign({}, WOM0, { tilt: -tilt, lookX: -0.8 }), womX: 610, womY: 850 });
    ctx.restore();
  } },
  { a: 83.15, b: 85.2, f(ctx, t) { const lt = t - 83.15;
    const cr = easeIO(lt / 1.6);
    ctx.save(); applyCam(ctx, { x: 600, y: 860, z: 3.0 + lt * 0.1 });
    drawRearView(ctx, { t, dist: NIGHT_D(t), L: LIGHT.night, boy: { yaw: 0.35, lookX: 1, eye: 1.3, brWorry: 1 }, wom: Object.assign({}, WOM0, { tilt: -0.5 - cr * 0.22, lookX: -0.8, creep: cr, mOpen: cr * 0.2, pupil: 0.45 - cr * 0.15 }), womX: 610, womY: 850 });
    ctx.restore();
  } },
  { a: 85.2, b: 88.1, f(ctx, t) { const lt = t - 85.2;
    shotReach(ctx, t, { x: 600, y: 930, z: 1.3 + lt * 0.05 }, easeIO(lt / 2.7));
  } },
  { a: 88.1, b: 89.9, f(ctx, t) { const lt = t - 88.1;
    shotLap(ctx, t, { x: 540, y: 1000, z: 1.05 + lt * 0.04 }, { on: 1, creep: easeIO(lt / 1.8) });
  } },
  { a: 89.9, b: 93.75, f(ctx, t) { const lt = t - 89.9; shotPhone(ctx, t, { x: 540, y: 860, z: 1.12 + lt * 0.04 }); } },
  { a: 93.75, b: 100.04, f(ctx, t) { const lt = t - 93.75;
    const talk = (t > 97.95 && t < 99.75) ? Math.max(0, Math.sin((t - 97.95) * 14)) * 0.28 : 0;
    const L = LIGHT.night;
    ctx.save(); applyCam(ctx, { x: 540, y: 880, z: 1.0 + lt * 0.05, r: -0.02 });
    ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); drawBoyBG(ctx, { L: LIGHT.nightDim, t }); ctx.restore();
    fillScreen(ctx, '#000', 0.4);
    ctx.save(); ctx.translate(540, 900); ctx.scale(3.4, 3.4);
    drawChar(ctx, 'wom', Object.assign({}, WOM0, { yaw: 0, lookX: 0, lookY: 0, tilt: -0.42, eye: 1.55, pupil: 0.4, glint: 1, creep: 0.35 + (t > 97.9 ? -0.15 : 0), smile: 1, mOpen: talk }), L);
    ctx.restore();
    ctx.restore();
  } },
  // CENA 6 — A FUGA
  { a: 100.04, b: 102.6, f(ctx, t) { const lt = t - 100.04;
    const s = shake(t, 26, 16);
    shotDad(ctx, t, { x: 520, y: 780, z: 1.35 + lt * 0.04, sx: s[0], sy: s[1] }, { eye: 1.3, brAngry: 1, mOpen: 1, shout: 1, sweat: 1, sweatT: lt * 0.5, lookX: 0.7, yaw: 0.42 });
  } },
  { a: 102.6, b: 105.3, f(ctx, t) { const lt = t - 102.6;
    const duck = easeIO(lt / 0.9); const s = shake(t, 10, 12);
    ctx.save(); applyCam(ctx, { x: 470, y: 960, z: 1.35, sx: s[0], sy: s[1] });
    drawRearView(ctx, { t, dist: NIGHT_D(t) + lt * lt * 6, L: LIGHT.night, boyY: REAR.boyY + duck * 330, boyX: REAR.boyX - duck * 30, boy: { yaw: 0.1, eye: 0, brWorry: 1, mOpen: 0.1, tilt: 0.3 * duck }, wom: Object.assign({}, WOM0, { tilt: -0.6, lookX: -0.6, lookY: duck * 0.8, creep: 0.4 }), womX: 610, womY: 850 });
    ctx.restore();
  } },
  { a: 105.3, b: 107.4, f(ctx, t) { const lt = t - 105.3; const s = shake(t, 6 + lt * 5, 20);
    ctx.save(); applyCam(ctx, { x: 540, y: 960, z: 1.0 + lt * 0.1, sx: s[0], sy: s[1] }); drawSpeedo(ctx, 540, 960, 420, kf(t, [[105.3, 98], [107.4, 168]], easeIn), t); ctx.restore();
  } },
  { a: 107.4, b: 109.76, f(ctx, t) { const lt = t - 107.4; const s = shake(t, 8, 14);
    ctx.save(); applyCam(ctx, { x: 560, y: 1400, z: 1.55, sx: s[0], sy: s[1] }); drawExterior(ctx, { t, dist: 200 + lt * 46, speedK: 1, ghost: 1, bounce: Math.sin(t * 30) * 3 }); ctx.restore();
  } },
  { a: 109.76, b: 112.4, f(ctx, t) { const lt = t - 109.76; const s = shake(t, 10, 12);
    shotWrist(ctx, t, { x: 520, y: 960, z: 1.1 + lt * 0.05, sx: s[0], sy: s[1] }, easeOut(lt / 0.7), clamp((lt - 0.6) / 0.5), LIGHT.night);
  } },
  { a: 112.4, b: 114.0, f(ctx, t) { const lt = t - 112.4;
    const sw = Math.sin(lt / 1.6 * Math.PI * 1.5) * 380 * Math.exp(-lt * 0.6);
    const s = shake(t, 22, 18);
    ctx.save(); applyCam(ctx, { x: 540, y: 780, z: 1.35, r: -sw / 2600, sx: s[0] + sw * 0.15, sy: s[1] });
    drawCabinForward(ctx, { t, dist: 400 + lt * 46, L: LIGHT.night, swerve: sw, roll: sw / 2600, dadDX: -sw * 0.06, mirror: mirrorRear({ sc: 0.36, cx: 700, cy: 880, dist: 0, t, L: LIGHT.nightDim, boy: { eye: 0 }, wom: WOM0, womX: 610, womY: 850, dark: 0.45 }) });
    ctx.restore();
  } },
  { a: 114.0, b: 115.02, f(ctx, t) { const lt = t - 114.0; const s = shake(t, 9, 12);
    shotWrist(ctx, t, { x: 520, y: 960, z: 1.25, sx: s[0], sy: s[1] }, 1, 1, mixLight(LIGHT.night, LIGHT.dawnSoft, clamp(lt / 1.2) * 0.35));
  } },
  { a: 115.02, b: 121.18, f(ctx, t) { const lt = t - 115.02;
    const day = easeIO(lt / 3.0); const L = mixLight(LIGHT.night, LIGHT.dawn, day);
    const dis = clamp((t - 118.94) / 1.8);
    const cam = { x: 480, y: 940, z: 1.3 + lt * 0.03 };
    const womP = Object.assign({}, WOM0, { tilt: -0.55, lookX: -0.7, creep: 0.5 * (1 - day * 0.5), eye: 1.5 });
    // braço dela segurando o pulso do menino
    const arm = (x) => { drawWomHand(x, 470, 1250, Math.PI - 0.35, 0.8, 0.55, 0.7, L, t, true); };
    ctx.save(); applyCam(ctx, cam);
    drawRearView(ctx, { t, dist: NIGHT_D(t) * 0.8, dawn: day, rays: day, L, boy: { yaw: 0.25, lookX: 0.6, eye: kf(t, [[115, 0], [118.9, 0], [119.8, 1.1]]), brWorry: 1, mOpen: 0.12 }, wom: null });
    ctx.restore();
    const layer = womDissolveLayer((x) => { x.save(); applyCam(x, cam); x.beginPath(); x.rect(-1000, -1000, 3200, 2480); x.clip(); x.save(); x.translate(610, 850); x.scale(0.95, 0.95); drawChar(x, 'wom', womP, L); x.restore(); arm(x); x.restore(); }, dis * 1.1, t);
    ctx.save(); ctx.globalAlpha = 1 - Math.pow(dis, 1.5) * 0.85; ctx.drawImage(layer, 0, 0); ctx.restore();
    if (dis > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3 * Math.sin(Math.min(1, dis * 1.4) * Math.PI); ctx.drawImage(layer, 0, 0);
      // bordas incandescentes onde ela se desfaz (só sobre o corpo dela)
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (!EMBC) { EMBC = document.createElement('canvas'); EMBC.width = W; EMBC.height = H; EMBX = EMBC.getContext('2d'); }
      EMBX.globalCompositeOperation = 'source-over'; EMBX.clearRect(0, 0, W, H);
      for (const [x, y, rr, k] of EMB) { const g = EMBX.createRadialGradient(x, y, rr * 0.5, x, y, rr * 1.15); g.addColorStop(0, 'rgba(255,170,80,0)'); g.addColorStop(0.6, `rgba(255,190,110,${0.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,170,80,0)'); EMBX.fillStyle = g; EMBX.fillRect(x - rr * 1.2, y - rr * 1.2, rr * 2.4, rr * 2.4); }
      EMBX.globalCompositeOperation = 'destination-in'; EMBX.drawImage(layer, 0, 0);
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(EMBC, 0, 0); ctx.restore(); }
    if (dis > 0) { ctx.save(); applyCam(ctx, cam); motes(ctx, t, dis * 1.3, 610, 1000); ctx.restore(); radial(ctx, 640, 900, 900, '#ffd7a0', 0.25 * Math.sin(dis * Math.PI)); }
  } },
  // CENA 7 — O ÚLTIMO AVISO
  { a: 121.18, b: 123.96, f(ctx, t) { const lt = t - 121.18;
    shotBoy(ctx, t, { x: 560, y: 900, z: 1.25 + lt * 0.03 }, { eye: kf(t, [[121.18, 1.0], [121.6, 0], [122.7, 0], [123.1, 0.9]]), brWorry: 0.5, mOpen: kf(t, [[121.18, 0.05], [121.7, 0.3], [122.6, 0.05]]), lookY: 0.1 }, { L: LIGHT.dawn, dawn: 1, speed: 0.5, dy: Math.sin(lt * 2.2) * 6 });
  } },
  { a: 123.96, b: 126.15, f(ctx, t) { const lt = t - 123.96;
    ctx.save(); applyCam(ctx, { x: 540, y: 1330, z: 1.12 - lt * 0.02 }); drawExterior(ctx, { t, dist: 900 + lt * 10, dawn: 1, speedK: 0 }); ctx.restore();
  } },
  { a: 126.15, b: 131.85, f(ctx, t) { const lt = t - 126.15;
    const talk = (t > 129.5 && t < 131.4) ? Math.max(0, Math.sin((t - 129.5) * 13)) * 0.22 : 0;
    const cam = { x: 540, y: 250, z: 5.6 + lt * 0.06 };
    ctx.save(); applyCam(ctx, cam);
    drawCabinForward(ctx, { t, dist: t * 12, dawn: 1, L: LIGHT.dawn, dash: 0.3, mirror: (x) => {
      const g = x.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, '#5a3f38'); g.addColorStop(1, '#2a1e1c'); x.fillStyle = g; x.fillRect(-300, -100, 600, 200);
      x.save(); x.scale(-0.52, 0.52); x.translate(0, -10); drawChar(x, 'dad', { yaw: 0.08, lookX: -0.15, lookY: 0, smile: 0.8, mOpen: talk, eye: 1.0, pupil: 1.25, glint: 0.4 }, LIGHT.dawnSoft); x.restore();
    } });
    ctx.restore();
  } },
  { a: 131.85, b: 138.5, f(ctx, t) { const lt = t - 131.85;
    const ph = easeOut((t - 136.7) / 0.3);
    const L = mixLight(LIGHT.dawn, Object.assign({}, LIGHT.dawn, { glow: { x: 0, y: 240, r: 300, c: '#bcd6ff', a: 0.3 } }), ph);
    if (ph > 0) L.glow = { x: 0, y: 240, r: 300, c: '#bcd6ff', a: 0.3 * ph };
    const z = kf(t, [[131.85, 1.15], [133.8, 1.2], [138.5, 2.1]], easeIO);
    const bz = buzzAmt(t);
    shotBoy(ctx, t, { x: 560, y: kf(t, [[133.8, 880], [138.5, 840]]), z, sx: Math.sin(t * 80) * 4 * bz }, {
      eye: kf(t, [[131.85, 1.0], [132.1, 0], [132.9, 0], [133.3, 0.95], [136.8, 0.95], [137.1, 1.35]]),
      brWorry: kf(t, [[131.85, 0.2], [133.8, 0.2], [137.0, 1.0]]), brRaise: kf(t, [[136.8, 0], [137.1, 0.7]]),
      mOpen: kf(t, [[131.85, 0.05], [132.2, 0.3], [133.0, 0.04], [137.0, 0.04], [137.3, 0.15]]), smile: kf(t, [[132.9, 0], [133.4, 0.5], [134.3, 0.2], [136.7, 0]]),
      lookY: kf(t, [[136.8, 0], [137.1, 0.9]]) }, { L, dawn: 1, speed: 0.5 });
  } },
  { a: 138.5, b: 142.85, f(ctx, t) {
    const u = easeOut((t - 141.62) / 0.45), base = 1.0 + (Math.min(t, 141.62) - 138.5) * 0.03;
    const z = lerp(base, 1.5, u) + (t > 141.62 ? (t - 141.62) * 0.08 : 0);
    const s = t > 141.62 ? shake(t, 10 * (1 - u * 0.6), 30) : [0, 0];
    shotPhone(ctx, t, { x: lerp(540, 445, u), y: lerp(960, 1440, u), z, sx: s[0], sy: s[1] }, true);
  } },
  { a: 142.85, b: T_END + 1, f(ctx, t) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } },
];

let FRAME = 0, EMBC = null, EMBX = null;
function renderFrame(t) {
  const ctx = window.CTX;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const s = SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
  ctx.save(); s.f(ctx, t); ctx.restore();
  if (t < 142.85) post(ctx, Math.floor(t * FPS));
  FRAME++;
}
