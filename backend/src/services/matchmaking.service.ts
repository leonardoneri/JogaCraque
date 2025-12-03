import { Player, Position } from '../types.js';
import { generatePlayer, INITIAL_SQUAD_POSITIONS } from './gameLogic.service.js';

interface MatchmakingQueue {
    socketId: string;
    rating: number;
    timestamp: number;
}

class MatchmakingService {
    private queue: MatchmakingQueue[] = [];

    addToQueue(socketId: string, rating: number = 1000) {
        this.queue.push({
            socketId,
            rating,
            timestamp: Date.now()
        });
    }

    removeFromQueue(socketId: string) {
        this.queue = this.queue.filter(q => q.socketId !== socketId);
    }

    findMatch(socketId: string): { opponent: string; roomId: string } | null {
        const player = this.queue.find(q => q.socketId === socketId);
        if (!player) return null;

        // Find opponent with similar rating
        const opponent = this.queue.find(
            q => q.socketId !== socketId && Math.abs(q.rating - player.rating) <= 200
        );

        if (opponent) {
            this.removeFromQueue(socketId);
            this.removeFromQueue(opponent.socketId);

            return {
                opponent: opponent.socketId,
                roomId: `match-${Date.now()}`
            };
        }

        return null;
    }

    generateOpponentSquad(): Player[] {
        return INITIAL_SQUAD_POSITIONS.map((pos: Position) =>
            generatePlayer(undefined, pos)
        );
    }

    getQueueSize(): number {
        return this.queue.length;
    }
}

export const matchmakingService = new MatchmakingService();
