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

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.method === 'POST' ? { ...req.body, password: '***' } : undefined,
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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Admin Signup: POST http://localhost:${PORT}/api/admin/auth/signup`);
  console.log(`🔗 Admin Login: POST http://localhost:${PORT}/api/admin/auth/login`);
});
