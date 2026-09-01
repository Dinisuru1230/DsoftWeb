const prisma = require('../config/prisma');

// Upsert helper — ensure singleton "global" row always exists
async function getOrCreateSettings() {
  return prisma.setting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      standardShipping: 450,
      expressShipping: 1200,
      freeShippingOver: 15000,
      bankName: 'Commercial Bank of Ceylon',
      accountName: 'DSoft Pack (Pvt) Ltd',
      accountNumber: '8009 123 456',
      branchName: 'Colombo Main Branch',
      swiftCode: 'CCEYLKLX',
      bankNotes: 'Please include your contact number or order ID as the deposit reference.',
      companyName: 'DSoft Pack',
      companyLegalName: 'DSoft Technologies LLC',
      companyAddressLine1: '5931 Greenville Ave #1169',
      companyAddressLine2: 'Dallas, TX 75206 US',
      companyTaxId: 'EIN: 98-1860068',
      companyEmail: 'contact@dsoftpack.com',
      companyWebsite: 'https://dsoftpack.com',
      invoiceFooterNote: 'Thank you for choosing DSoft Pack. For support queries, email us at contact@dsoftpack.com',
    },
  });
}

// GET /api/settings — Public (frontend needs delivery fee defaults, bank details & invoice details)
async function getSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ error: 'Failed to load store settings.' });
  }
}

// PUT /api/settings — Admin only
async function updateSettings(req, res) {
  try {
    const {
      standardShipping,
      expressShipping,
      freeShippingOver,
      bankName,
      accountName,
      accountNumber,
      branchName,
      swiftCode,
      bankNotes,
      companyName,
      companyLegalName,
      companyAddressLine1,
      companyAddressLine2,
      companyTaxId,
      companyEmail,
      companyPhone,
      whatsappNumber,
      workingHours,
      facebookUrl,
      companyWebsite,
      invoiceFooterNote,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFromEmail,
      smtpFromName,
      emailNotificationsEnabled,
    } = req.body;

    const data = {};
    if (standardShipping !== undefined) data.standardShipping = parseFloat(standardShipping);
    if (expressShipping !== undefined) data.expressShipping = parseFloat(expressShipping);
    if (freeShippingOver !== undefined) data.freeShippingOver = parseFloat(freeShippingOver);
    if (bankName !== undefined) data.bankName = String(bankName).trim();
    if (accountName !== undefined) data.accountName = String(accountName).trim();
    if (accountNumber !== undefined) data.accountNumber = String(accountNumber).trim();
    if (branchName !== undefined) data.branchName = String(branchName).trim();
    if (swiftCode !== undefined) data.swiftCode = String(swiftCode).trim();
    if (bankNotes !== undefined) data.bankNotes = String(bankNotes).trim();

    if (companyName !== undefined) data.companyName = String(companyName).trim();
    if (companyLegalName !== undefined) data.companyLegalName = String(companyLegalName).trim();
    if (companyAddressLine1 !== undefined) data.companyAddressLine1 = String(companyAddressLine1).trim();
    if (companyAddressLine2 !== undefined) data.companyAddressLine2 = String(companyAddressLine2).trim();
    if (companyTaxId !== undefined) data.companyTaxId = String(companyTaxId).trim();
    if (companyEmail !== undefined) data.companyEmail = String(companyEmail).trim();
    if (companyPhone !== undefined) data.companyPhone = String(companyPhone).trim();
    if (whatsappNumber !== undefined) data.whatsappNumber = String(whatsappNumber).trim();
    if (workingHours !== undefined) data.workingHours = String(workingHours).trim();
    if (facebookUrl !== undefined) data.facebookUrl = String(facebookUrl).trim();
    if (companyWebsite !== undefined) data.companyWebsite = String(companyWebsite).trim();
    if (invoiceFooterNote !== undefined) data.invoiceFooterNote = String(invoiceFooterNote).trim();

    if (smtpHost !== undefined) data.smtpHost = String(smtpHost).trim();
    if (smtpPort !== undefined) data.smtpPort = parseInt(smtpPort, 10);
    if (smtpUser !== undefined) data.smtpUser = String(smtpUser).trim();
    if (smtpPass !== undefined) data.smtpPass = String(smtpPass).trim();
    if (smtpFromEmail !== undefined) data.smtpFromEmail = String(smtpFromEmail).trim();
    if (smtpFromName !== undefined) data.smtpFromName = String(smtpFromName).trim();
    if (emailNotificationsEnabled !== undefined) data.emailNotificationsEnabled = Boolean(emailNotificationsEnabled);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid setting field to update.' });
    }

    const settings = await prisma.setting.upsert({
      where: { id: 'global' },
      update: data,
      create: {
        id: 'global',
        ...data,
      },
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ error: 'Failed to update store settings. Please try again.' });
  }
}

// POST /api/settings/test-email (Admin only)
async function testSmtpEmail(req, res) {
  try {
    const { targetEmail } = req.body;
    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid target email address is required' });
    }

    const { sendTestEmail } = require('../services/emailService');
    const result = await sendTestEmail(targetEmail);
    res.json({ message: `Test email successfully sent to ${targetEmail}`, result });
  } catch (error) {
    console.error('testSmtpEmail error:', error);
    res.status(500).json({ error: error.message || 'Failed to send test email. Check your SMTP settings.' });
  }
}

module.exports = { getSettings, updateSettings, testSmtpEmail };
