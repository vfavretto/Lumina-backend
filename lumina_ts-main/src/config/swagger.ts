import swaggerAutogen from 'swagger-autogen';
import dotenv from 'dotenv';

dotenv.config();

const swaggerAutogenConfig = swaggerAutogen({ openapi: '3.1.0' });

const doc = {
  info: {
    version: '1.0.0',
    title: 'Lumina API',
    description: 'API da Lumina com integração ao MongoDB',
  },
  servers: [
    {
      url: process.env.VITE_BACKEND_URL,
    },
  ],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogenConfig(outputFile, endpointsFiles, doc).then(async () => {
  await import('../../src');
});
