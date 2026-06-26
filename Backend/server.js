// require('dotenv').config();
// console.log('MONGO_URI =', process.env.MONGO_URI);
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./src/config/db');
// const { notFound, errorHandler } = require('./src/middleware/errorvalidation');

// const authRoutes = require('./src/routes/authRoutes');
// const categoryRoutes = require('./src/routes/categoryRoutes');
// const assessmentRoutes = require('./src/routes/assesmentRoutes');
// const responseRoutes = require('./src/routes/responseRoutes');

// const app = express();

// // --- Middleware ---
// // const allowedOrigin = process.env.CLIENT_ORIGIN;

// // app.use(
// //   cors({
// //     origin: function (origin, callback) {
// //       // allow Postman / server-to-server
// //       if (!origin) return callback(null, true);

// //       const allowedOrigins = [
// //         process.env.CLIENT_ORIGIN,
// //         'http://localhost:5173',
// //         'http://127.0.0.1:5173',
// //       ];

// //       if (allowedOrigins.includes(origin)) {
// //         return callback(null, true);
// //       }

// //       return callback(null, true); // DEV MODE: allow everything
// //     },
// //     credentials: true,
// //     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //   })
// // );
// app.use(cors());
// app.options('*', cors());

// app.use(express.json({ limit: '2mb' }));

// // --- Health check ---
// app.get('/api/health', (req, res) => {
//   res
//     .status(200)
//     .json({ status: 'ok', message: 'Assessment App API is running' });
// });

// // --- Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/assessments', assessmentRoutes);
// app.use('/api/responses', responseRoutes);

// // --- Error handling (must be last) ---
// app.use(notFound);
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// startServer();

// module.exports = app;

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
