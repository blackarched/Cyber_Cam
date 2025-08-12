const db = require('../services/db');
const logger = require('../services/logger');

/**
 * Retrieves all security nodes from the database.
 */
exports.getAllNodes = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM security_nodes ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    logger.error('Failed to retrieve security nodes', { error: error.message });
    next(error);
  }
};

/**
 * Deploys a new security node.
 */
exports.addNode = async (req, res, next) => {
  // Access the shared streamManager instance from the app context
  const streamManager = req.app.locals.streamManager;
  const { designation, ip_address, port, stream_path, node_type } = req.body;

  if (!designation || !ip_address) {
    return res.status(400).json({ error: 'Designation and IP address are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO security_nodes (designation, ip_address, port, stream_path, node_type, status)
       VALUES ($1, $2, $3, $4, $5, 'online')
       RETURNING *`,
      [designation, ip_address, port, stream_path, node_type]
    );
    const newNode = rows[0];
    logger.info(`Node ${newNode.designation} deployed to database with ID ${newNode.node_id}`);

    streamManager.establishStreamConnection(newNode).catch(err => {
        logger.error(`Failed to establish stream for new node ${newNode.node_id}`, { error: err.message });
        db.query(`UPDATE security_nodes SET status = 'error' WHERE node_id = $1`, [newNode.node_id]);
    });

    res.status(201).json(newNode);
  } catch (error) {
    logger.error('Failed to deploy new node', { error: error.message, body: req.body });
    next(error);
  }
};

/**
 * Decommissions a security node.
 */
exports.deleteNode = async (req, res, next) => {
    // Access the shared streamManager instance
    const streamManager = req.app.locals.streamManager;
    try {
        const { id } = req.params;
        const nodeResult = await db.query('SELECT node_id FROM security_nodes WHERE node_uuid = $1', [id]);

        if (nodeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Security node not found to delete.' });
        }
        const { node_id } = nodeResult.rows[0];

        // Terminate any active streams for this node
        await streamManager.handleStreamDisconnection(node_id);
        logger.info(`Active stream terminated for node ID: ${node_id}`);

        await db.query('DELETE FROM security_nodes WHERE node_id = $1', [node_id]);

        logger.info(`Node decommissioned: ${id} (Internal ID: ${node_id})`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Failed to decommission node ${req.params.id}`, { error: error.message });
        next(error);
    }
};