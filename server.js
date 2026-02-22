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

  // ════════════════════════════════════════════════════
  // LIMITS — Examples (from textbook doc)
  // ════════════════════════════════════════════════════
  {type:"example",topic:"limits",subtopic:"Rates of growth of functions",page:"22",question:"Evaluate: lim x→∞ (1 + a/x)^(bx)",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"23",question:"Evaluate: lim x→0 (eˣ - 1 - x) / x²",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"23",question:"Evaluate: lim x→∞ (ln x) / √x",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"23",question:"Evaluate: lim x→∞ x³e^(-x²)",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"24",question:"Evaluate: lim x→1 [x / (x - 1) - 1 / (ln x)]",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"24",question:"Evaluate: lim x→0 (eˣ - 1)ˣ",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"25",question:"Evaluate: lim x→0 (sin x / x)^(1/x²)",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"25",question:"Evaluate: lim x→0 (tan 2x)ˣ",solution:""},
  {type:"example",topic:"limits",subtopic:"Rates of growth of functions",page:"26",question:"Evaluate: lim x→∞ (e^(px) / x^100); p > 0 and interpret the limit.",solution:""},
  {type:"example",topic:"limits",subtopic:"Rates of growth of functions",page:"26",question:"Evaluate: lim x→∞ (ln x / x^(1/3)).",solution:""},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule",page:"27",question:"Find the value of k such that the limit lim x→0 (k sin x - sin 2x) / sin³x is finite.",solution:""},
  {type:"example",topic:"limits",subtopic:"Rates of decay",page:"28",question:"Evaluate the limit lim x→0 (ln x / cot x) and interpret the limit.",solution:""},

  // LIMITS — Exercises 1.2
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→1 (ln x / (x - 1))",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→∞ (eˣ / xⁿ)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (tan x - x) / x³",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (tan x - x) / (x - sin x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (xe^x - (1 + x) ln(1 + x)) / x²",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (e^(2x) - 1) / sin x",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→π/2 (cos x / (1 - sin x))",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (1/x - 1/(eˣ - 1))",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (ln tan x)(tan 2x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (1/x² - cot²x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (1/x² - 1/sin²x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 x ln tan x",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→a (a - x) tan(πx / 2a)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 x ln sin²x",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (1/x)^(tan x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→∞ (1/x)^(1/x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (cot²x)^(tan x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (tan x / x)^(1/x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (cos x)^(cot²x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→π/2 (sin x)^(tan x)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"Evaluate the limit: lim x→0 (tan x / x)^(1/x²)",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"If lim x→0 [x(1 + A cos x) - B sin x] / x³ = 1, then determine the value of A and B.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.2",page:"28",question:"If lim x→0 [(A + B cos x) x - C sin x] / x⁵ = 1, then determine the value of A, B and C.",solution:""},

  // ════════════════════════════════════════════════════
  // HIGHER DERIVATIVES — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"29",question:"Find y_n, if y = x^n, where n is positive integer.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"30",question:"Find y_n, if y = (ax + b)^m, where m is a positive integer greater than n.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"30",question:"Find y_n, if y = e^(ax).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"30",question:"Find y_n, if y = 1 / (x + a).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"31",question:"Find y_n, if y = sin x.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"31",question:"Find y_n, if y = ln(x + a).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Higher order derivatives of some special functions",page:"31",question:"Find y_n, if y = sin(ax + b).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"36",question:"Expand ln(1 + x) in ascending powers of x.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"36",question:"Assuming the validity of the expansion, show that eˣ = 1 + x + x²/2! + x³/3! + x⁴/4! + ....",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"37",question:"Assuming the validity of expansion using Maclaurin's theorem, expand (1 + x)^m in ascending powers of x.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"37",question:"Show that √x can not be expanded by Maclaurin's infinite series.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"37",question:"Assuming the validity of the expansion, show that ln(1 + x) = x - x²/2 + x³/3 - x⁴/4 + ....",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"38",question:"Assuming the validity of the expansion, show that e^(sin x) = 1 + x + x²/2 - x⁴/8 + ....",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"38",question:"Assuming the validity of the expansion, expand sin x in powers of (x - π/2).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"39",question:"Assuming the validity of the expansion, expand eˣ in powers of (x - 1).",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"39",question:"Assuming the validity of expansion using Maclaurin's theorem, prove: eˣ sec x = 1 + x + x² + (2/3)x³ + ...",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"40",question:"Assuming the validity of expansion, find Maclaurin's series expansion of f(x) = ln(sec x). Find expansion of tan x.",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Power series of function of single variable",page:"40",question:"Assuming the validity of expansion, find Maclaurin's representation of y = f(x) = eˣ / (eˣ + 1) and hence determine the series of ln(1 + eˣ).",solution:""},

  // HIGHER DERIVATIVES — Exercises 1.3
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: sin x = x - x³/3! + x⁵/5! - x⁷/7! + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: cos x = 1 - x²/2! + x⁴/4! - x⁶/6! + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: ln(1 - x) = -x - x²/2 - x³/3 - ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: 1 / (1 + x) = 1 - x + x² - x³ + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: e^(x/2) = 1 + x/2 + (1/2!)(x/2)² + (1/3!)(x/2)³ + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: e^(x cos x) = 1 + x + x²/2 - x³/3 + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: ln sec x = x²/2! + 2x⁴/4! + 16x⁶/6! + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: sin(eˣ - 1) = x + x²/2 - 5x⁴/24 + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: ln(1 + tan x) = x - x²/2 + (4/3!)x³ - 14x⁴/4! + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Assuming the validity of the expansion, prove using Maclaurin's series: tan⁻¹ x = x - x³/3 + x⁵/5 - x⁷/7 + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Prove using Maclaurin's series: eˣ sec x = 1 + x + x² + (2/3)x³ + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Prove using Maclaurin's series: eˣ ln(1 + x) = x + x²/2 + 2x³/3! + 9x⁵/5! + ...",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Expand tan x by Maclaurin's series in ascending powers of x and deduce the series for sec²x.",solution:""},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Exercise 1.3",page:"42",question:"Expand f(x) = ln(1 + eˣ) as far as the term x⁴ by Maclaurin's series and hence the expansion eˣ / (1 + eˣ).",solution:""},

  // ════════════════════════════════════════════════════
  // ASYMPTOTES — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"asymptotes",subtopic:"Determination asymptotes parallel to axes",page:"45",question:"Find the asymptotes of the curve y = x² / [(x - 1)²(x - 2)] by using the limit.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination asymptotes parallel to axes",page:"47",question:"Determine the asymptotes parallel to axes to the curve (y - a)²(x² - a²) = x⁴ + a⁴.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of values of m and c for an algebraic curve",page:"49",question:"Find oblique asymptotes to the curve y³ - x²y + 2y² + 4y + x = 0.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"50",question:"Determine the asymptotes of the curve y = x² / (x² + 1).",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"50",question:"Determine the asymptotes of the curve y = (x² + 2x - 1) / x.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"51",question:"Find all possible asymptotes for y = (2x - 3) / (x² - 3x + 2).",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"51",question:"Find all the asymptotes of the curve (y - a)²(x² - a²) = x⁴ + a⁴.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"52",question:"Find the asymptotes of the curve y² = (a - x)² / (a² + x²) * x².",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"52",question:"Find the asymptotes of the following curve (x² - y²)(x + 2y + 1) + x + y + 1 = 0.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"53",question:"Find the asymptotes of the curve x²(x - y)² - a²(x² + y²) = 0.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"54",question:"Find the asymptotes of the following curve y³ - xy² - x²y + x³ + x² - y² = 1.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Determination of oblique asymptotes",page:"55",question:"Find the asymptotes of the curve x³ + 3x²y - 4y³ - x + y + 3 = 0.",solution:""},
  {type:"example",topic:"asymptotes",subtopic:"Asymptotes to polar curves",page:"58",question:"Find the asymptotes to the curve (r - a) sin θ = b.",solution:""},

  // ASYMPTOTES — Exercises 1.4
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: x²y² = a²(x² + y²)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: x = y(x² - 1)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: x²y² - 4(x - y)² + 2y - 3 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: y = (2x - 3) / (x² - 3x + 2)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: xy² - a²(x - a) = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: x²y² - x²y - xy² + x + y + 1 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: y = (4x² + 4x - 3) / (x² - 4x + 3)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: y = (x² - 4x + 5) / (x² + 4x + 3)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Obtain the horizontal and vertical asymptotes, if any: y = 5x / (x - 3)",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes, if any: y = x / [(x - 1)²(x - 2)]",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes, if any: xy² - x²y = a²(x + y) + b²",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes, if any: x³y + xy³ = a⁴",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes, if any: x²y - xy² + xy + y² + x - y = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes, if any: x²/a² - y²/b² = 1",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: x³ + x²y - xy² - y³ + x² - y² - 2 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: 4x³ - 3xy² - y³ + 2x² - xy - y² - 1 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: x³ + 3x²y - 4y³ - x + y + 3 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: y³ + x²y + 2xy² - y + 1 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: x³ + x²y - xy² - y³ + 2xy + 2y² - 3x + y = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: y³ - 5xy² + 8x²y - 4x³ - 3y² + 9xy - 6x² + 2y - 2x + 1 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: x²(x - y)² - a²(x² + y²) = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: (x² - y²)² - 2(x² + y²) + x - 1 = 0",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes: (y - a)²(x² - a²) = x⁴ + a⁴",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes to polar curve: rθ = a",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes to polar curve: r cos θ = 2a sin²θ",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes to polar curve: r = a cosec θ + b",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes to polar curve: r cos θ = a sin²θ",solution:""},
  {type:"exercise",topic:"asymptotes",subtopic:"Exercise 1.4",page:"59",question:"Find the asymptotes to polar curve: r = a(cos θ + sec θ)",solution:""},

  // ════════════════════════════════════════════════════
  // PEDAL EQUATION — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"pedal_equation",subtopic:"Determination of pedal equation for polar curves",page:"62",question:"Find the pedal equation of y² = 4a(x + a).",solution:""},
  {type:"example",topic:"pedal_equation",subtopic:"Determination of pedal equation for polar curves",page:"63",question:"Find the pedal equation of x^(2/3) + y^(2/3) = a^(2/3).",solution:""},
  {type:"example",topic:"pedal_equation",subtopic:"Determination of pedal equation for polar curves",page:"64",question:"Find pedal equation of r^m = a^m cos(mθ).",solution:""},
  {type:"example",topic:"pedal_equation",subtopic:"Determination of pedal equation for polar curves",page:"64",question:"Find pedal equation of the curve r = 2a / (1 - cos θ).",solution:""},

  // PEDAL EQUATION — Exercises 1.5
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the parabola y² = 4ax.",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the circle x² + y² = 2ax.",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of c²(x² + y²) = x²y².",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the polar curve: r = a(1 + cos θ)",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the polar curve: r² cos 2θ = a²",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the polar curve: r^n = a^n cos(nθ)",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the polar curve: r = ae^(θ cot α)",solution:""},
  {type:"exercise",topic:"pedal_equation",subtopic:"Exercise 1.5",page:"74",question:"Find pedal equation of the polar curve: r = aθ",solution:""},

  // ════════════════════════════════════════════════════
  // RADIUS OF CURVATURE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"69",question:"Find the radius of curvature at any point of y = c cosh(x/c) [Cartesian form of curve].",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"69",question:"Find the radius of curvature of the curve y² = 4x at the vertex (0, 0).",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"70",question:"Find the radius of curvature of the curve y = x²(x - 3) at the points where the tangent is parallel to x-axis.",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"71",question:"Show that the radius of curvature at any point of a circle is constant and its curvature at any point is also constant.",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"72",question:"Find the radius of curvature of the following curve at the origin: 4x² - 3xy + y² - 3y = 0",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"72",question:"Find the radius of curvature of the following curve at the origin: x³ + y³ = 3axy",solution:""},
  {type:"example",topic:"radius_curvature",subtopic:"Curvature",page:"73",question:"If ρ₁ and ρ₂ be the radii of curvature at the ends of a focal chord of the parabola y² = 4ax, prove that ρ₁^(-2/3) + ρ₂^(-2/3) = (2a)^(-2/3).",solution:""},

  // RADIUS OF CURVATURE — Exercises 1.5
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at any point (x, y) of the Cartesian curve: y² = 4ax",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at any point (x, y) of the Cartesian curve: y = c cosec(x/a)",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at any point (x, y) of the Cartesian curve: x^(2/3) + y^(2/3) = a^(2/3)",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at any point (x, y) of the Cartesian curve: xy = c²",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at any point (x, y) of the Cartesian curve: y = a cosh(x/a)",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: y = x⁴ - 4x³ - 18x²",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: 3x² + 4y² = 2x",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: 3x⁴ - 2y⁴ + 5x²y + 2xy - 2y² + 4x = 0",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: x⁴ + y⁴ = 6a(x + y)",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: y² = x²(a + x) / (a - x)",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature at the origin: x² + 6y² + 2x - y = 0",solution:""},
  {type:"exercise",topic:"radius_curvature",subtopic:"Exercise 1.5",page:"74",question:"Find the radius of curvature of the curve √x + √y = √a at the point where it cuts the line y = x.",solution:""},

  // ════════════════════════════════════════════════════
  // METHODS OF INTEGRATION — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"methods_integration",subtopic:"methods of integration",page:"78",question:"Find ∫ √(1 + x²) * x⁵ dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"methods of integration",page:"78",question:"Evaluate: ∫ 1 / (√x + x) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"methods of integration",page:"78",question:"Evaluate: ∫ (1 + x²) / √(1 - x²) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"79",question:"Evaluate: ∫ x / (x² + 6x + 13) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"79",question:"Evaluate: ∫ 1 / √[(x - α)(x - β)] dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"80",question:"Find ∫ tan⁵x * sec⁷x dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"80",question:"Evaluate: ∫ 1 / [(x + 3) √(x² + 6x + 10)] dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"81",question:"Evaluate: ∫ 1 / (4 + 5 sin x) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of substitution and standard formula",page:"82",question:"Evaluate: ∫ √(4x² - 4x + 5) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of trigonometric substitution",page:"82",question:"Find ∫ 1 / [x²(x² + 4)] dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of trigonometric substitution",page:"83",question:"Evaluate: ∫ √[(a + x) / (a - x)] dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of partial fractions",page:"86",question:"Evaluate ∫ eˣ (cos x - sin x) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of partial fractions",page:"86",question:"Evaluate ∫ √(x + 4) / x dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of partial fractions",page:"86",question:"Evaluate ∫ (x² - 4) / [(x² + 1)(x² + 3)] dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of partial fractions",page:"87",question:"Evaluate: ∫ (2x² - x + 4) / (x³ + 4x) dx.",solution:""},
  {type:"example",topic:"methods_integration",subtopic:"method of partial fractions",page:"87",question:"Evaluate ∫ (2 sin x + 3 cos x) / (3 sin x + 4 cos x) dx.",solution:""},

  // METHODS OF INTEGRATION — Exercises 2.1
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ xeˣ / (x + 1)² dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ (x² + x + 1) / (x² + 1) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ cos x / √(2 sin²x + 3 sin x + 4) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / √(x + a + √(x + b)) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ (3e^(2x) + 3e^(4x)) / (eˣ + e^(-x)) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / √(x² - 2x + 5) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ (3x + 7) / (2x² + 3x - 2) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / [(2x + 1) √(x² + 2x + 2)] dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ x / √(x² + 4x + 5) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / (2 - 3 sin 2x) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / (3 sin x + 4 cos x) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 1 / (4 sin²x + 5 cos²x) dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ x⁵ eˣ dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ x / [(x - 3)(x + 1)] dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ (x + 5) / [(x + 1)(x + 2)²] dx",solution:""},
  {type:"exercise",topic:"methods_integration",subtopic:"Exercise 2.1",page:"88",question:"Integrate: ∫ 2x / [(x² + 1)(x² + 3)] dx",solution:""},

  // ════════════════════════════════════════════════════
  // DEFINITE INTEGRAL — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"93",question:"Prove that ∫₀^(π/2) dx / (1 + √tan x) = π/4.",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"94",question:"Show that ∫₀^(π/2) ln(tan x) dx = 0.",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"95",question:"Evaluate ∫₀^π (x dx) / (1 + cos²x).",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"96",question:"Show that ∫₀^(π/2) ln sin x dx = ∫₀^(π/2) ln cos x dx = (π/2) ln(1/2).",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"98",question:"Show that ∫₀^π (x tan x) / (sec x + cos x) dx = π²/4.",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"99",question:"Prove that ∫₀^π (x sin x) / (1 + cos²x) dx = π²/4.",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"100",question:"Evaluate ∫₀ᵃ √(a² - x²) cos⁻¹(x/a) dx.",solution:""},
  {type:"example",topic:"definite_integral",subtopic:"application of properties in the evaluation of definite integrals",page:"101",question:"Prove ∫₀¹ cot⁻¹(1 - x + x²) dx = π/2 - ln 2.",solution:""},

  // DEFINITE INTEGRAL — Exercises 2.2
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"102",question:"Prove: ∫₀^(π/2) sin θ / (sin θ + cos θ) dθ = π/4",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"102",question:"Prove: ∫₀^(π/2) √cot x / (1 + √cot x) dx = π/4",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"102",question:"Prove: ∫₀ᵃ x / √(a² - x²) dx = π/4",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"102",question:"Prove: ∫₀ᵃ √x / (√x + √(a - x)) dx = a/2",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"103",question:"Prove: ∫₀¹ ln x / √(1 - x²) dx = (π/2) ln(1/2)",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"103",question:"Prove: ∫₀^(π/4) ln(1 + tan θ) dθ = (π/8) ln 2",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"103",question:"Prove: ∫₀^π ln(x + 1/x) * (1 / (1 + x²)) dx = π ln 2",solution:""},
  {type:"exercise",topic:"definite_integral",subtopic:"Exercise 2.2",page:"103",question:"Prove: ∫₀^(π/2) (sin x - cos x) / (1 + sin x cos x) dx = 0",solution:""},

  // ════════════════════════════════════════════════════
  // DIFFERENTIATION UNDER INTEGRAL SIGN — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"105",question:"Evaluate ∫₀¹ (x^α - 1) / ln x dx using differentiation under the integral sign. (Take α ≥ 0).",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"106",question:"Evaluate ∫₀^∞ e^(-ax) sin x / x dx using differentiation under integral sign and use it to find ∫₀^∞ sin x / x dx.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"107",question:"Evaluate ∫₀^∞ tan⁻¹(αx) / [x(1 + x²)] dx using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"108",question:"Evaluate ∫₀^∞ ln(1 + α²x²) / (1 + β²x²) dx using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"109",question:"Evaluate ∫₀^∞ e^(-a²x²) cos(2bx) dx using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"111",question:"Evaluate ∫₀^(π/2) ln(a² cos²x + b² sin²x) dx; a, b > 0 using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"112",question:"Evaluate ∫₀^(π/2) dx / (a² sin²x + b² cos²x) and use it to find ∫₀^(π/2) dx / (a² sin²x + b² cos²x)² using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"114",question:"Evaluate ∫₀^π ln(1 + α cos x) / cos x dx using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"115",question:"Evaluate ∫₀^(π/2) ln(1 + cos α cos x) / cos x dx using differentiation under integral sign.",solution:""},
  {type:"example",topic:"diff_integral_sign",subtopic:"Differentiation under integral sign",page:"117",question:"Evaluate ∫₀^π ln(1 + sin α cos x) / cos x dx using differentiation under integral sign.",solution:""},

  // DIFFERENTIATION UNDER INTEGRAL SIGN — Exercises 2.3
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Evaluate using differentiation under integral sign: ∫₀¹ (xⁿ - 1) / ln x dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Evaluate using differentiation under integral sign: ∫₀^∞ e^(-x) sin(a - x) / x dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Evaluate using differentiation under integral sign: ∫₀¹ (x^a - x^b) / ln x dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Evaluate using differentiation under integral sign: ∫₀^∞ (e^(-ax) - e^(-bx)) / x dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Using ∫₀^(π/2) dx / (a² cos²x + b² sin²x) = π / 2ab, evaluate ∫₀^(π/2) dx / (a² cos²x + b² sin²x)².",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Using ∫₀^π dx / (a + b cos x) = π / √(a² - b²), find: ∫₀^π dx / (a + b cos x)²",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Using ∫₀^π dx / (a + b cos x) = π / √(a² - b²), find: ∫₀^π cos x / (a + b cos x)² dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"118",question:"Evaluate using differentiation under integral sign: ∫₀^(π/2) e^(-ax) sinⁿx / x dx and use it to find ∫₀^π sin x / x dx.",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀ᵃ ln(1 + ax) / (1 + x²) dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀^(π/2) ln(1 + y sin²x) / sin²x dx (y > -1)",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀^∞ e^(-a²x²) cos(2bx) dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀^(π/2) ln(1 + cos θ cos x) / cos x dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀^∞ (e^(-ax) - e^(-bx)) / x * cos(αx) dx",solution:""},
  {type:"exercise",topic:"diff_integral_sign",subtopic:"Exercise 2.3",page:"119",question:"Evaluate using differentiation under integral sign: ∫₀^∞ ln(1 + b²x²) / (1 + a²x²) dx",solution:""},

  // ════════════════════════════════════════════════════
  // IMPROPER INTEGRALS — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"120",question:"Evaluate ∫₃⁵ 1 / √(x - 3) dx.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"120",question:"Evaluate ∫₋∞^∞ 1 / (1 + x²) dx.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"121",question:"Evaluate ∫₁^∞ ln x / x² dx.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"122",question:"Evaluate ∫₀² ln x dx.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"123",question:"Evaluate ∫₀³ dx / (x - 2) if it exists.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"123",question:"Evaluate ∫₀ᵃ √[(a - x) / x] dx.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"124",question:"Prove that ∫₀^∞ e^(-ax) cos bx dx = a / (a² + b²), a > 0.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"125",question:"Evaluate ∫₀^∞ x tan⁻¹(x) / (1 + x²)² dx if it exists.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"127",question:"Evaluate ∫₀³ dx / (x² - 6x + 5) if it is convergent.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"127",question:"Evaluate ∫₀² x² ln x dx if it is convergent.",solution:""},
  {type:"example",topic:"improper_integral",subtopic:"Improper integrals",page:"128",question:"Evaluate ∫₂^∞ dx / [x √(x² - 4)] if it is convergent.",solution:""},

  // IMPROPER INTEGRALS — Exercises 2.4
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₀^∞ 1 / (1 + x²) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₀^∞ x / (x² + 4) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₀^∞ x / (x² + 2)² dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₁^∞ e^(-√x) / √x dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₂³ dx / √(x - 3)",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₀⁸ 1 / (x - 6)³ dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₋₂^∞ dx / x⁴",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫ₑ^∞ 1 / (x (ln x)³) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₂π^∞ sin x dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"129",question:"Evaluate if it exists: ∫₀^∞ x e^(-5x) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₁^∞ 1 / (1 + x)^(3/2) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀^∞ x e^(-x²) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₁^∞ x / (1 + x²)² dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀¹ dx / x",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀¹ ln x dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀^∞ e^(-ax) sin bx dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀¹ sin⁻¹x / √(1 - x²) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀^π 1 / (1 + cos x) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₋∞^∞ x² / (9 + x⁶) dx",solution:""},
  {type:"exercise",topic:"improper_integral",subtopic:"Exercise 2.4",page:"130",question:"Evaluate if it exists: ∫₀¹ √[(1 + x) / (1 - x)] dx",solution:""},

  // ════════════════════════════════════════════════════
  // BETA & GAMMA FUNCTIONS — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"136",question:"Prove: ∫₀^(π/2) sinⁿx dx = ∫₀^(π/2) cosⁿx dx = √π Γ((n+1)/2) / [2 Γ((n+2)/2)]",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"136",question:"Prove that: ∫₀^∞ e^(-x) xⁿ dx = n!.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"137",question:"Evaluate ∫₀^α x⁴ / √(α² - x²) dx using beta and gamma function.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"138",question:"Show that ∫₀^(π/2) sin³x cos⁵x dx = 1/24.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"138",question:"Evaluate ∫₀¹ x² (1 - x²)^(3/2) dx.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"139",question:"Evaluate ∫₀^(π/2) sin⁴θ cos⁶θ dθ.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"139",question:"Evaluate ∫₀³ √(x³ / (3 - x)) dx.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"140",question:"Show that ∫₀^(π/2) sinᵖθ cos^q θ dθ = (1/2) β((p+1)/2, (q+1)/2), p, q > -1.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"141",question:"Show that β(m, n) = (m-1)! (n-1)! / (m + n - 1)!, m > 1, n > 1, positive integers.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"141",question:"Prove that ∫₀¹ 1 / (1 - x⁶)^(1/6) dx = π/3.",solution:""},
  {type:"example",topic:"beta_gamma",subtopic:"Beta function and gamma function",page:"142",question:"Evaluate by using gamma function: ∫₀ᵃ x³ (a² - x²)^(5/2) dx.",solution:""},

  // BETA & GAMMA FUNCTIONS — Exercises 2.5
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that Γ(7) = 720",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that Γ(11/2) = 945/32 √π",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that Γ(3/2) Γ(5/2) / Γ(5) = π/64",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that ∫₀¹ x^m (1 - x)^n dx = Γ(m + 1) Γ(n + 1) / Γ(m + n + 2).",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that ∫₀^(π/2) sin³θ cos³θ dθ = 1/2.",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"143",question:"Show that ∫₀^(π/2) sin⁴θ cos²θ dθ = π/32.",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Show that ∫₀^(π/2) sin⁶θ cos⁴θ dθ = 3π / 512.",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, show that: ∫₀^(π/2) cos⁴θ sin²θ dθ = 5π / 192",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, show that: ∫₀^(π/6) cos²(6x) sin⁴(3x) dx = 7π / 192",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, show that: ∫₀^(π/2) sin⁶x cos³x dx = 1/24",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Show that β(m, n+1) / n = β(m+1, n) / m = β(m, n) / (m + n).",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀¹ x⁶ √(1 - x²) dx = 5π / 256",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀ᵃ x⁴ / √(a² - x²) dx = 3a⁴π / 16",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀¹ x⁶ / √(1 - x²) dx = 5π / 32",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀^(2a) x^(9/2) √(2a - x) dx = 63/8 * πa⁵",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀¹ x² (1 - x²)^(3/2) dx = π / 32",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀¹ x⁴ / √(1 - x²) dx = 3π / 16",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀^(2a) x³ √(2ax - x²) dx = 7πa⁵ / 8",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Using gamma function, prove that: ∫₀ᵃ x³ √(ax - x²) dx = 5πa⁴ / 256",solution:""},
  {type:"exercise",topic:"beta_gamma",subtopic:"Exercise 2.5",page:"144",question:"Prove that ∫₀^∞ √x e^(-x²) dx × ∫₀^∞ e^(-x²) / √x dx = π / (2√2).",solution:""},

  // ════════════════════════════════════════════════════
  // AREA UNDER CURVES — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"146",question:"Find the area bounded by y = x and y = x².",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"147",question:"Find the area bounded by y = 1 + √x, y = (3 + x) / 3.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"147",question:"Find the area enclosed by x-axis and the curve y = 3x - 5x².",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"148",question:"Find the area bounded by the y-axis, the curve x² = 4by and the line y = b.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"148",question:"Find the area bounded by the parabola y² = 4ax and its latus rectum.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"149",question:"Find the area between the curves y = cos x, y = sin(2x), x = 0, x = π/2.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"149",question:"Find the area bounded by the curve y = x³ - 12x and the x-axis.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"150",question:"Show that the area of the astroid x^(2/3) + y^(2/3) = a^(2/3) is (3/8)πa².",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"151",question:"Find the area between curves y = sin x, y = cos 2x, x = 0, x = π/2.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"151",question:"Find the area between the curves x² = 4ay and y² = 4ax.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"152",question:"Find the area bounded by x + y² = 0 and x + 3y² = 2.",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"153",question:"Find the area bounded by the curves y = x⁴ - 2x² and y = 2x².",solution:""},
  {type:"example",topic:"area_curve",subtopic:"Area between two curves",page:"153",question:"Find the area of the region of the circle x² + y² = 4 cut off by the line x - 2y = -2 in the first two quadrants.",solution:""},

  // AREA UNDER CURVES — Exercises 2.6
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the circle x² + y² = a²",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the ellipse x²/a² + y²/b² = 1",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve y² = 4ax and line y = x",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve y = sin x and x-axis between x = 0 and x = 2π",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: y = x² between x = 1 and x = 3",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the x-axis and y = 2x - x²",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve y = 2 - x² and y = -x",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve x = y² and x = -2y² + 3",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve y² - 4x = 4 and the line 4x - y = 16",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"154",question:"Find the area bounded by: the curve y = 3x² - 6 and the x-axis",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: x² = 4y and line x = 4y - 2",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: y = sec²x, y = sin x for x = 0 to x = π/4",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: x = y³ and x = y²",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: y = sin(x/2) and y = x",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area bounded by: y = √(4 - x) in first quadrant",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: x² = 4y and y = |x|",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: x - y² = 0 and x + y² = 0",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: y = sin x, y = cos x in first quadrant",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: y-axis and x = y² - y³",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area between: curve y = x² + 1 and line y = -x + 3",solution:""},
  {type:"exercise",topic:"area_curve",subtopic:"Exercise 2.6",page:"155",question:"Find the area: inside of x² + y² = 1 and outside of y² = 1 - x",solution:""},

  // ════════════════════════════════════════════════════
  // ARC LENGTH — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"156",question:"Show that the perimeter of a circle x² + y² = a² is 2πa.",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"157",question:"Find the arc length of the curves y = x²; -1 ≤ x ≤ 2.",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"158",question:"Find the arc length of x = y⁴/4 + 1/(8y²) from y = 1 to y = 2.",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"159",question:"Find perimeter of the astroid x^(2/3) + y^(2/3) = a^(2/3).",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"160",question:"Find the length of an arc of the parabola y² = 4ax cut off by the line y = 8x/3.",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"161",question:"Find the length of the loop formed by curve 3ay² = x(x - a)².",solution:""},
  {type:"example",topic:"arc_length",subtopic:"Arc length",page:"162",question:"Find the arc length of the curve x²(b² - x²) = 8b²y².",solution:""},

  // ARC LENGTH — Exercises 2.7
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the arc length: y² + 2y = 2x + 1, -1 ≤ x ≤ 3",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the arc length: x^(2/3) + y^(2/3) = a^(2/3)",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the arc length: y = (1/3)(x² + 2)^(3/2), 0 ≤ x ≤ 3",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the arc length: y² = 4ax to the points cut off by line 3y = 8x",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the length of parabola y² = 4ax between the intersecting points by y = 2x",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Show that the length of the arc of the semi-cubical parabola ay² = x³ from the vertex to the point (a, a) is a/27 (13√13 - 8).",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Show that the length of the curve y = ln((eˣ + 1) / (eˣ - 1)) from x = 1 to x = 2 is ln(e + 1/e).",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Show that the length of the arc of the parabola y² = 4ax from the vertex to one extremity of the latus rectum is a[√2 + ln(1 + √2)].",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Show that the length of the curve y = ln sec x from x = 0 to x = π/3 is ln(2 + √3).",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"Find the length of the curve y² = (2x - 1)³ cut off by the line x = 4.",solution:""},
  {type:"exercise",topic:"arc_length",subtopic:"Exercise 2.7",page:"164",question:"In the case of a catenary y = a cosh(x/a), show that the length of the arc measured from the vertex (0, a) to any point (x, y) is a sinh(x/a) and hence prove that s² = y² - a².",solution:""},

  // ════════════════════════════════════════════════════
  // SURFACE OF REVOLUTION — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"surface_revolution",subtopic:"Area of surface of revolution for Cartesian curve",page:"165",question:"Find the area of the surface generated by revolving the loop of the curve 3ay² = x(x - a)² about x-axis.",solution:""},
  {type:"example",topic:"surface_revolution",subtopic:"Area of surface of revolution for Cartesian curve",page:"166",question:"Find the area of surface generated by rotating the curve y = eˣ, 0 ≤ x ≤ 1 about x-axis.",solution:""},
  {type:"example",topic:"surface_revolution",subtopic:"Area of surface of revolution for Cartesian curve",page:"166",question:"Find the area of the surface obtained by rotating the curve y = x/4 - ln x / 2, 1 ≤ x ≤ 2 about x-axis.",solution:""},
  {type:"example",topic:"surface_revolution",subtopic:"Area of surface of revolution for Cartesian curve",page:"167",question:"Find the area of surface of a hemisphere of radius a.",solution:""},
  {type:"example",topic:"surface_revolution",subtopic:"Area of surface of revolution for Cartesian curve",page:"170",question:"Find the surface area of solid generated by the revolution of an arc of the catenary y = c cosh(x/c) about x-axis.",solution:""},

  // SURFACE OF REVOLUTION — Exercises 2.8
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about x-axis: y = x³, 0 ≤ x ≤ 2",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about x-axis: y = √x, 4 ≤ x ≤ 9",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about x-axis: y = cosh x, 0 ≤ x ≤ 1",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about x-axis: y = x/6 + 1/(2x), 1 ≤ x ≤ 2",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about y-axis: y = √x, 1 ≤ y ≤ 2",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area obtained by rotating about y-axis: x = √(a² - y²), 0 ≤ y ≤ a/2",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"The curve y = √(4 - x²), -1 ≤ x ≤ 1 is an arc of the circle x² + y² = 4. Find the surface area obtained by rotating this arc about x-axis.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"If a > 0, find the area of the surface generated by rotating the loop of the curve 3ay² = x(x - a)² about y-axis.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the area of the sphere generated by revolution of the circle x² + y² = r² about x-axis.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the area of the surface generated by rotating the curve y = x + 1/x about y-axis for 0 ≤ x ≤ 1.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the area of the surface generated by rotating the portion of the curve y = (1/3)(x² + 2)^(3/2) between x = 0 and x = 3 about y-axis.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"The loop of the curve 9x² = y(3 - y)² is rotated about x-axis. Find the surface area generated.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the area of the surface obtained by rotating the curve y = cos x, 0 ≤ x ≤ π/3 about x-axis.",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Find the surface area of solid generated by revolving the astroid x^(2/3) + y^(2/3) = a^(2/3) about x-axis. (Hint: The parametric equation for astroid is x = a cos³θ, y = a sin³θ)",solution:""},
  {type:"exercise",topic:"surface_revolution",subtopic:"Exercise 2.8",page:"170",question:"Show that the area of the curved surface generated when one loop of the curve x²(a² - x²) = 8a²y² is revolved about x-axis is πa²/4.",solution:""},

  // ════════════════════════════════════════════════════
  // VOLUME OF REVOLUTION — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"172",question:"The circle x² + y² = a² revolves round the x-axis; show that the volume of the whole sphere generated is (4/3)πa³.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"174",question:"Prove that the volume of the ellipsoid formed by the revolution of the ellipse x²/a² + y²/b² = 1 about the x-axis is 4πab² / 3.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"175",question:"The area bounded by the parabola y² = 4px and the line x = a revolves about the x-axis. Find the volume generated.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"175",question:"Find the volume of the solid in the region in the first quadrant evolved by the parabola y = x², y-axis and the line y = 1 revolving about the line x = 3/2.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"176",question:"Find the volume of the solid generated by revolution of the region bounded by y = √x, the lines y = 1, x = 4 about the line y = 1.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"176",question:"Find the volume of the solid generated by revolving the region bounded by the parabola y = x² + 1 and the line y = x + 3 about x-axis.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"177",question:"Find the volume of solid of revolution obtained by rotating the region bounded by the curves y = x, y = √x about the line y = 1.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"178",question:"Find the volume of a solid of revolution when the region R enclosed by the curves y = x and y = x² is rotated about x-axis.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"178",question:"Find the volume of a solid of revolution when the region R enclosed by y = 1/x, x = 1, x = 2, y = 0 about x-axis.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"179",question:"Find the volume of the solid of revolution obtained by rotating the region bounded by y = x² and y = x about the line y = 2.",solution:""},
  {type:"example",topic:"volume_revolution",subtopic:"Volume of solid of revolution",page:"180",question:"Find the volume of the solid generated by the revolution of an arc of the catenary y = c cosh(x/c) about x-axis.",solution:""},

  // VOLUME OF REVOLUTION — Exercises 2.9
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about x-axis: y = x³, y = 0, x = 2",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about x-axis: y = √cos x, 0 ≤ x ≤ π/2, y = 0, x = 0",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about x-axis: y = 2√x, y = 2, x = 0",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about x-axis: y = sec x, y = √2, -π/4 ≤ x ≤ π/4",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about x-axis: y = 5x - x², x = 0, x = 5",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about y-axis: y-axis and curve x = 2/y, 1 ≤ y ≤ 4",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about y-axis: x = y^(3/2), x = 0, y = 2",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving about y-axis: x = √(sin 2y), 0 ≤ y ≤ π/2, x = 0",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume of the solid bounded by the curve y = x² + 1 and the line y = -x + 3 revolved about x-axis.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the region bounded by y = x² and y = 1 about the line y = -1.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the region between x² = 4y and y = x about y = -2.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the triangle with vertices (1, 0), (2, 1) and (1, 1) about y-axis.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"The region in the first quadrant bounded by y = x² and y = x is revolved about y-axis. Find the volume generated.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the region in the first quadrant bounded on the left by the circle x² + y² = 3 and on the right by x = √3 and above by y = √3 about y-axis.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the region bounded on the left by x = 4 and on the right by the circle x² + y² = 25 about y-axis.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume of the solid in the first quadrant bounded by y = x², x-axis and x = 1 about the line x = -1.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Find the volume generated by revolving the region bounded by y = 3x² and y = 3x in first quadrant about y-axis.",solution:""},
  {type:"exercise",topic:"volume_revolution",subtopic:"Exercise 2.9",page:"181",question:"Show that the volume of the solid generated by revolving the astroid x^(2/3) + y^(2/3) = a^(2/3) about x-axis is 32/105 * πa³.",solution:""},

  // ════════════════════════════════════════════════════
  // CENTROID AND MOMENT OF INERTIA — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"centroid_inertia",subtopic:"Centroid and moment of inertia of plane lamina",page:"185",question:"Find the position of centroid of semi circular plate of radius 'a'.",solution:""},
  {type:"example",topic:"centroid_inertia",subtopic:"Centroid and moment of inertia of plane lamina",page:"185",question:"Find the centroid of the region bounded by y = x² and x = y².",solution:""},
  {type:"example",topic:"centroid_inertia",subtopic:"Centroid and moment of inertia of plane lamina",page:"186",question:"Find the centroid of the region bounded by y = 4 - x² and y = 0.",solution:""},
  {type:"example",topic:"centroid_inertia",subtopic:"Centroid and moment of inertia of plane lamina",page:"187",question:"Find the centroid of the region R bounded by y = cos x, y = 0, x = 0 and x = π/2.",solution:""},

  // CENTROID AND MOMENT OF INERTIA — Exercises 2.10
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of semicircular plate of radius 3.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Given that area formed by curves y = (6 - 3x) / 2, x = 0, y = 0 is 3, find the centroid of the region.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Given that the area formed by the curves y = x + 2, y = x² is 9/2, find the centroid of the region.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of the region bounded by x = 0, x = 1, y = eˣ, y = 0.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of the region bounded by xy = 1, x = 1, x = 2, y = 0.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of the region bounded by y = x² and y = x.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of the region bounded by y = cos x, y = sin x, x = 0, x = π/4.",solution:""},
  {type:"exercise",topic:"centroid_inertia",subtopic:"Exercise 2.10",page:"188",question:"Find the centroid of the region bounded by x = 5 - y², x = 0.",solution:""},

  // ════════════════════════════════════════════════════
  // EXTRA SEEDS (originally in SEED_QUESTIONS)
  // ════════════════════════════════════════════════════
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R·θ = a",solution:"Step 1: 1/R = θ/a = f(θ).\nStep 2: f(θ)=0 → θ=0, so α=0.\nStep 3: f'(θ)=1/a, f'(0)=1/a.\nStep 4: R·sin(θ-0) = a → R·sinθ = a"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = (θ² + 1) / θ",solution:"Step 1: 1/R = θ/(θ²+1) = f(θ).\nStep 2: f(θ)=0 → θ=0, α=0.\nStep 3: f'(0)=1.\nStep 4: R·sinθ = 1 (i.e. R = cscθ)"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = θ / (θ - π)",solution:"Step 1: 1/R = (θ-π)/θ = f(θ).\nStep 2: f(θ)=0 → θ=π, α=π.\nStep 3: f'(π)=1/π.\nStep 4: R·sin(θ-π) = π → R·sinθ = -π"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R·cosθ = 2a·sinθ",solution:"Step 1: 1/R = (1/2a)cotθ = f(θ).\nStep 2: α₁=π/2, α₂=3π/2.\nStep 3: f'(π/2) = f'(3π/2) = -1/2a.\nFor α₁: R·cosθ = 2a. For α₂: R·cosθ = -2a"},
  {type:"example",topic:"asymptotes",subtopic:"Polar Coordinate System",page:"",question:"Find all possible asymptotes of R = a·cscθ + b",solution:"Step 1: 1/R = sinθ/(a+b·sinθ) = f(θ).\nStep 2: α₁=0, α₂=π.\nStep 3: f'(0)=1/a, f'(π)=-1/a.\nBoth give asymptote: R·sinθ = a"},
  {type:"example",topic:"asymptotes",subtopic:"Rational Functions",page:"",question:"Find all asymptotes of f(x) = (x + 1) / (x² - 3x + 2)",solution:"Vertical: x²-3x+2=0 → x=1 and x=2.\nHorizontal: lim(x→∞) f(x) = 0 → y=0"},
  {type:"example",topic:"asymptotes",subtopic:"Rational Functions",page:"",question:"Find all asymptotes of f(x) = (x² + 2x - 1) / x",solution:"Vertical: x=0.\nNo horizontal asymptote.\nOblique: f(x)=x+2-1/x → y=x+2"},
  {type:"example",topic:"asymptotes",subtopic:"Implicit Functions",page:"",question:"Find the asymptotes of the curve y³ - xy² - x²y + x³ + x² - y² - 1 = 0",solution:"φ₃(m)=(m-1)²(m+1)=0 → m=1,1,-1.\nFor m=-1: asymptote y=-x.\nFor m=1 (repeated): c=0 or c=2 → asymptotes y=x and y=x+2"},
  {type:"example",topic:"higher_derivatives",subtopic:"Basic Differentiation",page:"",question:"Find dy/dx of y = 3x⁴ + 4·log(x) + 7·tan(x) + 6",solution:"dy/dx = 12x³ + 4/x + 7sec²x"},
  {type:"example",topic:"higher_derivatives",subtopic:"Power Rule",page:"",question:"Find dy/dx of y = x^(1/5) + 4·cos(x) + aᵇ",solution:"dy/dx = (1/5)x^(-4/5) - 4sinx + 0"},
  {type:"example",topic:"higher_derivatives",subtopic:"Product Rule",page:"",question:"Find the derivative of y = x²·sin(x)",solution:"Using product rule: x²cosx + sinx·2x = x²cosx + 2x·sinx"},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Basic Formulae",page:"",question:"What is the derivative of tan⁻¹(x)?",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Product Rule",page:"",question:"Find the derivative of y = x²·tan⁻¹(x)",solution:"x²·(1/(1+x²)) + tan⁻¹(x)·2x = x²/(1+x²) + 2x·tan⁻¹x"},
  {type:"example",topic:"higher_derivatives",subtopic:"Quotient Rule",page:"",question:"Find dy/dx of y = x² / (1 + x²)",solution:"[(1+x²)(2x) - x²(2x)] / (1+x²)² = 2x/(1+x²)²"},
  {type:"exercise",topic:"higher_derivatives",subtopic:"Quotient Rule",page:"",question:"Find dy/dx of y = (tan(x) + 4) / (1 + log(x))",solution:""},
  {type:"example",topic:"higher_derivatives",subtopic:"Chain Rule",page:"",question:"Differentiate y = tan(log x)",solution:"sec²(logx) · (1/x)"},
  {type:"example",topic:"higher_derivatives",subtopic:"Chain Rule",page:"",question:"Differentiate y = sin(√(tan x))",solution:"cos(√tanx) · (1/(2√tanx)) · sec²x"},
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
  {type:"example",topic:"pedal_equation",subtopic:"Polar to Pedal",page:"",question:"Convert r² = a²·cos(2θ) into pedal form and find ρ and the chord of curvature through the pole",solution:"φ=π/2+2θ, p=r·cos2θ=r³/a².\nPedal: pa²=r³.\nρ=a²/(3r).\nChord of curvature = 2r/3"},
  {type:"example",topic:"area_curve",subtopic:"Cartesian Integration",page:"",question:"Find the area of the circle x² + y² = a² using integration",solution:"Area = 4∫₀ᵃ √(a²-x²)dx.\nSub x=a·sinθ → 4a²∫₀^(π/2) cos²θ dθ = πa²"},
  {type:"example",topic:"area_curve",subtopic:"Parametric Form",page:"",question:"Find the area of the astroid x^(2/3) + y^(2/3) = a^(2/3)",solution:"x=a·cos³θ, y=a·sin³θ.\n12a²∫₀^(π/2) sin⁴θ·cos²θ dθ = (3/8)πa²"},
  {type:"example",topic:"area_curve",subtopic:"Parametric Form",page:"",question:"Find the area of the cycloid x = a(t - sint), y = a(1 - cost)",solution:"Area = a²∫₀^(2π)(1-cost)² dt = 3πa²"},
  {type:"example",topic:"volume_revolution",subtopic:"Revolution about x-axis",page:"",question:"Find the volume of a sphere by revolving x² + y² = a² about the x-axis",solution:"V = 2π∫₀ᵃ(a²-x²)dx = 2π[a²x - x³/3]₀ᵃ = (4/3)πa³"},
  {type:"example",topic:"improper_integral",subtopic:"Type 1 (Infinite Limit)",page:"",question:"Evaluate ∫₁^∞ (1/x²) dx",solution:"lim(T→∞)[-1/x]₁ᵀ = 0+1 = 1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 1 (Integration by Parts)",page:"",question:"Evaluate ∫₀^∞ x·e^(-x) dx",solution:"∫xe⁻ˣdx = -xe⁻ˣ - e⁻ˣ.\nlim(T→∞)[-(x+1)e⁻ˣ]₀ᵀ = 0+1 = 1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 1",page:"",question:"Evaluate ∫₀^∞ e^(-ax)·sin(bx) dx",solution:"Using formula: result = b/(a²+b²)"},
  {type:"example",topic:"improper_integral",subtopic:"Type 2 (Singularity at Endpoint)",page:"",question:"Evaluate ∫₀¹ log(x) dx",solution:"lim(h→0)[x·lnx - x]ₕ¹ = (0-1)-0 = -1"},
  {type:"example",topic:"improper_integral",subtopic:"Type 2 (Singularity in Between)",page:"",question:"Evaluate ∫₋₁¹ (1/x²) dx",solution:"Singular at x=0. Both halves diverge → integral is divergent"},
  {type:"example",topic:"diff_integral_sign",subtopic:"Leibniz Rule",page:"",question:"Evaluate ∫₀¹ (x^α - 1) / log(x) dx",solution:"dI/dα = 1/(α+1) → I = ln(α+1)+c.\nAt α=0: I=0 → c=0. So I = ln(α+1)"},
  {type:"example",topic:"diff_integral_sign",subtopic:"Leibniz Rule",page:"",question:"Evaluate ∫₀^∞ tan⁻¹(ax) / [x(1 + x²)] dx",solution:"dI/da = π/[2(1+a)] → I = (π/2)ln(1+a)+c.\nAt a=0: c=0. So I = (π/2)ln(1+a)"},
  {type:"example",topic:"beta_gamma",subtopic:"Trigonometric Substitution",page:"",question:"Evaluate ∫₀¹ x⁶·√(1 - x²) dx",solution:"x=sinθ: ∫₀^(π/2) sin⁶θ·cos²θ dθ = (1/2)β(7/2,3/2) = 5π/256"},
  {type:"example",topic:"beta_gamma",subtopic:"Algebraic Substitution",page:"",question:"Evaluate ∫₀^(2a) x⁵·√(2ax - x²) dx",solution:"x=2a·sin²θ → after substitution = (33/16)πa⁷"},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule (1^∞ form)",page:"",question:"Evaluate lim(x→0) (tan(x)/x)^(1/x²)",solution:"ln L = lim ln(tanx/x)/x² → apply L'Hôpital twice → ln L = 1/3.\nL = e^(1/3)"},
  {type:"example",topic:"limits",subtopic:"L'Hôpital's Rule (0^0 form)",page:"",question:"Evaluate lim(x→0) xˣ",solution:"ln L = lim x·lnx = lim lnx/(1/x) → L'Hôpital → 0.\nL = e⁰ = 1"},

  // ════════════════════════════════════════════════════
  // LIMITS — Continuity & Differentiability (Exercise 1.1)
  // ════════════════════════════════════════════════════
  {type:"example",topic:"limits",subtopic:"Indeterminate forms and their limits",page:"14",question:"The quantity of charge Q in Columbus (C) that has passed through a point in a wire up to time t (in seconds) is given by Q(t) = t³ - 2t² + 6t + 2. Calculate the current when: i. t = 0.5  ii. t = 1  iii. At what time current is lowest.",solution:""},
  {type:"example",topic:"limits",subtopic:"Indeterminate forms and their limits",page:"15",question:"Show that f(x) = {x² + 3 for x < 1,  3x + 1 for x ≥ 1} is not differentiable at x = 1.",solution:""},
  {type:"example",topic:"limits",subtopic:"Indeterminate forms and their limits",page:"15",question:"The function is defined by f(x) = {x² - 2 for x ≤ 2,  x² - 4x + 6 for x > 2}. Show that f(x) is continuous at x = 2 but not differentiable at x = 2.",solution:""},
  {type:"example",topic:"limits",subtopic:"Indeterminate forms and their limits",page:"16",question:"Examine the continuity and differentiability at (1) x = 0 and (2) x = π/2 for f(x) = {1 when x ∈ (-∞, 0),  1 + sin x when x ∈ [0, π/2],  2 + (x - π/2)² when x ∈ [π/2, ∞)}",solution:""},
  {type:"example",topic:"limits",subtopic:"Indeterminate forms and their limits",page:"18",question:"Show that the function f(x) = |x| + |x - 1| is continuous at x = 1 but is not differentiable at that point.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = 3x³ is differentiable at x = 2. Find its value.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = 4x² - x is differentiable at x = 1. Find its value.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = x³ - 4x² - 1 is differentiable at x = -1. Find its value.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Discuss whether f(x) = {2 + x if x ≥ 0,  2 - x if x < 0} is continuous and differentiable at the origin.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"For f(x) = {x for x < 1,  2 - x for 1 ≤ x < 2,  -2 + 3x - x² for x ≥ 2}, check continuity and differentiability at x = 1.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"For f(x) = {x for x < 1,  2 - x for 1 ≤ x < 2,  -2 + 3x - x² for x ≥ 2}, check continuity and differentiability at x = 2.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = {4 - x² for x < 2,  x - 2 for x ≥ 2} is continuous at x = 2 but not differentiable at x = 2.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = {5x - 4 for 0 < x ≤ 1,  4x² - 3x for 1 < x < 2,  3x + 4 for x ≥ 2} is continuous at x = 1 and x = 2, and that f'(x) exists at x = 1 but not at x = 2.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = {3 + 2x for -3/2 < x ≤ 0,  3 - 2x for 0 < x < 3/2} is continuous at x = 0 but not differentiable at that point.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"19",question:"Show that f(x) = {2 + x if x ≤ 0,  2 - x if x > 0} is continuous but not differentiable at the origin.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"20",question:"Show that f'(1/2) does not exist if f(x) = {x for 0 ≤ x < 1/2,  1 - x for 1/2 ≤ x ≤ 1}.",solution:""},
  {type:"exercise",topic:"limits",subtopic:"Exercise 1.1",page:"20",question:"For f(x) = {x for 0 < x < 1,  2 - x for 1 ≤ x ≤ 2,  x - x²/2 for x > 2}, show that f(x) is continuous at x = 1 and x = 2, and that f(x) is not differentiable at x = 1 but is differentiable at x = 2.",solution:""},

  // ════════════════════════════════════════════════════
  // FIRST ORDER & HIGHER ODE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"195",question:"Solve: dy/dx = ky.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"195",question:"Solve: y dx - x dy = xy dx",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"195",question:"Solve: (x² + 1) dy/dx = 1.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve: dy/dx = e^(ax + by).",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve: (sin x + cos x) dy = (cos x - sin x) dx",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve: (xy² + x) dx + (yx² + y) dy = 0.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve the initial value problem y' = 2y² + xy², y(0) = 1.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve the initial value problem 2xy' = 3y given y = 4, when x = 1.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Ordinary Differential Equation and its Applications",page:"196",question:"Solve the initial value problem y(1 - x²) dy/dx + x(1 - y²) = 0 given that y = 1, when x = 0.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Reduction into variable separable form by change of variables",page:"198",question:"Solve: (x + y + 1) dy/dx = 1.",solution:""},

  // ════════════════════════════════════════════════════
  // HOMOGENEOUS ODE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"200",question:"Solve: dy/dx = (x + y - a) / (x + y - b) + (x + y + a) / (x + y + b)",solution:""},
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"202",question:"Solve: dy/dx = y/x + y²/x²",solution:""},
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"203",question:"Solve: (x² + y²) dx + 2xy dy = 0.",solution:""},
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"204",question:"Solve: x(x - y) dy + y² dx = 0.",solution:""},
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"205",question:"Solve: x dy/dx = y - √(x² + y²).",solution:""},
  {type:"example",topic:"homogeneous_ode",subtopic:"Homogeneous differential equation",page:"205",question:"Solve: x sin(y/x) dy/dx = (y sin(y/x) - x) dx.",solution:""},

  // ════════════════════════════════════════════════════
  // FIRST ORDER ODE — Exercises 3.1
  // ════════════════════════════════════════════════════
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: √(1 - x²) dy + √(1 - y²) dx = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: (x² + 1) dy/dx = xy",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: (1 + x) y dx + (1 + y) x dy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: tan y dx + tan x dy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: dy/dx = (x³ + 1) / (y + 1)",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: sec²x tan y dx + sec²y tan x dy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: dy/dx + (1 + cos 2y) / (1 - cos 2x) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: e^(x-y) dx + e^(y-x) dy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: ln(dy/dx) = 3x + 4y",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: (a² + y²) x dx + y(x² - a²) dy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: dy/dx = sin⁻¹x",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: xy' + y = 0, y(1) = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' = x² / y, y(1) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' = -2xy, y(0) = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' cos²x - sin²y = 0, y(0) = π/2",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: xyy' = y + 2, y(2) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' = 2(1 + x)(1 + y²), y(0) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: cos y dx + (1 + 2e^(-x)) sin y dy = 0, y(0) = π/4",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' = sec y, y(0) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: e^x y' = 2(x + 1) y², y(0) = 1/6",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y' = (3x² - e^x) / (2y - 5), y(0) = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP: y'(x² + 1) = -2xy, y(1) = 2.",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Find the curve in the xy-plane that passes through (0, 3) and whose tangent line at a point (x, y) has slope 2x/y².",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Find an equation of a curve with x-intercept 2 whose tangent line at any point (x, y) has slope xe^y.",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): (x + y + 1) dy/dx = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): sin⁻¹(dy/dx) = x + y",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): dy/dx = (y + 1) / (y + 1 + x)",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): (x + y)² dy/dx = a²",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): dy/dx = (4x + y + 1)²",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): dy/dx = √(y - x)",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve (change of variable): y' = (y + 4x)²",solution:""},

  // HOMOGENEOUS ODE — Exercises 3.1 (continued)
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP (homogeneous): xyy' = 2y² + 4x², y(2) = 4",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP (homogeneous): xy' = y + 3x⁴ cos²(y/x), y(1) = 0",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP (homogeneous): y' = (y - x) / (y - x - 1), y(-5) = 5",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve IVP (homogeneous): y' = (1 - 2y - 4x) / (1 + y + 2x), y(0) = 0",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: dy/dx = (3xy + y²) / 3x²",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: 2x + x dy/dx = y",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: dy/dx = (x² + y²) / x² + y",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"207",question:"Solve: (x² - y²) dy = xy dx",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve: (x + y) dx + (y - x) dy = 0",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve: dy/dx = y³ / x³",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve: dy/dx = (3xy + y²) / (x² + xy)",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve: x dy/dx = y + √(x² + y²)",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve: dy/dx = y/x + tan(y/x)",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve IVP: y³ y' + x³ = 0, y(0) = 1",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve IVP: (x + y) y' = x - y, y(2) = 0",solution:""},
  {type:"exercise",topic:"homogeneous_ode",subtopic:"Exercise 3.1",page:"208",question:"Solve IVP: (x³ + y³) y' = x²y, y(0) = 1",solution:""},

  // ════════════════════════════════════════════════════
  // LINEAR FIRST ORDER ODE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"211",question:"Solve: dy/dx + 2y = 4x",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"212",question:"Solve: (1 + x) dy/dx - xy = 1 - x.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"213",question:"Solve: dy/dx + y tan x = sec x",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"213",question:"Solve: sin 2x dy/dx - y = tan x.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"214",question:"Solve: dy/dx + y cot x = √sin x.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"214",question:"Solve: (x² + 1) dy/dx + 3xy = sin x.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"214",question:"Solve: (1 + x + xy²) dy/dx + (y + y³) = 0",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"216",question:"Solve: (1 + y²) dx = (tan⁻¹y - x) dy.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Linear differential equation of first order",page:"216",question:"Solve: dy/dx + y/x = x², if y = 1 when x = 1",solution:""},

  // ════════════════════════════════════════════════════
  // BERNOULLI'S EQUATION — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"218",question:"Solve: dy/dx + y/x = y²/x²",solution:""},
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"219",question:"Solve: dy/dx + y/x = y² ln x.",solution:""},
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"220",question:"Solve: dy/dx - y tan x = -y² sec x.",solution:""},
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"221",question:"Solve: cos x dy = y(sin x - y) dx.",solution:""},
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"221",question:"Solve: dy/dx + y/x = e^x / x² * y²",solution:""},
  {type:"example",topic:"bernoulli",subtopic:"Bernoulli's equation",page:"222",question:"Solve: dy/dx - tan y / (1 + x) = (1 + x) e^x sec y.",solution:""},

  // ════════════════════════════════════════════════════
  // EXERCISES 3.2 — Linear & Bernoulli
  // ════════════════════════════════════════════════════
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: dy/dx + y/x = 1/x²",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: dy/dx + 3y = e^(-x)",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: (1 - x²) dy/dx - xy = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: cos x dy/dx + y sin x = sec²x",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: x ln x dy/dx + y = 2 ln x",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: sec x dy/dx + y sec x = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: (1 + x²) dy/dx + y = e^(tan⁻¹x)",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve: sec x dy/dx + y cosec x = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve (linear): (x + y + 1) dy/dx = 1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve IVP: xy' + 2y = x² - x + 1, y(1) = 1/2",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"223",question:"Solve IVP: y' + 2y = 4x, y(0) = -1",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP: x²y' + 2xy - x + 1 = 0, y(1) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP: y' + 2y tan x = sin x, y(0) = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP: y' + 2y = 6e^x, y(0) = 5",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve (Bernoulli): dy/dx + y/x = y²",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve (Bernoulli): dy/dx + y/x = x²y⁶",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve (Bernoulli): dy/dx + y tan x = y³ sec x",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve (Bernoulli): dy/dx + x sin 2y = x³ cos²y",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve (Bernoulli): dy/dx + y/x ln y = y / x² (ln y)²",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP (Bernoulli): y' - y tan x = -y² sec x, y(0) = 1",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP (Bernoulli): y' + y/x = y², y(1) = 0",solution:""},
  {type:"exercise",topic:"bernoulli",subtopic:"Exercise 3.2",page:"224",question:"Solve IVP (Bernoulli): y' + y tan x = y² tan x sin y, y(1) = π/2",solution:""},

  // ════════════════════════════════════════════════════
  // EQUATIONS SOLVABLE FOR p, y, x — Clairaut — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"first_higher_ode",subtopic:"Equations solvable for p",page:"225",question:"Solve p² - 9p + 18 = 0.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Equations solvable for p",page:"226",question:"Solve p² + 2py cot x = y².",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Equations solvable for y",page:"228",question:"Solve 4xp² - 8yp - x = 0.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Equations solvable for x",page:"229",question:"Solve x = y - p².",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Equations solvable for x",page:"230",question:"Solve 4yp² - 2px + y = 0.",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Clairaut's equation",page:"232",question:"Solve p = ln(px - y).",solution:""},
  {type:"example",topic:"first_higher_ode",subtopic:"Clairaut's equation",page:"233",question:"Solve y = px + p(1 - p).",solution:""},

  // EXERCISES 3.3 — Solvable for p, y, x; Clairaut
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Solve: p² + 5xp + 6x² = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Solve: p² - 7p + 12 = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Solve: p³ + 2xp² - y²p² - 2xy²p = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Solve: p² - xy - y² - px",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Solve: p² + 2px + py + 2xy = 0",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution: y + px = x⁴p²",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution: xp² - 2yp + ax = 0. Also find its singular solution.",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution: y = yp² + 2px",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution: y - 2px + ayp². Also find its singular solution.",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution (Clairaut): y = px - 1/p",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution (Clairaut): sin(y - px) = p",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution (Clairaut): y = px + p(1 - p). Also find its singular solution.",solution:""},
  {type:"exercise",topic:"first_higher_ode",subtopic:"Exercise 3.3",page:"234",question:"Find the general solution (Clairaut): y = px + x³. Also find its singular solution.",solution:""},

  // ════════════════════════════════════════════════════
  // SECOND ORDER LINEAR ODE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"238",question:"Solve: y'' - 7y' + 12y = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"238",question:"Solve: (D + 3)²y = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"238",question:"Solve: y'' + 6y' + 25y = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"238",question:"Solve: 6y'' - 5y' + y = 0, y(0) = 4, y'(0) = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"239",question:"Solve: y'' - 4y' + 5y = 0 given y(0) = 1, y'(0) = 2.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Second order linear differential equation",page:"239",question:"Solve: d²x/dt² + μx = 0, μ > 0 given x = a and dx/dt = 0 when t = π/(2√μ).",solution:""},

  // EXERCISES 3.4 — Second Order Linear (Homogeneous)
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² - 5 dy/dx + 6y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² - 3 dy/dx + 2y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² - 9y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² + 2 dy/dx + 5y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² + 4 dy/dx + 4y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²x/dt² + 5x = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: (D² + 3aD - 4a²)y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: (D² - 4D + 4)y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: (D² + 2D)y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: d²y/dx² - 4 dy/dx + 13y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: (8D² - 6D - 5)y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve: 16 d²y/dx² + 24 dy/dx + 9y = 0.",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' + 5y' + 6y = 0, y(0) = 2, y'(0) = 3",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' - 16y = 0, y(0) = 1, y'(0) = 20",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' - 3y' + 2y = 0, y(0) = 1, y'(0) = 1",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' - 4y' + 4 = 0, y(0) = 3, y'(0) = 1",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: 4y'' - 4y' - 3y = 0, y(-2) = e, y'(-2) = -e/2",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: 2y'' + y' = 4y, y(0) = 0, y'(0) = 1",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' + 4y' + 3y = 0, y(0) = 2, y'(0) = -1",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' - 4y' + 5y = 0, y(0) = 1, y'(0) = 2",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' + 8y' - 9y = 0, y(1) = 1, y'(1) = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' + 6y' + 9y = 0, y(0) = -4, y'(0) = 14",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.4",page:"240",question:"Solve IVP: y'' + y' - 2y = 0, y(0) = 3, y'(0) = 0",solution:""},

  // ════════════════════════════════════════════════════
  // CAUCHY EQUATION — Examples & Exercises 3.5
  // ════════════════════════════════════════════════════
  {type:"example",topic:"second_order_linear",subtopic:"Cauchy equation and its solution",page:"243",question:"Solve the equation x²y'' - (5/2)xy' - 2y = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Cauchy equation and its solution",page:"244",question:"Solve the differential equation x²y'' - 3xy' + 4y = 0.",solution:""},
  {type:"example",topic:"second_order_linear",subtopic:"Cauchy equation and its solution",page:"244",question:"Solve the differential equation x²y'' + 7xy' + 13y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: x²y'' - 4xy' + 6y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: x²y'' - 20y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: x²y'' - xy' + 2y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: x²y'' + xy' + y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: (4x²D² + 12xD + 3)y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Find the general solution: (x²D² + 7xD + 9)y = 0",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Solve IVP (Cauchy): x²y'' - 2xy' + 2y = 0, y(1) = 3/2, y'(1) = 1",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Solve IVP (Cauchy): 4x²y'' + 24xy' + 25y = 0, y(1) = 2, y'(1) = -6",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Solve IVP (Cauchy): (x²D² - 3xD + 4)y = 0, y(1) = 0, y'(1) = 3",solution:""},
  {type:"exercise",topic:"second_order_linear",subtopic:"Exercise 3.5",page:"244",question:"Solve IVP (Cauchy): (x²D² + 3xD + 1)y = 0, y(1) = 3, y'(1) = -4",solution:""},

  // ════════════════════════════════════════════════════
  // SECOND ORDER NON-HOMOGENEOUS — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"247",question:"Find the general solution of y'' - y' - 2y = 2e^(3x)",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"248",question:"Find the general solution of y'' - 3y' - 4y = 2e^(-x).",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"248",question:"Find the general solution of y'' + 4y = 8x².",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"249",question:"Find the general solution of y'' + 5y' = 15x².",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"249",question:"Find the general solution of y'' - y = sin x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"250",question:"Find the general solution of y'' + y = cos x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"250",question:"Find the general solution of y'' + 4y' + 4y = 2 cosh x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"251",question:"Find the general solution of y'' - 2y' = e^x sin x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"nonhomogeneous linear differential equation",page:"252",question:"Find the general solution of the IVP y'' - y' - 2y = 3e^x, y(0) = 0, y'(0) = -2.",solution:""},

  // EXERCISES 3.6 — Undetermined Coefficients
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the particular solution: y'' + 2y' + y = x²",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the particular solution: y'' + 9y = 6 cos 3x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the particular solution: y'' - 6y' + 13y = 4e^(3x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the particular solution: y'' + y' - 2y = 14 + 2x - 2x²",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the particular solution: y'' - y' - 2y = 3e^(2x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' - 3y' - 4y = 3e^(2x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' - 3y' - 4y = 2e^(-x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' + 10y' + 25y = e^(-5x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - 2y' - 2y = 10 cos x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' + 4y = sin 3x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 4y = 2 sin 2x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' + 2y' + 10y = 25x² + 3",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"252",question:"Find the general solution: y'' + 4y' + 5y = 10",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 3y' = 28 cosh 4x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + y' = x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 5y' = 15x²",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - y = 2e^x + 6e^(2x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - y' - 6y = e^(-x) - 7 cos x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 2y' - 35y = 12e^(5x) + 37 sin 5x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - 4y' - 5y = e^x + 4",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 2y' + 3 = 4 sin 2x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - 3y' - 4y = -8e^x cos 2x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' - 2y' - 3y = 3xe^(2x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Find the general solution: y'' + 9y = x²e^(3x) + 6",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' - 6y' + 13y = 4e^(3x), y(0) = 2, y'(0) = 4",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' + y' - 2y = 14 + 2x - 2x², y(0) = 0, y'(0) = 0",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' + y' - 2y = 2x, y(0) = 0, y'(0) = 1",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' + y' - 2y = -6 sin 2x - 18 cos 2x, y(0) = 2, y'(0) = 2",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' - 2y' - 3y = 3xe^(2x), y(0) = 1, y'(0) = 0",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' + 2y' + y = e^x; y(0) = -1, y'(0) = 1",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.6",page:"253",question:"Solve IVP: y'' + 2y' + 5y = 4e^(-x) cos 2x, y(0) = 1, y'(0) = 0",solution:""},

  // ════════════════════════════════════════════════════
  // VARIATION OF PARAMETERS — Examples & Exercises 3.7
  // ════════════════════════════════════════════════════
  {type:"example",topic:"second_nonhomogeneous",subtopic:"method of variation of parameter",page:"256",question:"Find the general solution by variation of parameters: y'' - 5y' + 6y = 2e^x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"method of variation of parameter",page:"256",question:"Find the general solution by variation of parameters: y'' + y = sin x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"method of variation of parameter",page:"257",question:"Find the general solution by variation of parameters: y'' - 2y' + y = e^x / x.",solution:""},
  {type:"example",topic:"second_nonhomogeneous",subtopic:"method of variation of parameter",page:"258",question:"Solve by variation of parameters: x² d²y/dx² + x dy/dx - y = 16x³; y(1) = -1, y'(1) = 1.",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' - y' - 2y = 2e^(-x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 2y' + y = e^(-x) cos x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 4y = 3 cosec 2x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 4y' + 4y = x^(-2) e^(-2x)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' - 2y' + y = 3x^(3/2) e^x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 4y' + 5y = 10",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 2y' + y = 4e^(-x) ln x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 9y = cosec 3x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: y'' + 9y = sec 3x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters: (D² + 2D + 2)y = 2e^(-x) sec²x",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters (Cauchy): (x²D² - 4xD + 6)y = 21x^(-4)",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters (Cauchy): (x²D² + xD - 9)y = 48x⁵",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters (Cauchy): (x²D² + xD - 1)y = 16x³, y(1) = -1, y'(1) = 1",solution:""},
  {type:"exercise",topic:"second_nonhomogeneous",subtopic:"Exercise 3.7",page:"260",question:"Solve by variation of parameters (Cauchy): (x²D² - xD + 2)y = x ln x",solution:""},

  // ════════════════════════════════════════════════════
  // APPLICATION OF ODE — Examples
  // ════════════════════════════════════════════════════
  {type:"example",topic:"application_ode",subtopic:"Exponential growth (population growth)",page:"262",question:"UNO reports the world population in 1998 was approximately 5.9 billion growing at about 1.33% per year. Formulate a differential equation for world population and estimate the world population at the end of 2025. When will the population double from 1998?",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of heating system using Newton's law of cooling",page:"263",question:"(Heating of a building) In winter the daytime temperature in an office building is 21°C. Heating is shut off at 10 PM and turned on at 6 AM. Outside temperature is 7°C. Temperature of building at 2 AM was 18°C. Determine the temperature before heating turns on at 6 AM.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of heating system using Newton's law of cooling",page:"264",question:"A jar with 2000 L of beer contains 4% alcohol by volume. Beer with 6% alcohol is pumped in at 20 L/min and mixture pumped out at the same rate. What is the percentage of alcohol after one hour?",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of R-L Circuit",page:"268",question:"An RL circuit has an emf of 5 V, a resistance of 50 Ω, inductance of 1 H and no additional current source. Find the current in the circuit.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Mixing problem",page:"270",question:"A tank initially contains 4 kg of salt dissolved into 100 L of water. Brine of 2 kg/L enters at 5 L/min; uniform solution drains at same rate. Find the amount of salt in the tank after 10 minutes.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Mixing problem",page:"272",question:"A 1500-gallon tank initially contains 600 gallons of water with 5 lbs of salt. Water enters at 9 gal/hr with salt concentration (1 + cos t) lbs/gal. Well-mixed solution leaves at 6 gal/hr. How much salt is in the tank when it overflows?",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of blood sugar distribution in human body",page:"273",question:"A glucose solution is administered intravenously at constant rate r. Glucose is removed from the bloodstream at rate proportional to concentration C(t): dC/dt = r - KC. (a) If C(0) = C₀, find C(t). (b) Assuming C₀ < r/K, find lim t→∞ C(t) and interpret.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of rainfall problems",page:"275",question:"When a raindrop falls the size and velocity both increase with time. Initial velocity is zero and initial mass m(0) = m₀. Growth rate of mass m(t) is proportional to current mass. Find velocity v(t) and mass m(t) at any time. Find terminal velocity as t → ∞.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of rainfall problems",page:"277",question:"(Vertical motion) A body of unit mass falling under gravity encounters atmospheric resistance proportional to velocity v. Show equation of motion is dv/dt = g - kv. Show that as t increases v → g/k, and x = gt/k - g/k²(1 - e^(-kt)) where x is distance fallen from rest.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of chemical reaction in chemical engineering",page:"279",question:"Chemical C is formed from chemicals A and B. Rate of reaction is proportional to instantaneous amounts of A and B not converted. Initially 40 g of A and 50 g of B; for each gram of B, 2 g of A is used. 10 g of C forms in 5 minutes. How much C forms in 20 minutes? Find limiting amount of C. How much A and B remain after long time?",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of chemical reaction in chemical engineering",page:"281",question:"(Resisted motion) A moving body is opposed by a force cx per unit mass and resistance bv² per unit mass, where x and v are displacement and velocity. Show velocity starting from rest is v² = c/(2b²)(1 - e^(-2bx)) - cx/b.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Modeling of chemical reaction in chemical engineering",page:"282",question:"A body is rowed with velocity v across a stream of width l. If velocity of current is proportional to the product of distances from the two banks, show the equation of the path is x = ky²/(6v)(3l - 2y).",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"288",question:"(No damping) A mass of 1 kg is attached to a spring on a frictionless surface. A force of 6 N stretches the spring 1.5 m. Mass is released from rest 1 m to the right of equilibrium. Determine position as a function of time.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"288",question:"(Underdamped motion) Solve: x'' + x' + 4x = 0 for the motion of a spring-mass system.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"289",question:"(Critically damped motion) Solve: x'' + 4x' + 4 = 0 for the motion of the spring attached with mass.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"289",question:"(Overdamped motion) Solve: x'' + 5x' + 4 = 0 for the motion of spring-mass system.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"290",question:"(Forced system) Solve: x'' + (1/2)x' + 4x = cos t for the spring-mass system with external force.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"291",question:"A spring with mass 2 kg has natural length 0.5 m. A force of 25.6 N maintains it stretched to 0.7 m. If the spring is stretched to 0.7 m and released with initial velocity 0, find the position at any time t.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"295",question:"Find the charge and current at time t in an RLC circuit with R = 40 Ω, L = 1 H, C = 16×10⁻⁴ F, E(t) = 100 cos(10t), with initial charge and current zero.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"296",question:"A series RLC circuit has capacitor 1.6×10⁻⁶ F and inductor L = 0.4 H. Find resistance R so that the circuit is critically damped.",solution:""},
  {type:"example",topic:"application_ode",subtopic:"Application of second order linear differential equation in spring-mass system",page:"297",question:"Solve the second order ODE of the series RLC circuit: L d²V_c/dt² + R dV_c/dt + (1/C)V_c = 0, where R = 10 Ω, L = 1 H, C = 16×10⁻⁴ F, V_in = 0, V_c(0) = 6 V, V_c'(0) = 6 A.",solution:""},

  // ════════════════════════════════════════════════════
  // APPLICATION OF ODE — Exercises 3.8
  // ════════════════════════════════════════════════════
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"297",question:"The growth rate of a culture of bacteria is proportional to the number present. After one day it is 1.5 times the original number. Find after how many days it will be (a) double (b) triple.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"297",question:"A metal bar at 20°C is placed in boiling water. How long does it take to heat the bar practically to 100°C (say 99.99°C) if the temperature after one minute is 51.5°C?",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"297",question:"A heater is turned off at night 2 hours before going to bed. Room is at 66°F when heater is turned off and falls to 63°F at bedtime. What is the temperature 8 hours after going to bed? Outside temperature is 32°F.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"297",question:"A cup of coffee at 190°F is in a room at 70°F. At t = 0 the coffee cools at 15°F per minute. (a) Find the function modeling the cooling. (b) How long until temperature reaches 143°F?",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A tank contains 40 kg of salt in 200 L of water. A solution of 2 kg/L enters at 5 L/min; uniform solution drains at same rate. Find the amount of salt at any time t. Also determine salt in tank after 15 minutes.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A spring with a 4 kg mass has natural length 1 m and is maintained stretched to 1.3 m by 24.3 N. Spring is compressed to 0.8 m and released with zero velocity. Find position of mass at any time t.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A spring has natural length 0.75 m with a 5 kg mass. A force of 25 N keeps the spring stretched to 1 m. If stretched to 1.1 m and released with velocity 0, find position of mass after t seconds.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A spring with mass 2 kg has damping constant 14 and a force of 6 N to keep it stretched 0.5 m beyond natural length. Spring is stretched 1 m beyond natural length and released with zero velocity. Find position of mass at any time t.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A spring has mass m, spring constant k, ω = √(k/m), damping constant c = 0. External force F(t) = F₀ cos ωt is applied. Show using undetermined coefficients that motion is x(t) = c₁ cos ωt + c₂ sin ωt + F₀/(2mω) sin ωt.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"Solve the second order ODE of the parallel RLC circuit: d²E/dt² + (1/RC) dE/dt + (1/LC) E = 0, E(0) = 6, dE(0)/dt = -12, R = 20 Ω, L = 50 H, C = 6×10⁻¹ F.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A series RLC circuit has R = 24 Ω, L = 1 H, C = 0.002 F and a 12 V battery. Initial charge and current are both zero. Find charge and current at any time t.",solution:""},
  {type:"exercise",topic:"application_ode",subtopic:"Exercise 3.8",page:"298",question:"A battery of 18 V is connected in series with inductance 1/4 H and resistance 30 Ω. Determine current I(t) with initial current zero. Find steady-state current as t → ∞ and transient current.",solution:""},
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
    .replace(/lim\s*\(?\s*([a-z])\s*(?:→|->)\s*([^)]+)\)?\s*/gi, 'limit as $1->$2 of ')
    .replace(/lim_\{?([a-z])\s*(?:→|->)\s*([^}]+)\}?/gi, 'limit as $1->$2 of ')
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
