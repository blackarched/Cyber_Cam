const logger = require('../services/logger');

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'WS_PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'SSL_CERT_PATH',
  'SSL_KEY_PATH',
];
const placeholderSecret = 'REPLACE_THIS_WITH_A_SECURE_RANDOM_STRING_USING_NPM_RUN_GENERATE_SECRET';

logger.info('Validating environment variables...');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  logger.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === placeholderSecret) {
  logger.error('FATAL ERROR: Attempting to run in production with the default placeholder JWT_SECRET. Please generate a new secret using "npm run generate:secret".');
  process.exit(1);
}

logger.info('Environment variable validation successful.');