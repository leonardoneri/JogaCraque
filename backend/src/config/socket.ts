import { Server } from 'socket.io';
import { config } from './env.js';

export const createSocketServer = (httpServer: any) => {
    const io = new Server(httpServer, {
        cors: {
            origin: config.FRONTEND_URL,
            methods: ['GET', 'POST']
        }
    });

    return io;
};
