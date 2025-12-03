
import { Player, ChatMessage } from '../types';
import { generatePlayer, INITIAL_SQUAD_POSITIONS } from './gameLogic';

// Mock Socket Service to simulate WebSocket behavior without a real backend
// In production, this would use socket.io-client

type EventCallback = (data: any) => void;

class SocketService {
  private listeners: Record<string, EventCallback[]> = {};
  private connected: boolean = false;
  private searching: boolean = false;

  connect() {
    console.log('Connecting to socket server...');
    setTimeout(() => {
      this.connected = true;
      this.emit('connect', {});
    }, 500);
  }

  disconnect() {
    this.connected = false;
    this.searching = false;
    console.log('Disconnected.');
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Simulate emitting to server and getting responses
  emit(event: string, data: any) {
    console.log(`[Socket Emitted] ${event}`, data);

    // MOCK RESPONSES
    if (event === 'join_ranked_queue') {
      this.searching = true;
      // Simulate finding a match after 3-6 seconds
      setTimeout(() => {
        if (!this.searching) return;
        
        const opponentName = `Player${Math.floor(Math.random() * 9000) + 1000}`;
        const opponentSquad = INITIAL_SQUAD_POSITIONS.map(pos => generatePlayer(undefined, pos));
        
        this.trigger('match_found', {
          opponentName,
          opponentSquad,
          roomId: `room-${Date.now()}`
        });
        
        this.searching = false;
      }, Math.random() * 3000 + 3000);
    }

    if (event === 'cancel_search') {
      this.searching = false;
    }

    if (event === 'send_chat_message') {
      // Echo back immediately to sender (local optimistic update)
      // And simulate opponent reply sometimes
      if (Math.random() < 0.3) {
        setTimeout(() => {
          this.trigger('chat_message', {
            id: `msg-${Date.now()}`,
            sender: 'Oponente',
            text: ['Boa sorte!', 'Joga muito!', 'Que time!', 'GG'][Math.floor(Math.random() * 4)],
            timestamp: Date.now()
          });
        }, 2000);
      }
    }
  }

  // Internal helper to trigger listeners
  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const socketService = new SocketService();
