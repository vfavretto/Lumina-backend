import express from "express";
import { enviarMensagem, buscarMensagensEntreEmpresas, buscarUltimaMensagem, buscarEmpresasComConversa } from "../controllers/messagesController";

const router = express.Router();

router.post("/", enviarMensagem);
router.get("/:idEmpresa1/:idEmpresa2", buscarMensagensEntreEmpresas);

// Exemplo buscar mensagens

/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=0   Primeiro Lote
/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=20  Segundo Lote
/// GET /api/v1/messages/:idEmpresa1/:idEmpresa2?limit=20&offset=40  Terceiro lote...

router.get("/ultima-mensagem/:idEmpresa1/:idEmpresa2", buscarUltimaMensagem);

router.get("/:idEmpresa", buscarEmpresasComConversa);

export default router;
