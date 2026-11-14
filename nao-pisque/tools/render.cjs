// Renderiza todos os quadros em paralelo e gera segmentos H.264 (sem e com legendas).
// uso: node tools/render.cjs <outdir> [workers]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, TOTAL = 155.5;
const out = path.resolve(process.argv[2] || 'build'); const NW = parseInt(process.argv[3] || '4');
fs.mkdirSync(out, { recursive: true });
const N = Math.round(TOTAL * FPS);
function enc(file) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-threads', '1', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  return p;
}
const write = (p, buf) => new Promise(r => { if (!p.stdin.write(buf)) p.stdin.once('drain', r); else r(); });
const close = p => new Promise(r => { p.on('close', r); p.stdin.end(); });
async function worker(w) {
  const a = Math.floor(N * w / NW), b = Math.floor(N * (w + 1) / NW);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../render/index.html'));
  await page.waitForFunction(() => window.READY === true || window.INIT_ERR, null, { timeout: 120000 });
  const e1 = enc(path.join(out, `clean_${w}.mp4`)), e2 = enc(path.join(out, `caps_${w}.mp4`));
  const t0 = Date.now();
  for (let i = a; i < b; i++) {
    const [x, y] = await page.evaluate(t => window.renderPair(t), i / FPS);
    await write(e1, Buffer.from(x.slice(x.indexOf(',') + 1), 'base64'));
    await write(e2, Buffer.from(y.slice(y.indexOf(',') + 1), 'base64'));
    if ((i - a) % 150 === 0) console.log(`w${w} ${i - a}/${b - a} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await Promise.all([close(e1), close(e2)]);
  await browser.close();
  console.log(`w${w} done ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
(async () => {
  await Promise.all([...Array(NW).keys()].map(worker));
  for (const v of ['clean', 'caps']) fs.writeFileSync(path.join(out, `${v}.txt`), [...Array(NW).keys()].map(w => `file '${v}_${w}.mp4'`).join('\n') + '\n');
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
