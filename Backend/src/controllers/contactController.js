const prisma = require('../config/prisma');
const { sendContactReplyEmail } = require('../services/emailService');

// POST /api/contact — Customer submits a message (public)
async function submitMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'UNREAD',
      },
    });
    res.status(201).json({ success: true, message: 'Message received! We will respond within 24 hours.', id: contact.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/contact — Admin: list all messages with reply counts
async function getMessages(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: {
          replies: { orderBy: { createdAt: 'asc' } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({ messages, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/contact/stats — Admin: unread/replied counts for badge
async function getStats(req, res) {
  try {
    const [unread, read, replied, archived, total] = await Promise.all([
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.contactMessage.count({ where: { status: 'READ' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      prisma.contactMessage.count({ where: { status: 'ARCHIVED' } }),
      prisma.contactMessage.count(),
    ]);
    res.json({ unread, read, replied, archived, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/contact/:id — Admin: get single message + mark as READ
async function getMessage(req, res) {
  try {
    const { id } = req.params;
    const msg = await prisma.contactMessage.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    // Auto-mark as READ if it was UNREAD
    if (msg.status === 'UNREAD') {
      await prisma.contactMessage.update({ where: { id }, data: { status: 'READ' } });
      msg.status = 'READ';
    }

    res.json({ message: msg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/contact/:id/status — Admin: change status
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const updated = await prisma.contactMessage.update({ where: { id }, data: { status } });
    res.json({ message: 'Status updated', contact: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/contact/:id/reply — Admin: reply to message
async function replyToMessage(req, res) {
  try {
    const { id } = req.params;
    const { body } = req.body;
    if (!body?.trim()) {
      return res.status(400).json({ error: 'Reply body is required.' });
    }
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    const reply = await prisma.messageReply.create({
      data: { messageId: id, body: body.trim() },
    });

    // Mark message as REPLIED
    await prisma.contactMessage.update({
      where: { id },
      data: { status: 'REPLIED' },
    });

    // Send email to customer via SMTP
    const emailResult = await sendContactReplyEmail({
      toEmail: msg.email,
      customerName: msg.name,
      originalSubject: msg.subject,
      replyBody: body.trim(),
    });

    res.status(201).json({
      success: true,
      reply,
      emailSent: emailResult.success,
      emailReason: emailResult.reason || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/contact/:id — Admin: delete message
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { submitMessage, getMessages, getStats, getMessage, updateStatus, replyToMessage, deleteMessage };
