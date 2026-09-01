const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

// Helper to format currency
function formatCurrency(amount) {
  return 'LKR ' + (parseFloat(amount) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const fromString = `"${smtpFromName}" <${smtpFromEmail || smtpUser}>`;
  return { transporter, fromString, enabled: true };
}

/**
 * Send License Key Delivery & Official Order Invoice Email
 */
async function sendLicenseDeliveryEmail(orderInput) {
  try {
    const { transporter, fromString, enabled } = await createTransporter();
    if (!enabled || !transporter) return false;

    const orderId = typeof orderInput === 'string' ? orderInput : (orderInput && orderInput.id ? orderInput.id : null);
    if (!orderId) {
      console.warn('⚠️ sendLicenseDeliveryEmail: Invalid order input or missing ID');
      return false;
    }

    // Fetch full order data with products and settings
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    if (!order || !order.email) return false;

    const setting = (await prisma.setting.findUnique({ where: { id: 'global' } })) || {};

    const companyName = setting.companyName || 'DSoft Pack';
    const companyLegalName = setting.companyLegalName || 'DSoft Technologies LLC';
    const companyAddress1 = setting.companyAddressLine1 || 'Colombo, Sri Lanka';
    const companyAddress2 = setting.companyAddressLine2 || '';
    const companyTaxId = setting.companyTaxId || '';
    const companyEmail = setting.companyEmail || 'support@dsoftpack.com';
    const invoiceFooterNote = setting.invoiceFooterNote || 'Thank you for choosing DSoft Pack. For support queries, email us at support@dsoftpack.com';

    // Resolve License Keys for each item from multiple sources
    const resolvedItems = await Promise.all(
      (order.items || []).map(async (item) => {
        let key = item.licenseKey;

        // Check if assigned in ProductKey table
        if ((!key || !key.trim()) && item.productId) {
          const assignedKeys = await prisma.productKey.findMany({
            where: { orderId: order.id, productId: item.productId },
          });
          if (assignedKeys.length > 0) {
            key = assignedKeys.map((k) => k.key).join(', ');
          }
        }

        // Check static licenseKey on Product
        if ((!key || !key.trim()) && item.product && item.product.licenseKey) {
          key = item.product.licenseKey;
        }

        // Try claiming unused key from pool if still unassigned
        if ((!key || !key.trim()) && item.productId) {
          const unusedKeys = await prisma.productKey.findMany({
            where: { productId: item.productId, isUsed: false },
            take: item.quantity || 1,
          });
          if (unusedKeys.length > 0) {
            key = unusedKeys.map((k) => k.key).join(', ');
            await prisma.productKey.updateMany({
              where: { id: { in: unusedKeys.map((k) => k.id) } },
              data: { isUsed: true, usedAt: new Date(), orderId: order.id },
            });
            await prisma.orderItem.update({
              where: { id: item.id },
              data: { licenseKey: key },
            });
          }
        }

        return {
          ...item,
          resolvedKey: key && key.trim() ? key.trim() : null,
        };
      })
    );

    // Strict Guard: DO NOT send email if ANY item lacks a license key or if order is not COMPLETED/DELIVERED
    const hasUnassignedKeys = resolvedItems.some(
      (item) => !item.resolvedKey || !item.resolvedKey.trim()
    );

    if (hasUnassignedKeys || (order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CONFIRMED')) {
      console.log(`ℹ️ License email skipped for Order #${order.orderNumber}: Keys pending or order not completed.`);
      return false;
    }

    // Build License Key Delivery Blocks
    const keysHtml = resolvedItems.map((item) => {
      const pName = item.product ? item.product.name : 'Software Product';
      const colorStr = item.colorName ? ` (${item.colorName})` : '';
      const downloadUrl = item.product && item.product.downloadUrl ? item.product.downloadUrl : null;
      const keyDisplay = item.resolvedKey;
      const installGuide = item.product && item.product.installationGuide ? item.product.installationGuide.trim() : null;

      return `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">${pName}${colorStr}</h3>
            <span style="background-color: #f1f5f9; color: #475569; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px;">Qty: ${item.quantity || 1}</span>
          </div>

          ${
            keyDisplay
              ? `
            <div style="margin-top: 12px;">
              <div style="font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Your License Key / Digital Code:</div>
              <div style="background-color: #eff6ff; color: #1e3a8a; font-family: 'Courier New', Consolas, monospace; font-size: 18px; font-weight: 800; padding: 14px 18px; border-radius: 10px; text-align: center; letter-spacing: 1.5px; word-break: break-all; border: 2px dashed #2563eb;">
                <span style="color: #1d4ed8;">${keyDisplay}</span>
              </div>
            </div>
          `
              : `
            <div style="margin-top: 12px; background-color: #fffbeb; border: 1px solid #fef3c7; color: #b45309; font-size: 13px; padding: 12px; border-radius: 8px; text-align: center;">
              <strong>License Key Pending:</strong> Your key will be sent shortly or can be accessed under <strong>My Account &gt; Order History</strong>.
            </div>
          `
          }

          ${
            installGuide
              ? `
            <div style="margin-top: 14px; background-color: #f0f9ff; border: 1px dashed #7dd3fc; border-radius: 10px; padding: 14px 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                Product Installation &amp; Setup Guide:
              </div>
              <div style="font-size: 13px; color: #0f172a; line-height: 1.6; white-space: pre-line;">
                ${installGuide}
              </div>
            </div>
          `
              : `
            <div style="margin-top: 14px; background-color: #f0f9ff; border: 1px dashed #7dd3fc; border-radius: 10px; padding: 14px 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                General Installation Instructions:
              </div>
              <div style="font-size: 13px; color: #0f172a; line-height: 1.6;">
                1. Download or launch the official product setup file.<br>
                2. Enter your product key when prompted during setup or activation.<br>
                3. Follow on-screen instructions to complete activation. If phone activation is required, use the official Microsoft phone activation assistant.
              </div>
            </div>
          `
          }

          ${
            downloadUrl
              ? `
            <div style="margin-top: 14px; text-align: right;">
              <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700;">Download Software File</a>
            </div>
          `
              : ''
          }
        </div>
      `;
    }).join('');

    // Calculate totals for Invoice
    const subtotal = resolvedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
    const shippingFee = parseFloat(order.shippingCost || 0);
    const grandTotal = parseFloat(order.totalAmount || subtotal + shippingFee);

    // Build Invoice Table Rows
    const invoiceRowsHtml = resolvedItems.map((item) => {
      const pName = item.product ? item.product.name : 'Product Item';
      const colorStr = item.colorName ? `<br><small style="color: #64748b;">Color: ${item.colorName}</small>` : '';
      const unitPrice = parseFloat(item.price || 0);
      const totalItemPrice = unitPrice * (item.quantity || 1);

      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 16px; color: #1e293b; font-size: 14px; font-weight: 500;">
            ${pName}${colorStr}
          </td>
          <td style="padding: 12px 16px; color: #475569; font-size: 14px; text-align: center;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 12px 16px; color: #475569; font-size: 14px; text-align: right;">
            ${formatCurrency(unitPrice)}
          </td>
          <td style="padding: 12px 16px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">
            ${formatCurrency(totalItemPrice)}
          </td>
        </tr>
      `;
    }).join('');

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const paymentMethodText =
      order.paymentMethod === 'BANK_TRANSFER'
        ? 'Bank Deposit / Slip Transfer'
        : order.paymentMethod === 'COD'
        ? 'Cash on Delivery'
        : 'Credit / Debit Card';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; }
          .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); color: #ffffff; padding: 36px 30px; }
          .header-title { font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
          .header-subtitle { font-size: 13px; opacity: 0.85; margin: 4px 0 0 0; }
          .content { padding: 32px 30px; color: #334155; }
          .badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; }
          .section-title { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin: 28px 0 16px 0; }
          .invoice-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 16px; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          .invoice-table th { background-color: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 16px; text-align: left; }
          .totals-table { width: 100%; max-width: 280px; margin-left: auto; border-collapse: collapse; margin-top: 16px; }
          .totals-table td { padding: 6px 0; font-size: 14px; }
          .footer { background-color: #f8fafc; padding: 24px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
          .button { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <table style="width: 100%;">
              <tr>
                <td>
                  <h1 class="header-title">${companyName}</h1>
                  <p class="header-subtitle">${companyLegalName}</p>
                </td>
                <td style="text-align: right;">
                  <span class="badge">OFFICIAL INVOICE</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Content -->
          <div class="content">
            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="vertical-align: top;">
                  <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 4px 0;">Order #${order.orderNumber}</h2>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">Date: <strong>${formattedDate}</strong></p>
                  <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Payment Method: <strong>${paymentMethodText}</strong></p>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <p style="margin: 0; font-size: 13px; color: #64748b;">Billed To:</p>
                  <strong style="font-size: 15px; color: #0f172a;">${order.customerName}</strong><br>
                  <span style="font-size: 13px; color: #475569;">${order.email}</span>
                  ${order.phone ? `<br><span style="font-size: 13px; color: #475569;">${order.phone}</span>` : ''}
                </td>
              </tr>
            </table>

            <!-- License Key Section -->
            <div class="section-title">Delivered License Keys & Digital Software</div>
            ${keysHtml}

            <!-- Official Order Invoice Summary -->
            <div class="section-title">Official Tax Invoice</div>
            <div class="invoice-box">
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Item Description</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoiceRowsHtml}
                </tbody>
              </table>

              <table class="totals-table">
                <tr>
                  <td style="color: #64748b;">Subtotal:</td>
                  <td style="text-align: right; color: #1e293b; font-weight: 500;">${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Shipping Fee:</td>
                  <td style="text-align: right; color: #1e293b; font-weight: 500;">
                    ${shippingFee > 0 ? formatCurrency(shippingFee) : '<span style="color: #16a34a; font-weight: 600;">Free</span>'}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #cbd5e1;">
                  <td style="padding-top: 10px; color: #0f172a; font-weight: 800; font-size: 15px;">Grand Total:</td>
                  <td style="padding-top: 10px; text-align: right; color: #2563eb; font-weight: 800; font-size: 18px;">
                    ${formatCurrency(grandTotal)}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Activation Assistance Callout -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin: 28px 0 20px 0;">
              <h4 style="margin: 0 0 6px 0; color: #1e40af; font-size: 14px;">Need Activation Help or Instant Downloads?</h4>
              <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
                You can access all your keys, download software installers, and track your purchase history anytime by signing into <strong>My Account &gt; Order History</strong> on our portal.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="${setting.companyWebsite || 'https://dsoftpack.com'}" class="button" target="_blank">Access Account & Order History</a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">${companyLegalName} ${companyTaxId ? `| ${companyTaxId}` : ''}</p>
            <p style="margin: 0; font-style: italic; color: #94a3b8;">${invoiceFooterNote}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromString,
      to: order.email,
      subject: `Invoice & License Key(s) for Order #${order.orderNumber} - ${companyName}`,
      html: htmlContent,
    });

    console.log(`✅ Invoice & License email successfully sent to ${order.email} (Message ID: ${info.messageId})`);
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

/**
 * Send Contact Message Reply Email to Customer via SMTP
 */
async function sendContactReplyEmail({ toEmail, customerName, originalSubject, replyBody }) {
  try {
    const { transporter, fromString, enabled } = await createTransporter();
    if (!enabled || !transporter) {
      console.log('ℹ️ SMTP is disabled or credentials not configured. Contact reply email was not dispatched.');
      return { success: false, reason: 'SMTP is disabled or not configured in Email Settings.' };
    }

    const setting = (await prisma.setting.findUnique({ where: { id: 'global' } })) || {};
    const companyName = setting.companyName || 'DSoft Pack';

    // Format newlines in reply body to HTML breaks
    const formattedReply = (replyBody || '').replace(/\n/g, '<br>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); color: #ffffff; padding: 28px 24px; }
          .header-title { font-size: 22px; font-weight: 800; margin: 0; }
          .content { padding: 28px 24px; color: #334155; font-size: 14px; line-height: 1.6; }
          .reply-box { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 18px; border-radius: 0 12px 12px 0; margin: 18px 0; font-size: 14px; color: #0f172a; line-height: 1.6; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="header-title">${companyName} Support Response</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${customerName || 'Customer'}</strong>,</p>
            <p>Thank you for getting in touch with us regarding <strong>"${originalSubject || 'your inquiry'}"</strong>. Here is our response from the support team:</p>

            <div class="reply-box">
              ${formattedReply}
            </div>

            <p style="margin-top: 20px;">If you have any follow-up questions, please feel free to reply directly to this email or visit our website.</p>
            <p style="margin-bottom: 0;">Warm regards,<br><strong>${companyName} Support Team</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromString,
      to: toEmail,
      subject: `Re: ${originalSubject || 'Inquiry to ' + companyName}`,
      html: htmlContent,
    });

    console.log(`✅ Contact reply email successfully sent to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send contact reply email:', err);
    return { success: false, reason: err.message };
  }
}

/**
 * Send Password Reset Link Email
 */
async function sendPasswordResetEmail(user, resetUrl) {
  try {
    const { transporter, fromString, enabled } = await createTransporter();
    if (!enabled || !transporter) {
      console.warn('⚠️ SMTP not enabled for password reset email');
      return { success: false, reason: 'SMTP not configured' };
    }

    const setting = (await prisma.setting.findUnique({ where: { id: 'global' } })) || {};
    const companyName = setting.companyName || 'DSoft Pack';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #ffffff; padding: 24px 30px; text-align: center; }
          .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 30px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 30px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37,99,235,0.25); }
          .footer { background: #f8fafc; padding: 16px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .link-box { word-break: break-all; font-size: 12px; color: #2563eb; background: #eff6ff; padding: 10px 14px; border-radius: 6px; border: 1px solid #bfdbfe; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Reset Your Password</h2>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name || 'User'}</strong>,</p>
            <p>We received a request to reset the password for your <strong>${companyName}</strong> account associated with <strong>${user.email}</strong>.</p>
            <p>Click the button below to set up a new password:</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If the button above does not work, copy and paste this link into your browser:</p>
            <div class="link-box">${resetUrl}</div>
            <p style="margin-top: 20px; font-size: 13px; color: #64748b;">This password reset link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
            <p style="margin-bottom: 0;">Best regards,<br><strong>${companyName} Support Team</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: fromString,
      to: user.email,
      subject: `Password Reset Request - ${companyName}`,
      html: htmlContent,
    });

    console.log(`✅ Password reset email sent to ${user.email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Failed to send password reset email:', err);
    return { success: false, reason: err.message };
  }
}

module.exports = {
  sendLicenseDeliveryEmail,
  sendTestEmail,
  sendContactReplyEmail,
  sendPasswordResetEmail,
};

