import mongoose from 'mongoose';


const connectDB = async () => {
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
