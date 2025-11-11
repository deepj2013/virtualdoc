import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './utils/logger';

// Import routes
import userRoutes from './routes/user.routes';
import permissionRoutes from './routes/permission.routes';
import roleRoutes from './routes/role.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security Middleware (HIPAA Compliance)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS Configuration (restrict in production)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'User Service is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: {
        create: 'POST /api/users',
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        createRole: 'POST /api/users/:id/roles',
        getRoles: 'GET /api/users/:id/roles',
        removeRole: 'DELETE /api/users/:id/roles/:roleId',
      },
      permissions: {
        create: 'POST /api/permissions',
        list: 'GET /api/permissions',
      },
      roles: {
        assignPermission: 'POST /api/roles/:role/permissions',
        getPermissions: 'GET /api/roles/:role/permissions',
      },
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
  logger.info('User Service started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: `http://localhost:${PORT}/health`,
      users: `http://localhost:${PORT}/api/users`,
      permissions: `http://localhost:${PORT}/api/permissions`,
      roles: `http://localhost:${PORT}/api/roles`,
    },
  });
});
