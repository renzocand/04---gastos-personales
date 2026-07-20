// Genera las "fotos" (PNG) de los reportes de RNF para el informe:
//  - rendimiento    <- perf/rep-carga  (JMeter, prueba de carga)
//  - disponibilidad <- perf/rep-soak   (JMeter, prueba de resistencia/soak)
//  - usabilidad     <- frontend/playwright-report (Playwright, 3 navegadores)
//
// Levanta un servidor estático mínimo sobre la raíz del repo y usa el Chromium
// de Playwright para capturar cada reporte a página completa.
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { chromium } = require(path.join(ROOT, 'frontend', 'node_modules', '@playwright', 'test'));

const OUT = path.join(ROOT, 'docs', 'evidencia-rnf');
const PORT = 8799;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.map': 'application/json', '.zip': 'application/zip',
};

function serve() {
  return http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    let fp = path.join(ROOT, rel);
    try {
      if (fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    } catch { res.writeHead(404); return res.end('not found'); }
    fs.readFile(fp, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = serve();
  await new Promise((r) => server.listen(PORT, r));
  const base = `http://localhost:${PORT}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });

  const shots = [
    { name: 'rendimiento-jmeter.png',        url: `${base}/perf/rep-carga/index.html`,   wait: 2500 },
    { name: 'disponibilidad-jmeter.png',     url: `${base}/perf/rep-soak/index.html`,    wait: 2500 },
    { name: 'disponibilidad-overtime.png',   url: `${base}/perf/rep-soak/content/pages/OverTime.html`, wait: 3500 },
    { name: 'usabilidad-playwright.png',     url: `${base}/frontend/playwright-report/index.html`, wait: 3000 },
  ];

  for (const s of shots) {
    await page.goto(s.url, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(s.wait);
    const file = path.join(OUT, s.name);
    await page.screenshot({ path: file, fullPage: true });
    console.log('OK ->', path.relative(ROOT, file));
  }

  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
