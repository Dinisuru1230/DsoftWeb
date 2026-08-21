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
      accountName: 'Malmalee Creations (Pvt) Ltd',
      accountNumber: '8009 123 456',
      branchName: 'Colombo Main Branch',
      swiftCode: 'CCEYLKLX',
      bankNotes: 'Please include your contact number or order ID as the deposit reference.',
    },
  });
}

// GET /api/settings — Public (frontend needs delivery fee defaults & bank details)
async function getSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
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
        accountName: data.accountName ?? 'Malmalee Creations (Pvt) Ltd',
        accountNumber: data.accountNumber ?? '8009 123 456',
        branchName: data.branchName ?? 'Colombo Main Branch',
        swiftCode: data.swiftCode ?? 'CCEYLKLX',
        bankNotes: data.bankNotes ?? 'Please include your contact number or order ID as the deposit reference.',
      },
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getSettings, updateSettings };
