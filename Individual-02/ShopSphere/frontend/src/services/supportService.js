import { api } from './api.js';

export const supportService = {
  getTickets: async (params = {}) => {
    const response = await api.get('/support/tickets', { params });
    return response.data?.tickets || [];
  },

  getTicketById: async (id) => {
    const response = await api.get(`/support/tickets/${id}`);
    return response.data?.ticket;
  },

  createTicket: async (ticketData) => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data?.ticket;
  },

  addMessage: async (ticketId, content) => {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { content });
    return response.data?.ticket;
  },

  addInternalNote: async (ticketId, note) => {
    const response = await api.post(`/support/tickets/${ticketId}/notes`, { note });
    return response.data?.ticket;
  },

  updateTicket: async (ticketId, updateData) => {
    const response = await api.patch(`/support/tickets/${ticketId}`, updateData);
    return response.data?.ticket;
  },
};
