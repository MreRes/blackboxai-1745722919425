const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const whatsappBot = require('./config/whatsapp');
const { errorHandler, notFound } = require('./middleware/error');
const { sanitize } = require('./middleware/validator');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const activationRoutes = require('./routes/activations');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/activations', activationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);

// Handle 404 routes
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize WhatsApp bot and database connection
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connected successfully');

    // Initialize WhatsApp bot
    await whatsappBot.initialize();
    console.log('✅ WhatsApp bot initialized successfully');

    // Handle WhatsApp session events
    whatsappBot.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    whatsappBot.client.on('auth_failure', () => {
      console.error('WhatsApp authentication failed');
    });

    whatsappBot.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
    });

  } catch (error) {
    console.error('❌ Error initializing services:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Export app and initialization function
module.exports = { app, initializeServices };
