import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTicketModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Products when modal opens
  useEffect(() => {
    if (isOpen) {
      api.get('/products')
        .then(res => setProducts(res.data))
        .catch(err => console.error("Failed to load products"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return alert("Please select a product category");
    
    setLoading(true);
    try {
      await api.post('/tickets', {
        subject,
        description,
        productId: Number(selectedProductId) // Send the real ID now
      });

      setSubject('');
      setDescription('');
      setSelectedProductId('');
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">New Support Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New Product Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category / Product</label>
            <select
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
            >
              <option value="">-- Select a Category --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              required
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;