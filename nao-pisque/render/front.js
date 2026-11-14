'use strict';
// ---------------------------------------------------------------------------
// Mundo "frente": o que você vê olhando para a frente do banco de trás.
// Coordenadas do mundo = coordenadas da tela com câmera padrão (540,960,1).
// ---------------------------------------------------------------------------
let FI, TREES = [], HILLS = [], VEIN = [];
const FOX = 260, FOY = 260;
const HOR = 612;          // horizonte
const FX = 228, KY = 556; // projeção da estrada

function wsPath(g) {
  g.beginPath(); g.moveTo(150, 388); g.quadraticCurveTo(540, 352, 930, 388);
  g.lineTo(1160, 890); g.lineTo(-80, 890); g.closePath();
}
function sideWinL(g) { g.beginPath(); g.moveTo(-FOX, 440); g.lineTo(70, 402); g.lineTo(-100, 880); g.lineTo(-FOX, 900); g.closePath(); }
function sideWinR(g) { g.beginPath(); g.moveTo(W + FOX, 440); g.lineTo(W - 70, 402); g.lineTo(W + 100, 880); g.lineTo(W + FOX, 900); g.closePath(); }

function seatBackPath(g, cx, top, w, bottom) {
  const hw = w / 2;
  g.beginPath();
  g.moveTo(cx - hw + 40, top);
  g.quadraticCurveTo(cx, top - 22, cx + hw - 40, top);
  g.quadraticCurveTo(cx + hw + 10, top + 6, cx + hw + 22, top + 110);
  g.quadraticCurveTo(cx + hw + 20, (top + bottom) / 2, cx + hw + 6, bottom);
  g.lineTo(cx - hw - 6, bottom);
  g.quadraticCurveTo(cx - hw - 20, (top + bottom) / 2, cx - hw - 22, top + 110);
  g.quadraticCurveTo(cx - hw - 10, top + 6, cx - hw + 40, top);
  g.closePath();
}
function drawSeat(g, cx, top, w, bottom, hrY, rimSide) {
  // haste do encosto de cabeça
  const mg = g.createLinearGradient(0, 0, 10, 0); mg.addColorStop(0, '#2a2d33'); mg.addColorStop(1, '#5b606a');
  g.fillStyle = '#3a3e46';
  g.fillRect(cx - 62, hrY + 120, 10, top - hrY - 110); g.fillRect(cx + 52, hrY + 120, 10, top - hrY - 110);
  g.fillStyle = 'rgba(160,170,190,0.25)';
  g.fillRect(cx - 60, hrY + 120, 3, top - hrY - 110); g.fillRect(cx + 54, hrY + 120, 3, top - hrY - 110);
  // encosto
  seatBackPath(g, cx, top, w, bottom);
  let gr = g.createLinearGradient(0, top, 0, bottom);
  gr.addColorStop(0, '#24262d'); gr.addColorStop(0.18, '#17181d'); gr.addColorStop(1, '#09090b');
  g.fillStyle = gr; g.fill();
  // luz de borda (vinda do painel/para-brisa)
  g.save(); seatBackPath(g, cx, top, w, bottom); g.clip();
  gr = g.createLinearGradient(cx - w / 2 * rimSide, 0, cx, 0);
  gr.addColorStop(0, 'rgba(90,130,170,0.20)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(cx - w, top - 30, w * 2, bottom - top + 60);
  // painel central acolchoado
  g.beginPath(); g.roundRect(cx - w / 2 + 70, top + 70, w - 140, bottom - top - 160, 40);
  g.fillStyle = 'rgba(255,255,255,0.025)'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 5; g.stroke();
  g.setLineDash([7, 9]); g.strokeStyle = 'rgba(140,150,170,0.12)'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(cx - w / 2 + 80, top + 80, w - 160, bottom - top - 180, 34); g.stroke();
  for (let i = 1; i < 4; i++) { const x = cx - w / 2 + 70 + (w - 140) * i / 4; g.beginPath(); g.moveTo(x, top + 90); g.lineTo(x, bottom - 110); g.stroke(); }
  g.setLineDash([]);
  // tecido (ruído)
  const r = rng(cx | 0);
  g.fillStyle = 'rgba(255,255,255,0.018)';
  for (let i = 0; i < 2600; i++) g.fillRect(cx - w / 2 + r() * w, top + r() * (bottom - top), 2, 2);
  g.restore();
  // contorno superior iluminado
  g.strokeStyle = 'rgba(120,150,190,0.28)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(cx - w / 2 + 40, top + 1); g.quadraticCurveTo(cx, top - 21, cx + w / 2 - 40, top + 1); g.stroke();
  // encosto de cabeça
  g.beginPath(); g.roundRect(cx - 112, hrY, 224, 140, [48, 48, 36, 36]);
  gr = g.createLinearGradient(0, hrY, 0, hrY + 140); gr.addColorStop(0, '#2a2c33'); gr.addColorStop(0.4, '#18191e'); gr.addColorStop(1, '#0b0b0e');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(130,160,200,0.22)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(cx - 80, hrY + 2); g.quadraticCurveTo(cx, hrY - 6, cx + 80, hrY + 2); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 90, hrY + 70); g.lineTo(cx + 90, hrY + 70); g.stroke();
}
function thighPath(g, kx, ky, w, lean) {
  g.beginPath();
  g.moveTo(kx - w * 0.75 + lean, H + 60);
  g.bezierCurveTo(kx - w * 0.62, H - 140, kx - w * 0.5, ky + 110, kx - w * 0.3, ky + 18);
  g.quadraticCurveTo(kx, ky - 30, kx + w * 0.3, ky + 18);
  g.bezierCurveTo(kx + w * 0.5, ky + 110, kx + w * 0.62, H - 140, kx + w * 0.75 + lean, H + 60);
  g.closePath();
}
function drawThigh(g, kx, ky, w, lean, seed) {
  thighPath(g, kx, ky, w, lean);
  let gr = g.createRadialGradient(kx - 10, ky + 40, 10, kx, ky + 160, w * 1.3);
  gr.addColorStop(0, '#34425c'); gr.addColorStop(0.35, '#1b2334'); gr.addColorStop(1, '#07090e');
  g.fillStyle = gr; g.fill();
  g.save(); thighPath(g, kx, ky, w, lean); g.clip();
  // trama do jeans
  g.strokeStyle = 'rgba(120,140,180,0.045)'; g.lineWidth = 2;
  for (let i = -60; i < 60; i++) { g.beginPath(); g.moveTo(kx + i * 9, ky - 20); g.lineTo(kx + i * 9 + 260, H + 60); g.stroke(); }
  // dobras
  const r = rng(seed);
  g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    const y = ky + 120 + i * 55 + r() * 20, x0 = kx - w * 0.45, x1 = kx + w * 0.45;
    g.beginPath(); g.moveTo(x0 + r() * 40, y); g.quadraticCurveTo(kx + (r() - .5) * 80, y + 25 + r() * 20, x1 - r() * 40, y + (r() - .5) * 20); g.stroke();
  }
  g.strokeStyle = 'rgba(110,130,170,0.12)'; g.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const y = ky + 140 + i * 60 + r() * 20;
    g.beginPath(); g.moveTo(kx - w * 0.35, y - 6); g.quadraticCurveTo(kx, y + 18, kx + w * 0.35, y - 6); g.stroke();
  }
  // costura lateral
  g.setLineDash([10, 8]); g.strokeStyle = 'rgba(190,140,70,0.16)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(kx + w * 0.42, ky + 60); g.bezierCurveTo(kx + w * 0.52, ky + 200, kx + w * 0.62, H - 140, kx + w * 0.7, H + 40); g.stroke();
  g.setLineDash([]);
  g.restore();
}

