import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user ? [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Book', path: '/book-slot' },
    { label: 'My Appointments', path: '/my-bookings' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : [])
  ] : [
    { label: 'Home', path: '/' },
    { label: 'Book', path: '/book-slot' },
  ];

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          DoctorApp
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button 
              key={item.label} 
              component={RouterLink} 
              to={item.path}
              color="inherit"
            >
              {item.label}
            </Button>
          ))}
          
          {user ? (
            <Button 
              color="inherit"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button 
                component={RouterLink} 
                to="/login" 
                color="inherit"
              >
                Login
              </Button>
              <Button 
                component={RouterLink} 
                to="/register" 
                color="primary" 
                variant="contained"
                size="small"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
