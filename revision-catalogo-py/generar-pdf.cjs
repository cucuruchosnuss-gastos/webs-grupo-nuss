// Genera el PDF del catálogo de Dolce Pasta Paraguay desde dolce-py/catalogo-py.html.
// Uso (desde la raíz del repo):  node revision-catalogo-py/generar-pdf.cjs [salida.pdf]
// Por defecto escribe dolce-py/catalogo-dolce-pasta.pdf (el que bajan las páginas del sitio).
// Necesita Playwright con Chromium. Si no está en este repo, usa el de seis-destinos
// (o el que diga la variable PLAYWRIGHT_DIR). Necesita internet: las letras vienen de Google Fonts.
const http = require('http'), fs = require('fs'), path = require('path');
function cargarPlaywright() {
  const candidatos = [process.env.PLAYWRIGHT_DIR, 'playwright', path.join(__dirname, '../../seis-destinos/node_modules/playwright')].filter(Boolean);
  for (const c of candidatos) { try { return require(c); } catch {} }
  throw new Error('No encontré Playwright. Instalalo (npm i -D playwright) o poné PLAYWRIGHT_DIR.');
}
const { chromium } = cargarPlaywright();
const raiz = path.join(__dirname, '..', 'dolce-py');
const salida = path.resolve(process.argv[2] || path.join(raiz, 'catalogo-dolce-pasta.pdf'));
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => {
  const f = path.join(raiz, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', tipos[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(r);
}).listen(0, async () => {
  const b = await chromium.launch();
  try {
    const p = await b.newPage();
    await p.goto(`http://localhost:${srv.address().port}/catalogo-py.html`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const faltan = await p.evaluate(() => ['Young Serif', 'Hanken Grotesk', 'JetBrains Mono'].filter(f => !document.fonts.check(`16px "${f}"`)));
    if (faltan.length) throw new Error('No cargaron las letras: ' + faltan.join(', ') + ' (¿hay internet?)');
    const hojas = await p.locator('.pagina').count();
    await p.pdf({ path: salida, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    console.log(`PDF listo: ${salida} (${hojas} hojas)`);
  } finally { await b.close(); srv.close(); }
});
