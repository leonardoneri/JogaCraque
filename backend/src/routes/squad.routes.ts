import { Router } from 'express';
import { squadService } from '../services/squad.service.js';

const router = Router();

// Todas as rotas já passam pelo authMiddleware no index.ts

// Obter squad do usuário
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const squad = await squadService.getSquad(req.user.id);

        // Formatar resposta para o frontend (array de 11 posições)
        const formattedSquad = Array(11).fill(null);

        if (squad.players && squad.players.length > 0) {
            squad.players.forEach((player: any) => {
                if (typeof player.squadPosition === 'number' && player.squadPosition >= 0 && player.squadPosition < 11) {
                    formattedSquad[player.squadPosition] = player;
                }
            });
        }

        res.json(formattedSquad);
    } catch (error) {
        console.error('Error fetching squad:', error);
        res.status(500).json({ error: 'Failed to fetch squad' });
    }
});

// Atualizar squad
router.put('/', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const { positions } = req.body; // Array de IDs ou null

        if (!Array.isArray(positions) || positions.length !== 11) {
            res.status(400).json({ error: 'Invalid squad format. Must be an array of 11 positions.' });
            return;
        }

        await squadService.updateSquad(req.user.id, positions);

        // Retornar squad atualizado
        const squad = await squadService.getSquad(req.user.id);
        const formattedSquad = Array(11).fill(null);

        if (squad.players && squad.players.length > 0) {
            squad.players.forEach((player: any) => {
                if (typeof player.squadPosition === 'number' && player.squadPosition >= 0 && player.squadPosition < 11) {
                    formattedSquad[player.squadPosition] = player;
                }
            });
        }

        res.json(formattedSquad);
    } catch (error) {
        console.error('Error updating squad:', error);
        res.status(500).json({ error: 'Failed to update squad' });
    }
});

export default router;
