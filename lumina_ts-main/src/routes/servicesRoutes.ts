import express from "express";
import { buscarServicoPorId, listarServicosDaEmpresa } from "../controllers/servicesController";

const router = express.Router();

// Rota para buscar um serviço pelo ID
router.get("/servicos/:id", buscarServicoPorId);

// Rota para listar os serviços de uma empresa
router.get("/empresa/:idEmpresa/servicos", listarServicosDaEmpresa);

export default router;
