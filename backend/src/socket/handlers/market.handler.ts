import { Socket } from 'socket.io';

export const handleMarket = (socket: Socket) => {
    // Comprar jogador
    socket.on('market:buy', (data: { playerId: string }) => {
        console.log('🛒 Market buy request:', data);
        // TODO: Implementar lógica de compra
        socket.emit('market:buy_result', { success: true });
    });

    // Listar jogador no mercado
    socket.on('market:list', (data: { playerId: string; price: number }) => {
        console.log('💰 Market list request:', data);
        // TODO: Implementar lógica de listagem
        socket.emit('market:list_result', { success: true });
    });
};
