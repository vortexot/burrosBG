// Renderiza o vídeo: node render.cjs <pastaSaida> [workers] [fps]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const OUT = path.resolve(process.argv[2] || 'out');
const WORKERS = +(process.argv[3] || 4), FPS = +(process.argv[4] || 30), T_END = 146.0;
const TOTAL = Math.round(T_END * FPS);
require('fs').mkdirSync(OUT, { recursive: true });

async function worker(k, browser) {
  const a = Math.floor(TOTAL * k / WORKERS), b = Math.floor(TOTAL * (k + 1) / WORKERS);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('ERR', k, e.message));
  await page.goto('file://' + __dirname + '/index.html');
  await page.waitForFunction('window.ready === true');
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-maxrate', '6M', '-bufsize', '12M', '-pix_fmt', 'yuv420p', '-r', String(FPS), path.join(OUT, `seg${k}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    const url = await page.evaluate(t => window.frameJPEG(t, 0.93), f / FPS);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 300 === 0) console.log(`w${k} ${f - a}/${b - a} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await page.close();
}
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  await Promise.all([...Array(WORKERS).keys()].map(k => worker(k, browser)));
  await browser.close();
  require('fs').writeFileSync(path.join(OUT, 'list.txt'), [...Array(WORKERS).keys()].map(k => `file 'seg${k}.mp4'`).join('\n'));
  console.log('done');
})();
