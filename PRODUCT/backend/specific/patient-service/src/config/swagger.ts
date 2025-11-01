import { createSwaggerOptions, SwaggerServiceConfig } from '../../../common/swagger-config/swaggerConfig';

const patientServiceConfig: SwaggerServiceConfig = {
  serviceName: 'Patient Service',
  serviceDescription: 'Handles patient management, medical records, and healthcare data for VirtualDoc platform',
  version: '1.0.0',
  port: parseInt(process.env.PORT || '3003'),
  basePath: '/api',
  tags: [
    {
      name: 'Patients',
      description: 'Patient profile and basic information management'
    },
    {
      name: 'Medical Records',
      description: 'Medical history and health records management'
    },
    {
      name: 'Demographics',
      description: 'Patient demographic information and personal details'
    },
    {
      name: 'Insurance',
      description: 'Insurance information and coverage management'
    },
    {
      name: 'Emergency Contacts',
      description: 'Emergency contact information management'
    },
    {
      name: 'Documents',
      description: 'Medical documents and file management'
    },
    {
      name: 'Search',
      description: 'Patient search and filtering capabilities'
    }
  ]
};

const swaggerOptions = createSwaggerOptions(patientServiceConfig, [
  './src/routes/*.ts',
  './src/controllers/*.ts',
  './src/schemas/*.ts'
]);

export { swaggerOptions, patientServiceConfig };
