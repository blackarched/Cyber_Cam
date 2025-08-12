// Load environment variables first
require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 8443,
  wsPort: process.env.WS_PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.FRONTEND_ORIGIN || `https://localhost:${process.env.PORT || 8443}`,

  // JSON Web Token Secret
  jwtSecret: process.env.JWT_SECRET,

  // Database Connection Details
  db: {
    host: process.env.DB_HOST || 'nexus-postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'nexus_admin',
    password: process.env.DB_PASSWORD || 'quantum_secure_2024',
    name: process.env.DB_NAME || 'nexus_security',
  },
  
  // SSL Certificate Paths
  ssl: {
      key: process.env.SSL_KEY_PATH || './certs/key.pem',
      cert: process.env.SSL_CERT_PATH || './certs/cert.pem'
  },

  // Logging Level
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate that critical secrets are provided in the environment
if (!config.jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment. Shutting down.');
  process.exit(1);
}

module.exports = config;