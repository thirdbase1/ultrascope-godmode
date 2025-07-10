export async function runInstagramCheck(email) {
  const token = process.env.BROWSERLESS_TOKEN;

  const code = `
    const puppeteer = require("puppeteer-core");

    module.exports = async ({ email }) => {
      const browser = await puppeteer.connect({
        browserWSEndpoint: "wss://chrome.browserless.io?token=${token}"
      });

      const page = await browser.newPage();

      try {
        await page.goto("https://www.instagram.com/accounts/password/reset/", { waitUntil: "networkidle2" });
        await page.waitForSelector('input[name="cppEmailOrUsername"]', { timeout: 5000 });
        await page.type('input[name="cppEmailOrUsername"]', email);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        const errorExists = await page.$(".fieldError") !== null;
        await browser.close();
        return { registered: !errorExists };
      } catch (err) {
        await browser.close();
        return { registered: false, error: err.message };
      }
    };
  `;

  const response = await fetch(`https://chrome.browserless.io/function?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      context: { email }
    })
  });

  const result = await response.json();

  if (result && result.registered !== undefined) {
    return { registered: result.registered };
  } else {
    throw new Error(result?.error || 'Unknown error during scan');
  }
}
