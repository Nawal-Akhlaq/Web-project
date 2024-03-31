const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '12345',
    database: 'mysql',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1); // Exit the process if there's an error connecting to the database
    }
    console.log('Database connection established');

    connection.query("CREATE DATABASE IF NOT EXISTS mysql", (err) => {
        if (err) {
            console.error('Error creating database:', err);
            process.exit(1);
        }
        console.log('Database created');

        connection.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255))", (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                process.exit(1);
            }
            console.log('Users table created');
            connection.release();
        });
    });
});

module.exports = pool;
