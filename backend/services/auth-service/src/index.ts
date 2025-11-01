import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import routes
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import logger from './utils/logger';

// Request logging middleware (HIPAA compliant)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next) => {
    // Sanitize request body before logging
    const sanitizedBody = req.method === 'POST' && req.body
      ? Object.keys(req.body).reduce((acc: any, key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
            acc[key] = '***REDACTED***';
          } else {
            acc[key] = req.body[key];
          }
          return acc;
        }, {})
      : undefined;
    
    logger.debug(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      body: sanitizedBody,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
    });
    next();
  });
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/admin/auth', adminRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Auth Service is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      adminSignup: 'POST /api/admin/auth/signup',
      adminLogin: 'POST /api/admin/auth/login',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled application error', err, {
    path: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    // Never expose stack traces in production (HIPAA requirement)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Auth Service started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: `http://localhost:${PORT}/health`,
      signup: `POST http://localhost:${PORT}/api/admin/auth/signup`,
      login: `POST http://localhost:${PORT}/api/admin/auth/login`,
    },
  });
});
