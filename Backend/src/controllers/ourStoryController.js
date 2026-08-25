const prisma = require('../config/prisma');

const DEFAULT_STORY_SECTIONS = [
  {
    id: 'sec-1',
    title: 'The Art of Stillness',
    paragraph: 'We believe that true elegance is found in the quiet moments. Our textiles are not just woven fabrics; they are a tribute to the slow, intentional art of craftsmanship. Each piece begins with a singular thread and a vision of calm, designed to bring a sense of tranquility and groundedness to your daily life.\n\nBy working directly with master artisans, we ensure that the soul of traditional weaving is preserved, allowing the natural character of the materials to speak for themselves in every subtle fold and delicate fringe.',
    image: '/01_cream_linen_fabrics.jpg',
    reverse: false,
  },
  {
    id: 'sec-2',
    title: 'Everyday Magic',
    paragraph: "Magic isn't found in the grandiose; it's tucked quietly into the objects we touch every day. At DSoft Pack, we aim to infuse your rituals with a touch of this extraordinary comfort. Our throw blankets are designed not just for warmth, but for the feeling of being wrapped in something that was made with genuine care.\n\nThis is our promise to you: every thread is a deliberate act of intention.",
    image: '/06_elegant_living_space.jpg',
    reverse: true,
  },
  {
    id: 'sec-3',
    title: 'The Hands Behind the Magic',
    paragraph: 'Our collections are born in the hands of skilled artisans who have dedicated their lives to the craft of weaving. We partner with small family-run workshops, ensuring fair wages and a sustainable practice that honors both the maker and the material.\n\nWhen you choose DSoft Pack, you are not just buying a product. You are investing in a story of human connection, skill, and a shared love for beautiful things.',
    image: '/05_artisanal_weaving_loom.jpg',
    reverse: false,
  },
  {
    id: 'sec-4',
    title: 'A Vision of Calm',
    paragraph: 'Our design philosophy is rooted in a respect for natural beauty and a rejection of excess. We choose natural fibers, muted tones, and textures that speak of the earth. Our pieces are designed to age gracefully, becoming more beautiful with each year.\n\nWe believe a well-made object is the ultimate form of sustainability — something you keep not because you have to, but because you love it.',
    image: '/11_mediterranean_balcony_alt.jpg',
    reverse: true,
  },
];

async function getOrCreateOurStory() {
  let story = await prisma.ourStory.findUnique({ where: { id: 'global' } });
  if (!story) {
    story = await prisma.ourStory.create({
      data: {
        id: 'global',
        mainTitle: 'Born from Stillness,\nCrafted with Intention',
        subtitle: 'DSoft Pack began as a quiet idea — that the most beautiful things in life are made slowly, with care, and with love. We are a small, passionate team of makers, dreamers, and storytellers.',
        mainImage: '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(DEFAULT_STORY_SECTIONS),
      },
    });
  }

  let parsedSections = [];
  try {
    parsedSections = JSON.parse(story.sections || '[]');
    if (!Array.isArray(parsedSections) || parsedSections.length === 0) {
      parsedSections = DEFAULT_STORY_SECTIONS;
    }
  } catch {
    parsedSections = DEFAULT_STORY_SECTIONS;
  }

  return {
    ...story,
    sections: parsedSections,
  };
}

// GET /api/our-story — Public
async function getOurStory(req, res) {
  try {
    const story = await getOrCreateOurStory();
    res.json(story);
  } catch (error) {
    console.error('getOurStory error:', error);
    res.status(500).json({ error: 'Failed to load Our Story content.' });
  }
}

// PUT /api/our-story — Admin Only
async function updateOurStory(req, res) {
  try {
    const { mainTitle, subtitle, mainImage, sections } = req.body;

    if (!mainTitle || !mainTitle.trim()) {
      return res.status(400).json({ error: 'Main story title is required.' });
    }

    if (!subtitle || !subtitle.trim()) {
      return res.status(400).json({ error: 'Subtitle / description is required.' });
    }

    let sanitizedSections = [];
    if (Array.isArray(sections)) {
      sanitizedSections = sections.map((sec, idx) => ({
        id: sec.id || `sec-${idx + 1}-${Date.now()}`,
        title: (sec.title || '').trim() || `Section ${idx + 1}`,
        paragraph: (sec.paragraph || '').trim(),
        image: sec.image || '/01_cream_linen_fabrics.jpg',
        reverse: sec.reverse !== undefined ? Boolean(sec.reverse) : idx % 2 === 1,
      }));
    }

    const updated = await prisma.ourStory.upsert({
      where: { id: 'global' },
      update: {
        mainTitle: mainTitle.trim(),
        subtitle: subtitle.trim(),
        mainImage: mainImage || '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(sanitizedSections),
      },
      create: {
        id: 'global',
        mainTitle: mainTitle.trim(),
        subtitle: subtitle.trim(),
        mainImage: mainImage || '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(sanitizedSections),
      },
    });

    let returnSections = sanitizedSections;
    try {
      returnSections = JSON.parse(updated.sections);
    } catch {}

    res.json({
      message: 'Our Story updated successfully!',
      story: {
        ...updated,
        sections: returnSections,
      },
    });
  } catch (error) {
    console.error('updateOurStory error:', error);
    res.status(500).json({ error: 'Failed to save Our Story content.' });
  }
}

module.exports = { getOurStory, updateOurStory };
