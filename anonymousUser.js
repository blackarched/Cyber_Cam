const logger = require('../services/logger');

/**
 * Middleware to attach a default anonymous user object to each request.
 * This is used to bypass authentication for direct-access deployments.
 */
const anonymousUserMiddleware = (req, res, next) => {
  // Define a default, system-level user context.
  req.user = {
    id: 0,
    username: 'GRID_OPERATOR',
    role: 'admin' // Grant admin privileges for full functionality
  };
  next();
};

module.exports = anonymousUserMiddleware;