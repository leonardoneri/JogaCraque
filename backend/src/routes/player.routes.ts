import { Router } from 'express';
import { playerService } from '../services/player.service.js';

const router = Router();

// Todas as rotas já passam pelo authMiddleware no index.ts

// Helper para formatar jogador para o frontend (aninhar atributos)
const formatPlayer = (player: any) => {
    if (!player) return null;
    return {
        ...player,
        attributes: {
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defending: player.defending,
            physical: player.physical,
            vision: player.vision,
            positioning: player.positioning
        }
    };
};

// Listar jogadores do usuário (Inventário)
router.get('/', async (req, res) => {
    try {
        if (!req.user) {
            console.log('[GET /players] No user authenticated');
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        console.log(`[GET /players] Fetching players for user: ${req.user.id}`);
        const players = await playerService.getPlayersByUser(req.user.id);
        console.log(`[GET /players] Found ${players.length} players`);

        if (players.length > 0) {
            console.log(`[GET /players] First player sample:`, {
                id: players[0].id,
                name: players[0].name,
                isValidated: players[0].isValidated
            });
        }

        res.json(players.map(formatPlayer));
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
        res.status(201).json(players.map(formatPlayer));
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

        res.json(formatPlayer(player));
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

        console.log(`[IMPORT] Importing ${players.length} players for user ${req.user.id}`);
        await playerService.importPlayers(req.user.id, players);

        // Verificar se foram salvos
        const savedPlayers = await playerService.getPlayersByUser(req.user.id);
        console.log(`[IMPORT] Total players in DB for user: ${savedPlayers.length}`);

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
        res.json(formatPlayer(player));
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

// Admin: Validar todos os jogadores do usuário
router.post('/validate-all', async (req, res) => {
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
