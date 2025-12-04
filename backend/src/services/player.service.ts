import { Player, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
     * Gera um jogador aleatório
     */
    generateRandomPlayer(userId?: string): Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'squadId' | 'marketListing'> {
        // Determinar raridade
        let rarity = Rarity.COMMON;
        const roll = Math.random();
        if (roll < 0.6) rarity = Rarity.COMMON;
        else if (roll < 0.85) rarity = Rarity.RARE;
        else if (roll < 0.98) rarity = Rarity.EPIC;
        else rarity = Rarity.LEGENDARY;

        // Determinar rating
        let minRating = 50;
        let maxRating = 99;
        switch (rarity) {
            case Rarity.COMMON: minRating = 55; maxRating = 74; break;
            case Rarity.RARE: minRating = 75; maxRating = 84; break;
            case Rarity.EPIC: minRating = 85; maxRating = 92; break;
            case Rarity.LEGENDARY: minRating = 93; maxRating = 99; break;
        }
        const rating = randomInt(minRating, maxRating);

        // Determinar posição
        const posKeys = Object.values(Position);
        const position = posKeys[randomInt(0, posKeys.length - 1)];

        // Gerar atributos
        const attributes = this.generateAttributes(rating, position);

        // Dados básicos
        const name = `${FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)]}`;
        const nationality = COUNTRIES[randomInt(0, COUNTRIES.length - 1)];
        const club = CLUBS[randomInt(0, CLUBS.length - 1)];
        const marketValue = this.calculateMarketValue(rarity, rating);
        const image = `https://picsum.photos/seed/${randomInt(1000, 9999)}/200/200`;

        return {
            userId: userId || null,
            baseId: `base-${Date.now()}-${randomInt(0, 9999)}`,
            variation: 'base',
            name,
            position,
            nationality,
            club,
            collection: 'Base',
            rarity,
            rating,
            ...attributes,
            level: 1,
            xp: 0,
            matches: 0,
            goals: 0,
            assists: 0,
            marketValue,
            image,
            squadId: null,
            squadPosition: null,
            isValidated: false
        } as any; // Cast necessário pois Omit não remove campos opcionais do tipo Prisma corretamente
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
     */
    async generatePack(userId: string, count: number = 5): Promise<Player[]> {
        // Tentar buscar jogadores validados para usar como template
        const validatedCount = await prisma.player.count({
            where: { isValidated: true }
        });

        let playersData: any[] = [];

        if (validatedCount > 0) {
            // Buscar templates aleatórios
            // Como o Prisma não tem "ORDER BY RANDOM()", buscamos IDs ou usamos skip aleatório
            // Para simplificar, vamos buscar todos os validados (assumindo que não são milhões) e escolher aleatoriamente
            // Se forem muitos, isso precisará ser otimizado
            const templates = await prisma.player.findMany({
                where: { isValidated: true }
            });

            playersData = Array(count).fill(null).map(() => {
                const template = templates[randomInt(0, templates.length - 1)];

                // Clonar o template para o novo usuário
                return {
                    userId,
                    baseId: template.baseId,
                    variation: template.variation,
                    name: template.name,
                    position: template.position,
                    nationality: template.nationality,
                    club: template.club,
                    collection: template.collection,
                    rarity: template.rarity,
                    rating: template.rating,
                    pace: template.pace,
                    shooting: template.shooting,
                    passing: template.passing,
                    dribbling: template.dribbling,
                    defending: template.defending,
                    physical: template.physical,
                    vision: template.vision,
                    positioning: template.positioning,
                    level: 1,
                    xp: 0,
                    matches: 0,
                    goals: 0,
                    assists: 0,
                    marketValue: template.marketValue,
                    image: template.image,
                    squadId: null,
                    squadPosition: null,
                    isValidated: true // Jogadores gerados de templates já nascem validados
                };
            });
        } else {
            // Fallback: Gerar aleatório se não houver templates
            playersData = Array(count).fill(null).map(() => this.generateRandomPlayer(userId));
        }

        // Usar transaction para criar todos de uma vez
        const createdPlayers = await prisma.$transaction(
            playersData.map(data => prisma.player.create({ data }))
        );

        return createdPlayers;
    }

    /**
     * Busca jogadores de um usuário
     */
    async getPlayersByUser(userId: string): Promise<Player[]> {
        return prisma.player.findMany({
            where: { userId },
            orderBy: { rating: 'desc' }
        });
    }

    /**
     * Busca um jogador por ID
     */
    async getPlayerById(id: string): Promise<Player | null> {
        try {
            return await prisma.player.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error(`Error fetching player ${id}:`, error);
            return null;
        }
    }

    /**
     * Busca todos os jogadores não validados (Admin)
     */
    async getUnvalidatedPlayers(): Promise<Player[]> {
        return prisma.player.findMany({
            where: { isValidated: false },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Marca um jogador como validado (Admin)
     */
    async markPlayerAsValidated(playerId: string): Promise<Player> {
        return prisma.player.update({
            where: { id: playerId },
            data: { isValidated: true }
        });
    }

    /**
     * Importa múltiplos jogadores (Admin)
     */
    async importPlayers(userId: string, players: any[]): Promise<void> {
        const playersData = players.map(p => ({
            userId,
            baseId: p.baseId || `imported-${Date.now()}-${Math.random()}`,
            variation: p.variation || 'base',
            name: p.name,
            position: p.position,
            nationality: p.nationality || null,
            club: p.club || null,
            collection: p.collection || 'Base',
            rarity: p.rarity,
            rating: p.rating,
            pace: p.attributes?.pace || 0,
            shooting: p.attributes?.shooting || 0,
            passing: p.attributes?.passing || 0,
            dribbling: p.attributes?.dribbling || 0,
            defending: p.attributes?.defending || 0,
            physical: p.attributes?.physical || 0,
            vision: p.attributes?.vision || 50,
            positioning: p.attributes?.positioning || 50,
            level: p.level || 1,
            xp: p.xp || 0,
            matches: p.stats?.matches || 0,
            goals: p.stats?.goals || 0,
            assists: p.stats?.assists || 0,
            marketValue: p.marketValue || 0,
            image: p.image || null,
            squadId: null,
            squadPosition: null,
            isValidated: false // Importados começam como não validados (precisam de revisão)
        }));

        await prisma.player.createMany({
            data: playersData,
            skipDuplicates: true
        });
    }

    /**
     * Atualiza um jogador (Admin)
     */
    async updatePlayer(playerId: string, updates: any): Promise<Player> {
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

        return prisma.player.update({
            where: { id: playerId },
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
