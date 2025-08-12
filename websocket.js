const { WebSocketServer } = require('ws');
const logger = require('./logger');
const streamManager = require('./stream_manager');

class WebSocketService {
  constructor(httpsServer) {
    this.clients = new Set();
    // The verifyClient option is removed to allow all connections.
    this.wss = new WebSocketServer({ server: httpsServer });
    logger.info('WebSocketService initialized in open-access mode.');
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws, req) => {
      logger.info('WebSocket client connected (anonymous).');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.info('WebSocket client disconnected.');
        this.clients.delete(ws);
      });
      
      ws.send(JSON.stringify({ type: 'connection_ack', message: 'NEXUS neural link established.' }));
    });

    streamManager.on('streamData', ({ nodeId, chunk }) => {
      // Broadcast binary video data to all connected clients.
      this.broadcast(chunk, true);
    });
  }

  broadcast(payload, isBinary = false) {
    for (const client of this.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload, { binary: isBinary });
      }
    }
  }

  // This method can be used by other services to send JSON status updates.
  broadcastStatus(statusPayload) {
      this.broadcast(JSON.stringify(statusPayload), false);
  }
}

module.exports = WebSocketService;