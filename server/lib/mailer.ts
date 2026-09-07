import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASS in .env.');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  await getTransporter().sendMail({
    from,
    to,
    subject: 'Verify your Open CAF account',
    text: `Confirm your email to activate your Open CAF account:\n\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't request this, ignore this email.`,
    html: `<p>Confirm your email to activate your Open CAF account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours. If you didn't request this, ignore this email.</p>`,
  });
}
