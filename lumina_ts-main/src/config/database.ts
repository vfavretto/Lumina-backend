import mongoose from 'mongoose';

const connectDB = async () => {

  if (process.env.NODE_ENV === 'test') {
    console.log('Ignorando conexão ao MongoDB em ambiente de teste');
    return;
  }
  
  const mongoURI = process.env.MONGODB_URI as string | undefined;
  if (!mongoURI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
    } else {
      console.error('Unknown MongoDB connection error');
    }
    process.exit(1);
  }
};

export default connectDB;
