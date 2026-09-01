const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const { sendLicenseDeliveryEmail } = require('../services/emailService');

function deleteFileIfLocal(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return;
  let relativePath = imagePath;
  if (relativePath.includes('/uploads/')) {
    relativePath = '/uploads/' + relativePath.split('/uploads/')[1];
  }
  if (relativePath.startsWith('/uploads/')) {
    const filename = relativePath.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file ${filePath}:`, err.message);
      }
    }
  }
}

async function getAllProducts(req, res) {
  try {
    const { search, category, maxPrice, sort, featured, limit, exclude } = req.query;

    const where = {};

    if (category && category !== 'All Products') {
      where.categoryName = category;
    }

    if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { categoryName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Filter by featured flag (for Home page "New Arrivals" section)
    if (featured === 'true') {
      where.featured = true;
    }

    // Exclude a specific product ID (for related products section)
    if (exclude) {
      where.id = { not: exclude };
    }

    // Special sorting for Most Selling / Best Selling products
    if (sort === 'best-selling' || sort === 'most-selling') {
      const products = await prisma.product.findMany({
        where,
        include: {
          colors: true,
          keys: true,
          orderItems: {
            select: { quantity: true },
          },
        },
      });

      // Sort products by total quantity sold descending
      products.sort((a, b) => {
        const totalSalesA = (a.orderItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
        const totalSalesB = (b.orderItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (totalSalesB !== totalSalesA) return totalSalesB - totalSalesA;

        // Tie-breaker: prioritize products with 'HOT' or 'Popular' badges or featured flag
        const badgeA = (a.badge || '').toUpperCase();
        const badgeB = (b.badge || '').toUpperCase();
        const isHotA = badgeA.includes('HOT') || badgeA.includes('POPULAR') || a.featured;
        const isHotB = badgeB.includes('HOT') || badgeB.includes('POPULAR') || b.featured;
        if (isHotB && !isHotA) return 1;
        if (isHotA && !isHotB) return -1;

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const cleanProducts = products.map(({ orderItems, ...p }) => p);
      if (limit) {
        return res.json(cleanProducts.slice(0, parseInt(limit)));
      }
      return res.json(cleanProducts);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };

    const queryOptions = {
      where,
      orderBy,
      include: {
        colors: true,
        keys: true,
      },
    };

    // Limit results (for Home page, related products, etc.)
    if (limit) {
      queryOptions.take = parseInt(limit);
    }

    const products = await prisma.product.findMany(queryOptions);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        colors: true,
        keys: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/products/:id/keys
async function getProductKeys(req, res) {
  try {
    const { id } = req.params;
    const keys = await prisma.productKey.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
    });
    const availableCount = keys.filter((k) => !k.isUsed).length;
    const usedCount = keys.filter((k) => k.isUsed).length;
    res.json({ keys, availableCount, usedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Helper to auto-fulfill pending orders for a product when keys or stock are added by admin
async function autoFulfillPendingOrdersForProduct(productId) {
  try {
    const pendingItems = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          orderStatus: { in: ['PENDING', 'PROCESSING', 'CONFIRMED', 'BANK_SLIP_PENDING'] },
        },
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    let fulfilledOrdersCount = 0;

    for (const item of pendingItems) {
      // If parent order is already delivered, skip
      if (item.order.orderStatus === 'DELIVERED') continue;

      const qty = parseInt(item.quantity || 1);
      let keyString = null;

      // Check available unused keys in key pool
      const availableKeys = await prisma.productKey.findMany({
        where: { productId, isUsed: false },
        take: qty,
        orderBy: { createdAt: 'asc' },
      });

      if (availableKeys.length >= qty) {
        keyString = availableKeys.map((k) => k.key).join(', ');
        const keyIds = availableKeys.map((k) => k.id);

        // Mark pool keys as used and tag with orderId
        await prisma.productKey.updateMany({
          where: { id: { in: keyIds } },
          data: {
            isUsed: true,
            usedAt: new Date(),
            orderId: item.order.id,
          },
        });
      } else {
        // Fallback to static licenseKey on product
        const prod = await prisma.product.findUnique({ where: { id: productId } });
        if (prod && prod.licenseKey && prod.licenseKey.trim()) {
          keyString = prod.licenseKey.trim();
        }
      }

      if (keyString) {
        // Update the order item with allocated keys
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { licenseKey: keyString },
        });

        // Check if all items in parent order now have keys allocated
        const updatedOrderItems = await prisma.orderItem.findMany({
          where: { orderId: item.order.id },
        });

        const allItemsHaveKey = updatedOrderItems.every(
          (it) => it.id === item.id || (it.licenseKey && it.licenseKey.trim() !== '')
        );

        if (allItemsHaveKey) {
          const completedOrder = await prisma.order.update({
            where: { id: item.order.id },
            data: { orderStatus: 'DELIVERED' },
            include: { items: { include: { product: true } } },
          });
          fulfilledOrdersCount++;

          // Send automated email notification to customer now that order is complete & keys allocated
          sendLicenseDeliveryEmail(completedOrder).catch((err) =>
            console.error('Non-blocking license email dispatch error in autoFulfillForProduct:', err)
          );
        }
      }
    }

    return fulfilledOrdersCount;
  } catch (err) {
    console.error(`Error auto-fulfilling pending orders for product ${productId}:`, err);
    return 0;
  }
}

// POST /api/products/:id/keys
async function addProductKeys(req, res) {
  try {
    const { id } = req.params;
    const { keys, rawText } = req.body;
    let keysList = [];
    if (Array.isArray(keys)) {
      keysList = keys.map((k) => String(k).trim()).filter(Boolean);
    } else if (rawText && typeof rawText === 'string') {
      keysList = rawText
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean);
    }

    if (!keysList.length) {
      return res.status(400).json({ error: 'No valid license keys provided' });
    }

    await prisma.productKey.createMany({
      data: keysList.map((k) => ({
        productId: id,
        key: k,
        isUsed: false,
      })),
    });

    // Auto-fulfill any pending orders waiting for keys
    const fulfilledCount = await autoFulfillPendingOrdersForProduct(id);

    const updatedKeys = await prisma.productKey.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'asc' },
    });

    let msg = `${keysList.length} key(s) added successfully!`;
    if (fulfilledCount > 0) {
      msg += ` ${fulfilledCount} pending order(s) auto-fulfilled & completed!`;
    }

    res.json({
      message: msg,
      count: keysList.length,
      fulfilledCount,
      keys: updatedKeys,
      availableCount: updatedKeys.filter((k) => !k.isUsed).length,
      usedCount: updatedKeys.filter((k) => k.isUsed).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/products/:id/keys/:keyId
async function deleteProductKey(req, res) {
  try {
    const { id, keyId } = req.params;
    await prisma.productKey.delete({ where: { id: keyId } });

    const totalAvailable = await prisma.productKey.count({
      where: { productId: id, isUsed: false },
    });

    res.json({ message: 'Key deleted successfully', totalAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, stock, categoryName, badge, description, details, downloadUrl, licenseKey, installationGuide, image, hoverImage, galleryImages, featured, colors, standardShipping, expressShipping, hasCidPoints, isCidAvailable, cidPoints, cidAvailable } = req.body;

    if (!name || !price || !categoryName || !description || !image) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const cidFlag = hasCidPoints !== undefined ? Boolean(hasCidPoints) : isCidAvailable !== undefined ? Boolean(isCidAvailable) : cidPoints !== undefined ? Boolean(cidPoints) : cidAvailable !== undefined ? Boolean(cidAvailable) : true;

    // Ensure category exists or create it
    let cat = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryName,
        badge,
        description,
        details: Array.isArray(details) ? JSON.stringify(details) : details,
        downloadUrl: downloadUrl || null,
        licenseKey: licenseKey || null,
        installationGuide: installationGuide || null,
        image,
        hoverImage,
        galleryImages: Array.isArray(galleryImages) ? JSON.stringify(galleryImages.filter(Boolean)) : null,
        featured: Boolean(featured),
        standardShipping: standardShipping != null ? parseFloat(standardShipping) : null,
        expressShipping: expressShipping != null ? parseFloat(expressShipping) : null,
        hasCidPoints: cidFlag,
        isCidAvailable: cidFlag,
        ...(colors && Array.isArray(colors) && colors.length > 0 && {
          colors: {
            create: colors.map((c) => ({
              name: c.name,
              hex: c.hex,
              image: c.image,
              price: parseFloat(c.price || price),
              stock: parseInt(c.stock || 0),
            })),
          },
        }),
      },
      include: {
        colors: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, price, stock, categoryName, badge, description, details, downloadUrl, licenseKey, installationGuide, image, hoverImage, galleryImages, featured, colors, standardShipping, expressShipping, hasCidPoints, isCidAvailable, cidPoints, cidAvailable } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cidVal = hasCidPoints !== undefined ? hasCidPoints : isCidAvailable !== undefined ? isCidAvailable : cidPoints !== undefined ? cidPoints : cidAvailable;

    // Handle updating product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryName && { categoryName }),
        ...(badge !== undefined && { badge }),
        ...(description && { description }),
        ...(details !== undefined && {
          details: Array.isArray(details) ? JSON.stringify(details) : details,
        }),
        ...(downloadUrl !== undefined && { downloadUrl: downloadUrl || null }),
        ...(licenseKey !== undefined && { licenseKey: licenseKey || null }),
        ...(installationGuide !== undefined && { installationGuide: installationGuide || null }),
        ...(image && { image }),
        ...(hoverImage !== undefined && { hoverImage }),
        ...(galleryImages !== undefined && {
          galleryImages: Array.isArray(galleryImages)
            ? JSON.stringify(galleryImages.filter(Boolean))
            : galleryImages,
        }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(standardShipping !== undefined && { standardShipping: standardShipping != null ? parseFloat(standardShipping) : null }),
        ...(expressShipping !== undefined && { expressShipping: expressShipping != null ? parseFloat(expressShipping) : null }),
        ...(cidVal !== undefined && { hasCidPoints: Boolean(cidVal), isCidAvailable: Boolean(cidVal) }),
        ...(colors !== undefined && Array.isArray(colors) && {
          colors: {
            deleteMany: {},
            create: colors.map((c) => ({
              name: c.name,
              hex: c.hex,
              image: c.image,
              price: parseFloat(c.price || price || existing.price || 0),
              stock: parseInt(c.stock || 0),
            })),
          },
        }),
      },
      include: { colors: true },
    });


    // If static license key or stock was updated, auto-fulfill any pending orders waiting for keys
    if (licenseKey || stock) {
      await autoFulfillPendingOrdersForProduct(id);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Fetch product with colors to gather all associated image URLs
    const product = await prisma.product.findUnique({
      where: { id },
      include: { colors: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Collect all image URLs (main, hover, gallery sub-images, color photos)
    const urlsToDelete = new Set();
    if (product.image) urlsToDelete.add(product.image);
    if (product.hoverImage) urlsToDelete.add(product.hoverImage);

    if (product.galleryImages) {
      try {
        const parsed = typeof product.galleryImages === 'string'
          ? JSON.parse(product.galleryImages)
          : product.galleryImages;
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => img && urlsToDelete.add(img));
        }
      } catch {}
    }

    if (product.colors && Array.isArray(product.colors)) {
      product.colors.forEach((c) => {
        if (c.image) urlsToDelete.add(c.image);
      });
    }

    // Delete product from DB
    await prisma.product.delete({ where: { id } });

    // Clean up all associated image files from disk storage
    urlsToDelete.forEach((url) => deleteFileIfLocal(url));

    res.json({ message: 'Product and all associated images deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductKeys,
  addProductKeys,
  deleteProductKey,
  autoFulfillPendingOrdersForProduct,
};
