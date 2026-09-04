const { chromium } = require('playwright');

const BASE = 'http://localhost:5173';
const OUT = process.env.OUT_DIR || '/tmp/audit';

const sizes = (process.env.SIZES || '1920x1080,1280x800,1024x600,1024x1300,820x1180,768x1024,430x932,390x844,375x667')
  .split(',')
  .map((s) => {
    const [width, height] = s.split('x').map(Number);
    return { width, height, label: s };
  });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
}

async function hasHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const report = [];

  for (const size of sizes) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
    const page = await context.newPage();

    // LOGIN (unauthenticated)
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    await shot(page, `login_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`login @ ${size.label}: HORIZONTAL SCROLL`);

    // CADASTRO
    await page.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    await shot(page, `cadastro_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`cadastro @ ${size.label}: HORIZONTAL SCROLL`);

    // REDEFINIR
    await page.goto(`${BASE}/redefinir`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    await shot(page, `redefinir_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`redefinir @ ${size.label}: HORIZONTAL SCROLL`);

    // LOGIN AUTH
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('#email', 'testuser@gmail.com');
    await page.fill('#senha', '77551');
    await page.click('text=Entrar');
    await page.waitForURL('**/principal', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);

    // PRINCIPAL
    await shot(page, `principal_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`principal @ ${size.label}: HORIZONTAL SCROLL`);

    // Transaction modal open
    await page.click('#abrirTransacao').catch(() => {});
    await page.waitForTimeout(250);
    await shot(page, `principal_modal_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`principal_modal @ ${size.label}: HORIZONTAL SCROLL`);

    // Custom category
    await page.selectOption('#categoriaSaida', 'Personalizada').catch(() => {});
    await page.waitForTimeout(200);
    await shot(page, `principal_customcat_${size.label}`);

    // close modal (click elsewhere) - navigate instead
    // HISTORICO
    await page.goto(`${BASE}/historico`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(page, `historico_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`historico @ ${size.label}: HORIZONTAL SCROLL`);

    // PERFIL
    await page.goto(`${BASE}/perfil`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, `perfil_${size.label}`);
    if (await hasHorizontalScroll(page)) report.push(`perfil @ ${size.label}: HORIZONTAL SCROLL`);

    await context.close();
    console.log(`done: ${size.label}`);
  }

  await browser.close();
  console.log('\n=== REPORT ===');
  report.forEach((r) => console.log(r));
  if (report.length === 0) console.log('No horizontal scroll issues detected.');
})();
