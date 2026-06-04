import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User Auth API',
      version: '1.0.0',
      description: 'API documentation for the user authentication system',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Replace with your server URL
      },
    ],
  },
  apis: [
    path.join(__dirname, 'auth/controller.ts'), // Point to controller.ts for routes
    path.join(__dirname, 'auth/schema.ts'),    // Point to schema.ts for definitions
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
