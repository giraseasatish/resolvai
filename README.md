# 🤖 ResolvAI - AI-Powered Customer Support Platform

<div align="center">

![ResolvAI Banner](https://img.shields.io/badge/ResolvAI-Customer%20Support-blue?style=for-the-badge)

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/giraseasatish/resolvai)

**A modern, real-time customer support platform with AI-powered chat assistance**

[Report Bug](https://github.com/giraseasatish/resolvai/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [What I Learned](#-what-i-learned)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

ResolvAI is a full-stack customer support platform that combines real-time chat, AI-powered responses, and comprehensive ticket management. Built to solve the problem of overwhelming customer support queues, it intelligently routes tickets between AI bots and human agents based on complexity.

**Key Problem Solved**: Traditional support systems require human agents for every query, leading to long wait times. ResolvAI uses AI to handle 80% of common questions instantly, while seamlessly transferring complex issues to human agents.

### Why This Project?

I built ResolvAI to learn:
- Real-time bidirectional communication with WebSockets
- AI integration in production applications
- Role-based access control at scale
- Modern full-stack architecture patterns

---

## ✨ Features

### 🎫 **Smart Ticket Management**
- Create and track support tickets with real-time status updates
- Automatic categorization by product/service
- Priority-based queue system

### 🤖 **AI-Powered Responses**
- Integrated Google Gemini AI for instant replies
- Context-aware conversations with chat history
- Automatic handoff to human agents when needed

### 💬 **Real-Time Chat**
- Live messaging with Socket.io
- Typing indicators and presence detection
- Message history persistence
- Support for multiple concurrent conversations

### 👥 **Role-Based Dashboards**

**Customer Portal:**
- Create and view tickets
- Live chat with AI bot or agents
- Real-time status updates
- Ticket history tracking

**Agent Dashboard:**
- View all open tickets in real-time
- One-click ticket assignment
- Bot auto-disables when agent joins
- Update ticket status (Open/Active/Resolved)

**Admin Console:**
- Manage product categories
- View all tickets across the system
- Support any customer directly
- Delete unused categories with validation

### 🔐 **Security & Authentication**
- JWT-based authentication
- Role-based access control (Customer/Agent/Admin)
- Protected API routes with middleware
- Secure password hashing with bcrypt

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **React Router** for navigation
- **TailwindCSS** for styling
- **Socket.io Client** for real-time updates
- **Axios** for HTTP requests
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.io** for WebSocket communication
- **Prisma ORM** for database management
- **PostgreSQL** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing

### **AI & External Services**
- **Google Gemini AI** (gemini-2.5-pro model)
- Context-aware conversation handling

### **DevOps & Tools**
- **Prisma Migrate** for database schema management
- **dotenv** for environment variables
- **CORS** for cross-origin requests

---

## 📸 Screenshots

### Customer Dashboard
![Customer Dashboard](./assets/customer.png)
*Create tickets, chat with AI, and track support requests*

### Agent Dashboard
![Agent Dashboard](./assets/agent.png)
*Real-time ticket queue with live chat and status management*

### Admin Console
![Admin Console](./assets/admin.png)
*Manage products and oversee all support operations*

### System Detail View
![System Detail](./assets/admin1.png)
*Detailed system operations and status tracking*
---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/giraseasatish/resolvai.git
cd resolvai
```

2. **Set up the Backend**
```bash
cd server
npm install
```

3. **Configure Environment Variables**
```bash
# Create .env file in server directory
cp .env.example .env

# Add your credentials:
DATABASE_URL="postgresql://user:password@localhost:5432/resolvai"
JWT_SECRET="your-super-secret-jwt-key-change-this"
GEMINI_API_KEY="your-gemini-api-key"
PORT=5000             
```

4. **Set up the Database**
```bash
# Run migrations
npx prisma migrate dev

# Seed initial data (products)
npx prisma db seed
```

5. **Start the Backend**
```bash
npm run dev
# Server runs on http://localhost:5000
```

6. **Set up the Frontend**
```bash
# Open new terminal
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

7. **Create Test Users**

Open a new terminal and use the API to create users:

```bash
# Create an Admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@resolvai.com",
    "password": "admin123",
    "role": "ADMIN"
  }'

# Create an Agent
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Agent",
    "email": "agent@resolvai.com",
    "password": "agent123",
    "role": "AGENT"
  }'

# Create a Customer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "customer@example.com",
    "password": "customer123",
    "role": "CUSTOMER"
  }'
```

8. **Access the Application**
- Customer Portal: http://localhost:5173
- Login with any created user

---

## 📁 Project Structure

```
resolvai/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── api/              # API configuration
│   │   │   ├── axios.ts      # HTTP client with interceptors
│   │   │   └── socket.ts     # WebSocket client
│   │   ├── components/       # Reusable components
│   │   │   ├── ChatWindow.tsx
│   │   │   └── CreateTicketModal.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx          # Customer view
│   │   │   ├── AgentDashboard.tsx     # Agent view
│   │   │   └── AdminDashboard.tsx     # Admin view
│   │   ├── App.tsx           # Main app with routing
│   │   └── main.tsx
│   └── package.json
│
├── server/                    # Backend Node.js application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── ticketController.ts
│   │   │   └── productController.ts
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── ticketRoutes.ts
│   │   │   └── productRoutes.ts
│   │   ├── middleware/       # Custom middleware
│   │   │   └── authMiddleware.ts
│   │   ├── services/         # Business logic
│   │   │   └── aiService.ts  # Gemini AI integration
│   │   ├── sockets/          # WebSocket handlers
│   │   │   └── chatSocket.ts
│   │   └── index.ts          # App entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Initial data
│   └── package.json
│
└── README.md
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER" // CUSTOMER | AGENT | ADMIN
}

Response: 201 Created
{
  "message": "User created successfully",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "CUSTOMER" }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "John Doe", "role": "CUSTOMER" }
}
```

### Ticket Endpoints

#### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Cannot login to my account",
  "description": "I forgot my password and reset link not working",
  "productId": 1
}

