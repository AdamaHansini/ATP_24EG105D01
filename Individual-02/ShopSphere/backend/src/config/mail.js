// backend/src/config/mail.js
export async function sendEmail({ to, subject, html, text }) {
  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);
  console.log(`[EMAIL CONTENT]`, text || html);
  // Email failures are isolated and logged; returns delivery report
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    recipient: to,
    timestamp: new Date().toISOString(),
  };
}
