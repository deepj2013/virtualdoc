import { createSwaggerOptions, SwaggerServiceConfig } from '../../../common/swagger-config/swaggerConfig';

const discoveryServiceConfig: SwaggerServiceConfig = {
  serviceName: 'Discovery Service',
  serviceDescription: 'Handles doctor discovery, search, filtering, and appointment booking for VirtualDoc platform',
  version: '1.0.0',
  port: parseInt(process.env.PORT || '3002'),
  basePath: '/api',
  tags: [
    {
      name: 'Doctors',
      description: 'Doctor profiles, search, and management'
    },
    {
      name: 'Appointments',
      description: 'Appointment booking and management'
    },
    {
      name: 'Reviews',
      description: 'Doctor reviews and ratings'
    },
    {
      name: 'Search',
      description: 'Advanced search and filtering capabilities'
    },
    {
      name: 'Insurance',
      description: 'Insurance provider management'
    },
    {
      name: 'Availability',
      description: 'Doctor availability and scheduling'
    }
  ]
};

const swaggerOptions = createSwaggerOptions(discoveryServiceConfig, [
  './src/routes/*.ts',
  './src/controllers/*.ts',
  './src/schemas/*.ts'
]);

export { swaggerOptions, discoveryServiceConfig };
