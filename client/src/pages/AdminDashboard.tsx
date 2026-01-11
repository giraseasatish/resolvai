// client/src/pages/AdminDashboard.tsx

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Server, Ticket as TicketIcon, Trash2, UserCheck } from 'lucide-react';
import { socket } from '../api/socket';
import ChatWindow from '../components/ChatWindow';

interface Product {
  id: number;
  name: string;
}

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

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'tickets'>('products');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadTickets();

    // Connect socket for real-time updates
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

    return () => {
      socket.off('ticket_created');
      socket.off('ticket_status_updated');
      socket.off('ticket_assigned');
    };
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/products', { name: newProduct });
      setProducts([...products, res.data]);
      setNewProduct('');
    } catch (err: any) {
      console.error("Failed to add product:", err);
      alert(err.response?.data?.message || "Failed to add product. Make sure you're logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product. It may be in use by tickets.");
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
      setTickets(tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex h-screen bg-gray-900">
      
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Server className="text-purple-400" />
            <h2 className="font-bold text-lg">Admin Console</h2>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 p-3 font-medium transition ${
              activeTab === 'products' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Server className="inline mr-2" size={18} />
            Products
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 p-3 font-medium transition ${
              activeTab === 'tickets' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <TicketIcon className="inline mr-2" size={18} />
            All Tickets ({tickets.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'products' ? (
            // PRODUCTS TAB
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">Manage Product Categories</h3>
              
              {/* Add Product Form */}
              <form onSubmit={handleAddProduct} className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Server Issues" 
                    className="flex-1 p-3 rounded bg-gray-900 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-bold flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} /> {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>

              {/* Products List */}
              <div className="space-y-2">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No products yet</p>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="p-3 bg-gray-700 rounded flex justify-between items-center group">
                      <div>
                        <span className="font-medium text-white">{p.name}</span>
                        <span className="text-xs text-gray-400 ml-2">ID: {p.id}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // TICKETS TAB
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">All Support Tickets</h3>
              
              {tickets.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tickets yet</p>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-4 rounded-lg cursor-pointer transition border ${
                        selectedTicketId === ticket.id 
                          ? 'bg-gray-700 border-purple-500' 
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white truncate flex-1" title={ticket.subject}>
                          {ticket.subject}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          ticket.status === 'OPEN' ? 'bg-green-900 text-green-300' 
                          : ticket.status === 'RESOLVED' ? 'bg-blue-900 text-blue-300'
                          : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      {/* Product & Customer */}
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded border border-purple-700">
                          {ticket.product?.name || 'General'}
                        </span>
                        <span className="text-gray-400">
                          {ticket.customer?.name}
                        </span>
                      </div>

                      {/* Agent Assignment */}
                      {ticket.agent && (
                        <div className="flex items-center gap-1 text-xs text-green-400 mt-2">
                          <UserCheck size={12} />
                          <span>Agent: {ticket.agent.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat or Info */}
      <div className="flex-1 flex flex-col h-full bg-gray-100">
        {selectedTicketId && selectedTicket && activeTab === 'tickets' ? (
          <>
            {/* ACTION BAR */}
            <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-gray-700">Ticket #{selectedTicketId}</h3>
                <p className="text-xs text-gray-500">
                  Customer: {selectedTicket.customer.name} ({selectedTicket.customer.email})
                </p>
                {selectedTicket.agent && (
                  <p className="text-xs text-gray-500">
                    Agent: {selectedTicket.agent.name}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange(selectedTicketId, 'RESOLVED')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition"
                >
                  ✅ Resolve
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedTicketId, 'OPEN')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm font-medium transition"
                >
                  🔄 Re-open
                </button>
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow ticketId={selectedTicketId} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            {activeTab === 'products' ? (
              <>
                <Server size={64} className="mb-4 opacity-20" />
                <p className="text-xl">Manage Product Categories</p>
                <p className="text-sm mt-2">Add or remove support categories for your team</p>
              </>
            ) : (
              <>
                <TicketIcon size={64} className="mb-4 opacity-20" />
                <p className="text-xl">Select a ticket to view details</p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
