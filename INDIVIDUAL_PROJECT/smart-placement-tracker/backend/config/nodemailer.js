import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification (non-blocking).
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
  // If email credentials not configured, skip email sending
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`⏭️  Email skipped (credentials not configured): ${to}`);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Smart Placement Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    // Log error but don't throw - email is non-critical
    console.error(`❌ Email Error (non-blocking): ${error.message}`);
    return null;
  }
};

export { transporter, sendEmail };
