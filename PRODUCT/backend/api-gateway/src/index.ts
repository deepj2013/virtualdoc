import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createSwaggerConfig } from '../common/swagger-config/swaggerConfig';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Centralized API Documentation
const centralizedSwaggerConfig = createSwaggerConfig({
  serviceName: 'VirtualDoc API Gateway',
  serviceDescription: 'Centralized API documentation for all VirtualDoc microservices - Authentication, Discovery, Patient Management, and User Management',
  version: '1.0.0',
  port: parseInt(process.env.PORT || '3000'),
  basePath: '/api',
  tags: [
    {
      name: 'Authentication Service',
      description: 'User authentication, authorization, and session management'
    },
    {
      name: 'Discovery Service',
      description: 'Doctor discovery, search, filtering, and appointment booking'
    },
    {
      name: 'Patient Service',
      description: 'Patient management, medical records, and healthcare data'
    },
    {
      name: 'User Service',
      description: 'User profile management, preferences, and account settings'
    },
    {
      name: 'API Gateway',
      description: 'Centralized routing and API management'
    }
  ]
});

// Add external service references
centralizedSwaggerConfig.servers = [
  {
    url: 'http://localhost:3000/api',
    description: 'API Gateway (Development)'
  },
  {
    url: 'https://api.virtualdoc.com/api',
    description: 'API Gateway (Production)'
  }
];

// Add external service documentation links
centralizedSwaggerConfig.externalDocs = {
  description: 'Individual Service Documentation',
  url: 'https://docs.virtualdoc.com'
};

// Add service-specific documentation links
centralizedSwaggerConfig.paths = {
  '/auth/docs': {
    get: {
      summary: 'Authentication Service Documentation',
      description: 'Redirect to Authentication Service Swagger UI',
      tags: ['Authentication Service'],
      responses: {
        '302': {
          description: 'Redirect to Auth Service documentation',
          headers: {
            Location: {
              description: 'URL to Auth Service docs',
              schema: { type: 'string', example: 'http://localhost:3001/api-docs' }
            }
          }
        }
      }
    }
  },
  '/discovery/docs': {
    get: {
      summary: 'Discovery Service Documentation',
      description: 'Redirect to Discovery Service Swagger UI',
      tags: ['Discovery Service'],
      responses: {
        '302': {
          description: 'Redirect to Discovery Service documentation',
          headers: {
            Location: {
              description: 'URL to Discovery Service docs',
              schema: { type: 'string', example: 'http://localhost:3002/api-docs' }
            }
          }
        }
      }
    }
  },
  '/patients/docs': {
    get: {
      summary: 'Patient Service Documentation',
      description: 'Redirect to Patient Service Swagger UI',
      tags: ['Patient Service'],
      responses: {
        '302': {
          description: 'Redirect to Patient Service documentation',
          headers: {
            Location: {
              description: 'URL to Patient Service docs',
              schema: { type: 'string', example: 'http://localhost:3003/api-docs' }
            }
          }
        }
      }
    }
  },
  '/users/docs': {
    get: {
      summary: 'User Service Documentation',
      description: 'Redirect to User Service Swagger UI',
      tags: ['User Service'],
      responses: {
        '302': {
          description: 'Redirect to User Service documentation',
          headers: {
            Location: {
              description: 'URL to User Service docs',
              schema: { type: 'string', example: 'http://localhost:3004/api-docs' }
            }
          }
        }
      }
    }
  }
};

const swaggerOptions: swaggerJsdoc.Options = {
  definition: centralizedSwaggerConfig,
  apis: [] // No local files to scan
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #2c3e50; font-size: 2.5rem }
    .swagger-ui .info .description { font-size: 1.2rem; color: #7f8c8d }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0 }
  `,
  customSiteTitle: 'VirtualDoc API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Service documentation redirects
app.get('/api/auth/docs', (req, res) => {
  res.redirect('http://localhost:3001/api-docs');
});

app.get('/api/discovery/docs', (req, res) => {
  res.redirect('http://localhost:3002/api-docs');
});

app.get('/api/patients/docs', (req, res) => {
  res.redirect('http://localhost:3003/api-docs');
});

app.get('/api/users/docs', (req, res) => {
  res.redirect('http://localhost:3004/api-docs');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: 'http://localhost:3001/health',
      discovery: 'http://localhost:3002/health',
      patients: 'http://localhost:3003/health',
      users: 'http://localhost:3004/health'
    }
  });
});

// API overview endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'VirtualDoc API',
    version: '1.0.0',
    description: 'Healthcare platform API for doctor discovery and patient management',
    documentation: '/api-docs',
    services: {
      authentication: {
        name: 'Authentication Service',
        url: 'http://localhost:3001',
        docs: 'http://localhost:3001/api-docs',
        description: 'User authentication and authorization'
      },
      discovery: {
        name: 'Discovery Service',
        url: 'http://localhost:3002',
        docs: 'http://localhost:3002/api-docs',
        description: 'Doctor discovery and appointment booking'
      },
      patients: {
        name: 'Patient Service',
        url: 'http://localhost:3003',
        docs: 'http://localhost:3003/api-docs',
        description: 'Patient management and medical records'
      },
      users: {
        name: 'User Service',
        url: 'http://localhost:3004',
        docs: 'http://localhost:3004/api-docs',
        description: 'User profiles and account management'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      documentation: '/api-docs',
      health: '/health',
      apiOverview: '/api',
      serviceDocs: {
        auth: '/api/auth/docs',
        discovery: '/api/discovery/docs',
        patients: '/api/patients/docs',
        users: '/api/users/docs'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 Centralized API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Service Health Checks: http://localhost:${PORT}/health`);
  console.log(`📋 API Overview: http://localhost:${PORT}/api`);
});

export default app;
