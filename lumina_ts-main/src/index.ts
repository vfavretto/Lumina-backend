import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import routes from "./config/routes";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { VercelRequest, VercelResponse } from "@vercel/node";

dotenv.config();

const app = express();

// Middleware para CORS
app.use(
  cors({
    origin: `${process.env.VITE_FRONTEND_URL}`,
  })
);

// Conexão com o banco de dados
connectDB();

// Middleware para aceitar JSON
app.use(express.json());

// Caminho para o arquivo swagger-output.json dependendo do ambiente
const swaggerPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../dist/config/swagger-output.json") // Para produção, usar dist/
    : path.join(__dirname, "../src/config/swagger-output.json"); // Para desenvolvimento, usar src/

let swaggerFile: any;

// Verifique se o arquivo Swagger existe
if (fs.existsSync(swaggerPath)) {
  swaggerFile = require(swaggerPath);
} else {
  console.error(
    "⚠️ Swagger file not found. Documentation will not be available."
  );
}

// Middleware do Swagger apenas se o JSON existir
if (swaggerFile) {
  console.log(swaggerFile);
  
  // Acesse os arquivos estáticos diretamente do swagger-ui-dist no Vercel
  app.use("/docs", express.static(path.join(__dirname, "../../node_modules", "swagger-ui-dist")));
  
  // Swagger UI setup
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// Rotas
app.use("/api/v1", routes);

// Exportando o handler serverless para Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
