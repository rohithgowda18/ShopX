import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import CustomerDashboard from './pages/customer/Dashboard';
import ShopOwnerDashboard from './pages/shop/Dashboard';
import ShopOrders from './pages/shop/ShopOrders';
import ShopSettings from './pages/shop/ShopSettings';
import ShopProducts from './pages/shop/ShopProducts';
import ShopImportProduct from './pages/shop/ShopImportProduct';
import AdminCatalogManager from './pages/admin/AdminCatalogManager';
import CreateList from './pages/customer/CreateList';
import SelectShop from './pages/customer/SelectShop';
import CustomerOrders from './pages/customer/CustomerOrders';
import Profile from './pages/customer/Profile';
import ImportProducts from './pages/shop/ImportProducts';
import CatalogManager from './pages/admin/CatalogManager';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'customer' | 'shop_owner' | 'admin' }) => {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (!userProfile) return <Navigate to="/role-selection" />;
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to={userProfile.role === 'customer' ? '/customer' : userProfile.role === 'admin' ? '/admin' : '/shop'} />;
  }
  
  return <>{children}</>;
};

import { ErrorBoundary } from './components/ui/ErrorBoundary';
import OfflineBanner from './components/ui/OfflineBanner';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/role-selection" element={
        currentUser && !userProfile ? <RoleSelection /> : <Navigate to="/" />
      } />
      
      <Route path="/" element={<Navigate to={userProfile?.role === 'shop_owner' ? '/shop' : '/customer'} />} />

      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute requiredRole="customer"><AppLayout /></ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="create-list" element={<CreateList />} />
        <Route path="select-shop" element={<SelectShop />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AppLayout /></ProtectedRoute>
      }>
        <Route path="catalog" element={<CatalogManager />} />
        <Route index element={<Navigate to="catalog" />} />
      </Route>

      {/* Shop Owner Routes */}
      <Route path="/shop" element={
        <ProtectedRoute requiredRole="shop_owner"><AppLayout /></ProtectedRoute>
      }>
        <Route index element={<ShopOwnerDashboard />} />
        <Route path="orders" element={<ShopOrders />} />
        <Route path="products" element={<ShopProducts />} />
        <Route path="products/import" element={<ShopImportProduct />} />
        <Route path="import-products" element={<ImportProducts />} />
        <Route path="settings" element={<ShopSettings />} />
        <Route path="admin/catalog" element={<AdminCatalogManager />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <OfflineBanner />
            <Toaster position="top-center" />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
