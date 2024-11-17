"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admController_1 = require("../controllers/admController");
const admController_2 = require("../controllers/admController");
const router = express_1.default.Router();
// Rota para validar login de administrador
router.post("/admin/login", admController_1.validarAdmin);
router.post("/admin/primeiro", admController_2.adicionarPrimeiroAdmin);
router.post("/admin", admController_1.verificarAutenticacao, admController_2.adicionarAdmin);
exports.default = router;
