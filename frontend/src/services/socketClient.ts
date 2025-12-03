import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private connected: boolean = false;

    connect() {
        if (this.socket) {
            return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

        console.log('Connecting to backend socket:', BACKEND_URL);

        this.socket = io(BACKEND_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to backend socket server');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from backend socket server');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) {
            console.warn('Socket not initialized. Call connect() first.');
            return;
        }
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (!this.socket) return;
        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }
    }

    emit(event: string, data?: any) {
        if (!this.socket || !this.connected) {
            console.warn('Socket not connected. Cannot emit event:', event);
            return;
        }
        this.socket.emit(event, data);
    }

    // Game-specific methods
    joinRankedQueue() {
        this.emit('matchmaking:search');
    }

    cancelSearch() {
        this.emit('matchmaking:cancel');
    }

    sendChatMessage(text: string) {
        this.emit('chat:message', { text });
    }

    // Market
    buyPlayer(playerId: string) {
        this.emit('market:buy', { playerId });
    }

    listPlayer(playerId: string, price: number) {
        this.emit('market:list', { playerId, price });
    }
}

export const socketService = new SocketService();
