const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test DB connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ MySQL connected successfully');
    connection.release();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/appointments', require('./routes/appointments'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
