const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // For password hashing

const app = express();
const port = process.env.PORT || 3000;

const connection = require('./db');

app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
  try {
      const { name, email, password } = req.body;

      // Basic validation
      if (!name || !email || !password) {
          return res.status(400).send('Please provide name, email, and password');
      }

      // Check for existing user
      const existingUser = await checkExistingUser(email);
      if (existingUser) {
          return res.status(409).send('Email already in use');
      }

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into database
      await connection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

      res.status(201).send('User created successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Retrieve user from database
      const user = await getUserByEmail(email);

      if (!user) {
          return res.status(401).send('Invalid email or password');
      }

      // Compare password with hashed password from database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
          // Successful login
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
  if (req.body.role !== 'admin') {
      return res.status(403).send('Only admins can add games');
  }
  next();
}

app.post('/addGame', isAdmin, async (req, res) => {
  try {
      const { name, description } = req.body;

      // Basic validation
      if (!name || !description) {
          return res.status(400).send('Please provide name and description for the game');
      }

      // Insert game into database
      await connection.query('INSERT INTO games (name, description) VALUES (?, ?)', [name, description]);

      res.status(201).send('Game added successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.post('/add-event', async (req, res) => {
  try {
      const { gameId, eventName, description, startDate, startTime, endDate, endTime, maxParticipants } = req.body;
      const { email } = req.user; // Assuming req.user contains the email of the logged-in user

      // Check if user is an eventManager
      const user = await getUserByEmail(email);
      if (!user || user.role !== 'eventManager') {
          return res.status(403).send('Only event managers can add events');
      }

      // Insert event into database
      await connection.query('INSERT INTO event (game_id, event_name, description, event_date, event_time, end_date, end_time, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)', [gameId, eventName, description, startDate, startTime, endDate, endTime, maxParticipants]);

      res.status(201).send('Event added successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.delete('/delete-event/:eventId', async (req, res) => {
  try {
      const { eventId } = req.params;
      const { email } = req.user; // Assuming req.user contains the email of the logged-in user

      // Check if user is an eventManager
      const user = await getUserByEmail(email);
      if (!user || user.role !== 'eventManager') {
          return res.status(403).send('Only event managers can delete events');
      }

      // Delete event from database
      const result = await connection.query('DELETE FROM event WHERE id = ?', [eventId]);

      if (result.affectedRows === 0) {
          return res.status(404).send('Event not found');
      }

      res.status(200).send('Event deleted successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.put('/update-event/:eventId', async (req, res) => {
  try {
      const { eventId } = req.params;
      const { email } = req.user; // Assuming req.user contains the email of the logged-in user
      const { description, startTime, endTime, maxParticipants } = req.body;

      // Check if user is an eventManager
      const user = await getUserByEmail(email);
      if (!user || user.role !== 'eventManager') {
          return res.status(403).send('Only event managers can update events');
      }

      // Update event details in the database
      const result = await connection.query(
          'UPDATE event SET description = ?, start_time = ?, end_time = ? WHERE id = ?',
          [description, startTime, endTime, eventId]
      );

      if (result.affectedRows === 0) {
          return res.status(404).send('Event not found');
      }

      res.status(200).send('Event details updated successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});

app.post('/add-participant', async (req, res) => {
  try {
      const { eventId, name, email } = req.body;
      const { email: userEmail } = req.user; // Assuming req.user contains the email of the logged-in user

      // Check if user is a participant
      const user = await getUserByEmail(userEmail);
      if (!user || user.role !== 'participant') {
          return res.status(403).send('Only participants can be added to events');
      }

      // Insert participant into database
      await connection.query('INSERT INTO participants (event_id, name, email) VALUES (?, ?, ?)', [eventId, name, email]);

      res.status(201).send('Participant added successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

async function checkExistingUser(email) {
  const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}

async function getUserByEmail(email) {
  const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows.length > 0 ? rows[0] : null;
}