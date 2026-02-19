const pool = require('../config/database');

const getHealthMetrics = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [rows] = await pool.execute(
      `SELECT 
        health_id, weight, height, blood_sugar, cholesterol, 
        bp_systolic, bp_diastolic, bmi, recorded_at
       FROM health_metrics 
       WHERE user_id = ? 
       ORDER BY recorded_at DESC 
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Get health metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addHealthMetric = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      weight, height, blood_sugar, cholesterol,
      bp_systolic, bp_diastolic, bmi
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO health_metrics 
       (user_id, weight, height, blood_sugar, cholesterol, 
        bp_systolic, bp_diastolic, bmi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, weight, height, blood_sugar, cholesterol,
       bp_systolic, bp_diastolic, bmi]
    );

    res.status(201).json({
      success: true,
      message: 'Health metric added successfully',
      data: { health_id: result.insertId }
    });
  } catch (error) {
    console.error('Add health metric error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getHealthMetrics, addHealthMetric };
