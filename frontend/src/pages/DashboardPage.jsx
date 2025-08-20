import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  ListAlt as BookingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingsAPI.getMyBookings();
        const now = new Date();
        
        // Filter upcoming bookings (next 7 days)
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        
        const upcoming = response.data
          .filter(booking => {
            if (!booking?.slot?.startTime) return false;
            const bookingTime = new Date(booking.slot.startTime);
            return bookingTime > now && bookingTime <= oneWeekFromNow;
          })
          .sort((a, b) => {
            const timeA = new Date(a.slot?.startTime || 0).getTime();
            const timeB = new Date(b.slot?.startTime || 0).getTime();
            return timeA - timeB;
          })
          .slice(0, 3); // Show only next 3 upcoming bookings
        
        setUpcomingBookings(upcoming);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load upcoming appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUpcomingBookings();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening with your appointments.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Upcoming Appointments
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<CalendarIcon />}
                  onClick={() => navigate('/book-slot')}
                >
                  Book New
                </Button>
              </Box>
              
              {upcomingBookings.length > 0 ? (
                <Box>
                  {upcomingBookings.map((booking) => (
                    <Box 
                      key={booking._id}
                      sx={{ 
                        p: 2, 
                        mb: 1, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => navigate(`/my-bookings`)}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {formatDate(booking.slot.startTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Typography>
                    </Box>
                  ))}
                  
                  {upcomingBookings.length > 0 && (
                    <Box mt={2} textAlign="right">
                      <Button 
                        size="small" 
                        onClick={() => navigate('/my-bookings')}
                      >
                        View All Appointments
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box 
                  textAlign="center" 
                  py={4}
                  sx={{ color: 'text.secondary' }}
                >
                  <BookingsIcon fontSize="large" />
                  <Typography variant="subtitle1" mt={1}>
                    No upcoming appointments
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/book-slot')}
                  >
                    Book an Appointment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<CalendarIcon />}
                  onClick={() => navigate('/book-slot')}
                >
                  Book Appointment
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<BookingsIcon />}
                  onClick={() => navigate('/my-bookings')}
                >
                  My Appointments
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<PersonIcon />}
                  onClick={() => navigate('/profile')}
                >
                  My Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
