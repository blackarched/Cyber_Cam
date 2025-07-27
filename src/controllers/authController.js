const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const config = require('../../config');
const db = require('../services/db');

/**
 * @description Register a new user.
 * @route POST /api/auth/register
 * @access Public
 */
const AppError = require('../utils/errorFormatter');
const { logger } = require('../services/logger');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12); // Enforce salt rounds
    const result = await db.query(
      'INSERT INTO system_users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
      [username, email, passwordHash]
    );
    logger.info(`User ${username} registered successfully.`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      logger.warn(`Attempt to register with existing username or email: ${req.body.username} / ${req.body.email}`);
      return next(new AppError('A user with that email or username already exists.', 409));
    }
    logger.error(`Error during user registration: ${error.message}`, {
      stack: error.stack,
      username: req.body.username,
      email: req.body.email,
    });
    next(error);
  }
};

/**
 * @description Set up MFA for the current user.
 * @route POST /api/auth/mfa/setup
 * @access Private
 */
exports.setupMfa = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const secret = speakeasy.generateSecret({ name: `NEXUS Grid (${req.body.email})` });

    await db.query(
      'INSERT INTO user_mfa_secrets (user_id, secret) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET secret = $2, is_verified = false',
      [userId, secret.base32]
    );

    try {
      const data_url = await qrcode.toDataURL(secret.otpauth_url);
      logger.info(`MFA setup initiated for user ${userId}.`);
      res.json({
        secret: secret.base32,
        qrCodeUrl: data_url,
        message: 'Scan this QR code with your authenticator app and verify to enable MFA.',
      });
    } catch (err) {
      logger.error(`Error generating QR code for user ${userId}: ${err.message}`, {
        stack: err.stack,
        userId,
      });
      return next(new AppError('Failed to generate QR code.', 500));
    }
  } catch (error) {
    logger.error(`Error during MFA setup for user ${req.user.userId}: ${error.message}`, {
      stack: error.stack,
      userId: req.user.userId,
    });
    next(error);
  }
};
/**
 * @description Verify MFA for the current user.
 * @route POST /api/auth/mfa/verify
 * @access Private
 */
exports.verifyMfa = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    const { rows } = await db.query('SELECT secret FROM user_mfa_secrets WHERE user_id = $1', [userId]);
    if (rows.length === 0) {
      return next(new AppError('MFA not set up for this user.', 400));
    }
    const { secret } = rows[0];

    const isVerified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
    });

    if (isVerified) {
      await db.query('UPDATE user_mfa_secrets SET is_verified = true WHERE user_id = $1', [userId]);
      logger.info(`MFA verification successful for user ${userId}.`);
      res.json({ message: 'MFA enabled successfully.' });
    } else {
      logger.warn(`Invalid MFA token for user ${userId}.`);
      return next(new AppError('Invalid token, verification failed.', 400));
    }
  } catch (error) {
    logger.error(`Error during MFA verification for user ${req.user.userId}: ${error.message}`, {
      stack: error.stack,
      userId: req.user.userId,
    });
    next(error);
  }
};

/**
 * @description Log in a user.
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, mfaToken } = req.body;
    const { rows } = await db.query('SELECT * FROM system_users WHERE email = $1', [email]);
    if (rows.length === 0) {
      logger.warn(`Login attempt for non-existent user: ${email}`);
      return next(new AppError('Invalid credentials.', 401));
    }
    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${email}`);
      return next(new AppError('Invalid credentials.', 401));
    }

    const mfaResult = await db.query('SELECT * FROM user_mfa_secrets WHERE user_id = $1 AND is_verified = true', [user.user_id]);
    if (mfaResult.rows.length > 0) {
      if (!mfaToken) {
        logger.warn(`MFA token required for user: ${email}`);
        return next(new AppError('MFA token is required.', 401));
      }
      const { secret } = mfaResult.rows[0];
      const isTokenValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: mfaToken,
        window: 1,
      });

      if (!isTokenValid) {
        logger.warn(`Invalid MFA token for user: ${email}`);
        return next(new AppError('Invalid MFA token.', 401));
      }
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
    logger.info(`User ${user.username} logged in successfully.`);
    res.json({ token, user: { id: user.user_id, username: user.username, role: user.role } });
  } catch (error) {
    logger.error(`Error during login for user ${req.body.email}: ${error.message}`, {
      stack: error.stack,
      email: req.body.email,
    });
    next(error);
  }
};