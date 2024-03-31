// db.js
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

    // Check and grant necessary privileges
    connection.query("GRANT ALL PRIVILEGES ON mysql.* TO 'root'@'localhost'", (err) => {
        if (err) {
            console.error('Error granting privileges:', err);
            process.exit(1);
        }
        console.log('Privileges granted');

        connection.query("FLUSH PRIVILEGES", (err) => {
            if (err) {
                console.error('Error flushing privileges:', err);
                process.exit(1);
            }
            console.log('Privileges flushed');

            // Continue with table creation
            connection.query("CREATE DATABASE IF NOT EXISTS mysql", (err) => {
                if (err) {
                    console.error('Error creating database:', err);
                    process.exit(1);
                }
                console.log('Database created');

                connection.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255), role VARCHAR(255))", (err) => {
                    if (err) {
                        console.error('Error creating users table:', err);
                        process.exit(1);
                    }
                    console.log('Users table created');

                    connection.query("CREATE TABLE IF NOT EXISTS games (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description TEXT, genre VARCHAR(255))", (err) => {
                        if (err) {
                            console.error('Error creating games table:', err);
                            process.exit(1);
                        }
                        console.log('Games table created');

                        connection.query("CREATE TABLE IF NOT EXISTS event (id INT AUTO_INCREMENT PRIMARY KEY, game_id INT, event_name VARCHAR(255), event_date DATE, event_time TIME, description TEXT, max_participants INT, FOREIGN KEY (game_id) REFERENCES games(id))", (err) => {
                            if (err) {
                                console.error('Error creating event table:', err);
                                process.exit(1);
                            }
                            console.log('Event table created');

                            connection.query("CREATE TABLE IF NOT EXISTS participants (id INT AUTO_INCREMENT PRIMARY KEY, event_id INT, name VARCHAR(255), email VARCHAR(255), FOREIGN KEY (event_id) REFERENCES events(id))", (err) => {
                                if (err) {
                                    console.error('Error creating participants table:', err);
                                    process.exit(1);
                                }
                                console.log('Participants table created');
                                connection.release();
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = pool;
