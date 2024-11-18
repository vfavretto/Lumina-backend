import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.test' }); // Usa arquivo .env.test para ambiente de testes

beforeAll(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI não encontrada no arquivo .env.test');
    }

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
    throw error;
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});