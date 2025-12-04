import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('=== VERIFICAÇÃO DO BANCO DE DADOS ===\n');

        // Listar todos os usuários
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                isAdmin: true,
                _count: {
                    select: { players: true }
                }
            }
        });

        console.log(`📊 Total de usuários: ${users.length}\n`);

        for (const user of users) {
            console.log(`👤 Usuário: ${user.username} (${user.id})`);
            console.log(`   Admin: ${user.isAdmin}`);
            console.log(`   Jogadores: ${user._count.players}`);

            // Listar jogadores deste usuário
            const players = await prisma.player.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    name: true,
                    rating: true,
                    isValidated: true,
                    image: true
                },
                take: 5
            });

            if (players.length > 0) {
                console.log('   Primeiros jogadores:');
                players.forEach(p => {
                    console.log(`     - ${p.name} (${p.rating} OVR) [Validado: ${p.isValidated}]`);
                    if (p.image) {
                        console.log(`       Imagem: ${p.image.substring(0, 50)}...`);
                    }
                });
            }
            console.log('');
        }

        // Total de jogadores no sistema
        const totalPlayers = await prisma.player.count();
        const validatedPlayers = await prisma.player.count({
            where: { isValidated: true }
        });

        console.log(`\n📈 RESUMO GERAL:`);
        console.log(`   Total de jogadores: ${totalPlayers}`);
        console.log(`   Jogadores validados: ${validatedPlayers}`);
        console.log(`   Jogadores não validados: ${totalPlayers - validatedPlayers}`);

    } catch (error) {
        console.error('❌ Erro ao verificar banco:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
