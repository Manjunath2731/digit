const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const planRoutes = require('./routes/plans');
const cityRoutes = require('./routes/cities');
const subscriptionRoutes = require('./routes/subscriptions');
const tankRoutes = require('./routes/tanks');
const complaintRoutes = require('./routes/complaints');
const serviceEngineerRoutes = require('./routes/serviceEngineers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - Allow all origins
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server is running but database connection failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tanks', tankRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/service-engineers', serviceEngineerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Server started successfully!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👥 User endpoints: http://localhost:${PORT}/api/users`);
  console.log(`📋 Plan endpoints: http://localhost:${PORT}/api/plans`);
  console.log(`🏙️  City endpoints: http://localhost:${PORT}/api/cities`);
  console.log(`💳 Subscription endpoints: http://localhost:${PORT}/api/subscriptions`);
  console.log(`🚰 Tank endpoints: http://localhost:${PORT}/api/tanks`);
  console.log(`💬 Complaint endpoints: http://localhost:${PORT}/api/complaints`);
  console.log(`🔧 Service Engineer endpoints: http://localhost:${PORT}/api/service-engineers`);
  console.log(`\n📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
