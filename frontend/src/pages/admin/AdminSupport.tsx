import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Search, Tag, Clock, ChevronRight, X, Send, AlertCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchAllTickets, fetchTicketDetails, addMessage, clearCurrentTicket, updateTicketStatus } from '../../features/support/supportSlice';

const AdminSupport = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, currentTicket, currentMessages, loading } = useSelector((state: RootState) => state.support);
  
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAllTickets());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTicketId) {
      dispatch(fetchTicketDetails({ id: selectedTicketId, isAdmin: true }));
    } else {
      dispatch(clearCurrentTicket());
    }
  }, [selectedTicketId, dispatch]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicketId) return;
    
    await dispatch(addMessage({
      id: selectedTicketId,
      message: replyMessage,
      isAdmin: true
    }));
    
    setReplyMessage('');
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTicketId) return;
    const status = e.target.value;
    await dispatch(updateTicketStatus({ id: selectedTicketId, status }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'bg-gray-100 text-gray-600';
      case 'MEDIUM': return 'bg-blue-100 text-blue-600';
      case 'HIGH': return 'bg-orange-100 text-orange-600';
      case 'CRITICAL': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
            Admin Support Desk
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and resolve all customer and partner support tickets</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Ticket List */}
        <div className={`w-full lg:w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${selectedTicketId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tickets by ID or subject..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-gray-900 font-medium">No active tickets</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">All support requests have been resolved.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <li 
                    key={ticket.id} 
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicketId === ticket.id ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                    <p className="text-xs text-gray-500 mb-2">#{ticket.id} • {ticket.category} • User: {ticket.user?.fullName || 'Unknown'}</p>
                    <div className="flex items-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} Priority
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Ticket Details / Chat Area */}
        <div className={`w-full lg:w-2/3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${!selectedTicketId ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedTicketId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
              <div className="bg-gray-100 p-6 rounded-full mb-6 shadow-inner">
                <MessageSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a ticket to respond</h3>
              <p className="text-gray-500 max-w-sm">Choose a ticket from the list to view its details, update its status, and message the user.</p>
            </div>
          ) : currentTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-col shadow-sm">
                <div className="flex items-center mb-3 lg:hidden">
                  <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg mr-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <span className="text-sm font-medium text-gray-600">Back to tickets</span>
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{currentTicket.subject}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center"><Tag className="h-4 w-4 mr-1.5 text-gray-400" /> Ticket #{currentTicket.id}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{currentTicket.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>User: {currentTicket.user?.fullName}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Created {new Date(currentTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <select 
                      value={currentTicket.status}
                      onChange={handleStatusChange}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${getStatusColor(currentTicket.status)}`}
                    >
                      <option value="OPEN" className="bg-white text-gray-800">OPEN</option>
                      <option value="IN_PROGRESS" className="bg-white text-gray-800">IN PROGRESS</option>
                      <option value="RESOLVED" className="bg-white text-gray-800">RESOLVED</option>
                      <option value="CLOSED" className="bg-white text-gray-800">CLOSED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 space-y-6 custom-scrollbar">
                {/* Initial Description */}
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 shadow-sm border border-gray-300">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                      <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{currentTicket.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-2 block ml-1">{new Date(currentTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Replies */}
                {currentMessages.map((msg) => {
                  const isAdmin = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN';
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm border ${
                        isAdmin 
                          ? 'bg-blue-600 text-white border-blue-700' 
                          : 'bg-gray-200 text-gray-600 border-gray-300'
                      }`}>
                        {isAdmin ? 'A' : 'U'}
                      </div>
                      <div className={`flex-1 max-w-[85%] ${isAdmin ? 'flex flex-col items-end' : ''}`}>
                        <div className={`p-4.5 shadow-sm border ${
                          isAdmin 
                            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none border-blue-700' 
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border-gray-100'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-1">
                          <span className="text-xs font-medium text-gray-500">{isAdmin ? 'You' : msg.sender.fullName}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              {currentTicket.status !== 'CLOSED' && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendReply} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply to the user..."
                        className="w-full resize-none border border-gray-300 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow min-h-[50px] max-h-[150px]"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(e);
                          }
                        }}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!replyMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center shrink-0 h-[50px] w-[50px]"
                    >
                      <Send className="h-5 w-5 ml-0.5" />
                    </button>
                  </form>
                </div>
              )}
              {currentTicket.status === 'CLOSED' && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                  <p className="text-sm text-gray-500 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-1.5" />
                    This ticket is closed and cannot receive new replies unless you change its status.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
              Loading ticket details...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
