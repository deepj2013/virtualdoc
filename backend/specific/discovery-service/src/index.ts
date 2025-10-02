import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { validateRequest } from './middleware/validation';

// Import routes
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import reviewRoutes from './routes/reviews';
import searchRoutes from './routes/search';
import insuranceRoutes from './routes/insurance';

// Import services
import { DatabaseService } from './services/DatabaseService';
import { RedisService } from './services/RedisService';
import { NotificationService } from './services/NotificationService';
import { SearchService } from './services/SearchService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3004;

// Initialize services
const databaseService = new DatabaseService();
const redisService = new RedisService();
const notificationService = new NotificationService();
const searchService = new SearchService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'discovery-service',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/insurance', insuranceRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join room for real-time updates
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info(`Client ${socket.id} joined room: ${roomId}`);
  });

  // Handle appointment booking updates
  socket.on('appointment-booking', async (data: any) => {
    try {
      // Process appointment booking
      const result = await appointmentRoutes.handleBooking(data);
      
      // Notify all clients in the room
      io.to(data.doctorId).emit('appointment-updated', result);
      
      // Send confirmation to patient
      socket.emit('booking-confirmation', result);
    } catch (error) {
      logger.error('Appointment booking error:', error);
      socket.emit('booking-error', { message: 'Booking failed' });
    }
  });

  // Handle availability updates
  socket.on('availability-check', async (data: any) => {
    try {
      const availability = await searchService.getRealTimeAvailability(data.doctorId, data.date);
      socket.emit('availability-update', availability);
    } catch (error) {
      logger.error('Availability check error:', error);
      socket.emit('availability-error', { message: 'Availability check failed' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await databaseService.close();
    await redisService.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await databaseService.close();
    await redisService.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
server.listen(PORT, async () => {
  try {
    // Initialize database connection
    await databaseService.initialize();
    logger.info('Database connected successfully');

    // Initialize Redis connection
    await redisService.initialize();
    logger.info('Redis connected successfully');

    // Initialize search index
    await searchService.initialize();
    logger.info('Search service initialized');

    logger.info(`Discovery service running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

export default app;
