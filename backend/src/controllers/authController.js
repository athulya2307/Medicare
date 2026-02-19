const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Create patient record
    await pool.execute(
      'INSERT INTO patients (user_id) VALUES (?)',
      [result.insertId]
    );

    // Generate token
    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [rows] = await pool.execute(
      'SELECT user_id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    // Check if user exists
    let [rows] = await pool.execute(
      'SELECT user_id, name, email, role FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let user;
    if (rows.length === 0) {
      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, google_id, role) VALUES (?, ?, ?, "patient")',
        [name, email, googleId]
      );

      await pool.execute('INSERT INTO patients (user_id) VALUES (?)', [result.insertId]);
      user = { user_id: result.insertId, name, email, role: 'patient' };
    } else {
      user = rows[0];
    }

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Google login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, googleLogin };
