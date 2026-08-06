import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import bwgRoutes from './routes/bwg.routes.js';
import civicRoutes from './routes/civic.routes.js';
import taskRoutes from './routes/task.routes.js';
import pickupRoutes from './routes/pickup.routes.js';
import batchRoutes from './routes/batch.routes.js';
import factoryRoutes from './routes/factory.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Load environment variables
dotenv.config();

// Initialize Express Application
const app = express();
const PORT = process.env.PORT || 5000;

// Connect & Verify PostgreSQL + PostGIS Database
connectDB();

// 1. Security & HTTP Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 2. Express Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100) : 10000, // High capacity for dev multi-tab testing
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 3. Request Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Server Root Health Check (GET /)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    system: 'UrbanEco Link RESTful API Server',
    version: '1.0.0',
    status: 'ONLINE',
    compliance: 'India Solid Waste Management (SWM) Rules 2026',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 5. Base API Health Check (GET /api/v1)
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 UrbanEco Link API Server is online and operational.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Alias Health Endpoint (GET /health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    system: 'UrbanEco Link RESTful API Server',
    compliance: 'India Solid Waste Management (SWM) Rules 2026',
    timestamp: new Date().toISOString(),
  });
});

// 6. Sub-Router Registrations
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/bwg', bwgRoutes);
app.use('/api/v1/civic', civicRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/pickups', pickupRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/v1/factory', factoryRoutes);
app.use('/api/factory', factoryRoutes);
app.use('/api/v1/delivery', batchRoutes);
app.use('/api/delivery', batchRoutes);

// 7. Wildcard 404 Route & Centralized Error Handler (Must be placed AFTER all routes)
app.use('*', notFoundHandler);
app.use(errorHandler);

// 8. Start Express Server Listener
const server = app.listen(PORT, () => {
  console.log(`🚀 UrbanEco Link API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
});

// Safety Net for Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

export default app;