function buildTrees() {
  const r = rng(11);
  const mkTree = (h, seed) => {
    const rr = rng(seed); const c = mk(220, 420), g = c.getContext('2d');
    g.fillStyle = '#000';
    g.beginPath(); g.moveTo(110, 4);
    const layers = 9;
    for (let i = 0; i <= layers; i++) { const y = 4 + i * 40, w = 10 + i * 11 + rr() * 10; g.lineTo(110 + w, y + 30); g.lineTo(110 + w * 0.45, y + 26); }
    g.lineTo(118, 420); g.lineTo(102, 420);
    for (let i = layers; i >= 0; i--) { const y = 4 + i * 40, w = 10 + i * 11 + rr() * 10; g.lineTo(110 - w * 0.45, y + 26); g.lineTo(110 - w, y + 30); }
    g.closePath(); g.fill();
    return c;
  };
  const sprites = [mkTree(1, 3), mkTree(1, 5), mkTree(1, 9), mkTree(1, 13)];
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1;
    TREES.push({ X: side * (12 + r() * 30), z0: r() * 320, h: 7 + r() * 9, spr: sprites[(r() * 4) | 0] });
  }
  for (let x = -FOX; x <= W + FOX; x += 16) HILLS.push([x, HOR - 6 - 18 * Math.abs(vn(x * 0.006, 3)) - 8 * Math.abs(vn(x * 0.03, 5))]);
}

function buildVeins() {
  for (let k = 0; k < 2; k++) {
    const c = mk(500, 250), g = c.getContext('2d'); const r = rng(400 + k);
    const branch = (x, y, a, len, w, d) => {
      if (d > 6 || w < 0.5) return;
      let px = x, py = y;
      g.strokeStyle = `rgba(${110 + r() * 40},${r() * 10},${10 + r() * 10},${0.55 + r() * 0.4})`;
      g.lineWidth = w; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px, py);
      const steps = 6;
      for (let i = 0; i < steps; i++) { a += (r() - .5) * 0.9; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; g.lineTo(px, py); }
      g.stroke();
      const nb = 1 + (r() * 2.2) | 0;
      for (let i = 0; i < nb; i++) branch(px, py, a + (r() - .5) * 1.6, len * (0.55 + r() * 0.25), w * 0.68, d + 1);
    };
    for (let i = 0; i < 9; i++) { const y = 40 + r() * 170; branch(0, y, (r() - .5) * 0.8, 120 + r() * 60, 5 + r() * 2.5, 0); }
    for (let i = 0; i < 9; i++) { const y = 40 + r() * 170; branch(500, y, Math.PI + (r() - .5) * 0.8, 120 + r() * 60, 5 + r() * 2.5, 0); }
    for (let i = 0; i < 4; i++) { branch(130 + r() * 240, 0, Math.PI / 2 + (r() - .5), 70, 3, 1); branch(130 + r() * 240, 250, -Math.PI / 2 + (r() - .5), 60, 3, 1); }
    VEIN.push(c);
  }
}

