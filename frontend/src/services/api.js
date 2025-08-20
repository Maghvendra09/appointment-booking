import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password, role = 'patient') => 
    api.post('/auth/register', { name, email, password, role }),
  
  getMe: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
  
  updateProfile: (data) => api.put('/auth/update-profile', data),
  
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword })
};

// Slots API
export const slotsAPI = {
  // Get available slots within a date range
  getAvailableSlots: (from, to) => 
    api.get('/slots', { params: { from, to } }),
  
  // Get all slots (admin only) - requires date range
  getAllSlots: (from, to) => 
    api.get('/slots', { params: { from, to } }),
  
  // Generate slots for a specific date (admin only)
  generateSlots: (data) => api.post('/slots/generate', data),
  
  // Delete a slot (admin only)
  deleteSlot: (slotId) => api.delete(`/slots/${slotId}`),
  
  // Book a specific slot (deprecated - use bookingsAPI.createBooking instead)
  bookSlot: (slotId) => api.post('/bookings', { slotId }),
  
  // Get slots for a specific date (admin view)
  getSlotsByDate: (date) => 
    api.get('/slots', { params: { from: date, to: date } })
};

export const bookingsAPI = {

  createBooking: (slotId) => 
    api.post('/bookings', { slotId }),
  
  getMyBookings: () => api.get('/bookings/my-bookings'),
  

  getAllBookings: () => 
    api.get('/bookings/all'),
  

  getBooking: (bookingId) => 
    api.get(`/bookings/${bookingId}`),
  

  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
  

  updateBookingStatus: (bookingId, status) => 
    api.put(`/bookings/${bookingId}/status`, { status })
};


export const usersAPI = {

  getUsers: () => api.get('/users'),
  

  getUser: (userId) => api.get(`/users/${userId}`),
  

  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  

  deleteUser: (userId) => api.delete(`/users/${userId}`)
};


export const profileAPI = {
 
  getProfile: () => api.get('/profile'),
  

  updateProfile: (data) => api.put('/profile', data),
  

  changePassword: (currentPassword, newPassword) => 
    api.put('/profile/change-password', { currentPassword, newPassword })
};


export default api;
