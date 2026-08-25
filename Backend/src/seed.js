const bcrypt = require('bcryptjs');
const prisma = require('./config/prisma');

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Default Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dsoftpack.lk' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Pramod Wijenayake',
      email: 'admin@dsoftpack.lk',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+94 77 123 4567',
      address: 'DSoft Pack HQ, Colombo',
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

  // 3. Create Default Global Settings
  await prisma.setting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      standardShipping: 450,
      expressShipping: 1200,
      freeShippingOver: 15000,
      bankName: 'Commercial Bank of Ceylon',
      accountName: 'DSoft Pack (Pvt) Ltd',
      accountNumber: '8009 123 456',
      branchName: 'Colombo Main Branch',
      swiftCode: 'CCEYLKLX',
      bankNotes: 'Please include your contact number or order ID as the deposit reference.',
    },
  });
  console.log('✅ Global Store Settings created');

  // 4. Create Default "Our Story" Details
  const storySections = [
    {
      id: 'sec-1',
      title: 'The Art of Stillness',
      paragraph:
        'We believe that true elegance is found in the quiet moments. Our textiles are not just woven fabrics; they are a tribute to the slow, intentional art of craftsmanship. Each piece begins with a singular thread and a vision of calm, designed to bring a sense of tranquility and groundedness to your daily life.\n\nBy working directly with master artisans, we ensure that the soul of traditional weaving is preserved, allowing the natural character of the materials to speak for themselves in every subtle fold and delicate fringe.',
      image: '/01_cream_linen_fabrics.jpg',
      reverse: false,
    },
    {
      id: 'sec-2',
      title: 'Everyday Magic',
      paragraph:
        "Magic isn't found in the grandiose; it's tucked quietly into the objects we touch every day. At DSoft Pack, we aim to infuse your rituals with a touch of this extraordinary comfort. Our throw blankets are designed not just for warmth, but for the feeling of being wrapped in something that was made with genuine care.\n\nThis is our promise to you: every thread is a deliberate act of intention.",
      image: '/06_elegant_living_space.jpg',
      reverse: true,
    },
    {
      id: 'sec-3',
      title: 'The Hands Behind the Magic',
      paragraph:
        'Our collections are born in the hands of skilled artisans who have dedicated their lives to the craft of weaving. We partner with small family-run workshops, ensuring fair wages and a sustainable practice that honors both the maker and the material.\n\nWhen you choose DSoft Pack, you are not just buying a product. You are investing in a story of human connection, skill, and a shared love for beautiful things.',
      image: '/05_artisanal_weaving_loom.jpg',
      reverse: false,
    },
    {
      id: 'sec-4',
      title: 'A Vision of Calm',
      paragraph:
        'Our design philosophy is rooted in a respect for natural beauty and a rejection of excess. We choose natural fibers, muted tones, and textures that speak of the earth. Our pieces are designed to age gracefully, becoming more beautiful with each year.\n\nWe believe a well-made object is the ultimate form of sustainability — something you keep not because you have to, but because you love it.',
      image: '/11_mediterranean_balcony_alt.jpg',
      reverse: true,
    },
  ];

  await prisma.ourStory.upsert({
    where: { id: 'global' },
    update: {
      mainTitle: 'Born from Stillness,\nCrafted with Intention',
      subtitle:
        'DSoft Pack began as a quiet idea — that the most beautiful things in life are made slowly, with care, and with love. We are a small, passionate team of makers, dreamers, and storytellers.',
      mainImage: '/13_studio_table_ribbons.jpg',
      sections: JSON.stringify(storySections),
    },
    create: {
      id: 'global',
      mainTitle: 'Born from Stillness,\nCrafted with Intention',
      subtitle:
        'DSoft Pack began as a quiet idea — that the most beautiful things in life are made slowly, with care, and with love. We are a small, passionate team of makers, dreamers, and storytellers.',
      mainImage: '/13_studio_table_ribbons.jpg',
      sections: JSON.stringify(storySections),
    },
  });
  console.log('✅ Our Story details seeded successfully');

  // 5. Create Default Products
  const productsData = [
    {
      id: 'blush-ribbon-bow',
      name: 'Blush Silk Ribbon Bow',
      price: 3600,
      stock: 48,
      categoryName: 'Bows & Ribbons',
      badge: 'Bestseller',
      description:
        'A handcrafted blush silk ribbon bow, perfect for adorning gifts, hair accessories, or home décor. Made with premium quality silk for a luxurious, soft feel.',
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
