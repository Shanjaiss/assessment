require('dotenv').config();
console.log('MONGO_URI =', process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const assessmentRoutes = require('./src/routes/assesmentRoutes');
const responseRoutes = require('./src/routes/responseRoutes');

const app = express();

/* ---------------- SIMPLE CORS (DEV ONLY) ---------------- */
app.use(cors());

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/responses', responseRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API running' });
});

/* ---------------- ERROR HANDLERS ---------------- */
// keep if you already implemented them
const { notFound, errorHandler } = require('./src/middleware/errorvalidation');
app.use(notFound);
app.use(errorHandler);

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log('DB Error:', err);
  }
};

start();

module.exports = app;
