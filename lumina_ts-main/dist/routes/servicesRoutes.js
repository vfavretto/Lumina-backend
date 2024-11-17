"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const servicesController_1 = require("../controllers/servicesController");
const router = express_1.default.Router();
// Rota para buscar um serviço pelo ID
router.get("/servicos/:id", servicesController_1.buscarServicoPorId);
// Rota para listar os serviços de uma empresa
router.get("/empresa/:idEmpresa/servicos", servicesController_1.listarServicosDaEmpresa);
exports.default = router;
