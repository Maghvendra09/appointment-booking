import React, { useState, useEffect } from 'react';
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
  TextField,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isBefore, isAfter, isToday } from 'date-fns';
import { slotsAPI, bookingsAPI } from '../services/api';

const BookSlotPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate min and max dates (today to 30 days from now)
  const minDate = new Date();
  const maxDate = addDays(new Date(), 30);

  const formatDateForApi = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatTime = (dateTime) => {
    return format(new Date(dateTime), 'h:mm a');
  };

  const fetchSlots = async (date) => {
    try {
      setLoading(true);
      setError('');
      
      const from = formatDateForApi(date);
      const to = formatDateForApi(addDays(date, 1));
      
      const response = await slotsAPI.getAvailableSlots(from, to);
      
      const now = new Date();
      const filteredSlots = response.data.filter(slot => {
        const slotTime = new Date(slot.startTime);
        return isToday(slotTime) ? isAfter(slotTime, now) : true;
      });
      
      setSlots(filteredSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

    const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setOpenDialog(true);
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      
      // Debug: Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      // Debug: Log the request payload
      console.log('Booking slot with ID:', selectedSlot._id);
      
      await bookingsAPI.createBooking(selectedSlot._id);
      setOpenDialog(false);
      setBookingSuccess(true);
      // Refresh slots after booking
      fetchSlots(selectedDate);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error?.message || 'Failed to book the slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSlots(selectedDate);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book an Appointment
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Select a date and time for your appointment.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {bookingSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setBookingSuccess(false)}
        >
          Appointment booked successfully!
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select a date"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            renderInput={(params) => (
              <TextField {...params} sx={{ minWidth: 250 }} />
            )}
            disablePast
            shouldDisableDate={(date) => {
              // Disable weekends
              return date.getDay() === 0 || date.getDay() === 6;
            }}
          />
        </LocalizationProvider>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
          Available time slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : slots.length > 0 ? (
          <Grid container spacing={2}>
            {slots.map((slot) => (
              <Grid item xs={6} sm={4} md={3} key={slot._id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleSlotSelect(slot)}
                  sx={{
                    py: 2,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box 
            textAlign="center" 
            p={4}
            sx={{ 
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No available slots for the selected date. Please choose another date.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Booking Confirmation Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please confirm your appointment details:
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Date: {selectedSlot && format(new Date(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')}
            </Typography>
            <Typography variant="subtitle1">
              Time: {selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            You'll receive a confirmation email with the appointment details.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBookAppointment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookSlotPage;
