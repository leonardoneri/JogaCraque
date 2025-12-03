import type { Match, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

export class MatchRepository {
    async findById(id: string): Promise<Match | null> {
        return prisma.match.findUnique({
            where: { id },
            include: {
                homeUser: {
                    select: {
                        username: true,
                        teamName: true,
                    },
                },
            },
        });
    }

    async findByUserId(userId: string, limit: number = 10): Promise<Match[]> {
        return prisma.match.findMany({
            where: {
                homeUserId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });
    }

    async create(data: Prisma.MatchCreateInput): Promise<Match> {
        return prisma.match.create({
            data,
        });
    }

    async getUserStats(userId: string) {
        const matches = await prisma.match.findMany({
            where: { homeUserId: userId },
        });

        const stats = {
            totalMatches: matches.length,
            wins: matches.filter(m => m.result === 'V').length,
            draws: matches.filter(m => m.result === 'E').length,
            losses: matches.filter(m => m.result === 'D').length,
            totalGoalsScored: matches.reduce((sum, m) => sum + m.homeScore, 0),
            totalGoalsConceded: matches.reduce((sum, m) => sum + m.awayScore, 0),
        };

        return stats;
    }
}

export const matchRepository = new MatchRepository();
