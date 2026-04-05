const nodemailer = require('nodemailer');

/**
 * Nodemailer + Resend SMTP relay
 *
 * Why this works in production (Render):
 * - Render blocks direct Gmail SMTP (ports 465/587 to smtp.gmail.com)
 * - Resend SMTP relay (smtp.resend.com) is NOT blocked — it routes through
 *   Resend's infrastructure which Render allows outbound connections to
 * - Authentication uses your Resend API key — no OAuth2 setup needed
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',                          // always literally 'resend'
    pass: process.env.RESEND_API_KEY,        // your Resend API key
  },
});

// Verify connection on server startup — only in development
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((err) => {
    if (err) {
      console.error('Email transporter error:', err.message);
    } else {
      console.log('Email transporter ready ✓');
    }
  });
}

const FROM = 'Vikas Silks <noreply@vikastrendz.com>';

// ─── Confirmation Email ───────────────────────────────────────────────────────
const sendConfirmationEmail = async (email) => {
  const info = await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Welcome to Vikas Silks Newsletter! 🎉',
    text: 'Thank you for subscribing to Vikas Silks. You will now receive updates on new arrivals, offers and more.',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#2B4F9E;margin:0;">Vikas Silks</h1>
        </div>
        <h2 style="color:#333;">You're subscribed! 🎊</h2>
        <p style="color:#555;line-height:1.7;">
          Thank you for subscribing. You'll now be the first to know about:
        </p>
        <ul style="color:#555;line-height:2;">
          <li>New saree collection drops</li>
          <li>Exclusive offers and discounts</li>
          <li>Festival special deals</li>
        </ul>
        <div style="text-align:center;margin-top:30px;">
          <a href="https://wa.link/i709qd"
             style="background:#e53e3e;color:#fff;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;">
            Shop Now
          </a>
        </div>
        <p style="color:#aaa;font-size:12px;margin-top:32px;text-align:center;">
          © 2026 Vikas Silks. All rights reserved.
        </p>
      </div>
    `,
  });

  if (info.rejected && info.rejected.length > 0) {
    console.warn('Rejected recipients:', info.rejected);
  }
};

// ─── Bulk Email (batched) ─────────────────────────────────────────────────────
const sendBulkEmail = async (subscribers, subject, html) => {
  const emails = subscribers.map((s) => s.email);
  const BATCH_SIZE = 50;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    await transporter.sendMail({
      from: FROM,
      bcc: batch,
      subject,
      html,
    });
  }
};

// ─── Product Update Email ─────────────────────────────────────────────────────
const sendProductUpdateEmail = async (subscribers, productName, productPrice) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#2B4F9E;margin:0;">Vikas Silks</h1>
      </div>
      <h2 style="color:#333;">New Arrival! 🛍️</h2>
      <p style="color:#555;line-height:1.7;">We just added a stunning new saree to our collection:</p>
      <div style="background:#FFF7F2;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
        <h3 style="color:#2B4F9E;margin:0 0 8px 0;">${productName}</h3>
        <p style="color:#e53e3e;font-size:20px;font-weight:bold;margin:0;">₹${productPrice}</p>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="https://wa.link/i709qd"
           style="background:#e53e3e;color:#fff;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;">
          View Collection
        </a>
      </div>
      <p style="color:#aaa;font-size:12px;margin-top:32px;text-align:center;">
        © 2026 Vikas Silks. You received this because you subscribed to our newsletter.
      </p>
    </div>
  `;

  await sendBulkEmail(subscribers, `New Arrival: ${productName} 🎉`, html);
};

module.exports = { sendConfirmationEmail, sendBulkEmail, sendProductUpdateEmail };
