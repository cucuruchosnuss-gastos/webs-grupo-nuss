// Saca una captura PNG de cada página de un PDF (para comparar el catálogo viejo con el nuevo).
// Uso (desde la raíz del repo):
//   node revision-catalogo-py/capturas.cjs <archivo.pdf> <carpeta-salida> <prefijo> [escala]
// Necesita Playwright (Chromium) y pdfjs-dist@4. Si no están en este repo, se buscan en
// PLAYWRIGHT_DIR / PDFJS_DIR (por ejemplo: npm i pdfjs-dist@4 en una carpeta aparte).
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_DIR || path.join(__dirname, '../../seis-destinos/node_modules/playwright'));
const [pdf, out, pref, escStr] = process.argv.slice(2);
if (!pdf || !out || !pref) { console.error('Uso: node capturas.cjs <pdf> <carpeta> <prefijo> [escala]'); process.exit(1); }
const esc = Number(escStr || 1.5);
const raizPdfjs = process.env.PDFJS_DIR || path.join(__dirname, 'node_modules/pdfjs-dist');
fs.mkdirSync(out, { recursive: true });
const srv = http.createServer((q, r) => {
  let f;
  if (q.url === '/doc.pdf') f = path.resolve(pdf);
  else if (q.url === '/') { r.setHeader('content-type', 'text/html'); return r.end('<html><body></body></html>'); }
  else f = path.join(raizPdfjs, decodeURIComponent(q.url));
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', f.endsWith('.mjs') ? 'text/javascript' : 'application/pdf');
  fs.createReadStream(f).pipe(r);
}).listen(0, async () => {
  const b = await chromium.launch();
  try {
    const p = await b.newPage();
    await p.goto(`http://localhost:${srv.address().port}/`);
    const pags = await p.evaluate(async (esc) => {
      const pdfjs = await import('/legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/legacy/build/pdf.worker.mjs';
      const doc = await pdfjs.getDocument('/doc.pdf').promise;
      const res = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const pg = await doc.getPage(i);
        const vp = pg.getViewport({ scale: esc });
        const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
        await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        res.push(c.toDataURL('image/png'));
      }
      return res;
    }, esc);
    pags.forEach((u, i) => fs.writeFileSync(path.join(out, `${pref}-pagina-${i + 1}.png`), Buffer.from(u.split(',')[1], 'base64')));
    console.log(`${pags.length} páginas -> ${out}`);
  } finally { await b.close(); srv.close(); }
});
