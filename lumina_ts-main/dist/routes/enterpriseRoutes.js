"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enterpriseController_1 = require("../controllers/enterpriseController");
const router = express_1.default.Router();
router.post('/register', enterpriseController_1.register);
router.post('/login', enterpriseController_1.login);
router.get("/profile/:id", enterpriseController_1.checkAuth, enterpriseController_1.getEmpresa);
router.put("/profile/:id", enterpriseController_1.checkAuth, enterpriseController_1.updateEmpresa);
router.delete("/profile/:id", enterpriseController_1.checkAuth, enterpriseController_1.deleteEmpresa);
router.get("/enterprises", enterpriseController_1.listEmpresas);
//Exemplos de paginacao
///GET /api/v1/auth/enterprises?tipo=contratante&page=1&limit=10
///GET /api/v1/auth/enterprises?tipo=fornecedor&page=2&limit=5
exports.default = router;
