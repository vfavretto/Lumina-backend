"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messagesController_1 = require("../controllers/messagesController");
const router = express_1.default.Router();
// Rota para enviar uma nova mensagem
router.post("/mensagens", messagesController_1.enviarMensagem);
// Rota para buscar mensagens entre duas empresas
router.get("/mensagens/:idEmpresa1/:idEmpresa2", messagesController_1.buscarMensagensEntreEmpresas);
// Rota para buscar a última mensagem entre duas empresas
router.get("/ultima-mensagem/:idEmpresa1/:idEmpresa2", messagesController_1.buscarUltimaMensagem);
exports.default = router;
