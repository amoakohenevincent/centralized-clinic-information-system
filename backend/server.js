const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for CCIS Frontend clients
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    module: 'CCIS Prescription Management Module',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Prescription API Routes
app.use('/api/prescriptions', prescriptionRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[CCIS Prescription Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error in Prescription Module.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Only start the HTTP listener if this file is run directly (not required by test suite)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[CCIS Prescription] Service listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  });
}

module.exports = app;
