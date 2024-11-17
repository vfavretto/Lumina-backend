import express from "express";
import { validarAdmin, verificarAutenticacao } from "../controllers/admController";
import { adicionarPrimeiroAdmin, adicionarAdmin } from "../controllers/admController";


const router = express.Router();

// Rota para validar login de administrador
router.post("/admin/login", validarAdmin);
router.post("/admin/primeiro", adicionarPrimeiroAdmin);
router.post("/admin", verificarAutenticacao, adicionarAdmin);

export default router;
