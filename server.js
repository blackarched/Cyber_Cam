// Validate environment variables at the very beginning.
require('../config/validateEnv');

// Load environment variables first
require('dotenv').config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('../config');
const logger = require('./services/logger');
const db = require('./services/db');
const mainApiRouter = require('./routes');
const streamManager = require('./services/stream_manager');
const WebSocketService = require('./services/websocket');

class NexusCommandCenter {
  constructor() {
    this.app = express();
    this.app.locals.streamManager = streamManager;

    this.initializeMiddleware();
    this.establishRouteMatrix();
    this.initializeErrorHandling();
    this.server = this.initializeServer(); // Store the server instance
    this.wsService = new WebSocketService(this.server); // Initialize WebSocket service
    this.initiateBackgroundServices();
    this.initializeShutdownHooks();
  }

  initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(cors({ origin: config.corsOrigin }));
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
    this.app.use('/api/', limiter);
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  establishRouteMatrix() {
    this.app.get('/health', (req, res) => res.status(200).json({ status: 'operational', timestamp: new Date().toISOString() }));
    this.app.use('/api', mainApiRouter);
  }

  initializeErrorHandling() {
    this.app.use((req, res, next) => {
      res.status(404).json({ error: 'Not Found: The requested resource does not exist on the NEXUS grid.' });
    });
    this.app.use((err, req, res, next) => {
      logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });
      res.status(err.status || 500).json({ error: 'Internal Server Error' });
    });
  }

  initializeServer() {
    try {
      const tlsOptions = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert)
      };
      const server = https.createServer(tlsOptions, this.app);
      server.listen(config.port, () => {
        logger.info(`🚀 NEXUS Command Center operational on secure port ${config.port}`);
      });
      return server; // Return the server instance
    } catch (error) {
      logger.error('Server initialization failed. Verify SSL certificate paths and permissions.', { error: error.message });
      process.exit(1);
    }
  }

  async initiateBackgroundServices() {
    logger.info('Initiating background services...');
    try {
      const { rows } = await db.query("SELECT * FROM security_nodes WHERE status = 'online'");
      logger.info(`Found ${rows.length} previously online nodes to re-initialize.`);
      for (const node of rows) {
        streamManager.establishStreamConnection(node).catch(err => {
            logger.error(`Failed to re-establish stream for node ${node.node_id}`, { error: err.message });
        });
      }
    } catch(error) {
        logger.error('Failed to query database for background service initialization.', { error: error.message });
    }
  }

  initializeShutdownHooks() {
    const shutdown = async (signal) => {
      logger.warn(`Received ${signal}. Starting graceful shutdown...`);
      await streamManager.terminateAllStreams();
      this.server.close(() => {
        logger.info('HTTPS server closed. Shutdown complete.');
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}

new NexusCommandCenter();