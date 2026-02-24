const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

router.use(auth);
router.use(roleAuth(['admin']));

// Add doctor
router.post('/doctors', async (req, res) => {
    try {
        const { name, email, password, specialization, phone } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "doctor")',
            [name, email, hashedPassword]
        );

        await db.execute(
            'INSERT INTO doctors (user_id, specialization, phone) VALUES (?, ?, ?)',
            [userResult.insertId, specialization, phone]
        );

        res.json({ message: 'Doctor added successfully', doctor_id: userResult.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add hospital
router.post('/hospitals', async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO hospitals (name, address, phone) VALUES (?, ?, ?)',
            [name, address, phone]
        );

        res.json({ message: 'Hospital added', hospital_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign doctor to hospital schedule
router.post('/schedule', async (req, res) => {
    try {
        const { doctor_id, hospital_id, day_of_week, start_time, end_time } = req.body;
        
        await db.execute(
            'INSERT INTO doctor_hospital_schedule (doctor_id, hospital_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
            [doctor_id, hospital_id, day_of_week, start_time, end_time]
        );

        res.json({ message: 'Schedule added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
