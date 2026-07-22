const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middleware: Helmet
app.use(helmet());

// Security Middleware: CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Security Middleware: Rate Limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api', apiLimiter);

// Body Parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Kubernetes Liveness & Readiness Probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.get('/readiness', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      return res.status(200).json({ ready: true, db: 'connected' });
    }
    return res.status(503).json({ ready: false, db: 'disconnected' });
  } catch (err) {
    res.status(500).json({ ready: false, error: err.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('AI Task Processing Platform API is running...');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
