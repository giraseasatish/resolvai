// client/src/pages/AgentDashboard.tsx

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { socket } from '../api/socket';

interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  agent?: {
    id: number;
    name: string;
  } | null;
  product?: {
    name: string;
  };
}

const AgentDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // --- 1. Fetch & Listen for Tickets ---
  useEffect(() => {
    // A. Fetch initial list from DB
    const fetchAllTickets = async () => {
      try {
        const res = await api.get('/tickets');
        setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets");
      }
    };
    fetchAllTickets();

    // B. Real-Time Socket Listeners
    if (!socket.connected) socket.connect();

    // Listen for new tickets
    socket.on('ticket_created', (newTicket: Ticket) => {
      setTickets((prevTickets) => [newTicket, ...prevTickets]);
    });

    // Listen for status updates
    socket.on('ticket_status_updated', (updatedTicket: Ticket) => {
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    });

    // Listen for ticket assignments
    socket.on('ticket_assigned', (updatedTicket: Ticket) => {
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('ticket_created');
      socket.off('ticket_status_updated');
      socket.off('ticket_assigned');
    };
  }, []);

  // --- 2. Handlers ---
  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicketId) return;
    try {
      await api.put(`/tickets/${selectedTicketId}/status`, { status: newStatus });
      
      // Update handled by socket listener, but we can do optimistic update
      setTickets(tickets.map(t => 
        t.id === selectedTicketId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicketId) return;
    try {
      await api.put(`/tickets/${selectedTicketId}/assign`);
      
      // Optimistic update
      setTickets(tickets.map(t => 
        t.id === selectedTicketId ? { 
          ...t, 
          agent: { id: user.id, name: user.name },
          status: 'ACTIVE'
        } : t
      ));
    } catch (err) {
      alert("Failed to assign ticket");
    }
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex h-screen bg-gray-900">
      
      {/* LEFT SIDEBAR: Ticket List */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-400" />
            <h2 className="font-bold text-lg">Agent Console</h2>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {tickets.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>No tickets yet</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-4 mb-2 rounded-lg cursor-pointer transition border ${
                  selectedTicketId === ticket.id 
                    ? 'bg-gray-700 border-green-500' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white truncate w-2/3" title={ticket.subject}>
                    {ticket.subject}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === 'OPEN' ? 'bg-green-900 text-green-300' 
                    : ticket.status === 'RESOLVED' ? 'bg-blue-900 text-blue-300'
                    : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Product Badge & Customer Name */}
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded border border-purple-700">
                    {ticket.product?.name || 'General'}
                  </span>
                  <span className="text-gray-400">
                    {ticket.customer?.name || ticket.customer?.email}
                  </span>
                </div>

                {/* Agent Assignment Indicator */}
                {ticket.agent && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <UserCheck size={12} />
                    <span>{ticket.agent.name}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat + Actions */}
      <div className="flex-1 flex flex-col h-full bg-gray-100">
        {selectedTicketId && selectedTicket ? (
          <>
            {/* ACTION BAR */}
            <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm h-16">
              <div>
                <h3 className="font-bold text-gray-700">Ticket #{selectedTicketId}</h3>
                {selectedTicket.agent && (
                  <p className="text-xs text-gray-500">
                    Assigned to: {selectedTicket.agent.name}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Assign to Me Button */}
                {!selectedTicket.agent || selectedTicket.agent.id !== user.id ? (
                  <button 
                    onClick={handleAssignToMe}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium transition flex items-center gap-2"
                  >
                    <UserCheck size={16} />
                    Assign to Me
                  </button>
                ) : null}

                <button 
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition"
                >
                  ✅ Mark Resolved
                </button>
                <button 
                  onClick={() => handleStatusChange('OPEN')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium transition"
                >
                  🔄 Re-open
                </button>
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-hidden relative">
              <ChatWindow ticketId={selectedTicketId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-20" />
            <p className="text-xl">Select a ticket to start supporting</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AgentDashboard;