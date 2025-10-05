import { createSwaggerOptions, SwaggerServiceConfig } from '../../swagger-config/swaggerConfig';

const authServiceConfig: SwaggerServiceConfig = {
  serviceName: 'Authentication Service',
  serviceDescription: 'Handles user authentication, authorization, and session management for VirtualDoc platform',
  version: '1.0.0',
  port: parseInt(process.env.PORT || '3001'),
  basePath: '/api',
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and session management'
    },
    {
      name: 'Authorization',
      description: 'User authorization and access control'
    },
    {
      name: 'Password Management',
      description: 'Password reset and change operations'
    },
    {
      name: 'User Profile',
      description: 'Current user profile operations'
    }
  ]
};

const swaggerOptions = createSwaggerOptions(authServiceConfig, [
  './src/routes/*.ts',
  './src/controllers/*.ts',
  './src/schemas/*.ts'
]);

export { swaggerOptions, authServiceConfig };
