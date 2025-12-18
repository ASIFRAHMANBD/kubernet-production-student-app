const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'studentdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Initialize database
pool.query(`
  CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    roll INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    class VARCHAR(50) NOT NULL
  )
`).then(() => console.log('Database initialized'))
  .catch(err => console.error('Database error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY roll');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by id
app.get('/api/students/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student
app.post('/api/students', async (req, res) => {
  const { roll, name, class: studentClass } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO students (roll, name, class) VALUES ($1, $2, $3) RETURNING *',
      [roll, name, studentClass]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  const { roll, name, class: studentClass } = req.body;
  try {
    const result = await pool.query(
      'UPDATE students SET roll = $1, name = $2, class = $3 WHERE id = $4 RETURNING *',
      [roll, name, studentClass, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
