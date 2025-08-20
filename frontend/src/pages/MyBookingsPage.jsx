import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, CircularProgress, Alert,
  Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText 
} from '@mui/material';
import { CalendarMonth, Cancel, CheckCircle, AccessTime } from '@mui/icons-material';
import { format, isBefore, isAfter, isToday, parseISO } from 'date-fns';
import { bookingsAPI } from '../services/api';

const MyBookingsPage = () => {
  const [tabValue, setTabValue] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingsAPI.getMyBookings();
      
      // Filter out any bookings with missing slot data
      const validBookings = response.data.filter(booking => 
        booking?.slot?.startTime
      );
      
      // Sort by start time, with invalid/missing times at the end
      const sortedBookings = validBookings.sort((a, b) => {
        const timeA = new Date(a.slot.startTime).getTime();
        const timeB = new Date(b.slot.startTime).getTime();
        return timeB - timeA; // Newest first
      });
      
      setBookings(sortedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      setCancelling(true);
      await bookingsAPI.cancelBooking(selectedBooking._id);
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
      setSuccess('Appointment cancelled successfully.');
      setTimeout(() => setSuccess(''), 5000);
      setCancelDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusChip = (status, date) => {
    if (!date) return <Chip label="Unknown" size="small" />;
    const now = new Date();
    const slotDate = new Date(date);
    
    if (status === 'cancelled') return <Chip label="Cancelled" color="error" size="small" />;
    if (isBefore(slotDate, now)) return <Chip label="Completed" color="success" size="small" />;
    if (isToday(slotDate)) return <Chip label="Today" color="primary" size="small" />;
    return <Chip label="Upcoming" color="info" size="small" />;
  };

  const filteredBookings = bookings.filter(booking => {
    if (!booking.slot || !booking.slot.startTime) return false;
    const now = new Date();
    const slotTime = new Date(booking.slot.startTime);
    return tabValue === 'upcoming' 
      ? slotTime >= now && booking.status !== 'cancelled'
      : slotTime < now || booking.status === 'cancelled';
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>My Appointments</Typography>
        <Typography color="text.secondary">View and manage your scheduled appointments</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Past & Cancelled" value="past" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : filteredBookings.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking._id} hover>
                  <TableCell>
                    {booking.slot?.startTime ? (
                      <>
                        <Typography>{format(parseISO(booking.slot.startTime), 'MMM d, yyyy h:mm a')}</Typography>
                        <Typography variant="body2" color="text.secondary">30 minutes</Typography>
                      </>
                    ) : (
                      <Typography color="text.secondary">Time not available</Typography>
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(booking.status, booking.slot?.startTime)}</TableCell>
                  <TableCell>
                    {booking.status !== 'cancelled' && booking.slot?.startTime && isAfter(new Date(booking.slot.startTime), new Date()) && (
                      <IconButton size="small" color="error" onClick={() => {
                        setSelectedBooking(booking);
                        setCancelDialogOpen(true);
                      }}>
                        <Cancel />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" p={4} border="1px dashed" borderRadius={1}>
          <CalendarMonth color="action" fontSize="large" />
          <Typography color="text.secondary" gutterBottom>
            No {tabValue === 'upcoming' ? 'upcoming' : 'past'} appointments
          </Typography>
          {tabValue === 'upcoming' && (
            <Button variant="contained" href="/book-slot" sx={{ mt: 2 }}>
              Book an Appointment
            </Button>
          )}
        </Box>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to cancel this appointment?</DialogContentText>
          {selectedBooking && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography>
                {selectedBooking.slot?.startTime 
                  ? format(parseISO(selectedBooking.slot.startTime), 'MMM d, yyyy h:mm a')
                  : 'Time not available'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button onClick={handleCancelBooking} color="error" disabled={cancelling}>
            {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookingsPage;
