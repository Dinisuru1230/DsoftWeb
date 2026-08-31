const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

// Helper to create dynamic SMTP transporter using DB setting or fallback to process.env
async function createTransporter() {
  let smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  let smtpPort = parseInt(process.env.EMAIL_PORT || '587', 10);
  let smtpUser = process.env.EMAIL_USER || '';
  let smtpPass = process.env.EMAIL_PASS || '';
  let smtpFromEmail = process.env.EMAIL_FROM_EMAIL || smtpUser;
  let smtpFromName = process.env.EMAIL_FROM_NAME || 'DSoft Pack';
  let enabled = true;

  try {
    const setting = await prisma.setting.findUnique({ where: { id: 'global' } });
    if (setting) {
      if (setting.smtpHost) smtpHost = setting.smtpHost;
      if (setting.smtpPort) smtpPort = setting.smtpPort;
      if (setting.smtpUser) smtpUser = setting.smtpUser;
      if (setting.smtpPass) smtpPass = setting.smtpPass;
      if (setting.smtpFromEmail) smtpFromEmail = setting.smtpFromEmail;
      if (setting.smtpFromName) smtpFromName = setting.smtpFromName;
      if (typeof setting.emailNotificationsEnabled === 'boolean') {
        enabled = setting.emailNotificationsEnabled;
      }
    }
  } catch (err) {
    console.error('Error loading SMTP settings from database:', err.message);
  }

  if (!enabled) {
    console.log('Email notifications are currently disabled in Admin settings.');
    return { transporter: null, fromString: null, enabled: false };
  }

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP user or password not configured in database or .env. Email dispatch skipped.');
    return { transporter: null, fromString: null, enabled: false };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert blocking
    },
  });

  const fromString = `"${smtpFromName}" <${smtpFromEmail || smtpUser}>`;
  return { transporter, fromString, enabled: true };
}

/**
 * Send License Key Delivery Email
 */
async function sendLicenseDeliveryEmail(order) {
  try {
    const { transporter, fromString, enabled } = await createTransporter();
    if (!enabled || !transporter) return false;

    const customerEmail = order.email;
    if (!customerEmail) return false;

    const itemsHtml = (order.items || []).map((item) => {
      const pName = item.product ? item.product.name : 'Software License';
      const licenseKey = item.licenseKey || 'Access via My Account > Order History';
      const downloadUrl = item.product && item.product.downloadUrl ? item.product.downloadUrl : null;

      return `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px; font-weight: 700;">${pName}</h3>
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">Quantity: <strong>${item.quantity || 1}</strong></p>

          <div style="background-color: #0f172a; color: #38bdf8; font-family: monospace; font-size: 15px; font-weight: 700; padding: 12px; border-radius: 8px; text-align: center; letter-spacing: 1px; word-break: break-all;">
            🔑 ${licenseKey}
          </div>

          ${downloadUrl ? `
            <div style="margin-top: 12px; text-align: right;">
              <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #852e69; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700;">Download Software &rarr;</a>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #4a1942 0%, #852e69 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
          .content { padding: 32px 24px; color: #334155; line-height: 1.6; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          .button { display: inline-block; background-color: #852e69; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">DSoft Pack</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Official License Delivery</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge">● Order Completed</span>
            </div>
            <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Hello ${order.customerName || 'Customer'},</h2>
            <p style="font-size: 14px; color: #475569;">
              Thank you for choosing <strong>DSoft Pack</strong>! Your purchase (Order <strong>#${order.orderNumber}</strong>) has been processed and completed successfully. Below are your software license key(s) and instructions.
            </p>

            <div style="margin: 24px 0;">
              ${itemsHtml}
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
              <h4 style="margin: 0 0 6px 0; color: #1e40af; font-size: 14px;">Need Help Activating?</h4>
              <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
                You can view all your keys anytime by logging into your account under <strong>My Account &gt; Order History</strong>. If you need assistance, contact our 24/7 support team.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://dsoftpack.com/account" class="button" target="_blank">View Order History</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DSoft Pack. All rights reserved.</p>
            <p>Colombo, Sri Lanka | Support: dsoftpack@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromString,
      to: customerEmail,
      subject: `🎉 Your License Key(s) for Order #${order.orderNumber} - DSoft Pack`,
      html: htmlContent,
    });

    console.log(`✅ License email sent to ${customerEmail} (Message ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send license email:', err);
    return false;
  }
}

/**
 * Send Test Email from Admin Panel Settings
 */
async function sendTestEmail(targetEmail) {
  try {
    const { transporter, fromString, enabled } = await createTransporter();
    if (!enabled || !transporter) {
      throw new Error('SMTP connection is not configured or disabled.');
    }

    const info = await transporter.sendMail({
      from: fromString,
      to: targetEmail,
      subject: '✅ DSoft Pack Email Test Successful',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #852e69;">DSoft Pack SMTP Test</h2>
          <p>Congratulations! Your DSoft Pack automated email settings are working correctly.</p>
          <p>Time Sent: <strong>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}</strong></p>
        </div>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Test email error:', err);
    throw err;
  }
}

module.exports = {
  sendLicenseDeliveryEmail,
  sendTestEmail,
};
