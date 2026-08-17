const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma');

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@malmalee.lk' },
    update: {},
    create: {
      name: 'Pramod Wijenayake',
      email: 'admin@malmalee.lk',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+94 77 123 4567',
      address: 'Malmalee Creations HQ, Colombo',
    },
  });
  console.log('✅ Default Admin User created:', admin.email);

  // 2. Create Categories
  const categories = ['Bows & Ribbons', 'Scrunchies', 'Headbands', 'Ribbons', 'Accessories'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
    });
  }
  console.log('✅ Categories created');

  // 3. Create Default Products
  const productsData = [
    {
      id: 'blush-ribbon-bow',
      name: 'Blush Silk Ribbon Bow',
      price: 3600,
      stock: 48,
      categoryName: 'Bows & Ribbons',
      badge: 'Bestseller',
      description: 'A handcrafted blush silk ribbon bow, perfect for adorning gifts, hair accessories, or home décor. Made with premium quality silk for a luxurious, soft feel.',
      details: JSON.stringify(['Material: 100% Silk', 'Width: 2 inches', 'Handmade in Sri Lanka']),
      image: '/14_blush_silk_ribbon_bow.jpg',
      hoverImage: '/15_blush_silk_ribbon_close_up.jpg',
      featured: true,
      colors: [
        { name: 'Blush Pink', hex: '#fadadd', image: '/14_blush_silk_ribbon_bow.jpg', price: 3600, stock: 18 },
        { name: 'Cream Linen', hex: '#f7f4ef', image: '/01_cream_linen_fabrics.jpg', price: 4200, stock: 12 },
        { name: 'Rose Gold', hex: '#e8c5c8', image: '/08_pink_satin_robe.jpg', price: 4800, stock: 5 },
      ],
    },
    {
      id: 'pearl-scrunchie',
      name: 'Pearl Satin Scrunchie',
      price: 4500,
      stock: 25,
      categoryName: 'Scrunchies',
      badge: null,
      description: 'Luxurious satin scrunchie embedded with delicate pearls. Gentle on all hair types.',
      details: JSON.stringify(['Material: Satin & Pearl Beads', 'Gentle Hair Elastic']),
      image: '/18_silk_scrunchie.jpg',
      hoverImage: '/08_flat_lay_fabrics_ribbon.jpg',
      featured: true,
    },
    {
      id: 'woven-headband',
      name: 'Woven Floral Headband',
      price: 6600,
      stock: 15,
      categoryName: 'Headbands',
      badge: 'New',
      description: 'Intricately woven floral headband crafted with soft pastel threads.',
      details: JSON.stringify(['Material: Woven Cotton & Silk', 'Flexible Headband Fit']),
      image: '/17_woven_floral_headband.jpg',
      hoverImage: '/02_woman_floral_headband.jpg',
      featured: true,
    },
    {
      id: 'studio-ribbon',
      name: 'Artisan Silk Ribbon',
      price: 5400,
      stock: 30,
      categoryName: 'Ribbons',
      badge: null,
      description: 'Hand-dyed silk ribbon spool for luxury gift wrapping and floral arrangements.',
      details: JSON.stringify(['Material: 100% Hand-dyed Silk', 'Spool Length: 5 Yards']),
      image: '/13_studio_table_ribbons.jpg',
      featured: false,
    },
    {
      id: 'hair-bows-set',
      name: 'Handmade Hair Bows Set',
      price: 8400,
      stock: 20,
      categoryName: 'Bows & Ribbons',
      badge: 'Popular',
      description: 'Set of 3 handcrafted hair bows in pastel tones.',
      details: JSON.stringify(['Set includes 3 items', 'Alligator Clip Backing']),
      image: '/16_flat_lay_hair_bows.jpg',
      hoverImage: '/20_flat_lay_ribbon_jasmine.jpg',
      featured: true,
    },
  ];

  for (const p of productsData) {
    const { colors, ...pData } = p;
    const existing = await prisma.product.findUnique({ where: { id: pData.id } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...pData,
          ...(colors && {
            colors: {
              create: colors,
            },
          }),
        },
      });
    }
  }

  console.log('✅ Initial Products seeded successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
