import { Router } from 'express';
import { cardTemplateService } from '../services/cardTemplate.service.js';

const router = Router();

// Todas as rotas já passam pelo authMiddleware no index.ts

// Helper para formatar template para o frontend (aninhar atributos)
const formatTemplate = (template: any) => {
    if (!template) return null;
    return {
        ...template,
        attributes: {
            pace: template.pace,
            shooting: template.shooting,
            passing: template.passing,
            dribbling: template.dribbling,
            defending: template.defending,
            physical: template.physical,
            vision: template.vision,
            positioning: template.positioning
        }
    };
};

// Listar todos os templates
router.get('/', async (req, res) => {
    try {
        console.log('[GET /card-templates] Fetching all templates');
        const templates = await cardTemplateService.getAllTemplates();
        console.log(`[GET /card-templates] Found ${templates.length} templates`);

        res.json(templates.map(formatTemplate));
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Importar templates
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

        console.log(`[IMPORT TEMPLATES] Importing ${players.length} templates`);
        const stats = await cardTemplateService.importTemplates(players);

        console.log(`[IMPORT TEMPLATES] Import stats:`, stats);

        res.status(201).json({
            message: `${stats.imported} novos templates importados, ${stats.skipped} duplicados ignorados`,
            ...stats
        });
    } catch (error) {
        console.error('Error importing templates:', error);
        res.status(500).json({ error: 'Failed to import templates' });
    }
});

// Atualizar template
router.put('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const template = await cardTemplateService.updateTemplate(req.params.id, req.body);
        res.json(formatTemplate(template));
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Deletar template
router.delete('/:id', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        await cardTemplateService.deleteTemplate(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// Validar todos os templates
router.post('/validate-all', async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        console.log(`[VALIDATE-ALL TEMPLATES] Validating all templates`);

        const result = await cardTemplateService.validateAllTemplates();

        console.log(`[VALIDATE-ALL TEMPLATES] Validated ${result.count} templates`);

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
