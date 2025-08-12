const logger = require('../services/logger');

// These are placeholder functions. In a real system, they would trigger complex backend logic.
const createSystemAction = (actionName) => {
    return (req, res, next) => {
        logger.info(`System action triggered by user ${req.user.id}: ${actionName}`);
        res.status(200).json({ message: `${actionName} command acknowledged and executed.` });
    };
};

exports.armSystem = createSystemAction('ARM_SYSTEM');
exports.disarmSystem = createSystemAction('DISARM_SYSTEM');
exports.recordAll = createSystemAction('RECORD_ALL_FEEDS');
exports.toggleNightVision = createSystemAction('TOGGLE_NIGHT_VISION');
exports.toggleMotionTrack = createSystemAction('TOGGLE_MOTION_TRACKING');
exports.activateLockdown = createSystemAction('ACTIVATE_EMERGENCY_LOCKDOWN');
exports.getConfiguration = createSystemAction('GET_SYSTEM_CONFIGURATION');