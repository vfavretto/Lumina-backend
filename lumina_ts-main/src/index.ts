import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import routes from './config/routes';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

const app = express();

// Middleware para CORS
app.use(cors({
  origin: `${process.env.VITE_FRONTEND_URL}`
}));

// Conexão com o banco de dados
connectDB();

// Middleware para aceitar JSON
app.use(express.json());

// Rotas
app.use('/api/v1', routes);

// Exportando o handler serverless para Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);  
};
