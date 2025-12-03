import { Server, Socket } from 'socket.io';
import { handleChat } from './handlers/chat.handler.js';
import { handleMarket } from './handlers/market.handler.js';
import { handleMatchmaking } from './handlers/matchmaking.handler.js';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('✅ Client connected:', socket.id);

        // Registrar handlers
        handleMatchmaking(socket);
        handleChat(socket);
        handleMarket(socket);

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });
};
