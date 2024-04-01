// db.js
const mysql = require('mysql2/promise');
require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
})
 module.exports.getConnection = async () => {
    try {
        const connection = await db.getConnection();
        return connection;
    } catch (err) {
        console.error('Error getting database connection:', err);
        throw err;
    }
};