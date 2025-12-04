import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Health check (sem autenticação)
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Rotas de autenticação (sem middleware)
router.use('/auth', authRoutes);

// Aplicar middleware de autenticação para todas as rotas abaixo
router.use(authMiddleware);

import adminRoutes from './admin.routes.js';
import cardTemplateRoutes from './cardTemplate.routes.js';
import playerRoutes from './player.routes.js';
import squadRoutes from './squad.routes.js';
// import marketRoutes from './market.routes.js';

router.use('/card-templates', cardTemplateRoutes);
router.use('/players', playerRoutes);
router.use('/squad', squadRoutes);
router.use('/admin', adminRoutes);
// router.use('/market', marketRoutes);

export default router;
