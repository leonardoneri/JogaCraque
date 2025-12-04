import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SquadService {
    /**
     * Obtém o squad do usuário, criando um padrão se não existir
     */
    async getSquad(userId: string): Promise<any> {
        let squad = await prisma.squad.findUnique({
            where: { userId },
            include: {
                players: true // Inclui os jogadores associados ao squad
            }
        });

        if (!squad) {
            // Cria squad inicial vazio
            squad = await prisma.squad.create({
                data: {
                    userId,
                    formation: '4-3-3'
                },
                include: {
                    players: true
                }
            });
        }

        // Mapear jogadores para suas posições (array de 11 posições)
        // O frontend espera um array de 11 posições onde null = vazio
        // No banco, temos uma relação Player -> Squad.
        // Precisamos de uma forma de saber a POSIÇÃO no campo (index 0-10).
        // O modelo atual do Prisma não tem campo 'squadPosition' no Player ou tabela de ligação com posição.
        // VAMOS ADICIONAR ISSO AGORA ou improvisar.

        // Improviso temporário: Retornar lista de jogadores e deixar frontend organizar por enquanto,
        // MAS o frontend espera array posicional.
        // Melhor abordagem: Adicionar `squadPosition` no model Player.

        return squad;
    }

    /**
     * Atualiza a escalação do time
     * Recebe um array de IDs de jogadores (ou null) para as 11 posições
     */
    async updateSquad(userId: string, playerIds: (string | null)[]): Promise<void> {
        // 1. Limpar squad atual (remover squadId de todos os jogadores deste usuário)
        // Isso é ineficiente, mas seguro para garantir consistência
        const squad = await this.getSquad(userId);

        await prisma.player.updateMany({
            where: { squadId: squad.id },
            data: { squadId: null, squadPosition: null } // Precisamos adicionar squadPosition no schema
        });

        // 2. Adicionar novos jogadores nas posições corretas
        const updates = playerIds.map((playerId, index) => {
            if (!playerId) return null;
            return prisma.player.update({
                where: { id: playerId, userId }, // Garante que o jogador pertence ao usuário
                data: {
                    squadId: squad.id,
                    squadPosition: index
                }
            });
        }).filter(p => p !== null);

        await prisma.$transaction(updates);
    }
}

export const squadService = new SquadService();
