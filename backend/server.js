const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// ─── Security & Utility Middleware ───
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check (unauthenticated) ───
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Centralized Clinic Information System (CCIS)',
    modules: {
      module1: 'Patient & Appointment Management',
      module2: 'Clinical Records Management',
      module3: 'Prescription Management',
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── Shared JWT Authentication for all /api routes ───
app.use('/api', authenticateToken);

// ─── Mount Unified API Routes ───
app.use('/api', routes);

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Centralized Error Handling ───
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().finally(() => {
    app.listen(PORT, () => {
      console.log(`\n╔══════════════════════════════════════════════════╗`);
      console.log(`║   CCIS Unified Server                            ║`);
      console.log(`║   Mode: ${(process.env.NODE_ENV || 'development').padEnd(40)}║`);
      console.log(`║   Port: ${String(PORT).padEnd(40)}║`);
      console.log(`║                                                  ║`);
      console.log(`║   Modules:                                       ║`);
      console.log(`║   ✓ Module 1: Patient & Appointments             ║`);
      console.log(`║   ✓ Module 2: Clinical Records                   ║`);
      console.log(`║   ✓ Module 3: Prescription Management            ║`);
      console.log(`╚══════════════════════════════════════════════════╝\n`);
    });
  });
}

module.exports = app;
