import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import routes from "./config/routes";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import yaml from "yaml"; 

dotenv.config();

const app = express();

app.use(
  cors({
    origin: `${process.env.VITE_FRONTEND_URL}`,
  })
);

connectDB();

app.use(express.json());

const swaggerPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../dist/config/swagger.yaml") 
    : path.join(__dirname, "../src/config/swagger.yaml"); 

let swaggerFile: any;

if (fs.existsSync(swaggerPath)) {

  const swaggerContent = fs.readFileSync(swaggerPath, "utf-8");
  swaggerFile = yaml.parse(swaggerContent);
} else {
  console.error(
    "⚠️ Arquivo Swagger não encontrado. A documentação não estará disponível."
  );
}

if (swaggerFile) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

app.use("/api/v1", routes);

export default app;
