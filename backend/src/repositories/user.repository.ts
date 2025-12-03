import type { Prisma, User } from '@prisma/client';
import prisma from '../config/database.js';

export class UserRepository {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                players: true,
                squad: {
                    include: {
                        players: true,
                    },
                },
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async updateResources(id: string, coins: number, gems: number, transferFunds: number): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: {
                coins,
                gems,
                transferFunds,
            },
        });
    }

    async updateStats(id: string, stats: { wins?: number; losses?: number; draws?: number; matchesPlayed?: number }): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: stats,
        });
    }

    async addXP(id: string, xp: number): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new Error('User not found');

        const newXP = user.xp + xp;
        const newLevel = Math.floor(newXP / 100) + 1;

        return prisma.user.update({
            where: { id },
            data: {
                xp: newXP,
                level: newLevel,
            },
        });
    }
}

export const userRepository = new UserRepository();
