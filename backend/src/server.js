require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const { seedAdminUser } = require('./utils/seed');

const app = express();

connectDB();

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://appointbooking.netlify.app',
  'https://appointbooking.netlify.app/'
];

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']
  });
  next();
});

// Enable CORS for all routes
app.use(cors({
  origin: function (origin, callback) {
  
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.log('Blocked request from Origin:', origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: { 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'Something went wrong!' 
    } 
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Endpoint not found' 
    } 
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    await seedAdminUser();
    console.log('Admin user checked/created');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
