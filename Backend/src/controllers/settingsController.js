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
    },
  });
}

// GET /api/settings — Public (frontend needs delivery fee defaults)
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
    const { standardShipping, expressShipping, freeShippingOver } = req.body;

    const data = {};
    if (standardShipping !== undefined) data.standardShipping = parseFloat(standardShipping);
    if (expressShipping !== undefined) data.expressShipping = parseFloat(expressShipping);
    if (freeShippingOver !== undefined) data.freeShippingOver = parseFloat(freeShippingOver);

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
      },
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getSettings, updateSettings };
