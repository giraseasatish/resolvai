// client/src/pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, MessageSquare } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import CreateTicketModal from '../components/CreateTicketModal';
import { socket } from '../api/socket';

interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  agent?: {
    id: number;
    name: string;
  } | null;
  product?: {
    name: string;
  };
}

const Dashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch tickets function
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and socket setup
  useEffect(() => {
    fetchTickets();

    // Connect socket
    if (!socket.connected) socket.connect();

    // Listen for status updates (so customer sees when ticket is resolved)
    socket.on('ticket_status_updated', (updatedTicket: Ticket) => {
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    });

    // Listen for ticket assignments (so customer sees who's helping)
    socket.on('ticket_assigned', (updatedTicket: Ticket) => {
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
    });

    return () => {
      socket.off('ticket_status_updated');
      socket.off('ticket_assigned');
    };
  }, []);

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      
      {/* LEFT SIDEBAR: Ticket List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-700">My Tickets</h2>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700" title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        {/* List of Tickets */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center mt-4 text-gray-500">Loading...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center mt-10 text-gray-400">
              <p>No tickets yet.</p>
              <p className="text-sm mt-2">Click "New Ticket" below to get started</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-4 mb-2 border rounded-lg cursor-pointer transition ${
                  selectedTicketId === ticket.id ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 flex-1 truncate" title={ticket.subject}>
                    {ticket.subject}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap ${
                    ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' 
                    : ticket.status === 'RESOLVED' ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                {/* Product & Date */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {ticket.product?.name || 'General'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Agent Assignment */}
                {ticket.agent && (
                  <div className="mt-2 text-xs text-gray-600">
                    📞 Agent: {ticket.agent.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Button */}
        <div className="p-4 border-t">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            <PlusCircle size={20} />
            New Ticket
          </button>
        </div>

      </div>

      {/* RIGHT SIDE: Chat Placeholder or Active Window */}
      <div className="flex-1 flex flex-col h-full">
        {selectedTicketId ? (
          <ChatWindow ticketId={selectedTicketId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-20" />
            <p className="text-xl">Select a ticket to view conversation</p>
          </div>
        )}
      </div>

      {/* MODAL COMPONENT */}
      <CreateTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTickets}
      />

    </div>
  );
};

export default Dashboard;