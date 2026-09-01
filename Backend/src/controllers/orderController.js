const prisma = require('../config/prisma');
const { sendLicenseDeliveryEmail } = require('../services/emailService');

// Helper to deduct stock for order items (variant level if applicable)
async function deductStock(items) {
  for (const item of items) {
    const pId = item.productId || item.id;
    const qty = parseInt(item.quantity || 1);
    if (!pId) continue;

    try {
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

// Helper to restore stock for cancelled orders
async function restoreStock(items) {
  for (const item of items) {
    const pId = item.productId || item.id;
    const qty = parseInt(item.quantity || 1);
    if (!pId) continue;

    try {
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

    if (!customerName || !email || !address || !totalAmount || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const orderNumber = `MC-${Date.now().toString().slice(-6)}`;
    const userId = req.user ? req.user.id : null;

    // Resolve products and allocate unique license keys from key pool
    const itemsToCreate = await Promise.all(
      items.map(async (item) => {
        const pId = item.productId || item.id;
        const qty = parseInt(item.quantity || 1);
        let allocatedKey = item.licenseKey || null;

        if (pId && paymentMethod !== 'BANK_TRANSFER') {
          // Find unused keys in key pool
          const availableKeys = await prisma.productKey.findMany({
            where: { productId: pId, isUsed: false },
            take: qty,
            orderBy: { createdAt: 'asc' },
          });

          if (availableKeys.length >= qty) {
            allocatedKey = availableKeys.map((k) => k.key).join(', ');

            // Mark keys as used
            const keyIds = availableKeys.map((k) => k.id);
            await prisma.productKey.updateMany({
              where: { id: { in: keyIds } },
              data: { isUsed: true, usedAt: new Date() },
            });
          } else {
            // Fallback to static product default licenseKey if available
            const product = await prisma.product.findUnique({ where: { id: pId } });
            if (product && product.licenseKey && !allocatedKey) {
              allocatedKey = product.licenseKey;
            }
          }
        }

        return {
          productId: pId,
          colorName: item.colorName || item.color || null,
          licenseKey: allocatedKey,
          quantity: qty,
          price: parseFloat(item.price || 0),
        };
      })
    );

    // Check if all items have an allocated key
    const allItemsHaveKeys = itemsToCreate.length > 0 && itemsToCreate.every(
      (it) => it.licenseKey && typeof it.licenseKey === 'string' && it.licenseKey.trim() !== ''
    );

    // Determine initial status based on payment method
    let initialStatus = 'PENDING';
    if (paymentMethod === 'BANK_TRANSFER') {
      initialStatus = 'BANK_SLIP_PENDING';
    } else if (allItemsHaveKeys) {
      initialStatus = 'DELIVERED';
    } else if (paymentMethod === 'CARD') {
      initialStatus = 'PROCESSING';
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName,
        email,
        phone: phone || '',
        address,
        totalAmount: parseFloat(totalAmount),
        shippingCost: parseFloat(shippingCost || 0),
        paymentMethod,
        orderStatus: initialStatus,
        items: {
          create: itemsToCreate,
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

    // Automatically send invoice, product keys, and installation guide email ONLY if order is completed with keys allocated
    if (initialStatus === 'DELIVERED') {
      sendLicenseDeliveryEmail(order).catch((err) =>
        console.error('Non-blocking license email dispatch error on order creation:', err)
      );
    }

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

// Helper to automatically assign available keys and complete any pending orders across the system
async function autoFulfillAllPendingOrders() {
  try {
    const pendingItems = await prisma.orderItem.findMany({
      where: {
        order: {
          orderStatus: { in: ['PENDING', 'PROCESSING', 'CONFIRMED'] },
        },
      },
      include: {
        product: true,
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    for (const item of pendingItems) {
      if (!item.productId) continue;
      if (item.order.orderStatus === 'DELIVERED') continue;

      const qty = parseInt(item.quantity || 1);
      let allocatedKey = null;

      // 1. Try to claim available keys from ProductKey pool
      const availableKeys = await prisma.productKey.findMany({
        where: { productId: item.productId, isUsed: false },
        take: qty,
        orderBy: { createdAt: 'asc' },
      });

      if (availableKeys.length >= qty) {
        allocatedKey = availableKeys.map((k) => k.key).join(', ');
        const keyIds = availableKeys.map((k) => k.id);

        await prisma.productKey.updateMany({
          where: { id: { in: keyIds } },
          data: {
            isUsed: true,
            usedAt: new Date(),
            orderId: item.order.id,
          },
        });
      } else if (item.product && item.product.licenseKey && !item.licenseKey) {
        // 2. Fallback to static product licenseKey if available
        allocatedKey = item.product.licenseKey;
      }

      // If key was successfully found/allocated, assign it to order item
      if (allocatedKey) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { licenseKey: allocatedKey },
        });

        // Check if all items in parent order now have license keys
        const updatedOrderItems = await prisma.orderItem.findMany({
          where: { orderId: item.order.id },
        });

        const allItemsHaveKey = updatedOrderItems.every(
          (it) => it.licenseKey && it.licenseKey.trim() !== ''
        );

        if (allItemsHaveKey) {
          const completedOrder = await prisma.order.update({
            where: { id: item.order.id },
            data: { orderStatus: 'DELIVERED' },
            include: { items: { include: { product: true } } },
          });

          sendLicenseDeliveryEmail(completedOrder).catch((err) =>
            console.error('Non-blocking license email dispatch error in autoFulfill:', err)
          );
        }
      }
    }
  } catch (err) {
    console.error('Error in autoFulfillAllPendingOrders:', err);
  }
}

// GET /api/orders/my-orders
async function getMyOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Auto-fulfill any pending orders if keys are now available
    await autoFulfillAllPendingOrders();

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

    // Auto-fulfill any pending orders if keys are now available
    await autoFulfillAllPendingOrders();

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

    // Auto-fulfill any pending orders if keys are now available
    await autoFulfillAllPendingOrders();

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
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const prevStatus = existingOrder.orderStatus;
    const newStatus = orderStatus;

    // IF ATTEMPTING TO MARK AS DELIVERED (Completed) OR CONFIRMED:
    // Block status update if ANY product item does not have a license key assigned or available.
    if (newStatus === 'DELIVERED' || newStatus === 'CONFIRMED') {
      const unfulfilledItems = [];

      for (const item of existingOrder.items) {
        let currentKey = item.licenseKey;

        // 1. Check assigned ProductKeys in DB for this order
        if ((!currentKey || !currentKey.trim()) && item.productId) {
          const dbKeys = await prisma.productKey.findMany({
            where: { orderId: existingOrder.id, productId: item.productId },
          });
          if (dbKeys.length > 0) {
            currentKey = dbKeys.map((k) => k.key).join(', ');
          }
        }

        // 2. Check static default licenseKey on Product
        if ((!currentKey || !currentKey.trim()) && item.product && item.product.licenseKey) {
          currentKey = item.product.licenseKey;
        }

        // 3. Try to claim unused key from ProductKey pool
        if ((!currentKey || !currentKey.trim()) && item.productId) {
          const qty = parseInt(item.quantity || 1);
          const availableKeys = await prisma.productKey.findMany({
            where: { productId: item.productId, isUsed: false },
            take: qty,
            orderBy: { createdAt: 'asc' },
          });

          if (availableKeys.length >= qty) {
            currentKey = availableKeys.map((k) => k.key).join(', ');
            const keyIds = availableKeys.map((k) => k.id);
            await prisma.productKey.updateMany({
              where: { id: { in: keyIds } },
              data: { isUsed: true, usedAt: new Date(), orderId: existingOrder.id },
            });
          }
        }

        // Save currentKey to orderItem if allocated
        if (currentKey && currentKey.trim()) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { licenseKey: currentKey.trim() },
          });
          item.licenseKey = currentKey.trim();
        }

        // If STILL no key is assigned to this item, record it
        if (!currentKey || !currentKey.trim()) {
          const productName = item.product ? item.product.name : 'Software Product';
          unfulfilledItems.push(productName);
        }
      }

      // If any item lacks a license key, DENY order completion!
      if (unfulfilledItems.length > 0) {
        return res.status(400).json({
          error: `Cannot mark order as ${
            newStatus === 'DELIVERED' ? 'Completed' : 'Confirmed'
          }: Product "${unfulfilledItems[0]}" does not have a license key assigned. Please assign a key before marking the order as ${
            newStatus === 'DELIVERED' ? 'Completed' : 'Confirmed'
          }.`,
        });
      }
    }

    // Handle stock restoration on cancellation
    if (prevStatus !== 'CANCELLED' && newStatus === 'CANCELLED') {
      await restoreStock(existingOrder.items);
    } else if (prevStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
      // Re-deduct stock if un-cancelling
      await deductStock(existingOrder.items);
    }

    let updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: { orderStatus: newStatus },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (newStatus !== 'BANK_SLIP_PENDING' && newStatus !== 'CANCELLED') {
      await autoFulfillAllPendingOrders();
      // Re-fetch order to return updated items and keys
      updatedOrder = await prisma.order.findUnique({
        where: { id: existingOrder.id },
        include: { items: { include: { product: true } } },
      });
    }

    // Automatically send license key email if status turns DELIVERED or CONFIRMED
    if (newStatus === 'DELIVERED' || newStatus === 'CONFIRMED') {
      sendLicenseDeliveryEmail(updatedOrder).catch((err) =>
        console.error('Non-blocking license email dispatch error:', err)
      );
    }

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/orders/:id/resend-email (Admin manual resend)
async function resendOrderEmail(req, res) {
  try {
    const { id } = req.params;
    let order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Auto-fulfill if keys are available in inventory pool
    await autoFulfillAllPendingOrders();

    // Re-fetch order
    order = await prisma.order.findFirst({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    // Check if items have keys before sending
    for (const item of order.items || []) {
      let hasKey = item.licenseKey && item.licenseKey.trim() !== '';
      if (!hasKey && item.product && item.product.licenseKey && item.product.licenseKey.trim() !== '') {
        hasKey = true;
      }
      if (!hasKey && item.productId) {
        const count = await prisma.productKey.count({
          where: {
            OR: [
              { orderId: order.id, productId: item.productId },
              { productId: item.productId, isUsed: false },
            ],
          },
        });
        if (count > 0) hasKey = true;
      }

      if (!hasKey) {
        const pName = item.product ? item.product.name : 'Software Product';
        return res.status(400).json({
          error: `Cannot send license email: Product "${pName}" does not have a license key assigned yet. Please assign a key first.`,
        });
      }
    }

    // Ensure order is set to DELIVERED if it has all keys
    if (order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CONFIRMED') {
      order = await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: 'DELIVERED' },
        include: { items: { include: { product: true } } },
      });
    }

    const sent = await sendLicenseDeliveryEmail(order);
    if (!sent) {
      return res.status(400).json({ error: 'Failed to send email. Please verify SMTP configuration in Admin Settings.' });
    }

    res.json({ message: `License email successfully sent to ${order.email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders/track/:orderNumber (Public tracking for customers)
async function trackOrder(req, res) {
  try {
    const { orderNumber } = req.params;
    if (!orderNumber || !orderNumber.trim()) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    const trimmed = orderNumber.trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: trimmed },
          { id: trimmed },
        ],
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: `Order #${trimmed} not found. Please verify your order number and try again.` });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders/dashboard-stats (Admin only)
async function getDashboardStats(req, res) {
  try {
    const [
      totalOrders,
      orders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      unreadMessages,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { orderStatus: { not: 'CANCELLED' } },
        select: { totalAmount: true, orderStatus: true },
      }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { stock: 0 },
        select: { id: true, name: true, stock: true, image: true, categoryName: true },
        take: 6,
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'BANK_SLIP_PENDING' || o.orderStatus === 'PROCESSING'
    ).length;

    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockCount: lowStockProducts.length,
      totalProducts,
      totalCustomers,
      unreadMessages,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard statistics' });
  }
}

// PUT /api/orders/:orderId/items/:itemId/license-key (Admin only)
async function updateOrderItemLicenseKey(req, res) {
  try {
    const { itemId } = req.params;
    const { licenseKey } = req.body;

    const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const newKey = licenseKey ? licenseKey.trim() : null;

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { licenseKey: newKey },
      include: { product: true },
    });

    // Check parent order and auto-complete if order is currently pending/processing
    let parentOrder = await prisma.order.findUnique({
      where: { id: item.orderId },
      include: { items: { include: { product: true } } },
    });

    let autoCompleted = false;
    if (newKey && parentOrder && ['PENDING', 'BANK_SLIP_PENDING', 'PROCESSING'].includes(parentOrder.orderStatus)) {
      const allItemsHaveKey = parentOrder.items.every((it) => (it.id === itemId ? !!newKey : !!it.licenseKey));
      if (allItemsHaveKey) {
        parentOrder = await prisma.order.update({
          where: { id: parentOrder.id },
          data: { orderStatus: 'DELIVERED' },
          include: { items: { include: { product: true } } },
        });
        autoCompleted = true;
      }
    }

    // Trigger email delivery ONLY when order is COMPLETED and keys are assigned
    if (parentOrder && parentOrder.orderStatus === 'DELIVERED') {
      sendLicenseDeliveryEmail(parentOrder).catch((err) =>
        console.error('Non-blocking license email dispatch error in updateOrderItemKey:', err)
      );
    }

    res.json({
      message: autoCompleted
        ? 'License key saved & Order automatically marked as COMPLETED!'
        : 'License key updated successfully',
      item: updatedItem,
      order: parentOrder,
      autoCompleted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/orders/track/:orderNumber
async function trackOrder(req, res) {
  try {
    const { orderNumber } = req.params;
    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    // Auto-fulfill any pending orders if keys are now available
    await autoFulfillAllPendingOrders();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderNumber.trim() },
          { id: orderNumber.trim() },
        ],
      },
      include: {
        items: {
          include: { product: true },
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

module.exports = {
  createOrder,
  uploadBankSlip,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemLicenseKey,
  resendOrderEmail,
  trackOrder,
  getDashboardStats,
  autoFulfillAllPendingOrders,
};
