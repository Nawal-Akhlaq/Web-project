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