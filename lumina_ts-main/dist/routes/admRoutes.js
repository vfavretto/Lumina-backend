"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admController_1 = require("../controllers/admController");
const router = express_1.default.Router();
// Rotas protegidas - precisam do middleware de autenticação
router.delete("/admin/:id", admController_1.verificarAutenticacaoAdmin, admController_1.deletarEmpresa);
router.put("/admin/:id", admController_1.verificarAutenticacaoAdmin, admController_1.editarEmpresa);
router.get("/admin", admController_1.verificarAutenticacaoAdmin, admController_1.listarEmpresas);
router.get("/admin/:id", admController_1.verificarAutenticacaoAdmin, admController_1.buscarEmpresa);
<<<<<<< HEAD
// Rota Públicas - para validar login de administrador
=======
// Rota para validar login de administrador
>>>>>>> 13009c0098f9d41bbc88928512de1ab5a526b7e1
router.post("/admin/login", admController_1.validarAdmin);
router.post("/admin/primeiro", admController_1.adicionarPrimeiroAdmin);
router.post("/admin", admController_1.verificarAutenticacaoAdmin, admController_1.adicionarAdmin);
exports.default = router;
