import { SupportTicket, AuditLog } from '../models/index.js';
import { toPlain } from '../utils/toPlain.js';

export async function getTickets(req, res, next) {
  try {
    const { status, priority, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Customer can only view their own tickets
    if (req.user && req.user.role === 'customer') {
      filter.user = req.user._id;
    }

    const tickets = await SupportTicket.find(filter);
    tickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      data: { tickets: toPlain(tickets) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(req, res, next) {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (req.user && req.user.role === 'customer' && String(ticket.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this ticket' });
    }

    res.json({
      success: true,
      data: { ticket: toPlain(ticket) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTicket(req, res, next) {
  try {
    const { subject, category, message, priority, relatedOrder } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and initial message are required' });
    }

    const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;
    const newTicket = await SupportTicket.create({
      ticketNumber,
      user: userId,
      userName,
      subject,
      category: category || 'Order Issue',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'Support Team',
      relatedOrder: relatedOrder || '',
      messages: [
        {
          sender: userName,
          senderRole: req.user ? req.user.role : 'customer',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ],
      internalNotes: [],
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket opened successfully',
      data: { ticket: toPlain(newTicket) },
    });
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const senderName = req.user ? req.user.name : 'Support Agent';
    const senderRole = req.user ? req.user.role : 'support';

    const newMessage = {
      sender: senderName,
      senderRole,
      content,
      timestamp: new Date().toISOString(),
    };

    const messages = [...(ticket.messages || []), newMessage];
    const update = { messages };

    // Auto update status if customer or agent replied
    if (senderRole === 'support' && ticket.status === 'OPEN') {
      update.status = 'IN_PROGRESS';
    }

    await SupportTicket.findByIdAndUpdate(req.params.id, { $set: update });
    const updated = await SupportTicket.findById(req.params.id);

    res.json({
      success: true,
      message: 'Message sent',
      data: { ticket: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}

export async function addInternalNote(req, res, next) {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const author = req.user ? req.user.name : 'Support Agent';
    const internalNotes = [
      ...(ticket.internalNotes || []),
      {
        author,
        note,
        timestamp: new Date().toISOString(),
      },
    ];

    await SupportTicket.findByIdAndUpdate(req.params.id, { $set: { internalNotes } });
    const updated = await SupportTicket.findById(req.params.id);

    res.json({
      success: true,
      message: 'Internal note recorded',
      data: { ticket: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const { status, priority, assignedTo } = req.body;
    const update = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (assignedTo) update.assignedTo = assignedTo;

    const updated = await SupportTicket.findByIdAndUpdate(req.params.id, { $set: update });
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}