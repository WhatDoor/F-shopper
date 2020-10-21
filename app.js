const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, executablePath:'node_modules/puppeteer/.local-chromium/linux-800071/chrome-linux/chrome'});
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();