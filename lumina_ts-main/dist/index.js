"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = __importDefault(require("./config/routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware para CORS
app.use((0, cors_1.default)({
    origin: `${process.env.VITE_FRONTEND_URL}`,
}));
// Conexão com o banco de dados
(0, database_1.default)();
// Middleware para aceitar JSON
app.use(express_1.default.json());
// Caminho para o arquivo swagger-output.json dependendo do ambiente
const swaggerPath = process.env.NODE_ENV === "production"
    ? path_1.default.join(__dirname, "../dist/config/swagger-output.json") // Para produção, usar dist/
    : path_1.default.join(__dirname, "../src/config/swagger-output.json"); // Para desenvolvimento, usar src/
let swaggerFile;
// Verifique se o arquivo Swagger existe
if (fs_1.default.existsSync(swaggerPath)) {
    swaggerFile = require(swaggerPath);
}
else {
    console.error("⚠️ Swagger file not found. Documentation will not be available.");
}
// Middleware do Swagger apenas se o JSON existir
if (swaggerFile) {
    console.log(swaggerFile);
    // Acesse os arquivos estáticos diretamente do swagger-ui-dist no Vercel
    app.use("/docs", express_1.default.static(path_1.default.join(__dirname, "../../node_modules", "swagger-ui-dist")));
    // Swagger UI setup
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerFile));
}
// Rotas
app.use("/api/v1", routes_1.default);
// Exportando o handler serverless para Vercel
exports.default = (req, res) => {
    return app(req, res);
};
