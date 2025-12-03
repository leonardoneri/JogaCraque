import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Criar usuário de teste
    const user = await prisma.user.create({
        data: {
            email: 'test@jogacraque.com',
            username: 'Jogador1',
            password: 'password123', // Em produção, use hash
            teamName: 'Time Teste',
            coins: 5000,
            gems: 100,
            transferFunds: 10000,
        },
    });

    console.log('✅ Usuário criado:', user.username);

    // Criar alguns jogadores de exemplo
    const players = await Promise.all([
        prisma.player.create({
            data: {
                name: 'Neymar Jr',
                position: 'PE',
                nationality: 'Brazil',
                club: 'Al-Hilal',
                collection: 'Base',
                rarity: 'Lendário',
                rating: 91,
                pace: 91,
                shooting: 85,
                passing: 86,
                dribbling: 94,
                defending: 37,
                physical: 62,
                vision: 88,
                positioning: 85,
                marketValue: 15000,
                userId: user.id,
                image: 'https://picsum.photos/seed/neymar/200/200',
            },
        }),
        prisma.player.create({
            data: {
                name: 'Vinicius Jr',
                position: 'PE',
                nationality: 'Brazil',
                club: 'Real Madrid',
                collection: 'Base',
                rarity: 'Épico',
                rating: 88,
                pace: 95,
                shooting: 80,
                passing: 78,
                dribbling: 90,
                defending: 29,
                physical: 65,
                vision: 75,
                positioning: 82,
                marketValue: 12000,
                userId: user.id,
                image: 'https://picsum.photos/seed/vinicius/200/200',
            },
        }),
    ]);

    console.log(`✅ ${players.length} jogadores criados`);

    // Criar squad
    const squad = await prisma.squad.create({
        data: {
            userId: user.id,
            formation: '4-3-3',
            positions: [],
        },
    });

    console.log('✅ Squad criado para:', user.username);

    console.log('🎉 Seed completo!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
