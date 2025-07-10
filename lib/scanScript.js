export default function generateScript(email) {
  return `
    const { chromium } = require('playwright');
    (async () => {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('https://www.instagram.com/accounts/password/reset/');
      await page.waitForSelector('input[name=emailOrUsername]');
      await page.fill('input[name=emailOrUsername]', '${email}');
      await page.click('button[type=submit]');
      await page.waitForTimeout(3500);
      const content = await page.content();
      await browser.close();
      return content;
    })();
  `;
}
