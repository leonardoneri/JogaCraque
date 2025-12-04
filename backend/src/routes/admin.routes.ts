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

/**
 * POST /api/admin/players/validate-all
 * Marca todos os jogadores do usuário admin como validados
 */
router.post('/players/validate-all', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        console.log(`[VALIDATE-ALL] Validating all players for user: ${req.user.id}`);

        const result = await playerService.validateAllPlayersByUser(req.user.id);

        console.log(`[VALIDATE-ALL] Validated ${result.count} players`);

        res.json({
            message: `${result.count} players validated successfully`,
            count: result.count
        });
    } catch (error) {
        console.error('Error validating all players:', error);
        res.status(500).json({ error: 'Failed to validate all players' });
    }
});

export default router;