function buildFront() {
  buildTrees(); buildVeins();
  FI = mk(W + 2 * FOX, H + 2 * FOY);
  const g = FI.getContext('2d'); g.translate(FOX, FOY);
  // base / teto
  let gr = g.createLinearGradient(0, -FOY, 0, 900);
  gr.addColorStop(0, '#060709'); gr.addColorStop(0.7, '#15171d'); gr.addColorStop(1, '#0d0e12');
  g.fillStyle = gr; g.fillRect(-FOX, -FOY, W + 2 * FOX, 1300);
  gr = g.createRadialGradient(540, 160, 10, 540, 160, 760);
  gr.addColorStop(0, 'rgba(70,82,105,0.20)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-FOX, -FOY, W + 2 * FOX, 1100);
  // costura do forro do teto
  g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 4;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-FOX, 150 + i * 70); g.quadraticCurveTo(540, 110 + i * 80, W + FOX, 150 + i * 70); g.stroke(); }
  // luz de teto
  g.beginPath(); g.roundRect(462, 70, 156, 54, 16); g.fillStyle = '#1c1e24'; g.fill();
  g.beginPath(); g.roundRect(476, 82, 128, 30, 10); g.fillStyle = '#26282f'; g.fill();
  // recorte do para-brisa e janelas
  g.globalCompositeOperation = 'destination-out';
  wsPath(g); g.fill(); sideWinL(g); g.fill(); sideWinR(g); g.fill();
  g.globalCompositeOperation = 'source-over';
  // colunas A
  g.strokeStyle = '#0c0d11'; g.lineWidth = 64; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(132, 380); g.lineTo(-108, 900); g.stroke();
  g.beginPath(); g.moveTo(948, 380); g.lineTo(1188, 900); g.stroke();
  g.strokeStyle = 'rgba(110,130,160,0.14)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(166, 388); g.lineTo(-72, 890); g.stroke();
  g.beginPath(); g.moveTo(914, 388); g.lineTo(1152, 890); g.stroke();
  // borda superior do para-brisa
  g.strokeStyle = '#0a0b0e'; g.lineWidth = 26; g.beginPath(); g.moveTo(120, 382); g.quadraticCurveTo(540, 342, 960, 382); g.stroke();
  // para-sóis
  const visor = (x0, x1, flip) => {
    g.beginPath(); g.moveTo(x0, 372); g.lineTo(x1, 360); g.lineTo(x1 - flip * 10, 418); g.quadraticCurveTo((x0 + x1) / 2, 432, x0 + flip * 30, 424); g.closePath();
    const vg = g.createLinearGradient(0, 360, 0, 430); vg.addColorStop(0, '#1d1f25'); vg.addColorStop(1, '#111216');
    g.fillStyle = vg; g.fill(); g.strokeStyle = 'rgba(120,140,170,0.15)'; g.lineWidth = 2; g.stroke();
  };
  visor(130, 430, 1); visor(950, 650, -1);
  // painel
  g.beginPath(); g.moveTo(-FOX, 905); g.lineTo(-90, 878);
  g.quadraticCurveTo(540, 846, 1170, 878); g.lineTo(W + FOX, 905); g.lineTo(W + FOX, 1300); g.lineTo(-FOX, 1300); g.closePath();
  gr = g.createLinearGradient(0, 850, 0, 1100); gr.addColorStop(0, '#121318'); gr.addColorStop(0.3, '#08090b'); gr.addColorStop(1, '#030304');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(150,170,200,0.22)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-90, 879); g.quadraticCurveTo(540, 847, 1170, 879); g.stroke();
  // grade do desembaçador
  g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 3;
  for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(380 + i * 24, 866); g.lineTo(374 + i * 24, 880); g.stroke(); }
  // brilho do painel de instrumentos (atrás da cabeça do pai)
  gr = g.createRadialGradient(255, 915, 10, 255, 915, 300);
  gr.addColorStop(0, 'rgba(70,210,230,0.42)'); gr.addColorStop(0.4, 'rgba(40,150,180,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-60, 640, 640, 520);
  // console central + tela do relógio
  g.beginPath(); g.roundRect(426, 912, 228, 120, 16); g.fillStyle = '#0a0b0e'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2; g.stroke();
  g.beginPath(); g.roundRect(450, 928, 180, 66, 9); g.fillStyle = '#010203'; g.fill();
  g.strokeStyle = 'rgba(90,200,230,0.18)'; g.lineWidth = 2; g.stroke();
  // saídas de ar
  for (const vx of [372, 664]) {
    g.beginPath(); g.roundRect(vx, 930, 44, 60, 8); g.fillStyle = '#060608'; g.fill();
    g.strokeStyle = 'rgba(140,150,170,0.18)'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(vx + 6, 938 + i * 11); g.lineTo(vx + 38, 938 + i * 11); g.stroke(); }
  }
  // volante (só aparece nas bordas)
  g.strokeStyle = '#07080a'; g.lineWidth = 40; g.beginPath(); g.arc(255, 1085, 245, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.strokeStyle = 'rgba(100,180,200,0.20)'; g.lineWidth = 3; g.beginPath(); g.arc(255, 1085, 265, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  // ---- o pai (visto por trás) ----
  // ombros
  g.beginPath(); g.moveTo(-30, 1060); g.bezierCurveTo(-28, 900, 60, 862, 165, 850);
  g.lineTo(345, 850); g.bezierCurveTo(450, 862, 540, 900, 548, 1060); g.closePath();
  gr = g.createLinearGradient(0, 850, 0, 1000); gr.addColorStop(0, '#1d2129'); gr.addColorStop(1, '#0b0c0f');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(110,190,215,0.35)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-26, 980); g.bezierCurveTo(-20, 900, 60, 865, 165, 853); g.stroke();
  g.beginPath(); g.moveTo(544, 980); g.bezierCurveTo(538, 900, 450, 865, 345, 853); g.stroke();
  // pescoço
  g.fillStyle = '#1a120e'; g.fillRect(205, 760, 100, 110);
  // orelhas
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(255 + s * 104, 705, 20, 38, s * 0.15, 0, Math.PI * 2);
    g.fillStyle = '#2b1d17'; g.fill();
    g.strokeStyle = 'rgba(120,200,215,0.3)'; g.lineWidth = 2; g.stroke();
  }
  // cabeça (cabelo)
  g.beginPath(); g.ellipse(255, 678, 104, 122, 0, 0, Math.PI * 2);
  gr = g.createRadialGradient(240, 610, 10, 255, 680, 140);
  gr.addColorStop(0, '#2a2a2e'); gr.addColorStop(0.6, '#121214'); gr.addColorStop(1, '#060607');
  g.fillStyle = gr; g.fill();
  g.save(); g.beginPath(); g.ellipse(255, 678, 104, 122, 0, 0, Math.PI * 2); g.clip();
  const hr = rng(21); g.lineWidth = 2;
  for (let i = 0; i < 260; i++) {
    const a = hr() * Math.PI * 2, rr = hr() * 110, x = 255 + Math.cos(a) * rr * 0.95, y = 678 + Math.sin(a) * rr * 1.1;
    g.strokeStyle = hr() < 0.25 ? 'rgba(160,160,165,0.16)' : 'rgba(0,0,0,0.3)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (hr() - .5) * 8, y + 10 + hr() * 8); g.stroke();
  }
  g.restore();
  g.strokeStyle = 'rgba(140,170,210,0.35)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(255, 678, 104, 122, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  // console entre os bancos
  g.beginPath(); g.moveTo(452, 1040); g.lineTo(628, 1040); g.lineTo(660, 1640); g.lineTo(420, 1640); g.closePath();
  gr = g.createLinearGradient(0, 1040, 0, 1640); gr.addColorStop(0, '#101116'); gr.addColorStop(1, '#050506');
  g.fillStyle = gr; g.fill();
  g.beginPath(); g.ellipse(540, 1150, 28, 22, 0, 0, Math.PI * 2); g.fillStyle = '#1b1c21'; g.fill();
  g.strokeStyle = 'rgba(160,180,210,0.25)'; g.lineWidth = 2; g.beginPath(); g.ellipse(540, 1146, 20, 12, 0, Math.PI, Math.PI * 2); g.stroke();
  g.beginPath(); g.roundRect(468, 1320, 144, 250, 30); g.fillStyle = '#131419'; g.fill();
  g.strokeStyle = 'rgba(120,140,170,0.12)'; g.stroke();
  // bancos
  drawSeat(g, 258, 860, 400, 1640, 712, 1);
  drawSeat(g, 822, 870, 400, 1640, 722, -1);
  // bolso do banco do passageiro
  g.beginPath(); g.roundRect(668, 1250, 310, 250, [10, 10, 26, 26]);
  g.fillStyle = 'rgba(5,5,7,0.85)'; g.fill();
  // assoalho entre bancos e joelhos
  gr = g.createLinearGradient(0, 1560, 0, 1700); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)');
  g.fillStyle = gr; g.fillRect(-FOX, 1520, W + 2 * FOX, 260);
  // suas coxas / joelhos
  drawThigh(g, 318, 1612, 330, -60, 5);
  drawThigh(g, 770, 1606, 330, 60, 9);
  // cinto de segurança (diagonal, canto inferior esquerdo)
  g.lineCap = 'butt';
  g.strokeStyle = '#111215'; g.lineWidth = 80; g.beginPath(); g.moveTo(-120, 1540); g.quadraticCurveTo(160, 1800, 300, 2100); g.stroke();
  g.strokeStyle = '#26272d'; g.lineWidth = 70; g.beginPath(); g.moveTo(-120, 1540); g.quadraticCurveTo(160, 1800, 300, 2100); g.stroke();
  g.setLineDash([8, 10]); g.strokeStyle = 'rgba(150,160,180,0.18)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-100, 1530); g.quadraticCurveTo(180, 1790, 322, 2090); g.stroke(); g.setLineDash([]);
  // luz ambiente fria para levantar as sombras
  g.globalCompositeOperation = 'screen';
  gr = g.createLinearGradient(0, 300, 0, H); gr.addColorStop(0, 'rgba(25,35,55,0.25)'); gr.addColorStop(1, 'rgba(10,14,24,0.1)');
  g.fillStyle = gr; g.fillRect(-FOX, -FOY, W + 2 * FOX, H + 2 * FOY);
  g.globalCompositeOperation = 'source-over';
}

