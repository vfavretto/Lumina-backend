import express from 'express';
import { register, login, checkAuth, getEmpresa, updateEmpresa, deleteEmpresa, listEmpresas } from '../controllers/enterpriseController';

const router = express.Router();

router.post('/register', register); 
router.post('/login', login);
router.get("/profile/:id", checkAuth, getEmpresa);
router.put("/profile/:id", checkAuth, updateEmpresa);
router.delete("/profile/:id", checkAuth, deleteEmpresa);
router.get("/enterprises", listEmpresas);
//Exemplos de paginacao
///GET /api/v1/auth/enterprises?tipo=contratante&page=1&limit=10
///GET /api/v1/auth/enterprises?tipo=fornecedor&page=2&limit=5




export default router;
