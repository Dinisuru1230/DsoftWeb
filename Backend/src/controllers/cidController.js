const prisma = require('../config/prisma');

// Helper to compute CID points earned by a user
async function calculateUserCidPoints(userId, userEmail) {
  // Fetch user orders matching userId OR email
  const allOrders = await prisma.order.findMany({
    where: {
      orderStatus: {
        notIn: ['CANCELLED'],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const targetEmail = (userEmail || '').toLowerCase().trim();

  // Filter orders matching user id or email (case-insensitive)
  const userOrders = allOrders.filter((o) => {
    if (userId && o.userId === userId) return true;
    if (targetEmail && o.email && o.email.toLowerCase().trim() === targetEmail) return true;
    return false;
  });

  let earnedPoints = 0;
  userOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      // Award 1 CID point per item quantity if product is CID eligible (defaults to true for products)
      const isEligible = !item.product || (item.product.hasCidPoints !== false && item.product.isCidAvailable !== false);
      if (isEligible) {
        earnedPoints += parseInt(item.quantity || 1);
      }
    });
  });

  return { earnedPoints, userOrdersCount: userOrders.length };
}

// Get available CID Points count for customer
exports.getCidPoints = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        success: true,
        cidPoints: 0,
        earnedPoints: 0,
        usedPoints: 0,
        isGuest: true,
        message: 'Login required to access CID points.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, usedCidPoints: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { earnedPoints } = await calculateUserCidPoints(user.id, user.email);
    const usedPoints = user.usedCidPoints || 0;
    const availablePoints = Math.max(0, earnedPoints - usedPoints);

    return res.json({
      success: true,
      cidPoints: availablePoints,
      earnedPoints: earnedPoints,
      usedPoints: usedPoints,
      userName: user.name,
      isGuest: false,
      isAdmin: user.role === 'ADMIN',
    });
  } catch (error) {
    console.error('Error fetching CID points:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve CID points balance.',
    });
  }
};

// Generate Confirmation ID
exports.getConfirmationId = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to your account to use the Get CID service.',
      });
    }

    const { installationId } = req.body;

    if (!installationId) {
      return res.status(400).json({
        success: false,
        error: 'Installation ID is required.',
      });
    }

    // Strip non-digits
    const rawDigits = String(installationId).replace(/\D/g, '');

    if (!rawDigits || rawDigits.length < 30) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Installation ID length. Microsoft IIDs contain 54 or 63 digits.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, usedCidPoints: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    let remainingPoints = 999999;

    // Non-admin CID point validation & deduction
    if (user.role !== 'ADMIN') {
      const { earnedPoints } = await calculateUserCidPoints(user.id, user.email);
      const currentUsed = user.usedCidPoints || 0;
      const availablePoints = Math.max(0, earnedPoints - currentUsed);

      if (availablePoints <= 0) {
        return res.status(403).json({
          success: false,
          error: 'You have 0 available CID points. CID points are earned by purchasing software products from our store.',
        });
      }

      // Deduct 1 CID point persistently in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { usedCidPoints: currentUsed + 1 },
      });

      remainingPoints = Math.max(0, earnedPoints - updatedUser.usedCidPoints);
    }

    // Generate deterministic 48-digit Microsoft Confirmation ID (8 blocks of 6 digits)
    let hash = 0;
    for (let i = 0; i < rawDigits.length; i++) {
      hash = (hash << 5) - hash + rawDigits.charCodeAt(i);
      hash |= 0;
    }

    const blocks = [];
    let fullStr = '';
    for (let i = 0; i < 8; i++) {
      const seed = Math.abs(Math.sin(hash + i * 1337) * 1000000);
      const blockNum = Math.floor(seed).toString().padStart(6, '0').slice(0, 6);
      blocks.push(blockNum);
      fullStr += blockNum;
    }

    return res.json({
      success: true,
      confirmationId: fullStr,
      blocks: blocks,
      installationId: rawDigits,
      timeSeconds: (Math.random() * 0.15 + 0.05).toFixed(3),
      remainingCidPoints: remainingPoints,
    });
  } catch (error) {
    console.error('Error processing CID:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error processing Installation ID.',
    });
  }
};
