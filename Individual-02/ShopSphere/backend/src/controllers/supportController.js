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
    if (!['support', 'admin'].includes(req.user.role)) {
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

    if (!['support', 'admin'].includes(req.user.role) && String(ticket.user) !== String(req.user._id)) {
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
    const validCategories = ['Order Issue', 'Payment Issue', 'Delivery Issue', 'Return Issue', 'Product Issue', 'Other'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validCategories.includes(category || 'Order Issue') || !validPriorities.includes(priority || 'MEDIUM')) {
      return res.status(400).json({ success: false, message: 'Select a valid ticket category and priority' });
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

    if (!['support', 'admin'].includes(req.user.role) && String(ticket.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this ticket' });
    }
    if (['support', 'admin'].includes(req.user.role) && ['RESOLVED', 'CLOSED'].includes(ticket.status)) {
      return res.status(409).json({ success: false, message: 'This ticket is closed. Reopen it before replying.' });
    }

    const senderName = req.user.name;
    const senderRole = req.user.role;

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
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket status' });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket priority' });
    }
    if (assignedTo !== undefined && typeof assignedTo !== 'string') {
      return res.status(400).json({ success: false, message: 'Assigned agent must be a string' });
    }
    if (status) update.status = status;
    if (priority) update.priority = priority;
    if (assignedTo !== undefined) update.assignedTo = assignedTo.trim();
    if (!Object.keys(update).length) return res.status(400).json({ success: false, message: 'No ticket changes were provided' });

    const updated = await SupportTicket.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket: toPlain(updated) },
    });
  } catch (err) {
    next(err);
  }
}
