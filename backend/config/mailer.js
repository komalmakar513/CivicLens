const nodemailer = require("nodemailer");

let transporter;

// Create the SMTP transporter once and reuse it.
const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env"
    );
  }

  const port = Number(SMTP_PORT) || 587;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // true for 465, STARTTLS for 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
};

const sendVerificationEmail = async (to, name, code) => {
  const from = process.env.SMTP_FROM || `CivicLens <${process.env.SMTP_USER}>`;

  await getTransporter().sendMail({
    from,
    to,
    subject: "Verify your CivicLens account",
    text:
      `Hi ${name},\n\n` +
      `Your CivicLens verification code is: ${code}\n\n` +
      `This code expires in 10 minutes. If you did not create an account, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#0e7490;margin:0 0 12px">CivicLens</h2>
        <p>Hi ${String(name).replace(/[<>&"]/g, "")},</p>
        <p>Use this code to verify your email address:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:20px 0">${code}</p>
        <p style="color:#64748b;font-size:13px">This code expires in 10 minutes. If you did not create an account, you can ignore this email.</p>
      </div>`,
  });
};

module.exports = { sendVerificationEmail };