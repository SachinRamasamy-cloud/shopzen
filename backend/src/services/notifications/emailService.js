import nodemailer from 'nodemailer';

const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: -apple-system, sans-serif; color: #1a1917; background: #f5f4f0; margin:0; padding:0; }
    .wrap { max-width: 520px; margin: 40px auto; background: #fff; border: 1px solid #d9d6cf; border-radius: 4px; overflow: hidden; }
    .header { padding: 24px 32px; border-bottom: 1px solid #ece9e3; }
    .header h1 { margin:0; font-size:14px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:#1a1917; }
    .body { padding: 32px; font-size: 14px; line-height: 1.6; color: #44423f; }
    .otp { font-size: 32px; font-weight: 700; letter-spacing: 0.12em; font-family: monospace; color: #1a1917; margin: 24px 0; }
    .btn { display:inline-block; padding:10px 20px; background:#1a1917; color:#fff; text-decoration:none; border-radius:3px; font-size:13px; font-weight:500; }
    .footer { padding: 20px 32px; border-top: 1px solid #ece9e3; font-size: 12px; color: #a09c96; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>E-Commerce Platform</h1></div>
    <div class="body">${content}</div>
    <div class="footer">You received this email because an action was performed on your account.</div>
  </div>
</body>
</html>`;

export const sendOTPEmail = async (to, otp) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"E-Commerce" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your verification code',
    html: baseTemplate(`
      <p>Your one-time verification code is:</p>
      <div class="otp">${otp}</div>
      <p>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    `),
  });
};

export const sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"E-Commerce" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: baseTemplate(`
      <p>We received a request to reset your password. Click the button below to proceed.</p>
      <p style="margin:24px 0"><a class="btn" href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in <strong>15 minutes</strong>. If you didn't request this, please ignore this email.</p>
    `),
  });
};

export const sendOrderConfirmationEmail = async (to, order) => {
  const transporter = createTransport();
  const itemsHtml = order.items
    .map(i => `<tr><td style="padding:8px 0">${i.title}</td><td style="padding:8px 0;text-align:right">×${i.quantity}</td><td style="padding:8px 0;text-align:right">₹${i.price * i.quantity}</td></tr>`)
    .join('');
  await transporter.sendMail({
    from: `"E-Commerce" <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmed — #${order._id.toString().slice(-6).toUpperCase()}`,
    html: baseTemplate(`
      <p>Thank you for your order! Here's your summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead><tr style="border-bottom:1px solid #ece9e3"><th style="padding:8px 0;text-align:left">Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr style="border-top:1px solid #ece9e3;font-weight:600"><td colspan="2" style="padding:8px 0">Total</td><td style="padding:8px 0;text-align:right">₹${order.total}</td></tr></tfoot>
      </table>
      <p>We'll notify you when your order is picked up for delivery.</p>
    `),
  });
};
