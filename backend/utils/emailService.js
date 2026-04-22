const nodemailer = require("nodemailer");

/**
 * Configure transporter.
 * In a real app, use environment variables for these.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: process.env.EMAIL_PORT || 587,
  pool: true, // Use a pool of connections for faster sending
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email with a premium look.
 */
exports.sendEmail = async ({ to, subject, title, body, ctaText, ctaLink }) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 30px; text-align: center; }
          .content { padding: 40px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          h1 { margin: 0; font-size: 24px; }
          p { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>${body}</p>
            ${ctaText && ctaLink ? `<a href="${ctaLink}" class="button">${ctaText}</a>` : ""}
          </div>
          <div class="footer">
            <p>&copy; 2026 Yojanta - Your Government Scheme Advisor</p>
            <p>Empowering citizens through information.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: '"Yojanta Advisor" <no-reply@yojanta.gov.in>',
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
