const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

router.use(auth);
router.use(roleAuth(['patient']));

// Find doctors - FIXED VERSION
router.get('/find-doctors', async (req, res) => {
    try {
        console.log('🔍 Find doctors called');
        
        const { name, hospital, specialization, date } = req.query;
        
        let query = `
            SELECT DISTINCT u.name as doctor_name, h.name as hospital_name, d.specialization,
                   GROUP_CONCAT(CONCAT(dhs.day_of_week, ' ', TIME_FORMAT(dhs.start_time, '%H:%i'), '-', TIME_FORMAT(dhs.end_time, '%H:%i'))) as slots
            FROM users u 
            JOIN doctors d ON u.id = d.user_id
            JOIN doctor_hospital_schedule dhs ON d.id = dhs.doctor_id
            JOIN hospitals h ON dhs.hospital_id = h.id
            WHERE 1=1
        `;
        let params = [];

        if (name) {
            query += ' AND u.name LIKE ?';
            params.push(`%${name}%`);
        }
        if (hospital) {
            query += ' AND h.name LIKE ?';
            params.push(`%${hospital}%`);
        }
        if (specialization) {
            query += ' AND d.specialization = ?';
            params.push(specialization);
        }

        query += ' GROUP BY d.id';

        console.log('SQL:', query, 'Params:', params);
        const [doctors] = await db.execute(query, params);
        
        res.json(doctors);
    } catch (error) {
        console.error('🚨 Find doctors ERROR:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Book appointment - FIXED VERSION
router.post('/book', async (req, res) => {
    try {
        console.log('📅 Book appointment called');
        const { doctor_id, hospital_id, appointment_date, appointment_time } = req.body;

        // Get patient ID
        const [patientRows] = await db.execute(
            'SELECT p.id FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = ?',
            [req.user.id]
        );
        
        if (patientRows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        const patientId = patientRows[0].id;

        // Insert appointment
        await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?, ?)',
            [patientId, doctor_id, hospital_id, appointment_date, appointment_time]
        );

        res.json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('🚨 Book appointment ERROR:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
