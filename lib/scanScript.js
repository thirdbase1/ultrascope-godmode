export async function runInstagramCheck(email) {
  const token = process.env.BROWSERLESS_TOKEN;

  const body = {
    query: `
      mutation Run($email: String!) {
        newPage {
          goto(url: "https://www.instagram.com/accounts/password/reset/", waitUntil: load) {
            status
          }
          type(selector: "input[name='cppEmailOrUsername']", text: $email)
          click(selector: "button[type='submit']")
          waitFor(duration: 3000)
          exists(selector: ".fieldError") {
            result
          }
        }
      }
    `,
    variables: { email }
  };

  const tryScan = async () => {
    const res = await fetch(`https://production-sfo.browserless.io/chromium/bql?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return !result.data?.newPage?.exists?.result;
  };

  for (let i = 1; i <= 2; i++) {
    try {
      const registered = await tryScan();
      return { registered };
    } catch (err) {
      if (i === 2) throw new Error("Scan failed after 2 retries: " + err.message);
    }
  }
}
