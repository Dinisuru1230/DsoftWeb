const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get approved reviews for a specific product (Public)
async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

    res.json({
      reviews,
      totalReviews,
      averageRating: parseFloat(averageRating),
    });
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

// Submit a review for a product (Customer / Public)
async function createReview(req, res) {
  try {
    const { productId } = req.params;
    const { userName, userEmail, rating, comment } = req.body;

    if (!userName || !comment) {
      return res.status(400).json({ error: 'Name and review comment are required.' });
    }

    const ratingNum = parseInt(rating) || 5;
    const validRating = Math.min(Math.max(ratingNum, 1), 5);

    const newReview = await prisma.review.create({
      data: {
        productId,
        userName: userName.trim(),
        userEmail: userEmail ? userEmail.trim() : null,
        rating: validRating,
        comment: comment.trim(),
        status: 'APPROVED', // Default approved so it shows immediately
      },
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

// Get all reviews for Admin Panel (Admin)
async function getAllReviews(req, res) {
  try {
    const { status, productId, search } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { comment: { contains: search } },
        { product: { name: { contains: search } } },
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            categoryName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

// Admin creates a review for a product
async function createAdminReview(req, res) {
  try {
    const { productId, userName, userEmail, rating, comment, status } = req.body;

    if (!productId || !userName || !comment) {
      return res.status(400).json({ error: 'Product, Author Name, and Comment are required.' });
    }

    const ratingNum = parseInt(rating) || 5;
    const validRating = Math.min(Math.max(ratingNum, 1), 5);

    const newReview = await prisma.review.create({
      data: {
        productId,
        userName: userName.trim(),
        userEmail: userEmail ? userEmail.trim() : null,
        rating: validRating,
        comment: comment.trim(),
        status: status || 'APPROVED',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating admin review:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
}

// Admin updates review status (APPROVED, REJECTED, PENDING)
async function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    res.json(updatedReview);
  } catch (err) {
    console.error('Error updating review status:', err);
    res.status(500).json({ error: 'Failed to update review status' });
  }
}

// Admin deletes a review
async function deleteReview(req, res) {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
}

module.exports = {
  getProductReviews,
  createReview,
  getAllReviews,
  createAdminReview,
  updateReviewStatus,
  deleteReview,
};
