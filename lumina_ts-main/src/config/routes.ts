import { Router } from 'express';
import enterpriseRoutes from '../routes/enterpriseRoutes';
import serviceRoutes from '../routes/servicesRoutes';
import messageRoutes from '../routes/messagesRoutes';
import adminRoutes from '../routes/admRoutes';

const router = Router();

// Rotas de autenticação de empresas
router.use('/auth', enterpriseRoutes);

// Rotas de serviços
router.use('/services', serviceRoutes);

// Rotas de mensagens
router.use('/messages', messageRoutes);

// Rotas de administradores
router.use('/admins', adminRoutes);

export default router;
