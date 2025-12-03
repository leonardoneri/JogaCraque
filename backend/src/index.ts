import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { config } from './config/env.js';
import { createSocketServer } from './config/socket.js';
import routes from './routes/index.js';
import { setupSocketHandlers } from './socket/index.js';

const app = express();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Socket.IO handlers
setupSocketHandlers(io);

httpServer.listen(config.PORT, () => {
    console.log(`🚀 Backend running on port ${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
});
