'use strict';
// ---------------------------------------------------------------------------
// Linha do tempo: cada plano sincronizado com a narração (timestamps por
// palavra). t em segundos.
// ---------------------------------------------------------------------------
const MIRROR_CAM = { x: 540, y: 456 };
function sway(t, a = 1) { return [vn(t * 0.35, 11) * 10 * a, vn(t * 0.3, 12) * 8 * a]; }
function dadNight(extra) { return Object.assign({ s: 0.5, red: 1, open: 1, gx: 0.55, gy: 0.05, furrow: 1, tremble: 0.8 }, extra || {}); }

// planos laterais deslizando (giro de cabeça)
function slideH(c, k, drawA, drawB, dir = 1) {
  const off = W * eio(k);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  c.save(); c.translate(-off * dir, 0); drawA(); c.restore();
  c.save(); c.translate((W - off) * dir, 0); drawB(); c.restore();
  c.restore();
}
function slideV(c, k, drawA, drawB, dir = 1) {
  const off = H * eio(k);
  c.save(); c.translate(0, -off * dir); drawA(); c.restore();
  c.save(); c.translate(0, (H - off) * dir); drawB(); c.restore();
}
function velBlur(k, dk, amp) { // velocidade da curva eio
  const d = (eio(clamp(k + 0.02)) - eio(clamp(k - 0.02))) / 0.04;
  return d * amp;
}

// ------------------------------- planos ------------------------------------
const SHOTS = [];
function shot(a, b, f) { SHOTS.push({ a, b, f }); }

