import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, CircularProgress, 
  Alert, Paper, Tabs, Tab, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, DialogContentText, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { bookingsAPI, slotsAPI } from '../services/api';

const AdminPage = () => {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState({ bookings: false, slots: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '', data: null });
  const [form, setForm] = useState({ 
    date: new Date(), 
    interval: 30, 
    startTime: '09:00', 
    endTime: '17:00' 
  });

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, [tab]: true }));
      let response;
      
      if (tab === 'bookings') {
        response = await bookingsAPI.getAllBookings();
        setBookings(response.data);
      } else {
        // Set default date range (today and next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        response = await slotsAPI.getAllSlots(
          today.toISOString().split('T')[0],
          nextWeek.toISOString().split('T')[0]
        );
        setSlots(response.data);
      }
    } catch (err) {
      setError(`Failed to load ${tab}`);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleGenerateSlots = async () => {
    try {
      setLoading(prev => ({ ...prev, slots: true }));
      await slotsAPI.generateSlots({
        date: format(form.date, 'yyyy-MM-dd'),
        interval: form.interval,
        startTime: form.startTime,
        endTime: form.endTime
      });
      setSuccess('Slots generated');
      setDialog({ open: false, type: '', data: null });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate slots');
    } finally {
      setLoading(prev => ({ ...prev, slots: false }));
    }
  };

  const handleCancelBooking = async () => {
    if (!dialog.data) return;
    try {
      await bookingsAPI.cancelBooking(dialog.data._id);
      setBookings(bookings.map(b => 
        b._id === dialog.data._id ? { ...b, status: 'cancelled' } : b
      ));
      setSuccess('Booking cancelled');
      setDialog({ open: false, type: '', data: null });
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleDeleteSlot = async () => {
    if (!dialog.data) return;
    try {
      await slotsAPI.deleteSlot(dialog.data._id);
      setSlots(slots.filter(s => s._id !== dialog.data._id));
      setSuccess('Slot deleted');
      setDialog({ open: false, type: '', data: null });
    } catch (err) {
      setError('Failed to delete slot');
    }
  };

  const renderBookingsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map(booking => (
            <TableRow key={booking._id}>
              <TableCell>{booking.user?.name || 'N/A'}</TableCell>
              <TableCell>
                {booking.slot?.startTime ? (
                  format(new Date(booking.slot.startTime), 'MMM d, yyyy h:mm a')
                ) : 'N/A'}
              </TableCell>
              <TableCell>
                <Chip 
                  label={booking.status} 
                  color={booking.status === 'confirmed' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {booking.status === 'confirmed' && booking.slot?.startTime && isBefore(new Date(), new Date(booking.slot.startTime)) && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setDialog({ open: true, type: 'cancel', data: booking })}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSlotsTable = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialog({ open: true, type: 'generate', data: null })}
        >
          Generate Slots
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Booked By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map(slot => (
              <TableRow key={slot._id}>
                <TableCell>{format(parseISO(slot.startTime), 'MMM d, yyyy h:mm a')}</TableCell>
                <TableCell>
                  <Chip 
                    label={slot.isBooked ? 'Booked' : 'Available'}
                    color={slot.isBooked ? 'secondary' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{slot.bookedBy?.name || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDialog({ open: true, type: 'delete', data: slot })}
                    disabled={slot.isBooked}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Typography color="text.secondary">Manage appointments and slots</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Appointments" value="bookings" />
          <Tab label="Time Slots" value="slots" />
        </Tabs>
      </Paper>

      {loading[tab] ? (
        <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
      ) : tab === 'bookings' ? renderBookingsTable() : renderSlotsTable()}

      {/* Generate Slots Dialog */}
      <Dialog open={dialog.open && dialog.type === 'generate'} onClose={() => setDialog({ open: false, type: '', data: null })}>
        <DialogTitle>Generate Time Slots</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={form.date}
              onChange={(date) => setForm({ ...form, date })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
            />
          </LocalizationProvider>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Interval (minutes)</InputLabel>
            <Select
              value={form.interval}
              label="Interval (minutes)"
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            >
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>60 minutes</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: '', data: null })}>Cancel</Button>
          <Button onClick={handleGenerateSlots} variant="contained" disabled={loading.slots}>
            {loading.slots ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={dialog.open && dialog.type === 'cancel'} onClose={() => setDialog({ open: false, type: '', data: null })}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: '', data: null })}>No</Button>
          <Button onClick={handleCancelBooking} color="error" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Slot Dialog */}
      <Dialog open={dialog.open && dialog.type === 'delete'} onClose={() => setDialog({ open: false, type: '', data: null })}>
        <DialogTitle>Delete Time Slot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this time slot?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, type: '', data: null })}>No</Button>
          <Button onClick={handleDeleteSlot} color="error" autoFocus>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
