require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ── DATABASE ───────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const VALID_TOPICS = [
  'limits','higher_derivatives','asymptotes','pedal_equation','radius_curvature',
  'methods_integration','definite_integral','diff_integral_sign','improper_integral',
  'beta_gamma','area_curve','arc_length','surface_revolution','volume_revolution','centroid_inertia',
  'homogeneous_ode','bernoulli','first_higher_ode','second_order_linear','second_nonhomogeneous','application_ode'
];

// ── SEED DATA ──────────────────────────────────────────
const SEED_QUESTIONS = [
  // ASYMPTOTES
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R·θ = a",solution:"Step 1: 1/R = θ/a = f(θ).\nStep 2: f(θ)=0 → θ=0, so α=0.\nStep 3: f'(θ)=1/a, f'(0)=1/a.\nStep 4: R·sin(θ-0) = a → R·sinθ = a"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = (θ² + 1) / θ",solution:"Step 1: 1/R = θ/(θ²+1) = f(θ).\nStep 2: f(θ)=0 → θ=0, α=0.\nStep 3: f'(0)=1.\nStep 4: R·sinθ = 1 (i.e. R = cscθ)"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = θ / (θ - π)",solution:"Step 1: 1/R = (θ-π)/θ = f(θ).\nStep 2: f(θ)=0 → θ=π, α=π.\nStep 3: f'(π)=1/π.\nStep 4: R·sin(θ-π) = π → R·sinθ = -π"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R·cosθ = 2a·sinθ",solution:"Step 1: 1/R = (1/2a)cotθ = f(θ).\nStep 2: α₁=π/2, α₂=3π/2.\nStep 3: f'(π/2) = f'(3π/2) = -1/2a.\nFor α₁: R·cosθ = 2a. For α₂: R·cosθ = -2a"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = a·cscθ + b",solution:"Step 1: 1/R = sinθ/(a+b·sinθ) = f(θ).\nStep 2: α₁=0, α₂=π.\nStep 3: f'(0)=1/a, f'(π)=-1/a.\nBoth give asymptote: R·sinθ = a"},
  {type:"example",topic:"asymptotes",subtopic:"Rational Functions",page:"",question:"Find all asymptotes of f(x) = (x + 1) / (x² - 3x + 2)",solution:"Vertical: x²-3x+2=0 → x=1 and x=2.\nHorizontal: lim(x→∞) f(x) = 0 → y=0"},
  {type:"example",topic:"asymptotes",subtopic:"Rational Functions",page:"",question:"Find all asymptotes of f(x) = (x² + 2x - 1) / x",solution:"Vertical: x=0.\nNo horizontal asymptote.\nOblique: f(x)=x+2-1/x → y=x+2"},
  {type:"example",topic:"asymptotes",subtopic:"Implicit Functions",page:"",question:"Find the asymptotes of the curve y³ - xy² - x²y + x³ + x² - y² - 1 = 0",solution:"φ₃(m)=(m-1)²(m+1)=0 → m=1,1,-1.\nFor m=-1: asymptote y=-x.\nFor m=1 (repeated): c=0 or c=2 → asymptotes y=x and y=x+2"},
  // HIGHER DERIVATIVES
  {type:"example",topic:"higher_derivatives",subtopic:"Basic Differentiation",page:"",question:"Find dy/dx of y = 3x⁴ + 4·log(x) + 7·tan(x) + 6",solution:"dy/dx = 12x³ + 4/x + 7sec²x"},
  {type:"example",topic:"higher_derivatives",subtopic:"Power Rule",page:"",question:"Find dy/dx of y = x^(1/5) + 4·cos(x) + aᵇ",solution:"dy/dx = (1/5)x^(-4/5) - 4sinx + 0"},
  {type:"example",topic:"higher_derivatives",subtopic:"Product Rule",page:"",question:"Find the derivative of y = x²·sin(x)",solution:"Using product rule: x²cosx + sinx·2x = x²cosx + 2x·sinx"},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Basic Formulae",page:"",question:"What is the derivative of tan⁻¹(x)?",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Product Rule",page:"",question:"Find the derivative of y = x²·tan⁻¹(x)",solution:"x²·(1/(1+x²)) + tan⁻¹(x)·2x = x²/(1+x²) + 2x·tan⁻¹x"},
  {type:"example",topic:"higher_derivatives",subtopic:"Quotient Rule",page:"",question:"Find dy/dx of y = x² / (1 + x²)",solution:"[(1+x²)(2x) - x²(2x)] / (1+x²)² = 2x/(1+x²)²"},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Quotient Rule",page:"",question:"Find dy/dx of y = (tan(x) + 4) / (1 + log(x))",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Chain Rule",page:"",question:"Differentiate y = tan(log x)",solution:"sec²(logx) · (1/x)"},
  {type:"example",topic:"higher_derivatives",subtopic:"Chain Rule",page:"",question:"Differentiate y = sin(√(tan x))",solution:"cos(√tanx) · (1/(2√tanx)) · sec²x"},
  // RADIUS OF CURVATURE
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find the radius of curvature at any point on y = a·log(sec(x/a))",solution:"y₁ = tan(x/a), y₂ = (1/a)sec²(x/a).\nρ = (sec²(x/a))^(3/2) / [(1/a)sec²(x/a)] = a·sec(x/a)"},
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find the radius of curvature at (1, -1) on y = x² - 3x + 1",solution:"y₁=-1, y₂=2 at (1,-1).\nρ = (1+1)^(3/2)/2 = √2"},
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find ρ for y = c·cosh(x/c) and show ρ = y²/c",solution:"y₁=sinh(x/c), y₂=y/c².\nρ = cosh³(x/c)/(y/c²) = y²/c"},
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find ρ at (a, 0) for y = x³(x - a)",solution:"y₁=a³, y₂=6a² at (a,0).\nρ = (1+a⁶)^(3/2) / 6a²"},
  {type:"example",topic:"radius_curvature",subtopic:"Implicit Function",page:"",question:"Find ρ at (3a/2, 3a/2) on x³ + y³ = 3axy",solution:"y₁=-1, y₂=-32/3a at that point.\nρ = 2^(3/2)/(32/3a) = 3a/(8√2)"},
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find ρ for b²x² + a²y² = a²b² where it meets the y-axis",solution:"At (0,±b): y₁=0, y₂=-b/a².\nρ = a²/b"},
  {type:"example",topic:"radius_curvature",subtopic:"Implicit Function",page:"",question:"Find ρ for √x + √y = √a at the point where it cuts y = x",solution:"Point (a/4, a/4): y₁=-1, y₂=4/a.\nρ = 2^(3/2)/(4/a) = a/√2"},
  {type:"example",topic:"radius_curvature",subtopic:"Parametric Form",page:"",question:"Find ρ at any point on the cycloid x = a(θ + sinθ), y = a(1 - cosθ)",solution:"y₁=tan(θ/2), y₂=sec⁴(θ/2)/(4a).\nρ = 4a·cos(θ/2)"},
  {type:"example",topic:"radius_curvature",subtopic:"Parametric Form",page:"",question:"Find ρ for x = a(cosθ + θ·sinθ), y = a(sinθ - θ·cosθ) and show ρ ∝ θ",solution:"y₁=tanθ, y₂=1/(aθcos³θ).\nρ = aθ, hence ρ ∝ θ"},
  {type:"example",topic:"radius_curvature",subtopic:"Parametric Form",page:"",question:"If ρ₁ and ρ₂ are the radii of curvature at the extremities of a focal chord of y² = 4ax, show ρ₁^(-2/3) + ρ₂^(-2/3) = (2a)^(-2/3)",solution:"ρ=2a(1+t²)^(3/2). With t₁t₂=-1:\nρ₁^(-2/3)+ρ₂^(-2/3) = (2a)^(-2/3)[1/(1+t₁²)+t₁²/(t₁²+1)] = (2a)^(-2/3)"},
  {type:"exercise",topic:"radius_curvature",subtopic:"Parametric Form",page:"",question:"Find the radius of curvature of the ellipse x = a·cosθ, y = b·sinθ",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"At the Origin (Newton's Formula)",page:"",question:"Find ρ at the origin for 3x² + 4y² = 2x",solution:"Tangent: x=0. ρ = lim y²/2x.\n3x/2 + 4(y²/2x)=1 → 4ρ=1 → ρ=1/4"},
  {type:"example",topic:"radius_curvature",subtopic:"At the Origin (Newton's Formula)",page:"",question:"Find ρ at the origin for 4x² - 3xy + y² - 3y = 0",solution:"Tangent: y=0. ρ = lim x²/2y.\n4ρ - 3/2 = 0 → ρ = 3/8"},
  {type:"example",topic:"radius_curvature",subtopic:"At the Origin (Newton's Formula)",page:"",question:"Find ρ at the origin for x³ + y³ - 2x² + 6y = 0",solution:"Tangent: y=0. ρ = lim x²/2y.\n-2ρ+3=0 → ρ=3/2"},
  {type:"example",topic:"radius_curvature",subtopic:"Maclaurin Series",page:"",question:"Find ρ at the origin for y² = x²(a+x)/(a-x)",solution:"Tangents: y=±x. p=±1, q=±2/a.\nρ=(1+1)^(3/2)/(2/a) = a√2"},
  {type:"example",topic:"radius_curvature",subtopic:"Cartesian Form",page:"",question:"Find ρ for y = x²(x-3) where the tangent is parallel to the x-axis",solution:"y₁=3x²-6x=0 → x=0,2.\nAt both points: y₂=±6 → ρ=1/6"},
  // PEDAL EQUATION
  {type:"example",topic:"pedal_equation",subtopic:"Polar to Pedal",page:"",question:"Convert r² = a²·cos(2θ) into pedal form and find ρ and the chord of curvature through the pole",solution:"φ=π/2+2θ, p=r·cos2θ=r³/a².\nPedal: pa²=r³.\nρ=a²/(3r).\nChord of curvature = 2r/3"},
  // AREA UNDER CURVE
  {type:"example",topic:"area_curve",subtopic:"Cartesian Integration",page:"",question:"Find the area of the circle x² + y² = a² using integration",solution:"Area = 4∫₀ᵃ √(a²-x²)dx.\nSub x=a·sinθ → 4a²∫₀^(π/2) cos²θ dθ = πa²"},
  {type:"example",topic:"area_curve",subtopic:"Parametric Form",page:"",question:"Find the area of the astroid x^(2/3) + y^(2/3) = a^(2/3)",solution:"x=a·cos³θ, y=a·sin³θ.\n12a²∫₀^(π/2) sin⁴θ·cos²θ dθ = (3/8)πa²"},
  {type:"example",topic:"area_curve",subtopic:"Parametric Form",page:"",question:"Find the area of the cycloid x = a(t - sint), y = a(1 - cost)",solution:"Area = a²∫₀^(2π)(1-cost)² dt = 3πa²"},
  // VOLUME OF REVOLUTION
  {type:"example",topic:"volume_revolution",subtopic:"Revolution about x-axis",page:"",question:"Find the volume of a sphere by revolving x² + y² = a² about the x-axis",solution:"V = 2π∫₀ᵃ(a²-x²)dx = 2π[a²x - x³/3]₀ᵃ = (4/3)πa³"},
  // IMPROPER INTEGRALS
  {type:"example",topic:"improper_integral",subtopic:"Type 1 (Infinite Limit)",page:"",question:"Evaluate ∫₁^∞ (1/x²) dx",solution:"lim(T→∞)[-1/x]₁ᵀ = 0+1 = 1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 1 (Integration by Parts)",page:"",question:"Evaluate ∫₀^∞ x·e^(-x) dx",solution:"∫xe⁻ˣdx = -xe⁻ˣ - e⁻ˣ.\nlim(T→∞)[-(x+1)e⁻ˣ]₀ᵀ = 0+1 = 1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 1",page:"",question:"Evaluate ∫₀^∞ e^(-ax)·sin(bx) dx",solution:"Using formula: result = b/(a²+b²)"},
  {type:"example",topic:"improper_integral",subtopic:"Type 2 (Singularity at Endpoint)",page:"",question:"Evaluate ∫₀¹ log(x) dx",solution:"lim(h→0)[x·lnx - x]ₕ¹ = (0-1)-0 = -1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 2 (Singularity in Between)",page:"",question:"Evaluate ∫₋₁¹ (1/x²) dx",solution:"Singular at x=0. Both halves diverge → integral is divergent"},
  // DIFFERENTIATION UNDER INTEGRAL SIGN
  {type:"example",topic:"diff_integral_sign",subtopic:"Leibniz Rule",page:"",question:"Evaluate ∫₀¹ (x^α - 1) / log(x) dx",solution:"dI/dα = 1/(α+1) → I = ln(α+1)+c.\nAt α=0: I=0 → c=0. So I = ln(α+1)"},
  {type:"example",topic:"diff_integral_sign",subtopic:"Leibniz Rule",page:"",question:"Evaluate ∫₀^∞ tan⁻¹(ax) / [x(1 + x²)] dx",solution:"dI/da = π/[2(1+a)] → I = (π/2)ln(1+a)+c.\nAt a=0: c=0. So I = (π/2)ln(1+a)"},
  // BETA GAMMA
  {type:"example",topic:"beta_gamma",subtopic:"Trigonometric Substitution",page:"",question:"Evaluate ∫₀¹ x⁶·√(1 - x²) dx",solution:"x=sinθ: ∫₀^(π/2) sin⁶θ·cos²θ dθ = (1/2)β(7/2,3/2) = 5π/256"},
  {type:"example",topic:"beta_gamma",subtopic:"Algebraic Substitution",page:"",question:"Evaluate ∫₀^(2a) x⁵·√(2ax - x²) dx",solution:"x=2a·sin²θ → after substitution = (33/16)πa⁷"},
  // LIMITS
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule (1^∞ form)",page:"",question:"Evaluate lim(x→0) (tan(x)/x)^(1/x²)",solution:"ln L = lim ln(tanx/x)/x² → apply L'Hôpital twice → ln L = 1/3.\nL = e^(1/3)"},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule (0^0 form)",page:"",question:"Evaluate lim(x→0) xˣ",solution:"ln L = lim x·lnx = lim lnx/(1/x) → L'Hôpital → 0.\nL = e⁰ = 1"},
];

