import express from 'express';
import { register, login, checkAuth, getUser, updateUser, deleteUser } from '../controllers/userController'; // Agora estamos importando as funções diretamente

const router = express.Router();

router.post('/register', register); 
router.post('/login', login);
router.get('/check', checkAuth);
router.get('/user/:id', getUser); 
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

export default router;