// 0 — abertura: estrada vazia, olhos do pai no retrovisor
shot(0, 8.9, (c, t) => {
  const k = keys(t, [{ t: 0, x: 540, y: 930, z: 1.0 }, { t: 8.9, x: 540, y: 880, z: 1.1, ease: esin }]);
  const s = sway(t);
  drawFront(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, mirror: dadNight({ gx: 0.05, gy: 0.35, red: 0.55 }) });
});
// 1 — "seu pai sempre deixa regras escritas": o papel no bolso; depois o retrovisor
shot(8.9, 17.3, (c, t) => {
  const k = keys(t, [
    { t: 8.9, x: 540, y: 880, z: 1.1 }, { t: 11.0, x: 805, y: 1300, z: 2.0 }, { t: 12.7, x: 812, y: 1290, z: 2.15, ease: esin },
    { t: 15.0, x: 540, y: 458, z: 2.7 }, { t: 17.3, x: 540, y: 458, z: 2.95, ease: esin }]);
  const s = sway(t, 0.6);
  const look = sstep(14.6, 15.4, t);
  drawFront(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, paper: 0, mirror: dadNight({ gx: lerp(0.1, 0, look), gy: lerp(0.35, 0, look), red: 0.7 }) });
});
// 2 — "mas, dessa vez, alguma coisa está diferente"
shot(17.3, 21.0, (c, t) => {
  const k = keys(t, [{ t: 17.3, x: 540, y: 458, z: 2.95 }, { t: 19.8, x: 540, y: 960, z: 1.0 }, { t: 21.0, x: 540, y: 990, z: 0.98, ease: esin }]);
  const s = sway(t);
  drawFront(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, paper: 0, clockFlicker: t > 18.8 ? 0.45 : 0, mirror: dadNight({ gx: 0.4, red: 0.85 }), hand: t > 20.95 ? { curl: 0 } : null });
  if (t > 19 && hash(Math.floor(t * 16)) < 0.18) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, H); }
});
// 3 — 4:07 no relógio, olhar desce até a mão no joelho
shot(21.0, 26.3, (c, t) => {
  const k = keys(t, [{ t: 21.0, x: 530, y: 958, z: 2.7 }, { t: 23.3, x: 530, y: 975, z: 2.95, ease: esin }, { t: 25.4, x: 840, y: 1640, z: 1.95 }, { t: 26.3, x: 850, y: 1650, z: 2.05, ease: esin }]);
  const s = sway(t, 0.7);
  const curl = 0.05 + 0.2 * sstep(25.4, 25.9, t) - 0.12 * sstep(25.9, 26.3, t);
  drawFront(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, paper: 0, mirror: dadNight(), hand: { curl } });
});
// 4 — vira para o lado: a mulher sentada ao seu lado
shot(26.3, 35.78, (c, t) => {
  const woman = { close: 0, smile: lerp(0.7, 0.95, sstep(30.5, 31.6, t)), gaze: -0.15 };
  const sideCam = keys(t, [{ t: 26.3, x: 600, y: 900, z: 1.0 }, { t: 28.0, x: 590, y: 880, z: 1.02 }, { t: 35.78, x: 590, y: 760, z: 1.3, ease: esin }]);
  const s = sway(t, 0.6);
  const drawS = () => drawSide(c, t, { cam: { x: sideCam.x + s[0], y: sideCam.y + s[1], z: sideCam.z }, woman });
  if (t < 28.0) {
    const k = (t - 26.3) / 1.7;
    slideH(c, k, () => drawFront(c, t, { cam: { x: 850, y: 1600, z: 1.7 }, paper: 0, mirror: dadNight(), hand: { curl: 0.08 } }), drawS);
    motionBlur(c, -velBlur(k, 0, 70));
  } else drawS();
});
// 5 — retrovisor: o pai encarando a mulher
shot(35.78, 40.4, (c, t) => {
  const z = lerp(2.9, 3.4, P(t, 35.8, 40.4, esin));
  const s = sway(t, 0.4);
  drawFront(c, t, { cam: { x: MIRROR_CAM.x + s[0], y: MIRROR_CAM.y + s[1], z }, paper: 0, mirror: dadNight({ gx: 0.6 }), hand: { curl: 0 } });
});
// 6 — close extremo: olhos vermelhos, tentando não piscar
shot(40.4, 46.22, (c, t) => {
  const z = lerp(5.2, 6.4, P(t, 40.4, 46.2, esin));
  const s = sway(t, 0.25);
  const twitch = 0.06 * Math.max(0, vn(t * 6, 3)) + (Math.abs(t - 44.9) < 0.12 ? 0.18 : 0);
  drawFront(c, t, { cam: { x: MIRROR_CAM.x + s[0] * 0.3, y: MIRROR_CAM.y + 4 + s[1] * 0.3, z }, paper: 0, mirror: dadNight({ gx: 0.55, open: 1 - twitch, tremble: 1.2 }) });
});
// 7 — alterna: ela está mais perto / o pai pisca / ela está ainda mais perto
shot(46.22, 49.9, (c, t) => {
  const s = sway(t, 0.5);
  if (t < 47.6) {
    drawSide(c, t, { cam: { x: 580 + s[0], y: 760 + s[1], z: 1.3 }, woman: { close: 0.22, smile: 0.95, gaze: -0.2 } });
  } else if (t < 48.42) {
    const bl = Math.abs(t - 48.0) < 0.09 ? 0.02 : 1; // o pai pisca
    drawFront(c, t, { cam: { x: MIRROR_CAM.x + s[0] * 0.3, y: MIRROR_CAM.y + s[1] * 0.3, z: 3.6 }, paper: 0, mirror: dadNight({ gx: 0.55, open: bl }) });
  } else {
    drawSide(c, t, { cam: { x: 575 + s[0], y: 760 + s[1], z: 1.32 }, woman: { close: 0.42, smile: 1.0, gaze: -0.2, tilt: 0.1 } });
  }
});
// 8 — o celular vibra: mensagens da "Mãe"
function phoneState(t) {
  if (t < 52.35) return { type: 'lock', time: '4:07', notif: sstep(50.6, 50.95, t) };
  const msgs = [{ text: 'Não deixa ele encostar em você.', k: clamp((t - 54.3) / 0.25) }];
  const typing = t > 56.7 && t < 59.1;
  msgs.push({ text: 'Não escuta ele, meu amor.', k: clamp((t - 59.12) / 0.25) });
  return { type: 'chat', time: '4:07', msgs, typing, t };
}
shot(49.9, 62.5, (c, t) => {
  const k = keys(t, [{ t: 49.9, x: 540, y: 1060, z: 0.95 }, { t: 52.2, x: 540, y: 1010, z: 1.02 }, { t: 53.4, x: 540, y: 820, z: 1.55 }, { t: 62.5, x: 540, y: 800, z: 1.66, ease: esin }]);
  const s = sway(t, 0.5);
  const buzz = (t > 50.0 && t < 50.55) || (t > 50.85 && t < 51.35) ? 1 : ((t > 54.3 && t < 54.6) || (t > 59.12 && t < 59.42) ? 0.5 : 0);
  const flash = t > 52.3 && t < 52.5 ? (1 - Math.abs(t - 52.4) / 0.1) : 0;
  drawLap(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, phone: phoneState(t), buzz, hand: true, glow: 1 + flash });
});
// 9 — por que sua mãe diria para não confiar no seu pai? (ele olha para você)
shot(62.5, 66.4, (c, t) => {
  const z = lerp(3.1, 3.7, P(t, 62.5, 66.4, esin));
  const s = sway(t, 0.4);
  const look = sstep(63.0, 63.8, t);
  drawFront(c, t, { cam: { x: MIRROR_CAM.x + s[0] * 0.4, y: MIRROR_CAM.y + s[1] * 0.4, z }, paper: 0, mirror: dadNight({ gx: lerp(0.55, 0, look), gy: lerp(0.05, -0.05, look) }), hand: { curl: 0 } });
});
// 10 — você procura o papel no bolso do banco
shot(66.4, 70.3, (c, t) => {
  const k = keys(t, [{ t: 66.4, x: 540, y: 470, z: 3.4 }, { t: 67.6, x: 800, y: 1250, z: 1.7 }, { t: 70.3, x: 790, y: 1150, z: 1.75, ease: esin }]);
  const s = sway(t, 0.6);
  const ry = keys(t, [{ t: 66.4, y: 2300 }, { t: 67.4, y: 2300 }, { t: 68.8, y: 1330, ease: eout }, { t: 69.2, y: 1300 }, { t: 70.3, y: 880, ease: ein }]).y;
  const pinch = sstep(68.7, 69.15, t);
  const pdy = Math.max(0, 1300 - ry);
  drawFront(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, paper: pdy, mirror: dadNight(), hand: { curl: 0 }, reach: { x: 800, y: ry - pdy * 0 , rot: -0.12, pinch } });
});
// 11 — desdobrando o papel
shot(70.3, 72.6, (c, t) => {
  const z = lerp(0.9, 0.98, P(t, 70.3, 72.6));
  drawPaperScene(c, t, { cam: { x: 540, y: 960, z }, unfold: P(t, 70.6, 72.2), shake: 2 });
});
// 12 — página 1, regra por regra
function ruleCam(key, z) { return { x: 540, y: 400 + RULE_Y[key], z }; }
shot(72.6, 89.2, (c, t) => {
  const full = { x: 540, y: 960, z: 0.98 };
  const k = keys(t, [
    Object.assign({ t: 72.6 }, full),
    Object.assign({ t: 73.5 }, ruleCam('r1', 1.62)), Object.assign({ t: 76.4, ease: esin }, ruleCam('r1', 1.7)),
    Object.assign({ t: 77.2 }, ruleCam('r2', 1.62)), Object.assign({ t: 79.9, ease: esin }, ruleCam('r2', 1.7)),
    Object.assign({ t: 80.8 }, ruleCam('r3', 1.5)), Object.assign({ t: 82.9, ease: esin }, ruleCam('r3', 1.62)),
    Object.assign({ t: 84.2 }, { x: 540, y: 400 + RULE_Y.r3 + 40, z: 2.05 }),
    Object.assign({ t: 85.6 }, { x: 540, y: 930, z: 1.0 }), Object.assign({ t: 89.2, ease: esin }, { x: 540, y: 960, z: 0.98 })]);
  const tremble = 1.5 + 5 * sstep(84.9, 86.0, t);
  drawPaperScene(c, t, { cam: k, page: 1, shake: tremble });
});
// 13 — vira o papel
shot(89.2, 91.6, (c, t) => {
  drawPaperScene(c, t, { cam: { x: 540, y: 960, z: 0.98 }, page: 1, flip: P(t, 89.4, 90.9), shake: 4 });
});
// 14 — página 2
shot(91.6, 101.38, (c, t) => {
  const k = keys(t, [
    { t: 91.6, x: 540, y: 960, z: 0.98 },
    Object.assign({ t: 92.4 }, ruleCam('r4', 1.62)), Object.assign({ t: 95.0, ease: esin }, ruleCam('r4', 1.7)),
    Object.assign({ t: 95.9 }, ruleCam('r5', 1.62)), Object.assign({ t: 98.0, ease: esin }, ruleCam('r5', 1.7)),
    Object.assign({ t: 98.9 }, ruleCam('r6', 1.5)), Object.assign({ t: 101.38, ease: esin }, ruleCam('r6', 1.78))]);
  drawPaperScene(c, t, { cam: k, page: 2, shake: 3 + 2 * sstep(98, 99, t) });
});
// 15 — olha de novo para o celular: algo estranho
shot(101.38, 105.9, (c, t) => {
  const k = keys(t, [{ t: 101.38, x: 540, y: 860, z: 1.5 }, { t: 104.6, x: 540, y: 820, z: 1.62, ease: esin }, { t: 105.9, x: 640, y: 860, z: 1.55 }]);
  const s = sway(t, 0.5);
  const st = { type: 'chat', time: '4:07', msgs: [{ text: 'Não deixa ele encostar em você.', k: 1 }, { text: 'Não escuta ele, meu amor.', k: 1 }], typing: t > 103.0, t };
  const fl = t > 104.7 && t < 105.3 && hash(Math.floor(t * 20)) < 0.5 ? 0.6 : 1;
  drawLap(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, phone: Object.assign(st, { bright: fl }), hand: true, glow: fl });
});
// 16 — as mensagens vêm do celular DELA
function herPhone(t) {
  const full = 'Diga meu nome';
  const n = Math.floor(clamp((t - 107.6) / 3.2) * full.length);
  return { type: 'herchat', time: '4:07', msgs: [{ text: 'Não deixa ele encostar em você.', k: 1 }, { text: 'Não escuta ele, meu amor.', k: 1 }], draft: full.slice(0, n), t };
}
shot(105.9, 112.72, (c, t) => {
  const s = sway(t, 0.5);
  const close = lerp(0, 0.55, P(t, 110.4, 112.4));
  const k = keys(t, [{ t: 105.9, x: 735, y: 2200, z: 1.3 }, { t: 107.2, x: 728, y: 2230, z: 1.42 }, { t: 110.4, x: 728, y: 2235, z: 1.5, ease: esin }, { t: 112.4, x: 560, y: 700, z: 1.3 }, { t: 112.72, x: 560, y: 690, z: 1.32 }]);
  const tap = Math.max(0, Math.sin(t * 9)) * (t > 107.6 && t < 110.8 ? 1 : 0);
  const drawS = () => drawSide(c, t, { cam: { x: k.x + s[0], y: k.y + s[1], z: k.z }, woman: { close, smile: 1, gaze: -0.2, tilt: 0.06, phone: herPhone(t), phoneTap: tap } });
  if (t < 106.9) {
    const kk = (t - 105.9) / 1.0;
    const st = { type: 'chat', time: '4:07', msgs: [{ text: 'Não deixa ele encostar em você.', k: 1 }, { text: 'Não escuta ele, meu amor.', k: 1 }], typing: true, t };
    slideH(c, kk, () => drawLap(c, t, { cam: { x: 640, y: 860, z: 1.55 }, phone: st, hand: true }), drawS);
    motionBlur(c, -velBlur(kk, 0, 80));
  } else {
    drawS();
    if (t > 110.4 && t < 112.4) motionBlur(c, 0, velBlur((t - 110.4) / 2, 0, 22));
  }
});
// 17 — você tenta se afastar; dedos no seu pescoço
shot(112.72, 117.3, (c, t) => {
  const rec = P(t, 112.75, 113.5, eout);
  const sh = shake(t, 6 * (1 - sstep(113.5, 114.5, t)) + 2, 13, 4);
  const camF = { x: lerp(540, 300, rec) + sh[0], y: lerp(960, 920, rec) + sh[1], z: lerp(1.0, 1.12, rec), rot: -0.04 * rec };
  const drawF = () => drawFront(c, t, { cam: camF, paper: 300, mirror: dadNight({ gx: 0.3, gy: 0 }) });
  const fingers = () => {
    // dedos entrando pela borda direita, perto da câmera (desfocados)
    const e = P(t, 114.3, 116.2, eout);
    const g = TMP2.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    g.setTransform(0.25, 0, 0, 0.25, 0, 0);
    drawLongHand(g, lerp(2700, 1180, e), 1500, 2.6, Math.PI * 1.08, { curl: 0.35 + 0.15 * Math.sin(t * 2), light: 'night' });
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingQuality = 'high';
    c.drawImage(TMP2, 0, 0, W / 4, H / 4, 0, 0, W, H); c.restore();
  };
  if (t < 116.3) { drawF(); if (t < 113.5) motionBlur(c, velBlur(rec, 0, 60)); fingers(); }
  else {
    const kk = (t - 116.3) / 1.0;
    slideH(c, kk, () => { drawF(); fingers(); }, () => drawSide(c, t, { cam: { x: 600, y: 700, z: 1.25 }, woman: { close: 0.85, smile: 1, gaze: -0.3, tilt: 0.14 } }));
    motionBlur(c, -velBlur(kk, 0, 40));
  }
});
// 18 — o rosto dela, colado ao seu: "Diga meu nome..."
shot(117.3, 121.92, (c, t) => {
  const s = sway(t, 0.3);
  const k = keys(t, [{ t: 117.3, close: 0.85, tilt: 0.14, cx: 600, cy: 700, z: 1.25 }, { t: 120.4, close: 1.25, tilt: 0.3, cx: 520, cy: 640, z: 1.35, ease: esin }, { t: 121.92, close: 1.36, tilt: 0.33, cx: 500, cy: 630, z: 1.38, ease: esin }]);
  const br = Math.sin(t * 2.6) * 0.012;
  drawSide(c, t, { cam: { x: k.cx + s[0], y: k.cy + s[1], z: k.z }, woman: { close: k.close + br, smile: 1, gaze: -0.35, tilt: k.tilt, dx: lerp(0, 120, P(t, 117.3, 121)) } });
  c.drawImage(VIG2, 0, 0);
});
// 19 — "FILHO, ABAIXE! AGORA!"
shot(121.92, 124.1, (c, t) => {
  const sh = shake(t, 14, 22, 8);
  drawFront(c, t, { cam: { x: MIRROR_CAM.x + sh[0] * 0.15, y: MIRROR_CAM.y + 6 + sh[1] * 0.15, z: lerp(4.4, 5.0, P(t, 121.92, 124.1)) }, paper: 300, mirror: dadNight({ wide: 1, gx: 0, gy: 0, red: 1, tremble: 3, redGlow: 0.12 }) });
});
// 20 — você se joga para baixo; o pai acelera
shot(124.1, 127.2, (c, t) => {
  if (t < 124.62) {
    const k = P(t, 124.1, 124.62, ein);
    drawFront(c, t, { cam: { x: 540, y: lerp(480, 2100, k), z: lerp(3.4, 1.3, k), rot: 0.12 * k }, paper: 300, mirror: dadNight({ wide: 1 }) });
    motionBlur(c, 0, -k * 160);
  } else {
    const sh = shake(t, 10 * (1 - sstep(124.6, 125.2, t)) + 3 + 4 * sstep(125.8, 126.4, t), 18, 6);
    drawFloor(c, t, { cam: { x: 540 + sh[0], y: 1050 + sh[1], z: 1.08, rot: 0.03 }, strobe: sstep(125.7, 126.2, t), dark: 0.45 });
  }
  c.drawImage(VIG2, 0, 0);
});
// 21 — amanhecer: você levanta a cabeça
shot(127.2, 131.5, (c, t) => {
  const dawn = sstep(127.2, 128.4, t);
  const camS = keys(t, [{ t: 128.2, x: 600, y: 1000, z: 1.0 }, { t: 131.5, x: 600, y: 900, z: 1.08, ease: esin }]);
  const drawS = () => drawSide(c, t, { cam: camS, day: 1, woman: { close: 0, smile: 0.85, gaze: -0.2, light: 'dawn', reach: false } });
  if (t < 128.2) drawFloor(c, t, { cam: { x: 540, y: 1050, z: 1.08, rot: 0.03 }, dawn, dark: 0.35 * (1 - dawn) });
  else if (t < 129.4) {
    const kk = (t - 128.2) / 1.2;
    slideV(c, kk, () => drawFloor(c, t, { cam: { x: 540, y: 1050, z: 1.08, rot: 0.03 }, dawn: 1, dark: 0 }), drawS, -1);
    motionBlur(c, 0, velBlur(kk, 0, 60));
  } else drawS();
  sunRays(c, t, 0.6 * sstep(128.2, 130, t));
});
// 22 — o rosto dela racha e ela desaparece
shot(131.5, 137.9, (c, t) => {
  const camS = keys(t, [{ t: 131.5, x: 600, y: 900, z: 1.08 }, { t: 137.9, x: 600, y: 860, z: 1.2, ease: esin }]);
  // centro do rosto em tela
  const fx = W / 2 + (WOMAN_BASE.x - camS.x) * camS.z, fy = H / 2 + (WOMAN_BASE.y - 60 - camS.y) * camS.z;
  const crack = P(t, 131.6, 133.6, x => x);
  const sh = t > 133.0 ? t - 133.0 : null;
  const tr = shake(t, 3 * crack * (sh == null ? 1 : 0.4), 20, 9);
  drawSide(c, t, { cam: { x: camS.x + tr[0], y: camS.y + tr[1], z: camS.z }, day: 1, woman: sh != null && sh > 4.2 ? null : { close: 0, smile: 0.85 - 0.2 * crack, gaze: -0.2, light: 'dawn', reach: false, crack }, shatter: sh, shatterX: fx, shatterY: fy, emptyBelt: sh != null });
  sunRays(c, t, 0.6 + 0.3 * sstep(133, 135, t));
});
// 23 — o pai: "agora está tudo bem"
shot(137.9, 141.6, (c, t) => {
  const z = lerp(2.9, 3.2, P(t, 137.9, 141.6, esin));
  drawFront(c, t, { cam: { x: MIRROR_CAM.x, y: MIRROR_CAM.y, z }, day: 1, paper: 300, mirror: { s: 0.5, red: 0.12, open: 0.82, gx: 0, gy: 0, furrow: 0, day: 1, tremble: 0.2 } });
});
// 24 — o relógio do painel ainda marca 4:07
shot(141.6, 145.7, (c, t) => {
  const z = lerp(2.6, 3.4, P(t, 141.6, 145.7, esin));
  drawFront(c, t, { cam: { x: 530, y: 962, z }, day: 1, paper: 300, mirror: { s: 0.5, red: 0.12, open: 0.82, gx: 0, gy: 0, furrow: 0, day: 1 } });
});
// 25 — o celular mostra 6:12
shot(145.7, 149.2, (c, t) => {
  const k = keys(t, [{ t: 145.7, x: 540, y: 1000, z: 1.05 }, { t: 147.0, x: 540, y: 760, z: 1.7 }, { t: 149.2, x: 540, y: 740, z: 1.85, ease: esin }]);
  drawLap(c, t, { cam: k, phone: { type: 'lock', time: '6:12' }, hand: false, glow: 0.6 });
  c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,150,90,0.18)'; c.fillRect(0, 0, W, H); c.restore();
});
// 26 — final: "quantas vezes você piscou?"
shot(149.2, T_END, (c, t) => {
  const camS = keys(t, [{ t: 149.2, x: 600, y: 860, z: 1.2 }, { t: T_END, x: 610, y: 780, z: 1.55, ease: esin }]);
  drawSide(c, t, { cam: camS, day: 1, woman: null, emptyBelt: true });
  c.fillStyle = `rgba(0,0,0,${lerp(0.25, 0.86, P(t, 149.2, 151.4))})`; c.fillRect(0, 0, W, H);
  // ela... ainda está ali? (quase imperceptível)
  if (t > 153.55) {
    c.save(); c.globalAlpha = 0.22 * sstep(153.55, 154.1, t);
    drawSide(c, t, { cam: camS, day: 0, woman: { close: 0.3, smile: 1, gaze: -0.2 } });
    c.restore();
  }
});

