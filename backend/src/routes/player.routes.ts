import { Router } from 'express';
import { playerService } from '../services/player.service.js';

const router = Router();

// Todas as rotas já passam pelo authMiddleware no index.ts

// Listar jogadores do usuário (Inventário)
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const players = await playerService.getPlayersByUser(req.user.id);
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Gerar pacote de cartas (Simulação de compra)
// TODO: Implementar verificação de saldo e dedução de moedas
router.post('/pack', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        // Por padrão gera 5 cartas
        const players = await playerService.generatePack(req.user.id, 5);
        res.status(201).json(players);
    } catch (error) {
        console.error('Error generating pack:', error);
        res.status(500).json({ error: 'Failed to generate pack' });
    }
});

// Obter detalhes de um jogador
router.get('/:id', async (req, res) => {
    try {
        const player = await playerService.getPlayerById(req.params.id);

        if (!player) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }

        // Verificar se o jogador pertence ao usuário
        if (player.userId !== req.user?.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        res.json(player);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

// Admin: Importar múltiplos jogadores
router.post('/import', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const { players } = req.body;
        if (!Array.isArray(players)) {
            res.status(400).json({ error: 'Players must be an array' });
            return;
        }

        await playerService.importPlayers(req.user.id, players);
        res.status(201).json({ message: `${players.length} players imported successfully` });
    } catch (error) {
        console.error('Error importing players:', error);
        res.status(500).json({ error: 'Failed to import players' });
    }
});

// Admin: Atualizar jogador
router.put('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const player = await playerService.updatePlayer(req.params.id, req.body);
        res.json(player);
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// Admin: Deletar jogador
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        await playerService.deletePlayer(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// Admin: Limpar inventário
router.delete('/inventory/clear', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        await playerService.clearInventory(req.user.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error clearing inventory:', error);
        res.status(500).json({ error: 'Failed to clear inventory' });
    }
});

export default router;
