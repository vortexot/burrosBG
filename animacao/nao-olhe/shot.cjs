// gera quadros estáticos para revisão: node shot.cjs pagina.html saida_%.png 1.5,2.0
const { chromium } = require('playwright');
(async () => {
const [,, page, out, times] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/' + page); await p.waitForFunction('window.done===true||window.ready===true', null, { timeout: 30000 });
if (times) { for (const t of times.split(',')) { await p.evaluate(t => window.renderFrame(+t), t); await p.locator('canvas').screenshot({ path: out.replace('%', t) }); } }
else await p.locator('canvas').screenshot({ path: out });
await b.close();
})();
