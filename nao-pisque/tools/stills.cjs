// Renderiza quadros específicos em PNG para revisão: node tools/stills.cjs outdir t1 t2 ...  (sufixo c = com legenda, ex 12.5c)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  page.on('pageerror', e => console.error('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../render/index.html'));
  await page.waitForFunction(() => window.READY === true || window.INIT_ERR, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.INIT_ERR);
  if (err) { console.error(err); process.exit(1); }
  for (const s of ts) {
    const caps = s.endsWith('c'); const t = parseFloat(s);
    const t0 = Date.now();
    const url = await page.evaluate(([t, caps]) => window.still(t, caps), [t, caps]);
    fs.writeFileSync(path.join(out, `f_${t.toFixed(2)}${caps ? 'c' : ''}.png`), Buffer.from(url.split(',')[1], 'base64'));
    console.log(s, Date.now() - t0, 'ms');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
