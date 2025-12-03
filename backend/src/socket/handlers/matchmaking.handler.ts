import { Socket } from 'socket.io';
import { matchmakingService } from '../../services/matchmaking.service.js';

export const handleMatchmaking = (socket: Socket) => {
    // Buscar partida
    socket.on('matchmaking:search', () => {
        console.log('🔍 Player searching for match:', socket.id);

        matchmakingService.addToQueue(socket.id);
        const match = matchmakingService.findMatch(socket.id);

        if (match) {
            const opponentSquad = matchmakingService.generateOpponentSquad();

            // Notificar ambos os jogadores
            socket.emit('match_found', {
                roomId: match.roomId,
                opponentName: `Player${Math.floor(Math.random() * 9000) + 1000}`,
                opponentSquad
            });

            socket.to(match.opponent).emit('match_found', {
                roomId: match.roomId,
                opponentName: `Player${Math.floor(Math.random() * 9000) + 1000}`,
                opponentSquad: matchmakingService.generateOpponentSquad()
            });

            console.log('⚽ Match created:', match.roomId);
        }
    });

    // Cancelar busca
    socket.on('matchmaking:cancel', () => {
        matchmakingService.removeFromQueue(socket.id);
        console.log('❌ Player cancelled search:', socket.id);
    });
};
