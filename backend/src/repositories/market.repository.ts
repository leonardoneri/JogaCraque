import type { MarketListing, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

export class MarketRepository {
    async findAll(): Promise<MarketListing[]> {
        return prisma.marketListing.findMany({
            where: {
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                player: true,
                seller: {
                    select: {
                        username: true,
                        teamName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findById(id: string): Promise<MarketListing | null> {
        return prisma.marketListing.findUnique({
            where: { id },
            include: {
                player: true,
                seller: true,
            },
        });
    }

    async create(data: Prisma.MarketListingCreateInput): Promise<MarketListing> {
        return prisma.marketListing.create({
            data,
        });
    }

    async delete(id: string): Promise<MarketListing> {
        return prisma.marketListing.delete({
            where: { id },
        });
    }

    async deleteExpired(): Promise<number> {
        const result = await prisma.marketListing.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
}

export const marketRepository = new MarketRepository();
