// frontend/src/components/support/SupportDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supportService } from '../../services/supportService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Headphones,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  User,
  Shield,
  Tag,
} from 'lucide-react';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form states
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [activeTab, setActiveTab] = useState('conversation'); // 'conversation' | 'notes'
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportService.getTickets({
        status: statusFilter,
        priority: priorityFilter,
      });
      setTickets(data);
      if (selectedTicket) {
        const refreshed = data.find((t) => t._id === selectedTicket._id);
        if (refreshed) setSelectedTicket(refreshed);
      } else if (data.length > 0) {
        setSelectedTicket(data[0]);
      }
    } catch (e) {
      console.warn('Support ticket load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const updated = await supportService.addMessage(selectedTicket._id, replyMessage);
      setSelectedTicket(updated);
      setReplyMessage('');
      await loadTickets();
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const updated = await supportService.addInternalNote(selectedTicket._id, internalNote);
      setSelectedTicket(updated);
      setInternalNote('');
      await loadTickets();
    } catch (err) {
      alert('Failed to save note: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await supportService.updateTicket(selectedTicket._id, { status: newStatus });
      setSelectedTicket(updated);
      await loadTickets();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!selectedTicket) return;
    try {
      const updated = await supportService.updateTicket(selectedTicket._id, { priority: newPriority });
      setSelectedTicket(updated);
      await loadTickets();
    } catch (err) {
      alert('Failed to update priority: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Support Workspace</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer inquiries, dispute mediation, ticket resolution, and internal notes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Main 2-Col Layout: Ticket List & Ticket Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
            <span>Customer Tickets ({tickets.length})</span>
            <button onClick={loadTickets} className="text-slate-400 hover:text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="p-8 text-center text-slate-400">No support tickets found.</p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedTicket?._id === t._id
                      ? 'bg-sky-50/70 border-l-4 border-sky-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-slate-500 font-semibold">{t.ticketNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">Customer: {t.userName}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-600">{t.category}</span>
                    <span className="font-bold text-slate-700">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details & Conversation (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6 text-xs">
          {!selectedTicket ? (
            <div className="py-20 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Select a support ticket to view conversation history</p>
            </div>
          ) : (
            <>
              {/* Ticket Top Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-500">{selectedTicket.ticketNumber}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {selectedTicket.category}
                    </span>
                    {selectedTicket.relatedOrder && (
                      <span className="text-slate-400 text-[11px]">
                        Order: <strong>{selectedTicket.relatedOrder}</strong>
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h2>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Customer: <strong className="text-slate-700">{selectedTicket.userName}</strong> &bull; Assigned to: {selectedTicket.assignedTo || 'Unassigned'}
                  </p>
                </div>

                {/* Status & Priority Controls */}
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-tabs: Conversation vs Internal Notes */}
              <div className="flex gap-2 border-b border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeTab === 'conversation'
                      ? 'border-sky-600 text-sky-700'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  Customer Thread ({selectedTicket.messages?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeTab === 'notes'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  Internal Notes ({selectedTicket.internalNotes?.length || 0})
                </button>
              </div>

              {/* Thread Tab */}
              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {selectedTicket.messages?.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          msg.senderRole === 'support' || msg.senderRole === 'admin'
                            ? 'bg-sky-50/60 border-sky-100 ml-4'
                            : 'bg-slate-50 border-slate-200/80 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{msg.sender} ({msg.senderRole})</span>
                          <span className="text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 space-y-2">
                    <textarea
                      rows={3}
                      required
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your response to the customer..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending || !replyMessage.trim()}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Internal Notes Tab (Agent-only) */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                    Internal notes are confidential and never shown to the customer.
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedTicket.internalNotes?.length === 0 ? (
                      <p className="text-slate-400 py-4 text-center">No internal notes logged yet.</p>
                    ) : (
                      selectedTicket.internalNotes?.map((note, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-800">{note.author}</span>
                            <span>{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="pt-2 border-t border-slate-100 space-y-2">
                    <textarea
                      rows={2}
                      required
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Add an internal agent note regarding this ticket..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending || !internalNote.trim()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold shadow-xs"
                      >
                        {sending ? 'Saving...' : 'Record Note'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
