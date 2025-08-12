const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const db = require('../services/db');
const logger = require('../services/logger');

/**
 * Registers a new user in the system.
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // Enforce strong password hashing with a fixed salt round count
    const passwordHash = await bcrypt.hash(password, 12);
    
    const result = await db.query(
      'INSERT INTO system_users (username, email, password_hash, salt, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, role',
      [username, email, passwordHash, 'bcrypt_salt_placeholder', 'operator'] // Salt is stored in the hash itself with bcrypt
    );

    logger.info(`New user registered: ${username}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error during user registration', { error: error.message });
    next(error);
  }
};

/**
 * Authenticates a user and provides a JWT.
 */
exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const { rows } = await db.query('SELECT * FROM system_users WHERE username = $1', [username]);

        if (rows.length === 0) {
            logger.warn(`Login failed: User not found - ${username}`);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password for user ${username}`);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT with user ID and role in the payload
        const tokenPayload = { id: user.user_id, role: user.role };
        const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '8h' });

        logger.info(`User authenticated successfully: ${username}`);
        res.status(200).json({
            message: 'Authentication successful.',
            token: token,
            user: { id: user.user_id, username: user.username, role: user.role }
        });

    } catch (error) {
        logger.error('Error during login process', { error: error.message });
        next(error);
    }
};