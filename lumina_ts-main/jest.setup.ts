import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    console.log('Iniciando MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`MongoDB iniciado em: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Conexão com o MongoDB estabelecida.');
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});