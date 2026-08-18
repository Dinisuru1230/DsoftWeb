const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// GET /api/users/customers — All customers
async function getCustomers(req, res) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        district: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      address: c.address || '',
      city: c.city || '',
      province: c.district || '',
      postalCode: c.postalCode || '',
      orders: c._count.orders,
      joined: c.createdAt.toISOString().split('T')[0],
    }));

    res.json({ customers: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/users/customers — Create a new customer
async function createCustomer(req, res) {
  try {
    const { name, email, password, phone, address, city, district, postalCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        city: city || null,
        district: district || null,
        postalCode: postalCode || null,
        role: 'CUSTOMER',
      },
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        province: user.district || '',
        postalCode: user.postalCode || '',
        orders: 0,
        joined: user.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/users/customers/:id — Edit a customer
async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, district, password, postalCode } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'CUSTOMER') {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If email changed, check it's not taken
    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return res.status(400).json({ error: 'Email is already in use by another account' });
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(district !== undefined && { district }),
      ...(postalCode !== undefined && { postalCode }),
    };

    // Only hash and update password if provided
    if (password && password.trim()) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data: updateData });

    res.json({
      message: 'Customer updated successfully',
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        address: updated.address || '',
        city: updated.city || '',
        province: updated.district || '',
        postalCode: updated.postalCode || '',
        joined: updated.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/users/customers/:id — Delete a customer
async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'CUSTOMER') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/users/admins — All admins
async function getAdmins(req, res) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone || '',
      role: 'ADMIN',
      joined: a.createdAt.toISOString().split('T')[0],
    }));

    res.json({ admins: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/users/admins — Create a new admin
async function createAdmin(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'ADMIN',
      },
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'ADMIN',
        joined: user.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/users/admins/:id — Edit an admin
async function updateAdmin(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return res.status(400).json({ error: 'Email already in use' });
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
    };

    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data: updateData });

    res.json({
      message: 'Admin updated successfully',
      admin: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        role: 'ADMIN',
        joined: updated.createdAt.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/users/admins/:id — Remove an admin
async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Admin not found' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