// distância percorrida (para animar a estrada); o pai acelera em ~126s
function driveDist(t) { return 24 * t + 26 * Math.max(0, t - 125.6) - 26 * Math.max(0, t - 131); }

function drawExterior(c, t, day) {
  c.save();
  wsPath(c); c.clip();
  const d = driveDist(t);
  // céu
  let g = c.createLinearGradient(0, 340, 0, HOR);
  g.addColorStop(0, '#03050a'); g.addColorStop(1, '#101a2c');
  c.fillStyle = g; c.fillRect(-200, 300, 1500, HOR - 290);
  if (day > 0) {
    c.globalAlpha = day;
    g = c.createLinearGradient(0, 340, 0, HOR);
    g.addColorStop(0, '#5a7fb0'); g.addColorStop(0.55, '#e7b38a'); g.addColorStop(1, '#ffcf8a');
    c.fillStyle = g; c.fillRect(-200, 300, 1500, HOR - 290);
    g = c.createRadialGradient(700, HOR - 10, 5, 700, HOR - 10, 420);
    g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(0.15, 'rgba(255,200,120,0.7)'); g.addColorStop(1, 'rgba(255,160,90,0)');
    c.fillStyle = g; c.fillRect(-200, 300, 1500, 400);
    c.globalAlpha = 1;
  }
  // lua e estrelas
  if (day < 1) {
    c.globalAlpha = 1 - day;
    g = c.createRadialGradient(860, 430, 4, 860, 430, 160);
    g.addColorStop(0, 'rgba(220,230,255,0.9)'); g.addColorStop(0.08, 'rgba(180,200,240,0.35)'); g.addColorStop(1, 'rgba(120,140,200,0)');
    c.fillStyle = g; c.fillRect(680, 300, 360, 300);
    const r = rng(5); c.fillStyle = 'rgba(200,210,255,0.55)';
    for (let i = 0; i < 40; i++) { const x = r() * 1080, y = 380 + r() * 200; if (r() < 0.5) c.fillRect(x, y, 2, 2); }
    c.globalAlpha = 1;
  }
  // colinas distantes
  c.beginPath(); c.moveTo(HILLS[0][0], HOR + 2); for (const [x, y] of HILLS) c.lineTo(x, y); c.lineTo(W + FOX, HOR + 2); c.closePath();
  c.fillStyle = day > 0 ? mixc('#04060a', '#5a3b3a', day) : '#04060a'; c.fill();
  // chão
  c.fillStyle = day > 0 ? mixc('#020304', '#3a2a26', day) : '#020304'; c.fillRect(-300, HOR, 1700, 400);
  // estrada
  c.beginPath(); c.moveTo(532, HOR); c.lineTo(548, HOR); c.lineTo(540 + 7.5 * FX / 1.6, HOR + KY / 1.6); c.lineTo(540 - 7.5 * FX / 1.6, HOR + KY / 1.6); c.closePath();
  g = c.createLinearGradient(0, HOR, 0, 900);
  g.addColorStop(0, '#070708'); g.addColorStop(1, day > 0 ? mixc('#1b1a19', '#5b4c44', day) : '#1b1a19');
  c.fillStyle = g; c.fill();
  // faróis
  if (day < 1) {
    c.globalAlpha = 1 - day * 0.8;
    g = c.createRadialGradient(540, 905, 10, 540, 860, 560);
    g.addColorStop(0, 'rgba(255,220,160,0.32)'); g.addColorStop(0.5, 'rgba(255,210,150,0.10)'); g.addColorStop(1, 'rgba(255,210,150,0)');
    c.fillStyle = g; c.fillRect(-200, HOR, 1500, 300);
    c.globalAlpha = 1;
  }
  // faixas laterais
  c.strokeStyle = 'rgba(210,210,200,0.22)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(536, HOR); c.lineTo(540 - 7 * FX / 1.6, HOR + KY / 1.6); c.stroke();
  c.beginPath(); c.moveTo(544, HOR); c.lineTo(540 + 7 * FX / 1.6, HOR + KY / 1.6); c.stroke();
  // faixa central tracejada
  const per = 9, len = 3.6;
  for (let k = 0; k < 40; k++) {
    const z1 = 1.6 + k * per - (d % per), z2 = z1 + len;
    if (z2 < 1.6) continue;
    const za = Math.max(1.6, z1);
    const y1 = HOR + KY / za, y2 = HOR + KY / z2, w1 = 0.16 * FX / za, w2 = 0.16 * FX / z2;
    const a = clamp(1.3 - z1 / 70) * (0.25 + 0.75 * clamp(1 - z1 / 30));
    c.fillStyle = `rgba(235,200,120,${a})`;
    c.beginPath(); c.moveTo(540 - w1, y1); c.lineTo(540 + w1, y1); c.lineTo(540 + w2, y2); c.lineTo(540 - w2, y2); c.closePath(); c.fill();
  }
  // balizadores refletivos
  const pper = 22;
  for (let k = 0; k < 16; k++) {
    for (const side of [-1, 1]) {
      const z = 2 + k * pper - ((d + (side > 0 ? 7 : 0)) % pper);
      if (z < 2) continue;
      const X = side * 8.6, x = 540 + X * FX / z, yb = HOR + KY / z, h = 1.0 * FX / z, w = Math.max(1, 0.14 * FX / z);
      const lit = clamp(1.2 - z / 60);
      c.fillStyle = `rgba(${140 + 80 * lit},${140 + 70 * lit},${130 + 60 * lit},${0.25 + 0.6 * lit})`;
      c.fillRect(x - w / 2, yb - h, w, h);
      const rc = side > 0 ? '255,150,40' : '255,255,240';
      c.fillStyle = `rgba(${rc},${0.4 + 0.6 * lit})`;
      c.fillRect(x - w / 2, yb - h, w, Math.max(1.5, h * 0.16));
      if (z < 30) {
        const gg = c.createRadialGradient(x, yb - h, 0, x, yb - h, 40 * FX / z / 8);
        gg.addColorStop(0, `rgba(${rc},${0.35 * lit})`); gg.addColorStop(1, `rgba(${rc},0)`);
        c.fillStyle = gg; c.fillRect(x - 60 * FX / z / 8, yb - h - 60 * FX / z / 8, 120 * FX / z / 8, 120 * FX / z / 8);
      }
    }
  }
  // árvores
  const vis = [];
  for (const tr of TREES) {
    const z = 3 + ((tr.z0 - d) % 320 + 320) % 320;
    vis.push([z, tr]);
  }
  vis.sort((a, b) => b[0] - a[0]);
  for (const [z, tr] of vis) {
    const x = 540 + tr.X * FX / z, yb = HOR + KY / z, h = tr.h * FX / z, w = h * 0.52;
    if (x + w < -FOX || x - w > W + FOX) continue;
    c.globalAlpha = day > 0 ? 1 - day * 0.15 : 1;
    c.drawImage(tr.spr, x - w / 2, yb - h, w, h);
  }
  c.globalAlpha = 1;
  // névoa no horizonte
  g = c.createLinearGradient(0, HOR - 50, 0, HOR + 60);
  g.addColorStop(0, 'rgba(60,75,100,0)'); g.addColorStop(0.5, day > 0 ? `rgba(${lerp(60, 255, day)},${lerp(75, 190, day)},${lerp(100, 140, day)},0.25)` : 'rgba(60,75,100,0.22)'); g.addColorStop(1, 'rgba(60,75,100,0)');
  c.fillStyle = g; c.fillRect(-200, HOR - 60, 1500, 130);
  // reflexo no vidro
  g = c.createLinearGradient(200, 380, 700, 880);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(180,200,230,0.05)'); g.addColorStop(0.5, 'rgba(180,200,230,0.0)');
  c.fillStyle = g; c.fillRect(-100, 350, 1300, 560);
  c.restore();
  // janelas laterais dianteiras: escuridão em movimento
  for (const path of [sideWinL, sideWinR]) {
    c.save(); path(c); c.clip();
    c.fillStyle = day > 0 ? mixc('#05070c', '#c58a63', day) : '#05070c'; c.fillRect(-FOX, 380, W + 2 * FOX, 560);
    c.restore();
  }
}

