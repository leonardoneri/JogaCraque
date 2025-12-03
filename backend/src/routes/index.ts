import express from 'express';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// TODO: Importar e adicionar outras rotas
// import authRoutes from './auth.routes';
// import playerRoutes from './player.routes';
// import marketRoutes from './market.routes';
// import squadRoutes from './squad.routes';

// router.use('/auth', authRoutes);
// router.use('/players', playerRoutes);
// router.use('/market', marketRoutes);
// router.use('/squad', squadRoutes);

export default router;
