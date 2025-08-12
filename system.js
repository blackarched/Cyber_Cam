const express = require('express');
const systemController = require('../controllers/systemController');
const anonymousUserMiddleware = require('../middleware/anonymousUser');

const router = express.Router();

// JWT authentication is replaced with the anonymous user middleware.
router.use(anonymousUserMiddleware);

router.post('/arm', systemController.armSystem);
router.post('/disarm', systemController.disarmSystem);
router.post('/record/all', systemController.recordAll);
router.post('/night-vision/toggle', systemController.toggleNightVision);
router.post('/emergency/lockdown', systemController.activateLockdown);

module.exports = router;