const express = require('express');
const cameraController = require('../controllers/cameraController');

const router = express.Router();

// Authentication middleware has been removed.
router.get('/', cameraController.getAllNodes);
router.post('/', cameraController.addNode);
router.delete('/:id', cameraController.deleteNode);

module.exports = router;