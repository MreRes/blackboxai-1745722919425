const { app, initializeServices } = require('./app');
const config = require('./config/config');

// Start server
const startServer = async () => {
  try {
    // Initialize services (database and WhatsApp bot)
    await initializeServices();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`
🚀 Server running in ${config.environment} mode on port ${config.port}
👉 http://localhost:${config.port}
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} is already in use`);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nReceived shutdown signal...');
      
      // Close server
      server.close(() => {
        console.log('HTTP server closed');
      });

      // Close database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('Database connection closed');
      }

      // Exit process
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
