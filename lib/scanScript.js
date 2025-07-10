const token = process.env.BROWSERLESS_TOKEN;
const endpoint = `https://chrome.browserless.io/function?token=${token}`;

export async function runInstagramCheck(email) {
  const code = `
    const page = await browser.newPage();
    await page.goto("https://www.instagram.com/accounts/password/reset/", { waitUntil: 'networkidle2' });
    await page.type("input[name='cppEmailOrUsername']", "${email}");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    const error = await page.$(".fieldError");
    return { registered: !error };
  `;

  const body = { code, context: {} };

  for (let i = 1; i <= 2; i++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (json.error) throw new Error(json.error.message || "Unknown error");
      return json.data || { registered: false };

    } catch (err) {
      if (i === 2) throw new Error("Scan failed after 2 retries: " + err.message);
    }
  }
}
