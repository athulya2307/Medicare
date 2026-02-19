const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getHealthMetrics, addHealthMetric } = require('../controllers/healthMetricsController');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getHealthMetrics);
router.post('/', addHealthMetric);

module.exports = router;
