"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enterpriseRoutes_1 = __importDefault(require("../routes/enterpriseRoutes"));
const servicesRoutes_1 = __importDefault(require("../routes/servicesRoutes"));
const messagesRoutes_1 = __importDefault(require("../routes/messagesRoutes"));
const admRoutes_1 = __importDefault(require("../routes/admRoutes"));
const router = (0, express_1.Router)();
// Rotas de autenticação de empresas
router.use('/auth', enterpriseRoutes_1.default);
// Rotas de serviços
router.use('/services', servicesRoutes_1.default);
// Rotas de mensagens
router.use('/messages', messagesRoutes_1.default);
// Rotas de administradores
router.use('/admins', admRoutes_1.default);
exports.default = router;
