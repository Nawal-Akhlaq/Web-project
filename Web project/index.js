const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

const db = require('./db');
const mysql = require('mysql2/promise');

app.use(express.json());

app.post('/signup', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const idusers = req.body.idusers;
    const role = req.body.role;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const connection = await db.getConnection();
        const sqlSearch = "SELECT * FROM users WHERE name = ?";
        const search_query = mysql.format(sqlSearch, [name]);
        const sqlInsert = "INSERT INTO users (idusers, name, password, email, role) VALUES (?,?,?,?,?)"; // Adjust this query to match your table structure
        const insert_query = mysql.format(sqlInsert, [idusers, name, hashedPassword, email, role]);

        const [result] = await connection.query(search_query);
        console.log("------> Search Results");
        console.log(result.length);
        if (result.length !== 0) {
            connection.release();
            console.log("------> User already exists");
            res.sendStatus(409);
        } else {
            await connection.query(insert_query);
            connection.release();
            console.log("--------> Created new User");
            res.sendStatus(201);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const connection = await db.getConnection();
        const sqlSearch = "SELECT * FROM users WHERE email = ?";
        const search_query = mysql.format(sqlSearch, [email]);
        const [userResult] = await connection.query(search_query);

        if (userResult.length === 0) {
            res.status(401).send('Invalid email or password');
            return;
        }

        const user = userResult[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Store user ID in session
            req.session.userId = user.idusers;
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

function isAdmin(req, res, next) {
    if (req.session.userId && req.body.role !== 'admin') {
        return res.status(403).send('Only admins can add games');
    }
    next();
}

function isManager(req, res, next) {
    if (req.session.userId && req.body.role !== 'eventManager') {
        return res.status(403).send('Only Event Managers can add events');
    }
    next();
}
app.post('/addGame', isAdmin, async (req, res) => {
    try {
        const { idgames, name, description, genre } = req.body;

        // Basic validation
        if (!name || !description || !genre) {
            return res.status(400).send('Please provide name, description, and genre for the game');
        }

        const connection = await db.getConnection(); // Establish database connection

        // Insert game into database
        await connection.query('INSERT INTO games (idgames, name, description, genre) VALUES (?, ?, ?, ?)', [idgames, name, description, genre]);

        connection.release(); // Release the connection

        res.status(201).send('Game added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});
app.post('/addEvent', isManager,async (req, res) => {
    try {
        const { eventid, eventName, description, startdate, enddate } = req.body;
        const connection = await db.getConnection();
        // Insert event into database
        await connection.query('INSERT INTO events (idevents, event_name, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)', [eventid, eventName, description, startdate, enddate]);
  
        res.status(201).send('Event added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