// --------------------------- rosto do pai (retrovisor) ----------------------
// p: gx,gy (olhar), open (0..1), wide (0..1), red (0..1), day (0..1)
function drawDadFace(c, cx, cy, s, p) {
  c.save(); c.translate(cx, cy); c.scale(s, s);
  const day = p.day || 0, wide = p.wide || 0, red = p.red ?? 1, open = p.open ?? 1;
  let g = c.createLinearGradient(0, -230, 0, 230);
  g.addColorStop(0, mixc('#21160f', '#6b4a38', day)); g.addColorStop(0.5, mixc('#4b3326', '#9a6c52', day)); g.addColorStop(1, mixc('#2e1f17', '#7a5440', day));
  c.fillStyle = g; c.fillRect(-460, -260, 920, 520);
  // luz do painel por baixo (azul-petróleo)
  if (day < 1) {
    g = c.createRadialGradient(0, 260, 20, 0, 230, 420);
    g.addColorStop(0, `rgba(60,170,185,${0.38 * (1 - day)})`); g.addColorStop(1, 'rgba(60,170,185,0)');
    c.fillStyle = g; c.fillRect(-460, -260, 920, 520);
  } else {
    g = c.createLinearGradient(-460, 0, 460, 0);
    g.addColorStop(0, 'rgba(255,180,110,0.25)'); g.addColorStop(1, 'rgba(255,200,140,0)');
    c.fillStyle = g; c.fillRect(-460, -260, 920, 520);
  }
  // rugas da testa
  c.strokeStyle = `rgba(15,8,5,${0.35 + wide * 0.3})`; c.lineWidth = 5; c.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const y = -150 - i * 30 - wide * 20; c.beginPath(); c.moveTo(-150 + i * 10, y + 8); c.quadraticCurveTo(0, y - 10 - wide * 10, 150 - i * 10, y + 8); c.stroke(); }
  // ponte do nariz
  g = c.createRadialGradient(0, 120, 4, 0, 120, 70);
  g.addColorStop(0, `rgba(${day ? '255,220,190' : '120,200,210'},0.14)`); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 90, 34, 140, 0, 0, Math.PI * 2); c.fill();
  for (const side of [-1, 1]) {
    const ex = side * 118;
    // órbita escura
    g = c.createRadialGradient(ex, 4, 10, ex, 4, 125);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(ex - 130, -125, 260, 260);
    // sobrancelha
    const furrow = (p.furrow ?? 1) * (1 - wide);
    c.lineCap = 'round';
    c.strokeStyle = '#120a06'; c.lineWidth = 24;
    c.beginPath(); c.moveTo(side * 38, -66 + furrow * 16 - wide * 34);
    c.quadraticCurveTo(side * 100, -100 - wide * 40 + furrow * 6, side * 182, -80 - wide * 30); c.stroke();
    c.strokeStyle = 'rgba(60,40,30,0.6)'; c.lineWidth = 2;
    for (let i = 0; i < 10; i++) { const u = i / 9; const x = lerp(side * 40, side * 180, u), y = lerp(-66 + furrow * 16 - wide * 34, -80 - wide * 30, u) - Math.sin(u * Math.PI) * (26 + wide * 10); c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + side * 14, y - 8); c.stroke(); }
    drawDadEye(c, ex, 0, side, open, wide, red, p.gx || 0, p.gy || 0, day);
  }
  c.restore();
}
function drawDadEye(c, ex, ey, side, open, wide, red, gx, gy, day) {
  const ew = 64 * (1 + wide * 0.08), up = 34 * open * (1 + wide * 0.6), lo = 22 * open * (1 + wide * 0.35);
  c.save(); c.translate(ex, ey);
  const shape = () => {
    c.beginPath(); c.moveTo(-ew, 0);
    c.bezierCurveTo(-ew * 0.45, -up * 1.3, ew * 0.45, -up * 1.3, ew, 3);
    c.bezierCurveTo(ew * 0.45, lo * 1.25, -ew * 0.45, lo * 1.25, -ew, 0); c.closePath();
  };
  // pálpebra superior / dobra
  c.strokeStyle = 'rgba(12,6,4,0.55)'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-ew + 4, -6); c.bezierCurveTo(-ew * 0.4, -up * 1.3 - 26 + open * 2, ew * 0.4, -up * 1.3 - 26, ew - 2, -4); c.stroke();
  if (open > 0.04) {
    c.save(); shape(); c.clip();
    let g = c.createRadialGradient(0, 0, 4, 0, 0, ew * 1.05);
    g.addColorStop(0, mixc('#ece6de', '#e9b2a8', red)); g.addColorStop(0.55, mixc('#d9cfc4', '#c95a58', red)); g.addColorStop(1, mixc('#8d7d72', '#7c0d12', red));
    c.fillStyle = g; c.fillRect(-ew, -70, ew * 2, 140);
    if (red > 0.02) { c.globalAlpha = red; c.drawImage(VEIN[side > 0 ? 1 : 0], -ew, -42, ew * 2, 84); c.globalAlpha = 1; }
    const ir = 25 * (1 - wide * 0.1), ix = gx * ew * 0.42, iy = gy * 9 + 2;
    g = c.createRadialGradient(ix, iy, 2, ix, iy, ir);
    g.addColorStop(0, '#0c0705'); g.addColorStop(0.35, '#3b2414'); g.addColorStop(0.8, '#5b3a20'); g.addColorStop(1, '#120a05');
    c.fillStyle = g; c.beginPath(); c.arc(ix, iy, ir, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#030202'; c.beginPath(); c.arc(ix, iy, ir * (0.42 - wide * 0.12), 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.beginPath(); c.arc(ix - 9, iy - 9, 5.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(ix + 9, iy + 7, 2.6, 0, Math.PI * 2); c.fill();
    if (!day) { c.fillStyle = 'rgba(120,230,240,0.35)'; c.beginPath(); c.ellipse(ix + 2, iy + 14, 9, 3, 0, 0, Math.PI * 2); c.fill(); }
    g = c.createLinearGradient(0, -up * 1.3, 0, -up * 0.1);
    g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(-ew, -up * 1.4, ew * 2, up * 1.3);
    c.restore();
  }
  // linha da pálpebra + cílios
  c.strokeStyle = '#0d0604'; c.lineWidth = 6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-ew - 3, 1); c.bezierCurveTo(-ew * 0.45, -up * 1.3 - 1, ew * 0.45, -up * 1.3 - 1, ew + 3, 3); c.stroke();
  c.lineWidth = 2.5;
  for (let i = 1; i < 8; i++) {
    const u = i / 8, x = lerp(-ew, ew, u), y = -Math.sin(u * Math.PI) * up * 0.98;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + (u - .5) * 10, y - 8 - 4 * Math.sin(u * Math.PI)); c.stroke();
  }
  // pálpebra inferior úmida/vermelha
  c.strokeStyle = red > 0.2 ? `rgba(200,60,60,${0.5 + red * 0.4})` : 'rgba(170,110,95,0.7)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-ew + 2, 1); c.bezierCurveTo(-ew * 0.45, lo * 1.25, ew * 0.45, lo * 1.25, ew - 2, 3); c.stroke();
  if (open > 0.04) {
    c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-ew * 0.5, lo * 0.95 + 1); c.quadraticCurveTo(0, lo * 1.05 + 2, ew * 0.5, lo * 0.95 + 2); c.stroke();
  }
  // olheiras
  c.strokeStyle = 'rgba(8,4,2,0.55)'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(-ew * 0.7, lo * 1.25 + 16); c.quadraticCurveTo(0, lo * 1.25 + 34, ew * 0.75, lo * 1.25 + 14); c.stroke();
  c.strokeStyle = 'rgba(8,4,2,0.3)'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-ew * 0.5, lo * 1.25 + 38); c.quadraticCurveTo(0, lo * 1.25 + 52, ew * 0.6, lo * 1.25 + 34); c.stroke();
  c.restore();
}

