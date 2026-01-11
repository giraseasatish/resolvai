// client/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup'; // <--- 1. Import Signup here
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard'; 
import AdminDashboard from './pages/AdminDashboard'; 

// Smart Route Guard
const PrivateRoute = ({ children, roleRequired }: any) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" />;
  
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/dashboard" />; 
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* <--- 2. Add Route here */}
        
        {/* Customer Route */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Agent Route */}
        <Route path="/agent" element={
          <PrivateRoute roleRequired="AGENT">
            <AgentDashboard />
          </PrivateRoute>
        } />

        {/* Admin Route */}
        <Route path="/admin" element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Catch-all for 404 (Optional but recommended) */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;