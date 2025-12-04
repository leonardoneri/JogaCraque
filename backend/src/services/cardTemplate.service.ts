import { CardTemplate, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

class CardTemplateService {
    /**
     * Importa múltiplos templates de cartas (Admin)
     * Verifica duplicatas baseado em baseId + variation
     */
    async importTemplates(templates: any[]): Promise<{ imported: number; skipped: number; total: number }> {
        console.log(`[CARD_TEMPLATE_SERVICE] Starting import of ${templates.length} templates`);

        const templatesToImport: Prisma.CardTemplateCreateInput[] = [];
        const skippedTemplates: any[] = [];

        // Verificar duplicatas para cada template
        for (const t of templates) {
            const baseId = t.baseId || `imported-${Date.now()}-${Math.random()}`;
            const variation = t.variation || 'base';

            // Verificar se já existe um template com mesmo baseId e variation
            const existing = await prisma.cardTemplate.findFirst({
                where: {
                    baseId,
                    variation
                }
            });

            if (existing) {
                console.log(`[CARD_TEMPLATE_SERVICE] Skipping duplicate: ${baseId} (${variation})`);
                skippedTemplates.push({ baseId, variation, name: t.name });
                continue;
            }

            // Preparar dados para importação
            templatesToImport.push({
                baseId,
                variation,
                name: t.name,
                position: t.position,
                nationality: t.nationality || null,
                club: t.club || null,
                collection: t.collection || 'Base',
                rarity: t.rarity,
                rating: t.rating,
                pace: t.attributes?.pace || 0,
                shooting: t.attributes?.shooting || 0,
                passing: t.attributes?.passing || 0,
                dribbling: t.attributes?.dribbling || 0,
                defending: t.attributes?.defending || 0,
                physical: t.attributes?.physical || 0,
                vision: t.attributes?.vision || 50,
                positioning: t.attributes?.positioning || 50,
                image: t.image || null,
                isValidated: false // Importados começam como não validados
            });
        }

        console.log(`[CARD_TEMPLATE_SERVICE] Templates to import: ${templatesToImport.length}`);
        console.log(`[CARD_TEMPLATE_SERVICE] Templates skipped (duplicates): ${skippedTemplates.length}`);

        // Importar apenas os novos
        if (templatesToImport.length > 0) {
            await prisma.$transaction(
                templatesToImport.map(data => prisma.cardTemplate.create({ data }))
            );
        }

        return {
            imported: templatesToImport.length,
            skipped: skippedTemplates.length,
            total: templates.length
        };
    }

    /**
     * Lista todos os templates de cartas
     */
    async getAllTemplates(): Promise<CardTemplate[]> {
        return prisma.cardTemplate.findMany({
            orderBy: { rating: 'desc' }
        });
    }

    /**
     * Lista apenas templates validados (para geração de pacotes)
     */
    async getValidatedTemplates(): Promise<CardTemplate[]> {
        return prisma.cardTemplate.findMany({
            where: { isValidated: true },
            orderBy: { rating: 'desc' }
        });
    }

    /**
     * Busca um template por ID
     */
    async getTemplateById(id: string): Promise<CardTemplate | null> {
        try {
            return await prisma.cardTemplate.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error(`Error fetching template ${id}:`, error);
            return null;
        }
    }

    /**
     * Atualiza um template
     */
    async updateTemplate(id: string, updates: any): Promise<CardTemplate> {
        return prisma.cardTemplate.update({
            where: { id },
            data: {
                name: updates.name,
                position: updates.position,
                nationality: updates.nationality,
                club: updates.club,
                collection: updates.collection,
                rating: updates.rating,
                pace: updates.attributes?.pace,
                shooting: updates.attributes?.shooting,
                passing: updates.attributes?.passing,
                dribbling: updates.attributes?.dribbling,
                defending: updates.attributes?.defending,
                physical: updates.attributes?.physical,
                vision: updates.attributes?.vision,
                positioning: updates.attributes?.positioning,
                image: updates.image,
                isValidated: updates.isValidated
            }
        });
    }

    /**
     * Deleta um template
     */
    async deleteTemplate(id: string): Promise<void> {
        await prisma.cardTemplate.delete({
            where: { id }
        });
    }

    /**
     * Valida todos os templates de uma vez
     */
    async validateAllTemplates(): Promise<{ count: number }> {
        const result = await prisma.cardTemplate.updateMany({
            where: { isValidated: false },
            data: { isValidated: true }
        });

        return { count: result.count };
    }
}

export const cardTemplateService = new CardTemplateService();
