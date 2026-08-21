const prisma = require('../config/prisma');

// Helper to deduct stock for order items
async function deductStock(items) {
  for (const item of items) {
    const pId = item.productId || item.id;
    const qty = parseInt(item.quantity || 1);
    if (!pId) continue;

    try {
      const product = await prisma.product.findUnique({ where: { id: pId } });
      if (product) {
        await prisma.product.update({
          where: { id: pId },
          data: { stock: Math.max(0, product.stock - qty) },
        });
      }

      const colorName = item.colorName || item.color;
      if (colorName) {
        const colorVariant = await prisma.productColor.findFirst({
          where: { productId: pId, name: colorName },
        });
        if (colorVariant) {
          await prisma.productColor.update({
            where: { id: colorVariant.id },
            data: { stock: Math.max(0, colorVariant.stock - qty) },
          });
        }
      }
    } catch (err) {
      console.error(`Error deducting stock for product ${pId}:`, err);
    }
  }
}

// Helper to restore (re-increment) stock for cancelled orders
async function restoreStock(items) {
  for (const item of items) {
    const pId = item.productId || item.id;
    const qty = parseInt(item.quantity || 1);
    if (!pId) continue;

    try {
      const product = await prisma.product.findUnique({ where: { id: pId } });
      if (product) {
        await prisma.product.update({
          where: { id: pId },
          data: { stock: product.stock + qty },
        });
      }

      const colorName = item.colorName || item.color;
      if (colorName) {
        const colorVariant = await prisma.productColor.findFirst({
          where: { productId: pId, name: colorName },
        });
        if (colorVariant) {
          await prisma.productColor.update({
            where: { id: colorVariant.id },
            data: { stock: colorVariant.stock + qty },
          });
        }
      }
    } catch (err) {
      console.error(`Error restoring stock for product ${pId}:`, err);
    }
  }
}

// POST /api/orders
async function createOrder(req, res) {
  try {
    const { customerName, email, phone, address, totalAmount, shippingCost, paymentMethod, items } = req.body;

    if (!customerName || !email || !phone || !address || !totalAmount || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const orderNumber = `MC-${Date.now().toString().slice(-6)}`;
    const userId = req.user ? req.user.id : null;

    // Determine initial status based on payment method
    let initialStatus = 'PENDING';
    if (paymentMethod === 'BANK_TRANSFER') {
      initialStatus = 'BANK_SLIP_PENDING';
    } else if (paymentMethod === 'COD') {
      initialStatus = 'PENDING';
    } else if (paymentMethod === 'CARD') {
      initialStatus = 'PROCESSING';
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        email,
        phone,
        address,
        totalAmount: parseFloat(totalAmount),
        shippingCost: parseFloat(shippingCost || 0),
        paymentMethod,
        orderStatus: initialStatus,
        items: {
          create: items.map((item) => ({
            productId: item.productId || item.id,
            colorName: item.colorName || item.color || null,
            quantity: parseInt(item.quantity || 1),
            price: parseFloat(item.price || 0),
          })),
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

    // Automatically deduct stock for purchased items
    await deductStock(items);

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/orders/:id/bank-slip
async function uploadBankSlip(req, res) {
  try {
    const { id } = req.params;
    const { depositRef } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Bank slip image or file is required' });
    }

    const bankSlipUrl = `/uploads/${req.file.filename}`;

    // Look up by id or orderNumber
    let order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order = await prisma.order.update({
      where: { id: order.id },
      data: {
        bankSlipUrl,
        depositRef: depositRef || order.depositRef,
        orderStatus: 'BANK_SLIP_PENDING',
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({ message: 'Bank deposit slip uploaded successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders/my-orders
async function getMyOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders (Admin only)
async function getAllOrders(req, res) {
  try {
    const { status } = req.query;

    const where = {};
    if (status && status !== 'All') {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders/:id (Admin or Owner)
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/orders/:id/status (Admin only)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ error: 'Order status is required' });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const prevStatus = existingOrder.orderStatus;
    const newStatus = orderStatus;

    // Handle stock restoration on cancellation
    if (prevStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
      await restoreStock(existingOrder.items);
    } else if (prevStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
      // Re-deduct stock if un-cancelling
      await deductStock(existingOrder.items);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: { orderStatus: newStatus },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createOrder,
  uploadBankSlip,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