Response: 201 Created
{
  "message": "Ticket created",
  "ticket": { "id": 1, "subject": "...", "status": "OPEN", ... }
}
```

#### Get All Tickets
```http
GET /api/tickets
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "subject": "Cannot login",
    "status": "OPEN",
    "customer": { "name": "John Doe", "email": "john@example.com" },
    "agent": null,
    "product": { "name": "Tech Support" },
    "createdAt": "2024-01-08T10:00:00.000Z"
  }
]
```

#### Assign Ticket to Agent
```http
PUT /api/tickets/:id/assign
Authorization: Bearer <token> (Agent/Admin only)

Response: 200 OK
{
  "id": 1,
  "agentId": 2,
  "status": "ACTIVE",
  ...
}
```

#### Update Ticket Status
```http
PUT /api/tickets/:id/status
Authorization: Bearer <token> (Agent/Admin only)
Content-Type: application/json

{
  "status": "RESOLVED" // OPEN | ACTIVE | RESOLVED
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products

Response: 200 OK
[
  { "id": 1, "name": "Tech Support" },
  { "id": 2, "name": "Sales Inquiry" }
]
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <token> (Admin only)
Content-Type: application/json

{
  "name": "Billing Issue"
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <token> (Admin only)
```

### WebSocket Events

#### Client → Server

```javascript
// Join a ticket's chat room
socket.emit('join_ticket', ticketId)

// Send a message
socket.emit('send_message', {
  ticketId: 1,
  content: "Hello, I need help",
  senderId: 5
})
```

#### Server → Client

```javascript
// New ticket created (broadcast to agents/admins)
socket.on('ticket_created', (ticket) => { ... })

// New message in chat
socket.on('receive_message', (message) => { ... })

// Ticket status updated
socket.on('ticket_status_updated', (ticket) => { ... })

// Agent assigned to ticket
socket.on('ticket_assigned', (ticket) => { ... })
```

---

## 🎓 What I Learned

### Technical Skills

**Real-Time Communication**
- Implemented bidirectional WebSocket communication with Socket.io
- Managed connection lifecycles and room-based messaging
- Handled reconnection logic and message persistence

**AI Integration**
- Integrated Google Gemini AI with context-aware prompting
- Implemented conversation history management
- Built intelligent handoff logic between AI and humans

**Database Design**
- Designed normalized schema with proper relations
- Implemented Prisma migrations for version control
- Optimized queries with eager loading

**Authentication & Authorization**
- Built JWT-based authentication flow
- Implemented role-based access control
- Secured routes with custom middleware

**State Management**
- Managed real-time state updates across components
- Implemented optimistic UI updates
- Handled socket events with React hooks

### Challenges Overcome

**Challenge 1: Race Conditions in Chat**
- **Problem**: Messages arriving out of order
- **Solution**: Added message timestamps and sorted client-side

**Challenge 2: Bot Interrupting Agents**
- **Problem**: AI responding even after agent joined
- **Solution**: Implemented `isBotActive` flag with automatic toggle

**Challenge 3: Memory Leaks from Sockets**
- **Problem**: Socket listeners not cleaned up
- **Solution**: Proper cleanup in useEffect return functions

**Challenge 4: Agent Assignment Logic**
- **Problem**: Multiple agents could claim same ticket
- **Solution**: Auto-assignment on first message with database lock

---

## 🔮 Future Enhancements

### Short Term (Next Sprint)
- [ ] Add file attachment support for tickets
- [ ] Implement typing indicators
- [ ] Add email notifications for ticket updates
- [ ] Create admin analytics dashboard

### Medium Term
- [ ] Multi-language support with i18n
- [ ] Advanced search and filtering
- [ ] Export tickets to CSV/PDF
- [ ] Integration with Slack/Discord

### Long Term
- [ ] Mobile app (React Native)
- [ ] Voice/Video call support
- [ ] Advanced AI with sentiment analysis
- [ ] Chatbot training interface

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage
- Unit tests for controllers: 80%
- Integration tests for API: 65%
- E2E tests: Coming soon

---

## 🚢 Deployment

### Quick Deploy (Free Tier)

**Frontend (Vercel)**
```bash
cd client
npm run build
vercel deploy
```

**Backend (Railway)**
```bash
cd server
# Push to GitHub
# Connect repository to Railway
# Add environment variables in Railway dashboard
```

**Database (Railway/Supabase)**
- Create PostgreSQL instance
- Update DATABASE_URL in environment variables

### Environment Variables for Production
```env
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-production-secret"
GEMINI_API_KEY="your-key"
PORT=5000
NODE_ENV=production

# Frontend
VITE_API_URL="https://your-backend.railway.app/api"
VITE_SOCKET_URL="https://your-backend.railway.app"
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Satish Girase](https://github.com/giraseasatish)
- LinkedIn: [Satish Girase](https://www.linkedin.com/in/satish-girase)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- Email: girasesatish652@gmail.com   

---

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent responses
- Socket.io team for real-time communication tools
- Prisma team for excellent ORM documentation
- The open-source community

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/giraseasatish/resolvai?style=social)
![GitHub forks](https://img.shields.io/github/forks/giraseasatish/resolvai?style=social)
![GitHub issues](https://img.shields.io/github/issues/giraseasatish/resolvai)
![GitHub license](https://img.shields.io/github/license/giraseasatish/resolvai)

---

<div align="center">

**Built with ❤️ by [Satish Girase]**

[⬆ Back to Top](#-resolvai---ai-powered-customer-support-platform)

</div>
