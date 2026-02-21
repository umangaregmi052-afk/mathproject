require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ── DATABASE ───────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL CHECK (type IN ('example', 'exercise')),
      topic TEXT NOT NULL CHECK (topic IN (
      'limits','higher_derivatives','asymptotes','pedal_equation','radius_curvature',
      'methods_integration','definite_integral','diff_integral_sign','improper_integral',
      'beta_gamma','area_curve','arc_length','surface_revolution','volume_revolution','centroid_inertia',
      'homogeneous_ode','bernoulli','first_higher_ode','second_order_linear','second_nonhomogeneous','application_ode'
    )),
      subtopic TEXT DEFAULT '',
      page TEXT DEFAULT '',
      question TEXT NOT NULL,
      solution TEXT DEFAULT '',
      solved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✓ Database ready');
}

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// ── ROUTES ─────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// GET all questions (with optional filters)
app.get('/api/questions', async (req, res) => {
  try {
    const { topic, type, solved, search } = req.query;
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (topic && topic !== 'all') {
      params.push(topic);
      query += ` AND topic = $${params.length}`;
    }
    if (type && type !== 'all') {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    if (solved === 'true') query += ' AND solved = TRUE';
    if (solved === 'false') query += ' AND solved = FALSE';
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (question ILIKE $${params.length} OR subtopic ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET single question
app.get('/api/questions/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// POST create question
app.post('/api/questions', async (req, res) => {
  try {
    const { type, topic, subtopic, page, question, solution } = req.body;
    if (!type || !topic || !question) {
      return res.status(400).json({ error: 'type, topic and question are required' });
    }
    const result = await pool.query(
      `INSERT INTO questions (type, topic, subtopic, page, question, solution)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [type, topic, subtopic || '', page || '', question, solution || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PATCH update solution
app.patch('/api/questions/:id/solution', async (req, res) => {
  try {
    const { solution } = req.body;
    const result = await pool.query(
      'UPDATE questions SET solution = $1 WHERE id = $2 RETURNING *',
      [solution, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update solution' });
  }
});

// PATCH toggle solved
app.patch('/api/questions/:id/solved', async (req, res) => {
  try {
    const { solved } = req.body;
    const result = await pool.query(
      'UPDATE questions SET solved = $1 WHERE id = $2 RETURNING *',
      [solved, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update solved status' });
  }
});

// DELETE question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE solved = TRUE) AS solved,
        COUNT(*) FILTER (WHERE type = 'example') AS examples,
        COUNT(*) FILTER (WHERE type = 'exercise') AS exercises
      FROM questions
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── START ──────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`✓ MathBank server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
