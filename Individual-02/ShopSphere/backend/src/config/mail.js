// backend/src/config/mail.js
export async function sendEmail({ to, subject, html, text }) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const username = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  if (!host || !username || !password) {
    return { success: false, configured: false, message: 'Email provider credentials are not configured.' };
  }
  const payload = {
    from: process.env.EMAIL_FROM || username,
    to,
    subject,
    text,
    html,
  };
  const response = await fetch(`https://${host}:${port}/send`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Email provider rejected the message.');
  return { success: true, configured: true };
}
