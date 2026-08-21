const prisma = require('../config/prisma');

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

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };

    const queryOptions = {
      where,
      orderBy,
      include: {
        colors: true,
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

async function createProduct(req, res) {
  try {
    const { name, price, stock, categoryName, badge, description, details, image, hoverImage, galleryImages, featured, colors, standardShipping, expressShipping } = req.body;

    if (!name || !price || !categoryName || !description || !image) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

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
        image,
        hoverImage,
        galleryImages: Array.isArray(galleryImages) ? JSON.stringify(galleryImages.filter(Boolean)) : null,
        featured: Boolean(featured),
        standardShipping: standardShipping != null ? parseFloat(standardShipping) : null,
        expressShipping: expressShipping != null ? parseFloat(expressShipping) : null,
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
    const { name, price, stock, categoryName, badge, description, details, image, hoverImage, galleryImages, featured, colors, standardShipping, expressShipping } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

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


    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
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
};