// retrovisor: haste, moldura e o reflexo dos olhos do pai
const MIR = { x: 362, y: 404, w: 356, h: 104 };
function drawMirror(c, t, p) {
  c.fillStyle = '#0a0b0e'; c.fillRect(528, 330, 24, 84);
  c.fillStyle = 'rgba(120,140,170,0.2)'; c.fillRect(530, 330, 3, 84);
  c.beginPath(); c.roundRect(MIR.x - 12, MIR.y - 12, MIR.w + 24, MIR.h + 24, 36);
  let g = c.createLinearGradient(0, MIR.y - 12, 0, MIR.y + MIR.h + 12);
  g.addColorStop(0, '#24262d'); g.addColorStop(1, '#08090b');
  c.fillStyle = g; c.fill();
  c.save();
  c.beginPath(); c.roundRect(MIR.x, MIR.y, MIR.w, MIR.h, 26); c.clip();
  c.fillStyle = '#050608'; c.fillRect(MIR.x, MIR.y, MIR.w, MIR.h);
  const tr = shake(t, (p.tremble || 0.6), 14, 3);
  drawDadFace(c, 540 + (p.dx || 0) + tr[0] * 0.3, 456 + (p.dy || 0) + tr[1] * 0.3, p.s || 0.5, p);
  // brilho do vidro
  g = c.createLinearGradient(MIR.x, MIR.y, MIR.x + MIR.w, MIR.y + MIR.h);
  g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(0.3, 'rgba(255,255,255,0.0)'); g.addColorStop(0.62, 'rgba(255,255,255,0.0)'); g.addColorStop(0.7, 'rgba(200,220,255,0.06)'); g.addColorStop(0.8, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(MIR.x, MIR.y, MIR.w, MIR.h);
  if (p.redGlow) {
    c.globalCompositeOperation = 'screen';
    c.fillStyle = `rgba(160,0,0,${p.redGlow})`; c.fillRect(MIR.x, MIR.y, MIR.w, MIR.h);
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();
  c.strokeStyle = 'rgba(160,180,210,0.22)'; c.lineWidth = 2;
  c.beginPath(); c.roundRect(MIR.x - 11, MIR.y - 11, MIR.w + 22, MIR.h + 22, 35); c.stroke();
}

function drawClock(c, t, o) {
  const fl = o.clockFlicker ? (hash(Math.floor(t * 24)) < o.clockFlicker ? 0.25 : 1) : 1;
  c.save();
  c.font = '52px ShareTech'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = 'rgba(90,220,255,0.9)'; c.shadowBlur = 14;
  c.fillStyle = `rgba(110,230,255,${0.95 * fl})`;
  c.fillText(o.clockText || '4:07', 528, 962);
  c.font = '20px ShareTech'; c.shadowBlur = 6; c.fillText('AM', 600, 950);
  c.restore();
}

// papel dobrado no bolso do banco (dy = quanto já foi puxado para cima)
function drawPocketPaper(c, dy, rot = 0) {
  c.save(); c.translate(790, 1236 - dy); c.rotate(-0.08 + rot);
  c.fillStyle = '#c9c0ac'; c.beginPath(); c.roundRect(-70, -60, 150, 150, 4); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(-70, 10, 150, 3);
  c.fillStyle = 'rgba(30,40,80,0.75)'; c.font = '700 26px Caveat'; c.textAlign = 'center';
  c.fillText('Dad’s rules', 6, -24);
  c.restore();
}
function drawPocketFront(c) {
  c.beginPath(); c.roundRect(660, 1252, 326, 248, [6, 6, 26, 26]);
  const g = c.createLinearGradient(0, 1252, 0, 1500); g.addColorStop(0, '#1a1b20'); g.addColorStop(1, '#0b0b0e');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(140,160,190,0.25)'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(664, 1256); c.quadraticCurveTo(822, 1268, 982, 1256); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(690 + i * 50, 1262); c.lineTo(700 + i * 50, 1290); c.stroke(); }
}

// desenho completo do mundo "frente"
// o = { cam:{x,y,z,rot}, day, hand, handT, paper(dy|null), reach, mirror:{...}, clockText, clockFlicker }
function drawFront(c, t, o) {
  const cm = o.cam;
  c.save(); camera(c, cm.x, cm.y, cm.z, cm.rot || 0);
  drawExterior(c, t, o.day || 0);
  c.drawImage(FI, -FOX, -FOY);
  if (o.paper !== null && o.paper !== undefined) drawPocketPaper(c, o.paper);
  drawPocketFront(c);
  drawClock(c, t, o);
  drawMirror(c, t, o.mirror || {});
  if (o.hand) drawKneeHand(c, t, o.hand);
  if (o.reach) drawReach(c, o.reach);
  c.restore();
  if (o.day) {
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(W, 0, 0, H);
    g.addColorStop(0, `rgba(255,170,100,${0.42 * o.day})`); g.addColorStop(1, `rgba(120,80,60,${0.2 * o.day})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  }
}

// mão da mulher sobre o seu joelho direito (no mundo "frente")
function drawKneeHand(c, t, h) {
  const curl = (h.curl || 0) + 0.06 * Math.sin(t * 1.3) * (h.alive ?? 1);
  // manga roxa entrando pela direita
  c.save();
  c.beginPath(); c.moveTo(1400, 1540); c.quadraticCurveTo(1150, 1560, 1010, 1600); c.lineTo(1000, 1720); c.quadraticCurveTo(1160, 1720, 1400, 1760); c.closePath();
  const g = c.createLinearGradient(1000, 0, 1300, 0); g.addColorStop(0, '#4a1d60'); g.addColorStop(1, '#1d0a28');
  c.fillStyle = g; c.fill();
  c.strokeStyle = 'rgba(160,100,200,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(1010, 1602); c.quadraticCurveTo(1150, 1562, 1400, 1542); c.stroke();
  c.restore();
  drawLongHand(c, 1030, 1650, 1.0, Math.PI - 0.32, { curl, light: 'night', flip: true });
}

// sua mão alcançando o bolso do banco
function drawReach(c, r) {
  c.save(); c.translate(r.x, r.y); c.rotate(r.rot || -0.2);
  // braço / manga
  c.fillStyle = '#16181d'; c.beginPath(); c.moveTo(-70, 40); c.lineTo(70, 40); c.lineTo(110, 900); c.lineTo(-110, 900); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(120,140,170,0.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-70, 40); c.lineTo(-110, 900); c.stroke();
  drawMyHand(c, 0, 0, 1, 0, r.pinch || 0, 'night');
  c.restore();
}
