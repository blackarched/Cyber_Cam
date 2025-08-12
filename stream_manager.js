const { spawn } = require('child_process');
const EventEmitter = require('events');
const logger = require('./logger');

class StreamManager extends EventEmitter {
    constructor() {
        super();
        this.activeStreams = new Map();
        logger.info('StreamManager initialized.');
    }

    async establishStreamConnection(nodeConfig) {
        const { node_id, ip_address, stream_path } = nodeConfig;
        const rtspUrl = `rtsp://${ip_address}${stream_path || '/video'}`;
        logger.info(`Attempting to establish stream for node ${node_id} at ${rtspUrl}`);

        if (this.activeStreams.has(node_id)) {
            logger.warn(`Stream for node ${node_id} is already active. Terminating old stream.`);
            await this.handleStreamDisconnection(node_id);
        }

        const ffmpegArgs = [
            '-rtsp_transport', 'tcp', // Use TCP for more reliable transport
            '-i', rtspUrl,
            '-c:v', 'copy',
            '-an',
            '-f', 'mpegts',
            '-bufsize', '1024k',
            'pipe:1'
        ];

        const streamProcess = spawn('ffmpeg', ffmpegArgs, { detached: false });

        streamProcess.stdout.on('data', (chunk) => {
            // Emit an event with the node ID and video data chunk
            this.emit('streamData', { nodeId: node_id, chunk });
        });

        streamProcess.stderr.on('data', (data) => {
            logger.debug(`[FFMPEG Node ${node_id}]: ${data.toString()}`);
        });

        streamProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                logger.error(`Stream process for node ${node_id} terminated unexpectedly with code ${code}`);
            } else {
                logger.info(`Stream process for node ${node_id} terminated cleanly.`);
            }
            this.handleStreamDisconnection(node_id);
        });

        this.activeStreams.set(node_id, streamProcess);
        logger.info(`Stream established for node ${node_id}`);
    }

    async handleStreamDisconnection(nodeId) {
        const streamProcess = this.activeStreams.get(nodeId);
        if (streamProcess) {
            if (!streamProcess.killed) {
                streamProcess.kill('SIGTERM');
            }
            this.activeStreams.delete(nodeId);
            logger.info(`Cleaned up stream resources for node ${nodeId}`);
        }
    }

    async terminateAllStreams() {
        logger.info('Terminating all active streams for graceful shutdown...');
        const streamPromises = Array.from(this.activeStreams.keys()).map(nodeId =>
            this.handleStreamDisconnection(nodeId)
        );
        await Promise.all(streamPromises);
        logger.info('All active streams have been terminated.');
    }
}

// Export a single, shared instance (Singleton pattern)
module.exports = new StreamManager();