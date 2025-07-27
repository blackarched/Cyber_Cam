const db = require('../services/db');
const { logger } = require('../services/logger');
const RecordingEngine = require('../services/RecordingEngine');
const AppError = require('../utils/errorFormatter');

/**
 * @description Add a new security node to the system.
 * @route POST /api/nodes
 * @access Private
 */
exports.addNode = async (req, res, next) => {
  try {
    const { designation, ip_address, port, stream_path, node_type } = req.body;
    const result = await db.query(
      'INSERT INTO security_nodes (designation, ip_address, port, stream_path, node_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [designation, ip_address, port, stream_path, node_type]
    );
    logger.info(`New security node added: ${result.rows[0].designation}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      logger.warn(`Attempt to add node with existing designation: ${req.body.designation}`);
      return next(new AppError('A node with that designation already exists.', 409));
    }
    logger.error(`Error adding new node: ${error.message}`, {
      stack: error.stack,
      nodeData: req.body,
    });
    next(error);
  }
};

exports.startRecording = async (req, res, next) => {
  try {
    const { id } = req.params;
    await RecordingEngine.startRecording(id);
    logger.info(`Recording started for node ${id}.`);
    res.status(200).json({ message: `Recording started for node ${id}` });
  } catch (error) {
    logger.error(`Error starting recording for node ${req.params.id}: ${error.message}`, {
      stack: error.stack,
      nodeId: req.params.id,
    });
    next(error);
  }
};

exports.stopRecording = async (req, res, next) => {
  try {
    const { id } = req.params;
    RecordingEngine.stopRecording(id);
    logger.info(`Recording stopped for node ${id}.`);
    res.status(200).json({ message: `Recording stopped for node ${id}` });
  } catch (error) {
    logger.error(`Error stopping recording for node ${req.params.id}: ${error.message}`, {
      stack: error.stack,
      nodeId: req.params.id,
    });
    next(error);
  }
};

/**
 * @description Get all security nodes.
 * @route GET /api/nodes
 * @access Private
 */
exports.getAllNodes = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM security_nodes ORDER BY designation');
    res.status(200).json(result.rows);
  } catch (error) {
    logger.error(`Error getting all nodes: ${error.message}`, {
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * @description Get a single security node by ID.
 * @route GET /api/nodes/:id
 * @access Private
 */
exports.getNodeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM security_nodes WHERE node_id = $1', [id]);
    if (result.rows.length === 0) {
      logger.warn(`Node with ID ${id} not found.`);
      return next(new AppError('Node not found', 404));
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error getting node by ID ${req.params.id}: ${error.message}`, {
      stack: error.stack,
      nodeId: req.params.id,
    });
    next(error);
  }
};

/**
 * @description Update a security node.
 * @route PUT /api/nodes/:id
 * @access Private
 */
exports.updateNode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { designation, ip_address, port, stream_path, node_type, status } = req.body;
    const result = await db.query(
      'UPDATE security_nodes SET designation = $1, ip_address = $2, port = $3, stream_path = $4, node_type = $5, status = $6, updated_at = NOW() WHERE node_id = $7 RETURNING *',
      [designation, ip_address, port, stream_path, node_type, status, id]
    );
    if (result.rows.length === 0) {
      logger.warn(`Attempted to update non-existent node with ID ${id}.`);
      return next(new AppError('Node not found', 404));
    }
    logger.info(`Node ${id} updated: ${result.rows[0].designation}`);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating node ${req.params.id}: ${error.message}`, {
      stack: error.stack,
      nodeId: req.params.id,
      updateData: req.body,
    });
    next(error);
  }
};

/**
 * @description Delete a security node.
 * @route DELETE /api/nodes/:id
 * @access Private
 */
exports.deleteNode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM security_nodes WHERE node_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      logger.warn(`Attempted to delete non-existent node with ID ${id}.`);
      return next(new AppError('Node not found', 404));
    }
    logger.info(`Node ${id} deleted: ${result.rows[0].designation}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting node ${req.params.id}: ${error.message}`, {
      stack: error.stack,
      nodeId: req.params.id,
    });
    next(error);
  }
};
