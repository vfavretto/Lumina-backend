"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messagesController_1 = require("../controllers/messagesController");
const router = express_1.default.Router();
router.post("/", messagesController_1.enviarMensagem);
router.get("/:idEmpresa1/:idEmpresa2", messagesController_1.buscarMensagensEntreEmpresas);
// Exemplo buscar mensagens
/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=0   Primeiro Lote
/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=20  Segundo Lote
/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=40  Terceiro lote...
router.get("/ultima-mensagem/:idEmpresa1/:idEmpresa2", messagesController_1.buscarUltimaMensagem);
exports.default = router;
