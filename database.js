const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2411',  // ← YOUR PASSWORD THAT WORKS MANUALLY
    database: 'medicare',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


module.exports = db.promise();
