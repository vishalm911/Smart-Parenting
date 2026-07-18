/**
 * server.js — SpacECE Express + MongoDB Backend
 *
 * Replaces Firebase entirely:
 *   • Firebase Auth    →  JWT (jsonwebtoken + bcryptjs)
 *   • Firestore        →  MongoDB (mongoose)
 *
 * Routes:
 *   POST   /api/auth/register
 *   POST   /api/auth/login
 *   POST   /api/auth/logout
 *   GET    /api/auth/me
 *   POST   /api/auth/forgot-password
 *   PUT    /api/auth/change-password
 *
 *   GET/POST/PUT/DELETE  /api/literacy/*     (stories, vocab, scores, …)
 *   GET/POST/PUT/DELETE  /api/children/*     (child profiles)
 *   GET/POST/PUT/DELETE  /api/users/*        (user accounts — admin)
 *   GET/POST             /api/sessions/*     (login sessions)
 *   GET/POST/PUT/DELETE  /api/scores/*       (activity scores)
 *   GET/POST/PUT/DELETE  /api/numeracy/*     (math, puzzle, logic games)
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

// ── Route modules ──────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const literacyRoutes  = require('./routes/literacy');
const childrenRoutes  = require('./routes/children');
const usersRoutes     = require('./routes/users');
const sessionsRoutes  = require('./routes/sessions');
const scoresRoutes    = require('./routes/scores');
const numeracyRoutes  = require('./routes/numeracy');
const milestonesRoutes = require('./routes/milestones');
const notificationsRoutes = require('./routes/notifications');
const cognitiveSelRoutes = require('./routes/cognitiveSel');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/literacy',  literacyRoutes);
app.use('/api/children',  childrenRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/sessions',  sessionsRoutes);
app.use('/api/scores',    scoresRoutes);
app.use('/api/numeracy',  numeracyRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/cognitive-sel', cognitiveSelRoutes);

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── MongoDB connection + server start ─────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceece')
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app; // for tests
