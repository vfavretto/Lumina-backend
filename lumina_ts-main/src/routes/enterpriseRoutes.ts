import express from 'express';
import { register, login, checkAuth, getEmpresa, updateEmpresa, deleteEmpresa } from '../controllers/enterpriseController';

const router = express.Router();

router.post('/register', register); 
router.post('/login', login);
router.get('/check', checkAuth);
router.get("/profile/:id", checkAuth, getEmpresa);
router.put("/profile/:id", checkAuth, updateEmpresa);
router.delete("/profile/:id", checkAuth, deleteEmpresa);

export default router;
