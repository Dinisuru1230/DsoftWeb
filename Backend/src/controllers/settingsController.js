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
      companyWebsite,
      invoiceFooterNote,
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
    if (companyWebsite !== undefined) data.companyWebsite = String(companyWebsite).trim();
    if (invoiceFooterNote !== undefined) data.invoiceFooterNote = String(invoiceFooterNote).trim();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid setting field to update.' });
    }

    const settings = await prisma.setting.upsert({
      where: { id: 'global' },
      update: data,
      create: {
        id: 'global',
        standardShipping: data.standardShipping ?? 450,
        expressShipping: data.expressShipping ?? 1200,
        freeShippingOver: data.freeShippingOver ?? 15000,
        bankName: data.bankName ?? 'Commercial Bank of Ceylon',
        accountName: data.accountName ?? 'DSoft Pack (Pvt) Ltd',
        accountNumber: data.accountNumber ?? '8009 123 456',
        branchName: data.branchName ?? 'Colombo Main Branch',
        swiftCode: data.swiftCode ?? 'CCEYLKLX',
        bankNotes: data.bankNotes ?? 'Please include your contact number or order ID as the deposit reference.',
        companyName: data.companyName ?? 'DSoft Pack',
        companyLegalName: data.companyLegalName ?? 'DSoft Technologies LLC',
        companyAddressLine1: data.companyAddressLine1 ?? '5931 Greenville Ave #1169',
        companyAddressLine2: data.companyAddressLine2 ?? 'Dallas, TX 75206 US',
        companyTaxId: data.companyTaxId ?? 'EIN: 98-1860068',
        companyEmail: data.companyEmail ?? 'contact@dsoftpack.com',
        companyWebsite: data.companyWebsite ?? 'https://dsoftpack.com',
        invoiceFooterNote: data.invoiceFooterNote ?? 'Thank you for choosing DSoft Pack. For support queries, email us at contact@dsoftpack.com',
      },
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ error: 'Failed to update store settings. Please try again.' });
  }
}

module.exports = { getSettings, updateSettings };
