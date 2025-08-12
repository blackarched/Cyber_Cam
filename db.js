const { Pool } = require('pg');
const config = require('../../config');
const logger = require('./logger');

// Configuration for the database connection pool
const dbConfig = {
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.password,
    port: config.db.port,
    max: 20, // Max number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 10000, // How long to wait for a connection from the pool
};

// Instantiate the connection pool
const pool = new Pool(dbConfig);

// Event listener for new client connections
pool.on('connect', client => {
    logger.info(`Database client connected. Total clients: ${pool.totalCount}`);
});

// Event listener for client errors
pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle PostgreSQL client', { 
        error: err.message, 
        stack: err.stack 
    });
    process.exit(-1); // Terminate the process on critical pool error
});

logger.info(`Quantum Database Pool initialized for [${config.db.host}:${config.db.port}]`);

/**
 * Executes a SQL query against the database connection pool.
 * @param {string} text - The SQL query string, with placeholders ($1, $2, etc.).
 * @param {Array} params - An array of values to substitute for the placeholders.
 * @returns {Promise<object>} A promise that resolves with the query result object.
 * @example
 * const { rows } = await db.query('SELECT * FROM system_users WHERE user_id = $1', [userId]);
 */
module.exports = {
  query: (text, params) => pool.query(text, params),
  // Expose the pool directly for more complex transactions if needed
  getPool: () => pool,
};