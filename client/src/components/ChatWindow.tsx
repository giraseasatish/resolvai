// client/src/components/ChatWindow.tsx

import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { socket } from '../api/socket';
import { Send, Bot, User, Loader2 } from 'lucide-react'; // <--- Added Loader2

interface Message {
  id: number;
  content: string;
  senderId: number | null; // null = AI/Bot
  createdAt: string;
}

interface ChatWindowProps {
  ticketId: number;
}

const ChatWindow = ({ ticketId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- NEW: Typing State ---
  const [isTyping, setIsTyping] = useState(false);
  const [typerName, setTyperName] = useState('');
  const typingTimeoutRef = useRef<any>(null); // To detect when they stop
  // -------------------------

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch History & Join Room
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tickets/${ticketId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // Connect Socket
    if (!socket.connected) socket.connect();
    socket.emit('join_ticket', ticketId.toString());

    // Listen for incoming messages
    const handleNewMessage = (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false); // Hide indicator if they send the message
    };

    // --- NEW: Listen for Typing Events ---
    const handleDisplayTyping = (data: any) => {
      if (data.typerName !== user.name) {
        setTyperName(data.typerName);
        setIsTyping(true);
      }
    };

    const handleHideTyping = () => {
      setIsTyping(false);
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('display_typing', handleDisplayTyping);
    socket.on('hide_typing', handleHideTyping);

    // Cleanup when user switches tickets
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('display_typing', handleDisplayTyping);
      socket.off('hide_typing', handleHideTyping);
    };
  }, [ticketId]);

  // 2. Auto-scroll to bottom (Updated to scroll when Typing appears too)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- NEW: Handle Input Change (Triggers Typing Event) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // 1. Tell server "I am typing"
    socket.emit('typing', { ticketId, name: user.name });

    // 2. Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 3. Set a new timeout to Stop Typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { ticketId });
    }, 2000);
  };

  // 3. Send Message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Stop typing immediately when sent
    socket.emit('stop_typing', { ticketId });

    // Send to Socket (Backend will save it)
    socket.emit('send_message', {
      ticketId,
      content: input,
      senderId: user.id
    });

    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            const isBot = msg.senderId === null;
            const isAgent = !isMe && !isBot; // Any other user

            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 
                  isBot ? 'bg-purple-100 text-purple-900 border border-purple-200 rounded-bl-none' :
                  'bg-green-100 text-green-900 border border-green-200 rounded-bl-none'
                }`}>
                  {/* Sender Label */}
                  {isBot && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot size={14} className="text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">ResolvAI Bot</span>
                    </div>
                  )}
                  {isAgent && (
                    <div className="flex items-center gap-1 mb-1">
                      <User size={14} className="text-green-600" />
                      <span className="text-xs font-bold text-green-600">Support Agent</span>
                    </div>
                  )}
                  
                  {/* Message Content */}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Timestamp */}
                  <span className={`text-[10px] block mt-1 ${
                    isMe ? 'text-blue-100' : 
                    isBot ? 'text-purple-400' :
                    'text-green-600'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* --- NEW: Typing Indicator Bubble --- */}
        {isTyping && (
           <div className="flex justify-start animate-pulse">
             <div className="bg-gray-200 text-gray-500 text-xs px-3 py-2 rounded-full flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                {typerName} is typing...
             </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange} // <--- Updated Handler
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;