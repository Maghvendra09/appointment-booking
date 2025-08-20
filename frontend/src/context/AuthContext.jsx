import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        await authAPI.getMe();
      } catch (err) {
        console.error('Session expired:', err);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { initializeAuth(); }, [initializeAuth]);

  // Handle auth redirects
  useEffect(() => {
    if (!loading) {
      const isAuthPage = ['/login', '/register'].includes(location.pathname);
      if (user && isAuthPage) {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else if (!user && !isAuthPage && location.pathname !== '/') {
        navigate('/login', { state: { from: location } });
      }
    }
  }, [user, loading, navigate, location]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name, email, password, role = 'patient') => {
    try {
      setError(null);
      await authAPI.register(name, email, password, role);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await profileAPI.updateProfile(profileData);
      updateUser(response.data.user);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Update failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
