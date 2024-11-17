import express from "express";
import {
  validarAdmin,
  verificarAutenticacaoAdmin,
  deletarEmpresa,
  editarEmpresa,
  listarEmpresas,
  buscarEmpresa,
  adicionarPrimeiroAdmin,
  adicionarAdmin,
} from "../controllers/admController";

const router = express.Router();

// Rotas protegidas - precisam do middleware de autenticação
router.delete("/admin/:id", verificarAutenticacaoAdmin, deletarEmpresa);
router.put("/admin/:id", verificarAutenticacaoAdmin, editarEmpresa);
router.get("/admin", verificarAutenticacaoAdmin, listarEmpresas);
router.get("/admin/:id", verificarAutenticacaoAdmin, buscarEmpresa);

// Rota para validar login de administrador
router.post("/admin/login", validarAdmin);
router.post("/admin/primeiro", adicionarPrimeiroAdmin);
router.post("/admin", verificarAutenticacaoAdmin, adicionarAdmin);

export default router;
