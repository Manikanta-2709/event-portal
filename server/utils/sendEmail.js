const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // Skip sending if SMTP is not configured (placeholder values in .env)
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'your_email@gmail.com' ||
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS === 'your_app_password'
  ) {
    console.warn(`[Email skipped] SMTP not configured. Would have sent "${subject}" to ${to}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Event Portal" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
