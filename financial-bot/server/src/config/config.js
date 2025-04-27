require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/financial-bot',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  defaultActivationDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  environment: process.env.NODE_ENV || 'development',
  whatsapp: {
    sessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
    headless: true
  }
};
