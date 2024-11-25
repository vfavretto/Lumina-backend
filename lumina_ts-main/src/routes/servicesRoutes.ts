import express from "express";
import { buscarServicoPorId, listarServicosDaEmpresa } from "../controllers/servicesController";

const router = express.Router();

// Rota para buscar um serviço pelo ID
router.get("/:id", buscarServicoPorId);

// Rota para listar os serviços de uma empresa
router.get("/empresa/:idEmpresa", listarServicosDaEmpresa);

export default router;
