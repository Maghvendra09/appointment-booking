import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import Navigation from './Navigation';
import { useTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Navigation />

      <Container component="main" sx={{ flex: 1, py: 4, mt: 2 }}>
        <Outlet />
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[100] 
            : theme.palette.grey[900],
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {new Date().getFullYear()} Appointment Booking System
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
              <Typography variant="body2" color="text.secondary">
                Terms of Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact Us
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode}
      />
    </Box>
  );
};

export default Layout;
