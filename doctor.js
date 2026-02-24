const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

router.use(auth);
router.use(roleAuth(['doctor']));

// Search patient
router.get('/search-patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const [patient] = await db.execute(
            `SELECT u.name, u.email, p.id as patient_id, 
                    hm.*,
                    GROUP_CONCAT(mr.ai_summary) as ai_summaries
             FROM users u 
             JOIN patients p ON u.id = p.user_id 
             LEFT JOIN health_metrics hm ON p.id = hm.patient_id
             LEFT JOIN medical_reports mr ON p.id = mr.patient_id
             WHERE p.id = ? 
             GROUP BY p.id`,
            [patientId]
        );

        res.json(patient[0] || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get appointments
router.get('/appointments', async (req, res) => {
    try {
        const [doctorRows] = await db.execute(
            'SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.id = ?',
            [req.user.id]
        );
        const doctorId = doctorRows[0].id;

        const [appointments] = await db.execute(
            `SELECT a.*, u.name as patient_name, h.name as hospital_name 
             FROM appointments a 
             JOIN users u ON a.patient_id = u.id
             JOIN hospitals h ON a.hospital_id = h.id
             WHERE a.doctor_id = ?
             ORDER BY a.appointment_date, a.appointment_time`,
            [doctorId]
        );

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
