import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

export interface SwaggerServiceConfig {
  serviceName: string;
  serviceDescription: string;
  version: string;
  port: number;
  basePath: string;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export const createSwaggerConfig = (config: SwaggerServiceConfig): SwaggerDefinition => {
  const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: `${config.serviceName} API`,
      description: config.serviceDescription,
      version: config.version,
      contact: {
        name: 'VirtualDoc Team',
        email: 'support@virtualdoc.com',
        url: 'https://virtualdoc.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.basePath}`,
        description: 'Development server'
      },
      {
        url: `https://api.virtualdoc.com${config.basePath}`,
        description: 'Production server'
      }
    ],
    tags: config.tags,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service communication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Error code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Success message'
            },
            data: {
              type: 'object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              example: 1
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              example: 10
            },
            total: {
              type: 'integer',
              example: 100
            },
            totalPages: {
              type: 'integer',
              example: 10
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Unauthorized access',
                error: 'UNAUTHORIZED',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Access denied',
                error: 'FORBIDDEN',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found',
                error: 'NOT_FOUND',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed',
                error: 'VALIDATION_ERROR',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_SERVER_ERROR',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  };

  return swaggerDefinition;
};

export const createSwaggerOptions = (config: SwaggerServiceConfig, paths: string[]): swaggerJsdoc.Options => {
  return {
    definition: createSwaggerConfig(config),
    apis: paths
  };
};

// Common response schemas for different services
export const commonSchemas = {
  IdParam: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }
    },
    required: ['id']
  },
  
  PaginationQuery: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number',
        example: 1
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of items per page',
        example: 10
      },
      sort: {
        type: 'string',
        description: 'Sort field',
        example: 'createdAt'
      },
      order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc',
        description: 'Sort order',
        example: 'desc'
      }
    }
  },

  SearchQuery: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        description: 'Search query',
        example: 'search term'
      },
      filters: {
        type: 'object',
        description: 'Additional filters',
        additionalProperties: true
      }
    }
  },

  Timestamps: {
    type: 'object',
    properties: {
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  }
};

// Common response examples
export const commonResponses = {
  success: {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Success'
        }
      }
    }
  },
  
  created: {
    description: 'Resource created successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Success'
        }
      }
    }
  },
  
  noContent: {
    description: 'No content',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        }
      }
    }
  },
  
  badRequest: {
    description: 'Bad request',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Error'
        },
        example: {
          success: false,
          message: 'Invalid request parameters',
          error: 'BAD_REQUEST',
          timestamp: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  },
  
  unauthorized: {
    $ref: '#/components/responses/UnauthorizedError'
  },
  
  forbidden: {
    $ref: '#/components/responses/ForbiddenError'
  },
  
  notFound: {
    $ref: '#/components/responses/NotFoundError'
  },
  
  validationError: {
    $ref: '#/components/responses/ValidationError'
  },
  
  internalServerError: {
    $ref: '#/components/responses/InternalServerError'
  }
};
