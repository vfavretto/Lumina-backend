import express from "express";
import { enviarMensagem, buscarMensagensEntreEmpresas, buscarUltimaMensagem } from "../controllers/messagesController";

const router = express.Router();

// Rota para enviar uma nova mensagem
router.post("/mensagens", enviarMensagem);

// Rota para buscar mensagens entre duas empresas
router.get("/mensagens/:idEmpresa1/:idEmpresa2", buscarMensagensEntreEmpresas);

// Rota para buscar a última mensagem entre duas empresas
router.get("/ultima-mensagem/:idEmpresa1/:idEmpresa2", buscarUltimaMensagem);

export default router;
