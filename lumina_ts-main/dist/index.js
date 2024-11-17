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
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware para CORS
app.use((0, cors_1.default)({
    origin: `${process.env.VITE_FRONTEND_URL}`
}));
// Conexão com o banco de dados
(0, database_1.default)();
// Middleware para aceitar JSON
app.use(express_1.default.json());
// Rotas
app.use('/api/v1', routes_1.default);
// Exportando o handler serverless para Vercel
exports.default = (req, res) => {
    return app(req, res);
};
