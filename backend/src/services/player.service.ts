import { Player, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipo para Player com Template incluído
export type PlayerWithTemplate = Prisma.PlayerGetPayload<{
    include: { template: true }
}>;

// Constantes para geração de jogadores (portadas do frontend)
const FIRST_NAMES = ['Gabriel', 'Lucas', 'Matheus', 'Pedro', 'Rafael', 'Leo', 'Bruno', 'Thiago', 'Igor', 'Felipe', 'Alejandro', 'Diego', 'Carlos', 'Neymar', 'Vinicius', 'Rodrygo'];
const LAST_NAMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Junior', 'Paqueta'];
const CLUBS = ['Flamengo', 'Palmeiras', 'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'PSG', 'Bayern', 'Juventus', 'Milan', 'Boca Juniors', 'River Plate'];
const COUNTRIES = ['Brasil', 'Argentina', 'França', 'Alemanha', 'Espanha', 'Inglaterra', 'Itália', 'Portugal', 'Holanda', 'Bélgica'];

enum Rarity {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY'
}

enum Position {
    GK = 'GK',
    LB = 'LB', CB = 'CB', RB = 'RB',
    CDM = 'CDM', CM = 'CM', CAM = 'CAM', LM = 'LM', RM = 'RM',
    LW = 'LW', ST = 'ST', RW = 'RW'
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export class PlayerService {
    /**
     * Gera atributos baseados na posição e rating
     */
    private generateAttributes(rating: number, position: string) {
        const genAttr = (base: number) => Math.min(99, Math.max(1, base + randomInt(-5, 5)));

        const attributes = {
            pace: genAttr(rating),
            shooting: genAttr(rating),
            passing: genAttr(rating),
            dribbling: genAttr(rating),
            defending: genAttr(rating),
            physical: genAttr(rating),
            vision: genAttr(rating),
            positioning: genAttr(rating),
        };

        // Pesos por posição
        if (position === Position.GK) {
            attributes.pace = genAttr(rating - 30);
            attributes.shooting = genAttr(rating - 40);
            attributes.passing = genAttr(rating - 10);
            attributes.dribbling = genAttr(rating - 30);
            attributes.defending = genAttr(rating + 5); // Reflexos
            attributes.physical = genAttr(rating);
            attributes.positioning = genAttr(rating + 2);
        } else if ([Position.CB, Position.LB, Position.RB, Position.CDM].includes(position as Position)) {
            attributes.defending = genAttr(rating + 4);
            attributes.physical = genAttr(rating + 3);
            attributes.shooting = genAttr(rating - 15);
            attributes.positioning = genAttr(rating + 2);
            attributes.pace = [Position.LB, Position.RB].includes(position as Position) ? genAttr(rating + 2) : genAttr(rating - 5);
        } else if ([Position.CM, Position.CAM, Position.LM, Position.RM].includes(position as Position)) {
            attributes.passing = genAttr(rating + 4);
            attributes.dribbling = genAttr(rating + 3);
            attributes.vision = genAttr(rating + 5);
            attributes.defending = genAttr(rating - 10);
        } else if ([Position.ST, Position.LW, Position.RW].includes(position as Position)) {
            attributes.shooting = genAttr(rating + 5);
            attributes.pace = genAttr(rating + 4);
            attributes.defending = genAttr(rating - 25);
            attributes.physical = genAttr(rating - 5);
            attributes.positioning = genAttr(rating + 5);
        }

        return attributes;
    }

    /**
     * Calcula valor de mercado
     */
    private calculateMarketValue(rarity: string, rating: number): number {
        let base = 0;
        switch (rarity) {
            case Rarity.COMMON: base = 100; break;
            case Rarity.RARE: base = 500; break;
            case Rarity.EPIC: base = 2500; break;
            case Rarity.LEGENDARY: base = 10000; break;
            default: base = 100;
        }
        const multiplier = 1 + ((rating - 50) / 50);
        return Math.floor(base * multiplier);
    }

    /**
     * Cria um jogador no banco de dados
     */
    async createPlayer(data: any): Promise<Player> {
        return prisma.player.create({
            data
        });
    }

    /**
     * Gera e salva um pacote de jogadores para um usuário
     * Usa CardTemplates validados como base
     */
    async generatePack(userId: string, count: number = 5): Promise<PlayerWithTemplate[]> {
        // Buscar templates validados
        const validatedCount = await prisma.cardTemplate.count({
            where: { isValidated: true }
        });

        if (validatedCount === 0) {
            throw new Error('Não há templates de cartas validados disponíveis para gerar pacotes');
        }

        // Buscar todos os templates validados
        const templates = await prisma.cardTemplate.findMany({
            where: { isValidated: true }
        });

        // Criar jogadores a partir dos templates
        const playersData = Array(count).fill(null).map(() => {
            const template = templates[randomInt(0, templates.length - 1)];

            // Criar Player referenciando o template
            return {
                templateId: template.id,
                userId,
                level: 1,
                xp: 0,
                matches: 0,
                goals: 0,
                assists: 0,
                marketValue: this.calculateMarketValue(template.rarity, template.rating),
                squadId: null,
                squadPosition: null
            };
        });

        // Usar transaction para criar todos de uma vez
        const createdPlayers = await prisma.$transaction(
            playersData.map(data => prisma.player.create({
                data,
                include: { template: true } // Incluir template nos resultados
            }))
        );

        return createdPlayers;
    }

    /**
     * Busca jogadores de um usuário
     */
    async getPlayersByUser(userId: string): Promise<PlayerWithTemplate[]> {
        return prisma.player.findMany({
            where: { userId },
            include: { template: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Busca um jogador por ID
     */
    async getPlayerById(id: string): Promise<PlayerWithTemplate | null> {
        try {
            return await prisma.player.findUnique({
                where: { id },
                include: { template: true }
            });
        } catch (error) {
            console.error(`Error fetching player ${id}:`, error);
            return null;
        }
    }

    /**
     * Busca todos os templates não validados (Admin)
     */
    async getUnvalidatedTemplates() {
        return prisma.cardTemplate.findMany({
            where: { isValidated: false },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Marca um template como validado (Admin)
     */
    async markTemplateAsValidated(templateId: string) {
        return prisma.cardTemplate.update({
            where: { id: templateId },
            data: { isValidated: true }
        });
    }

    /**
     * Marca todos os templates como validados (Admin)
     */
    async validateAllTemplates(): Promise<{ count: number }> {
        const result = await prisma.cardTemplate.updateMany({
            where: {
                isValidated: false  // Só atualiza os que ainda não foram validados
            },
            data: { isValidated: true }
        });

        return { count: result.count };
    }

    /**
     * Importa múltiplos templates de cartas (Admin)
     * Cria CardTemplates que depois podem ser usados para gerar Players
     */
    async importTemplates(templates: any[]): Promise<void> {
        console.log(`[SERVICE] Starting import of ${templates.length} templates`);
        console.log(`[SERVICE] First template sample:`, templates[0]);

        const templatesData = templates.map(t => ({
            baseId: t.baseId || `imported-${Date.now()}-${Math.random()}`,
            variation: t.variation || 'base',
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
            isValidated: false // Importados começam como não validados (precisam de revisão)
        }));

        console.log(`[SERVICE] Mapped ${templatesData.length} templates for DB insertion`);
        console.log(`[SERVICE] First mapped template:`, templatesData[0]);

        const result = await prisma.cardTemplate.createMany({
            data: templatesData,
            skipDuplicates: true
        });

        console.log(`[SERVICE] Import result:`, result);
    }

    /**
     * Atualiza um jogador (Admin)
     * Atualiza apenas os campos do Player (progressão), não o template
     */
    async updatePlayer(playerId: string, updates: any): Promise<PlayerWithTemplate> {
        const data: any = {};

        // Campos de progressão do Player
        if (updates.level !== undefined) data.level = updates.level;
        if (updates.xp !== undefined) data.xp = updates.xp;
        if (updates.matches !== undefined) data.matches = updates.matches;
        if (updates.goals !== undefined) data.goals = updates.goals;
        if (updates.assists !== undefined) data.assists = updates.assists;
        if (updates.marketValue !== undefined) data.marketValue = updates.marketValue;

        return prisma.player.update({
            where: { id: playerId },
            data,
            include: { template: true }
        });
    }

    /**
     * Atualiza um template de carta (Admin)
     */
    async updateTemplate(templateId: string, updates: any) {
        const data: any = {};

        if (updates.name) data.name = updates.name;
        if (updates.rating) data.rating = updates.rating;
        if (updates.position) data.position = updates.position;
        if (updates.nationality) data.nationality = updates.nationality;
        if (updates.club) data.club = updates.club;
        if (updates.collection) data.collection = updates.collection;
        if (updates.image) data.image = updates.image;
        if (updates.isValidated !== undefined) data.isValidated = updates.isValidated;

        if (updates.attributes) {
            if (updates.attributes.pace !== undefined) data.pace = updates.attributes.pace;
            if (updates.attributes.shooting !== undefined) data.shooting = updates.attributes.shooting;
            if (updates.attributes.passing !== undefined) data.passing = updates.attributes.passing;
            if (updates.attributes.dribbling !== undefined) data.dribbling = updates.attributes.dribbling;
            if (updates.attributes.defending !== undefined) data.defending = updates.attributes.defending;
            if (updates.attributes.physical !== undefined) data.physical = updates.attributes.physical;
            if (updates.attributes.vision !== undefined) data.vision = updates.attributes.vision;
            if (updates.attributes.positioning !== undefined) data.positioning = updates.attributes.positioning;
        }

        return prisma.cardTemplate.update({
            where: { id: templateId },
            data
        });
    }

    /**
     * Deleta um jogador (Admin)
     */
    async deletePlayer(playerId: string): Promise<void> {
        await prisma.player.delete({
            where: { id: playerId }
        });
    }

    /**
     * Limpa todo o inventário de um usuário (Admin)
     */
    async clearInventory(userId: string): Promise<void> {
        await prisma.player.deleteMany({
            where: { userId }
        });
    }
}

export const playerService = new PlayerService();
