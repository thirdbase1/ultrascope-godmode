import { isValidEmail } from '../utils/validator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    console.log('Checking:', email);

    // Dummy simulation of Instagram check
    // Replace this with your actual scanner logic
    const registered = email.includes('gmail');

    res.status(200).json({
      email,
      registered,
      message: registered
        ? '✅ Email is linked to an Instagram account.'
        : '❌ Email is not linked to any Instagram account.',
    });
  } catch (err) {
    console.error('🔥 Server Error:', err.message);
    res.status(500).json({ message: 'A server error has occurred', error: err.message });
  }
}
