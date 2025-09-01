import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider,AuthContext ,useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PizzaBuilder from './pages/user/PizzaBuilder';
import OrderHistory from './pages/user/OrderHistory';
import OrderDetails from './pages/user/OrderDetails';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminUsers from './pages/admin/AdminUsers';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  
                  {/* Protected User Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <UserDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/pizza-builder" 
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <PizzaBuilder />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <OrderHistory />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders/:id" 
                    element={
                      <ProtectedRoute allowedRoles={['user']}>
                        <OrderDetails />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/inventory" 
                    element={
                      <AdminRoute>
                        <AdminInventory />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