function sunRays(c, t, a) {
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'screen';
  const ox = 1100, oy = 620;
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * 0.82 + i * 0.09 + Math.sin(t * 0.3 + i) * 0.015;
    const len = 2200, w = 0.035 + 0.02 * hash(i);
    const g = c.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len);
    g.addColorStop(0, `rgba(255,220,160,${0.22 * a})`); g.addColorStop(1, 'rgba(255,200,140,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(ox, oy);
    c.lineTo(ox + Math.cos(ang - w) * len, oy + Math.sin(ang - w) * len); c.lineTo(ox + Math.cos(ang + w) * len, oy + Math.sin(ang + w) * len); c.closePath(); c.fill();
  }
  const g = c.createRadialGradient(ox, oy, 10, ox, oy, 700);
  g.addColorStop(0, `rgba(255,235,190,${0.5 * a})`); g.addColorStop(1, 'rgba(255,200,140,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}

// ------------------------------- textos na tela ------------------------------
function overlays(t) {
  const c = ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  // gancho inicial
  if (t > 0.3 && t < 4.6) {
    const a = sstep(0.3, 1.1, t) * (1 - sstep(3.9, 4.6, t));
    const fl = hash(Math.floor(t * 18)) < 0.12 ? 0.5 : 1;
    c.globalAlpha = a;
    c.font = '500 50px Oswald'; c.fillStyle = 'rgba(235,235,240,0.92)';
    c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 18;
    spacedText(c, 'VOCÊ ESTÁ NO BANCO DE TRÁS', W / 2, 250, 6);
    c.globalAlpha = a * fl;
    c.font = '700 168px Oswald'; c.shadowColor = 'rgba(200,0,0,0.85)'; c.shadowBlur = 40;
    c.fillStyle = '#e01b1b'; spacedText(c, 'NÃO PISQUE', W / 2, 430, 4);
    c.shadowBlur = 0;
  }
  // 4:07 AM
  if (t > 21.44 && t < 24.8) {
    const a = sstep(21.44, 21.7, t) * (1 - sstep(24.3, 24.8, t));
    const fl = hash(Math.floor(t * 20) + 3) < 0.1 ? 0.3 : 1;
    c.globalAlpha = a * fl;
    c.font = '120px ShareTech'; c.shadowColor = 'rgba(90,220,255,0.8)'; c.shadowBlur = 30;
    c.fillStyle = '#bff3ff'; spacedText(c, '4:07 AM', W / 2, 400, 8);
    c.shadowBlur = 0;
  }
  // "Diga meu nome..."
  if (t > 120.45 && t < 121.92) {
    const a = sstep(120.45, 120.75, t);
    const sh = shake(t, 3, 25, 2);
    c.globalAlpha = a * 0.95;
    c.font = '86px SpecialElite'; c.shadowColor = 'rgba(0,0,0,1)'; c.shadowBlur = 20;
    c.fillStyle = '#efe6e6';
    c.fillText('Diga meu nome…', W / 2 + sh[0], 1500 + sh[1]);
    c.shadowBlur = 0;
  }
  // "FILHO, ABAIXE! AGORA!"
  if (t > 121.92 && t < 124.1) {
    const words = [['FILHO,', 121.96, 760], ['ABAIXE!', 122.58, 1000], ['AGORA!', 123.30, 1240]];
    for (const [w, ts, y] of words) {
      if (t < ts) continue;
      const k = clamp((t - ts) / 0.12);
      const sh = shake(t + ts, 9, 30, 5);
      c.save(); c.translate(W / 2 + sh[0], y + sh[1]); const sc = 1.35 - 0.35 * eout(k); c.scale(sc, sc);
      c.globalAlpha = k;
      c.font = '700 190px Oswald'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(90,0,0,0.95)'; c.lineWidth = 22; c.strokeText(w, 0, 0);
      c.fillStyle = '#ffffff'; c.fillText(w, 0, 0);
      c.restore();
    }
    // clarão vermelho
    const fl = Math.max(0, 1 - (t - 121.92) / 0.35);
    if (fl > 0) { c.globalAlpha = fl * 0.55; c.fillStyle = '#c00000'; c.fillRect(0, 0, W, H); }
  }
  // pergunta final
  if (t > 151.3 && t < T_END) {
    const lines = [['QUANTAS', 151.40, 760, '#f2f2f2'], ['VEZES VOCÊ', 151.74, 950, '#f2f2f2'], ['PISCOU?', 152.48, 1180, '#e01b1b']];
    for (const [w, ts, y, col] of lines) {
      if (t < ts) continue;
      const k = clamp((t - ts) / 0.25);
      c.save(); c.globalAlpha = k;
      c.translate(W / 2, y); const sc = 1.08 - 0.08 * eout(k); c.scale(sc, sc);
      c.font = w === 'PISCOU?' ? '700 210px Oswald' : '700 150px Oswald';
      c.shadowColor = col === '#e01b1b' ? 'rgba(220,0,0,0.8)' : 'rgba(0,0,0,0.9)'; c.shadowBlur = 36;
      c.fillStyle = col; c.fillText(w, 0, 0);
      c.restore();
    }
  }
  c.restore();
}

// ------------------------------- quadro final --------------------------------
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t >= T_END) return;
  const sh = SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
  ctx.save(); sh.f(ctx, t); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // gradação: sombras azuladas, vinheta e granulação
  ctx.drawImage(VIG, 0, 0);
  overlays(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16;
  ctx.drawImage(GRAIN[Math.floor(t * FPS) % GRAIN.length], 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  eyelids(ctx, blinkAmount(t));
}

window.READY = false;
async function init() {
  const fonts = ['500 40px Caveat', '700 40px Caveat', '300 40px Oswald', '500 40px Oswald', '700 40px Oswald', '400 20px Inter', '600 20px Inter', '700 20px Inter', '40px ShareTech', '40px SpecialElite'];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'ÃÉÍÕÚÇãéíõúç…’')));
  await document.fonts.ready;
  initPost(); buildFront(); buildSide(); buildPaper(); buildLap(); buildFloor();
  window.READY = true;
}
window.renderPair = (t, q = 0.93) => {
  renderFrame(t);
  const a = cv.toDataURL('image/jpeg', q);
  drawCaptions(t);
  const b = cv.toDataURL('image/jpeg', q);
  return [a, b];
};
window.still = (t, caps) => { renderFrame(t); if (caps) drawCaptions(t); return cv.toDataURL('image/png'); };
init().catch(e => { window.INIT_ERR = String(e && e.stack || e); });
