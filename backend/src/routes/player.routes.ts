import { Router } from 'express';
import { playerService, PlayerWithTemplate } from '../services/player.service.js';

const router = Router();

// Todas as rotas já passam pelo authMiddleware no index.ts

// Helper para formatar jogador para o frontend (combinar Player + Template)
const formatPlayer = (player: PlayerWithTemplate) => {
    if (!player || !player.template) return null;

    const template = player.template;

    return {
        id: player.id,
        // Dados do template
        baseId: template.baseId,
        variation: template.variation,
        name: template.name,
        position: template.position,
        nationality: template.nationality,
        club: template.club,
        collection: template.collection,
        rarity: template.rarity,
        rating: template.rating,
        image: template.image,
        isValidated: template.isValidated,
        // Progressão individual do jogador
        level: player.level,
        xp: player.xp,
        matches: player.matches,
        goals: player.goals,
        assists: player.assists,
        marketValue: player.marketValue,
        // Atributos aninhados (do template)
        attributes: {
            pace: template.pace,
            shooting: template.shooting,
            passing: template.passing,
            dribbling: template.dribbling,
            defending: template.defending,
            physical: template.physical,
            vision: template.vision,
            positioning: template.positioning
        },
        // Relações
        userId: player.userId,
        squadId: player.squadId,
        squadPosition: player.squadPosition,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
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
                name: players[0].template?.name,
                templateId: players[0].templateId
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

// Admin: Validar todos os templates não validados
router.post('/validate-all', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        console.log(`[VALIDATE-ALL] Validating all templates`);

        const result = await playerService.validateAllTemplates();

        console.log(`[VALIDATE-ALL] Validated ${result.count} templates`);

        res.json({
            message: `${result.count} templates validated successfully`,
            count: result.count
        });
    } catch (error) {
        console.error('Error validating all templates:', error);
        res.status(500).json({ error: 'Failed to validate all templates' });
    }
});

export default router;
