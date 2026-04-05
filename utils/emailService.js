const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Vikas Silks <noreply@vikastrendz.com>';

const sendConfirmationEmail = async (email) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [email],
    subject: 'Welcome to Vikas Silks Newsletter! 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h1 style="color:#2B4F9E;text-align:center;">Vikas Silks</h1>
        <h2 style="color:#333;">You're subscribed! 🎊</h2>
        <p style="color:#555;line-height:1.7;">Thank you for subscribing. You'll now be the first to know about:</p>
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

  if (error) {
    console.error('Resend error:', JSON.stringify(error))
    throw new Error(error.message)
  }
  console.log('Resend email ID:', data?.id)
};

const sendBulkEmail = async (subscribers, subject, html) => {
  const emails = subscribers.map((s) => s.email);
  const BATCH_SIZE = 50;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    await resend.emails.send({
      from: FROM,
      to: batch,
      subject,
      html,
    });
  }
};

const sendProductUpdateEmail = async (subscribers, productName, productPrice) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h1 style="color:#2B4F9E;text-align:center;">Vikas Silks</h1>
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
