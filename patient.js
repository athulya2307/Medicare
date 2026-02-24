const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

router.use(auth);
router.use(roleAuth(['patient']));

// Get patient health metrics
router.get('/health-metrics', async (req, res) => {
    try {
        const [patientRows] = await db.execute(
            'SELECT p.id as patient_id FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = ?',
            [req.user.id]
        );
        
        if (patientRows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const patientId = patientRows[0].patient_id;
        const [metrics] = await db.execute(
            'SELECT * FROM health_metrics WHERE patient_id = ? ORDER BY measured_at DESC LIMIT 1',
            [patientId]
        );

        res.json(metrics[0] || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update health metrics
router.post('/health-metrics', async (req, res) => {
    try {
        const { height, weight, blood_sugar, cholesterol, blood_pressure } = req.body;
        const bmi = (weight / Math.pow(height / 100, 2)).toFixed(2);

        const [patientRows] = await db.execute(
            'SELECT p.id FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = ?',
            [req.user.id]
        );
        const patientId = patientRows[0].id;

        await db.execute(
            'INSERT INTO health_metrics (patient_id, height, weight, bmi, blood_sugar, cholesterol, blood_pressure) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patientId, height, weight, bmi, blood_sugar, cholesterol, blood_pressure]
        );

        res.json({ message: 'Health metrics updated', bmi });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
