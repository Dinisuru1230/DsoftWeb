const prisma = require('../config/prisma');

// Helper to compute CID points earned by a user
async function calculateUserCidPoints(userId, userEmail) {
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

  const userOrders = allOrders.filter((o) => {
    if (userId && o.userId === userId) return true;
    if (targetEmail && o.email && o.email.toLowerCase().trim() === targetEmail) return true;
    return false;
  });

  let earnedPoints = 0;
  userOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
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

// Generate Confirmation ID via getcid.us provider (matching E:\dsfot web\cid platform logic)
exports.getConfirmationId = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to your account to use the Get CID service.',
      });
    }

    const { installationId, productKey } = req.body;

    if (!installationId) {
      return res.status(400).json({
        success: false,
        error: 'Installation ID is required.',
      });
    }

    // Strip non-digits from Installation ID
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

    // Validate CID Points for non-admin users
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
    }

    // Send server-side cURL/POST request to https://getcid.us/getdata.php
    const params = new URLSearchParams();
    params.append('key', productKey || '');
    params.append('comment', rawDigits);

    const providerRes = await fetch('https://getcid.us/getdata.php', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://getcid.us/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      },
    });

    if (!providerRes.ok) {
      return res.status(502).json({
        success: false,
        error: 'Failed to reach CID provider (getcid.us). Please try again.',
      });
    }

    const apiResult = await providerRes.json();

    // Check if CID was successfully returned by getcid.us
    if (apiResult && (apiResult.have_cid == 1 || apiResult.have_cid === true) && apiResult.confirmationid) {
      const cleanedCid = String(apiResult.confirmationid).replace(/\D/g, '');
      const blocks = cleanedCid.match(/.{1,6}/g) || [];

      let remainingPoints = 999999;

      // Deduct 1 CID point only when getcid.us successfully generates the CID
      if (user.role !== 'ADMIN') {
        const { earnedPoints } = await calculateUserCidPoints(user.id, user.email);
        const currentUsed = user.usedCidPoints || 0;

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { usedCidPoints: currentUsed + 1 },
        });

        remainingPoints = Math.max(0, earnedPoints - updatedUser.usedCidPoints);
      }

      return res.json({
        success: true,
        confirmationId: cleanedCid,
        blocks: blocks,
        installationId: rawDigits,
        remainingCidPoints: remainingPoints,
      });
    } else {
      // Error message directly from getcid.us (Do NOT deduct point)
      const providerError = apiResult?.message || 'Error generating CID from provider. Please check your Product Key & Installation ID.';
      return res.status(400).json({
        success: false,
        error: providerError,
      });
    }
  } catch (error) {
    console.error('Error processing CID request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error sending request to getcid.us provider.',
    });
  }
};
