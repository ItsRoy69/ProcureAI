const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { verifyEmailConfig } = require('./config/email');
const { startEmailMonitoring } = require('./services/emailService');

// Import models to ensure associations are set up
require('./models');

// Import routes
const rfpRoutes = require('./routes/rfpRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/auth', require('./routes/authRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ProcureAI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    // Use force: true in development to recreate tables (WARNING: deletes data)
    // Use alter: true in production to modify existing tables
    await sequelize.sync({ force: false, alter: false });
    console.log('✓ Database synchronized');

    // Verify email configuration
    await verifyEmailConfig();

    // Start the server
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 ProcureAI Backend Server`);
      console.log(`${'='.repeat(50)}`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`${'='.repeat(50)}\n`);

      // Start email monitoring in background
      if (process.env.IMAP_USER && process.env.IMAP_PASSWORD) {
        startEmailMonitoring();
      } else {
        console.log('⚠ Email monitoring disabled (IMAP credentials not configured)');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  await sequelize.close();
  console.log('Database connection closed');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
