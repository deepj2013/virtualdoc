import { createSwaggerOptions, SwaggerServiceConfig } from '../../swagger-config/swaggerConfig';

const userServiceConfig: SwaggerServiceConfig = {
  serviceName: 'User Service',
  serviceDescription: 'Handles user profile management, preferences, and account settings for VirtualDoc platform',
  version: '1.0.0',
  port: parseInt(process.env.PORT || '3004'),
  basePath: '/api',
  tags: [
    {
      name: 'Users',
      description: 'User profile and account management'
    },
    {
      name: 'Profiles',
      description: 'User profile information and preferences'
    },
    {
      name: 'Settings',
      description: 'User account settings and preferences'
    },
    {
      name: 'Notifications',
      description: 'User notification preferences and settings'
    },
    {
      name: 'Search',
      description: 'User search and filtering capabilities'
    }
  ]
};

const swaggerOptions = createSwaggerOptions(userServiceConfig, [
  './src/routes/*.ts',
  './src/controllers/*.ts',
  './src/schemas/*.ts'
]);

export { swaggerOptions, userServiceConfig };
