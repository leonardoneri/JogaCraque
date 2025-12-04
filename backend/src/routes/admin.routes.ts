import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { playerService } from '../services/player.service.js';

const router = Router();

// Todas as rotas admin requerem autenticação e permissões de admin
router.use(requireAdmin);

/**
 * GET /api/admin/players/unvalidated
 * Lista todos os jogadores que ainda não foram validados
 */
router.get('/players/unvalidated', async (req, res) => {
    try {
        const unvalidatedPlayers = await playerService.getUnvalidatedPlayers();
        res.json(unvalidatedPlayers);
    } catch (error) {
        console.error('Error fetching unvalidated players:', error);
        res.status(500).json({ error: 'Failed to fetch unvalidated players' });
    }
});

/**
 * PATCH /api/admin/players/:id/validate
 * Marca um jogador como validado
 */
router.patch('/players/:id/validate', async (req, res) => {
    try {
        const playerId = req.params.id;
        const updatedPlayer = await playerService.markPlayerAsValidated(playerId);
        res.json(updatedPlayer);
    } catch (error) {
        console.error('Error validating player:', error);
        res.status(500).json({ error: 'Failed to validate player' });
    }
});

export default router;
