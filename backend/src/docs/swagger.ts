import swaggerJSDoc from 'swagger-jsdoc';
import config from '../types';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Win Learning Management System API',
    version: '1.0.0',
    description: 'API documentation for the Win Learning Management System',
  },
  servers: [
    {
      url: `http://localhost:${config.port}${config.apiPrefix}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
