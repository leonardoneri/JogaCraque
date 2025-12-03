import type { Player, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

export class PlayerRepository {
    async findById(id: string): Promise<Player | null> {
        return prisma.player.findUnique({
            where: { id },
        });
    }

    async findByUserId(userId: string): Promise<Player[]> {
        return prisma.player.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Prisma.PlayerCreateInput): Promise<Player> {
        return prisma.player.create({
            data,
        });
    }

    async update(id: string, data: Prisma.PlayerUpdateInput): Promise<Player> {
        return prisma.player.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Player> {
        return prisma.player.delete({
            where: { id },
        });
    }

    async updateStats(id: string, stats: { matches?: number; goals?: number; assists?: number }): Promise<Player> {
        return prisma.player.update({
            where: { id },
            data: stats,
        });
    }

    async addXP(id: string, xp: number): Promise<Player> {
        const player = await this.findById(id);
        if (!player) throw new Error('Player not found');

        const newXP = player.xp + xp;
        const newLevel = Math.floor(newXP / 50) + 1;

        return prisma.player.update({
            where: { id },
            data: {
                xp: newXP,
                level: Math.min(newLevel, 10), // Max level 10
            },
        });
    }

    async transferOwnership(playerId: string, newUserId: string): Promise<Player> {
        return prisma.player.update({
            where: { id: playerId },
            data: {
                userId: newUserId,
            },
        });
    }
}

export const playerRepository = new PlayerRepository();
