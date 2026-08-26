const prisma = require('../config/prisma');

// Generate a URL-friendly slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/categories — All categories (public)
async function getCategories(req, res) {
  try {
    const includeInactive = req.query.all === 'true';
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { active: true },
      include: { _count: { select: { products: true } } },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    res.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        order: c.order ?? 0,
        active: c.active,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/categories — Create new category (admin only)
async function createCategory(req, res) {
  try {
    const { name, icon, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = generateSlug(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });
    if (existing) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    // Auto-calculate highest order if not provided
    let newOrder = Number(order);
    if (isNaN(newOrder)) {
      const maxOrderCat = await prisma.category.findFirst({
        orderBy: { order: 'desc' },
      });
      newOrder = (maxOrderCat?.order ?? -1) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || 'category',
        order: newOrder,
        active: true,
      },
    });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/categories/reorder — Bulk reorder categories (admin only)
async function reorderCategories(req, res) {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    const updatePromises = items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { order: Number(item.order) || 0 },
      })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Category order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/categories/:id — Update category (admin only)
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, icon, active, order } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const updateData = {};
    if (name !== undefined && name.trim()) {
      // Check name not taken by another category
      const nameTaken = await prisma.category.findFirst({
        where: { name: name.trim(), NOT: { id } },
      });
      if (nameTaken) return res.status(400).json({ error: 'A category with this name already exists' });
      updateData.name = name.trim();
      updateData.slug = generateSlug(name.trim());
    }
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;
    if (order !== undefined) updateData.order = Number(order);

    const updated = await prisma.category.update({ where: { id }, data: updateData });
    res.json({ message: 'Category updated successfully', category: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/categories/:id — Delete category (admin only)
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    if (existing._count.products > 0) {
      return res.status(400).json({
        error: `Cannot delete: this category has ${existing._count.products} product(s) assigned to it.`,
      });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCategories,
  createCategory,
  reorderCategories,
  updateCategory,
  deleteCategory,
};
