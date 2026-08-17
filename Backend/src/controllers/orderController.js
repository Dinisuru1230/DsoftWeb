const prisma = require('../config/prisma');

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
            colorName: item.colorName || item.color,
            quantity: parseInt(item.quantity || 1),
            price: parseFloat(item.price),
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

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function uploadBankSlip(req, res) {
  try {
    const { id } = req.params;
    const { depositRef } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Bank slip image or file is required' });
    }

    const bankSlipUrl = `/uploads/${req.file.filename}`;

    const order = await prisma.order.update({
      where: { id },
      data: {
        bankSlipUrl,
        depositRef,
        orderStatus: 'BANK_SLIP_PENDING',
      },
      include: { items: true },
    });

    res.json({ message: 'Bank deposit slip uploaded successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

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

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ error: 'Order status is required' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { orderStatus },
      include: { items: true },
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createOrder,
  uploadBankSlip,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
