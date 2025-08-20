import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import BookSlotPage from './pages/BookSlotPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        {/* Public routes */}
        <Route path="login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={
          user ? <DashboardPage /> : <Navigate to="/login" />
        } />
        
        <Route path="book-slot" element={
          user ? <BookSlotPage /> : <Navigate to="/login" />
        } />
        
        <Route path="my-bookings" element={
          user ? <MyBookingsPage /> : <Navigate to="/login" />
        } />
        
        <Route path="profile" element={
          user ? <ProfilePage /> : <Navigate to="/login" />
        } />
        
        {/* Admin only route */}
        <Route path="admin" element={
          user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" />
        } />
        
        {/* 404 route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
