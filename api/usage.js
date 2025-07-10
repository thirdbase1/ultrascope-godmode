export default async function handler(req, res) {
  const token = process.env.BROWSERLESS_TOKEN;

  const response = await fetch(`https://chrome.browserless.io/metrics?token=${token}`);
  const data = await response.json();

  if (!data.success) {
    return res.status(500).json({ error: 'Unable to fetch usage data' });
  }

  res.status(200).json({
    used: data.metrics?.usage?.used,
    limit: data.metrics?.usage?.limit,
    percent: ((data.metrics?.usage?.used / data.metrics?.usage?.limit) * 100).toFixed(2) + '%'
  });
}
