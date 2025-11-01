import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'VirtualDoc API is running!',
    version: '1.0.0',
    status: 'healthy'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // TODO: Implement actual authentication
  if (email && password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'patient'
      },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  // TODO: Implement actual registration
  if (firstName && lastName && email && password) {
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: 1,
        firstName,
        lastName,
        email,
        role: role || 'patient'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
});

// User routes
app.get('/api/users/profile', (req, res) => {
  // TODO: Implement actual user profile retrieval
  res.json({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'patient',
    createdAt: new Date().toISOString()
  });
});

// Appointments routes
app.get('/api/appointments', (req, res) => {
  // TODO: Implement actual appointments retrieval
  res.json({
    appointments: [
      {
        id: 1,
        doctorName: 'Dr. Smith',
        date: '2024-01-15T10:00:00Z',
        status: 'scheduled',
        type: 'consultation'
      },
      {
        id: 2,
        doctorName: 'Dr. Johnson',
        date: '2024-01-20T14:30:00Z',
        status: 'confirmed',
        type: 'follow-up'
      }
    ]
  });
});

app.post('/api/appointments', (req, res) => {
  const { doctorId, date, type } = req.body;
  
  // TODO: Implement actual appointment creation
  res.json({
    success: true,
    message: 'Appointment created successfully',
    appointment: {
      id: 3,
      doctorId,
      date,
      type,
      status: 'scheduled'
    }
  });
});

// Doctors routes
app.get('/api/doctors', (req, res) => {
  // TODO: Implement actual doctors retrieval
  res.json({
    doctors: [
      {
        id: 1,
        name: 'Dr. Smith',
        specialization: 'General Medicine',
        experience: 10,
        rating: 4.8,
        consultationFee: 100
      },
      {
        id: 2,
        name: 'Dr. Johnson',
        specialization: 'Cardiology',
        experience: 15,
        rating: 4.9,
        consultationFee: 150
      }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 VirtualDoc API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});
