import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { playerService } from '../services/player.service.js';

const router = Router();

// Todas as rotas admin requerem autenticação e permissões de admin
router.use(requireAdmin);

/**
 * GET /api/admin/templates/unvalidated
 * Lista todos os templates de cartas que ainda não foram validados
 */
router.get('/templates/unvalidated', async (req, res) => {
    try {
        const unvalidatedTemplates = await playerService.getUnvalidatedTemplates();
        res.json(unvalidatedTemplates);
    } catch (error) {
        console.error('Error fetching unvalidated templates:', error);
        res.status(500).json({ error: 'Failed to fetch unvalidated templates' });
    }
});

/**
 * PATCH /api/admin/templates/:id/validate
 * Marca um template de carta como validado
 */
router.patch('/templates/:id/validate', async (req, res) => {
    try {
        const templateId = req.params.id;
        const updatedTemplate = await playerService.markTemplateAsValidated(templateId);
        res.json(updatedTemplate);
    } catch (error) {
        console.error('Error validating template:', error);
        res.status(500).json({ error: 'Failed to validate template' });
    }
});

/**
 * POST /api/admin/templates/validate-all
 * Marca todos os templates não validados como validados
 */
router.post('/templates/validate-all', async (req, res) => {
    try {
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