async function initDB() {
  // Drop and recreate — ensures schema is always fresh on deploy
  await pool.query(`DROP TABLE IF EXISTS questions CASCADE`);
  await pool.query(`
    CREATE TABLE questions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('example', 'exercise')),
      topic TEXT NOT NULL,
      subtopic TEXT DEFAULT '',
      page TEXT DEFAULT '',
      question TEXT NOT NULL,
      solution TEXT DEFAULT '',
      solved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✓ Database table ready');

  // Always seed fresh after recreating
  console.log('Seeding questions...');
  for (const q of SEED_QUESTIONS) {
    await pool.query(
      `INSERT INTO questions (type, topic, subtopic, page, question, solution)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [q.type, q.topic, q.subtopic, q.page, q.question, q.solution]
    );
  }
  console.log(`✓ Seeded ${SEED_QUESTIONS.length} questions`);
}

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── ROUTES ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/questions', async (req, res) => {
  try {
    const { topic, type, solved, search } = req.query;
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    if (topic && topic !== 'all') { params.push(topic); query += ` AND topic = $${params.length}`; }
    if (type && type !== 'all') { params.push(type); query += ` AND type = $${params.length}`; }
    if (solved === 'true') query += ' AND solved = TRUE';
    if (solved === 'false') query += ' AND solved = FALSE';
    if (search) { params.push(`%${search}%`); query += ` AND (question ILIKE $${params.length} OR subtopic ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { type, topic, subtopic, page, question, solution } = req.body;
    if (!type || !topic || !question) return res.status(400).json({ error: 'type, topic and question are required' });
    const result = await pool.query(
      `INSERT INTO questions (type, topic, subtopic, page, question, solution) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [type, topic, subtopic||'', page||'', question, solution||'']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.patch('/api/questions/:id/solution', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE questions SET solution=$1 WHERE id=$2 RETURNING *',
      [req.body.solution, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/questions/:id/solved', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE questions SET solved=$1 WHERE id=$2 RETURNING *',
      [req.body.solved, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE solved=TRUE) AS solved,
             COUNT(*) FILTER (WHERE type='example') AS examples,
             COUNT(*) FILTER (WHERE type='exercise') AS exercises
      FROM questions
    `);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── HELPERS ────────────────────────────────────────────

// Unicode → ASCII so Wolfram can parse math symbols
function normalizeForWolfram(text) {
  return text
    .replace(/^(evaluate|find|compute|calculate|solve|determine|show that|prove that|simplify)\s+/i, '')
    .replace(/lim\s*\(?\s*([a-z])\s*[→->]+\s*([^)]+)\)?\s*/gi, 'limit as $1->$2 of ')
    .replace(/lim_\{?([a-z])\s*[→->]+\s*([^}]+)\}?/gi, 'limit as $1->$2 of ')
    .replace(/⁰/g,'^0').replace(/¹/g,'^1').replace(/²/g,'^2').replace(/³/g,'^3')
    .replace(/⁴/g,'^4').replace(/⁵/g,'^5').replace(/⁶/g,'^6').replace(/⁷/g,'^7')
    .replace(/⁸/g,'^8').replace(/⁹/g,'^9').replace(/ⁿ/g,'^n').replace(/ˣ/g,'^x')
    .replace(/ᵃ/g,'^a').replace(/ᵇ/g,'^b').replace(/ᵐ/g,'^m')
    .replace(/₀/g,'_0').replace(/₁/g,'_1').replace(/₂/g,'_2').replace(/₃/g,'_3')
    .replace(/₄/g,'_4').replace(/₅/g,'_5').replace(/₆/g,'_6').replace(/₇/g,'_7')
    .replace(/₈/g,'_8').replace(/₉/g,'_9')
    .replace(/α/g,'alpha').replace(/β/g,'beta').replace(/γ/g,'gamma').replace(/δ/g,'delta')
    .replace(/ε/g,'epsilon').replace(/θ/g,'theta').replace(/λ/g,'lambda').replace(/μ/g,'mu')
    .replace(/π/g,'pi').replace(/σ/g,'sigma').replace(/φ/g,'phi').replace(/ω/g,'omega')
    .replace(/Γ/g,'Gamma').replace(/Δ/g,'Delta').replace(/Σ/g,'Sigma').replace(/Ω/g,'Omega')
    .replace(/→/g,'->').replace(/←/g,'<-').replace(/∞/g,'infinity').replace(/∫/g,'integral')
    .replace(/∂/g,'d').replace(/√/g,'sqrt').replace(/∑/g,'sum').replace(/∏/g,'product')
    .replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/≠/g,'!=').replace(/≈/g,'~=')
    .replace(/·/g,'*').replace(/×/g,'*').replace(/÷/g,'/')
    .replace(/−/g,'-').replace(/–/g,'-').replace(/—/g,'-')
    .replace(/′/g,"'").replace(/″/g,"''")
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Call Groq API (groq.com — fast LLM inference)
async function callGroq(fetch, apiKey, model, systemPrompt, userPrompt) {
  if (!apiKey) throw new Error('Groq API key not set');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ── MAIN SOLVER ENDPOINT ───────────────────────────────
app.post('/api/wolfram-solve/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const q = rows[0];

    const appId    = process.env.WOLFRAM_APP_ID;
    const groqKey1 = process.env.GROQ_API_KEY_1;  // fallback solver
    const groqKey2 = process.env.GROQ_API_KEY_2;  // refiner
    const fetch   = (await import('node-fetch')).default;

    const cleanQuery = normalizeForWolfram(q.question);
    console.log(`[solve] question: "${q.question}"`);
    console.log(`[solve] normalized: "${cleanQuery}"`);

    let rawSolution = '';   // what Wolfram/Grok-fallback gives us
    let source = '';        // 'wolfram' | 'grok-fallback'

    // ══ TIER 1: Wolfram Alpha Full Results API ══════════════════════════════════
    if (appId) {
      try {
        const encoded = encodeURIComponent(cleanQuery);
        const url = `https://api.wolframalpha.com/v2/query?input=${encoded}&appid=${appId}&output=json&format=plaintext&podstate=Step-by-step+solution&podstate=Show+all+steps&scantimeout=15&podtimeout=15`;
        const data = await fetch(url).then(r => r.json());

        if (data.queryresult?.success) {
          for (const pod of (data.queryresult.pods || [])) {
            const texts = (pod.subpods || []).map(s => (s.plaintext || '').trim()).filter(Boolean);
            if (texts.length) rawSolution += `=== ${pod.title} ===\n${texts.join('\n')}\n\n`;
          }
        }

        // Wolfram Short Answers fallback if pods had no plaintext
        if (!rawSolution.trim()) {
          const shortRes = await fetch(
            `https://api.wolframalpha.com/v1/result?input=${encoded}&appid=${appId}`
          );
          const shortText = await shortRes.text();
          if (shortRes.ok && shortText && !shortText.toLowerCase().startsWith('wolfram')) {
            rawSolution = `=== Result ===\n${shortText.trim()}`;
          }
        }

        if (rawSolution.trim()) source = 'wolfram';
      } catch (e) { console.warn('[wolfram] failed:', e.message); }
    }

    // ══ TIER 2: Groq Fallback (when Wolfram fails) — uses KEY 1 ═════════════════
    if (!rawSolution.trim() && groqKey1) {
      try {
        console.log('[groq-fallback] wolfram failed, using groq key 1 (llama-3.3-70b)...');
        rawSolution = await callGroq(
          fetch,
          groqKey1,
          'llama-3.3-70b-versatile',
          `You are an expert engineering mathematics solver. Solve problems step by step with clear, numbered steps. 
Be mathematically rigorous. Show every intermediate step. Use plain text — write fractions as a/b, powers as x^n, etc.
End with a clear boxed final answer line like: ANSWER: [result]`,
          `Solve this problem step by step:\n${q.question}`
        );
        source = 'groq-fallback';
      } catch (e) { console.warn('[groq-fallback] failed:', e.message); }
    }

    if (!rawSolution.trim()) {
      return res.status(422).json({
        error: `Could not solve this question. Wolfram normalized it to: "${cleanQuery}". Try rephrasing using plain ASCII math notation.`
      });
    }

    // ══ TIER 3: Groq Refiner — uses KEY 2 to beautify into HTML ════════════════
    let finalSolution = rawSolution.trim();

    if (groqKey2) {
      try {
        console.log(`[groq-refiner] refining with groq key 2 (llama-3.3-70b), source: ${source}...`);
        const refined = await callGroq(
          fetch,
          groqKey2,
          'llama-3.3-70b-versatile',
          `You are a mathematics presentation expert. Your job is to take raw math solutions and reformat them into beautifully structured, visually clear step-by-step solutions using HTML.

OUTPUT RULES — return ONLY the HTML fragment, no markdown fences, no explanation:
- Wrap the entire output in <div class="ai-solution">
- Use <div class="sol-step"> for each numbered step with <span class="step-num">Step N</span>
- Use <div class="sol-result"> for the final answer  
- Use <code class="math"> for all mathematical expressions
- Use <div class="sol-section"> with <div class="sol-section-title"> for major section headers
- Use <div class="sol-note"> for notes, identities, or rules being applied
- Preserve ALL mathematical content exactly — never omit steps or change values
- Make it look like a premium textbook solution`,
          `Original question: ${q.question}

Raw solution data (source: ${source}):
${rawSolution}

Reformat this into a beautiful, structured HTML step-by-step solution. Keep all math exactly correct.`
        );

        // Validate it returned actual HTML
        if (refined && refined.includes('<') && refined.length > 100) {
          finalSolution = refined;
        }
      } catch (e) { console.warn('[groq-refiner] failed, using raw:', e.message); }
    }

    const updated = await pool.query(
      'UPDATE questions SET solution=$1, solved=TRUE WHERE id=$2 RETURNING *',
      [finalSolution, req.params.id]
    );

    res.json({ solution: finalSolution, isHtml: finalSolution.includes('<div'), question: updated.rows[0] });
  } catch (err) {
    console.error('Solver error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── START ──────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`✓ MathBank running on port ${PORT}`));
}).catch(err => { console.error('Failed to init DB:', err); process.exit(1); });
