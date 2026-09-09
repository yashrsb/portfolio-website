/**
 * Browser reproduction script for the blog tags refresh bug.
 *
 * 1. Opens the admin dashboard
 * 2. Logs in
 * 3. Navigates to /blog/tags
 * 4. Captures the API response and the rendered DOM
 * 5. Refreshes the page
 * 6. Captures again
 */
import puppeteer from 'puppeteer-core';

const ADMIN_URL = 'http://localhost:5174';
const ADMIN_EMAIL = 'admin@portfolio.com';
const ADMIN_PASSWORD = 'BFg2nK3JG';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Collect all console messages and network responses.
  const consoleMessages = [];
  const networkResponses = [];

  page.on('console', async (msg) => {
    const args = await Promise.all(
      msg.args().map((arg) => arg.jsonValue().catch(() => '<unserializable>'))
    );
    consoleMessages.push(`[${msg.type()}] ${args.map((a) => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/v1/admin/blog/tags')) {
      try {
        const body = await response.text();
        networkResponses.push({
          url,
          status: response.status(),
          body: body.slice(0, 500),
        });
      } catch (e) {
        networkResponses.push({ url, status: response.status(), error: e.message });
      }
    }
  });

  try {
    // Step 1: Open login page.
    console.log('=== Step 1: Open login page ===');
    await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Step 2: Login.
    console.log('=== Step 2: Login ===');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.click('input[name="email"]', { clickCount: 3 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.click('input[name="password"]', { clickCount: 3 });
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) await loginButton.click();

    // Wait for navigation away from /login.
    try {
      await page.waitForFunction(() => !window.location.pathname.startsWith('/login'), { timeout: 10000 });
    } catch (e) {
      console.log('Did not navigate away from /login. Current URL:', page.url());
    }
    await sleep(2000);

    // Step 3: Navigate to /blog/tags.
    console.log('=== Step 3: Navigate to /blog/tags ===');
    consoleMessages.length = 0;
    networkResponses.length = 0;
    await page.goto(`${ADMIN_URL}/blog/tags`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    const initialDom = await page.evaluate(() => {
      const empty = document.querySelector('[class*="empty"]');
      const table = document.querySelector('table');
      const rows = document.querySelectorAll('table tbody tr');
      return {
        hasEmptyState: !!empty,
        emptyText: empty?.textContent?.slice(0, 100),
        hasTable: !!table,
        rowCount: rows.length,
        firstRowText: rows[0]?.textContent?.slice(0, 100),
      };
    });

    console.log('Initial load DOM:', JSON.stringify(initialDom, null, 2));
    console.log('Initial network responses:');
    networkResponses.forEach((r) => {
      console.log(`  ${r.status} ${r.url}`);
      console.log(`  body: ${r.body}`);
    });
    console.log('Console messages:');
    consoleMessages.forEach((m) => console.log(`  ${m}`));

    // Step 4: Refresh the page.
    console.log('\n=== Step 4: Refresh page ===');
    consoleMessages.length = 0;
    networkResponses.length = 0;
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(2000);

    const refreshDom = await page.evaluate(() => {
      const empty = document.querySelector('[class*="empty"]');
      const table = document.querySelector('table');
      const rows = document.querySelectorAll('table tbody tr');
      return {
        hasEmptyState: !!empty,
        emptyText: empty?.textContent?.slice(0, 100),
        hasTable: !!table,
        rowCount: rows.length,
        firstRowText: rows[0]?.textContent?.slice(0, 100),
      };
    });

    console.log('After refresh DOM:', JSON.stringify(refreshDom, null, 2));
    console.log('Refresh network responses:');
    networkResponses.forEach((r) => {
      console.log(`  ${r.status} ${r.url}`);
      console.log(`  body: ${r.body}`);
    });
    console.log('Console messages:');
    consoleMessages.forEach((m) => console.log(`  ${m}`));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
}

main();
