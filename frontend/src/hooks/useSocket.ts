import { useCallback, useEffect } from 'react';
import { socketService } from '../services/socketClient';

export const useSocket = () => {
    useEffect(() => {
        // Conectar ao socket quando o componente montar
        socketService.connect();

        return () => {
            // Desconectar quando desmontar
            socketService.disconnect();
        };
    }, []);

    const emit = useCallback((event: string, data?: any) => {
        socketService.emit(event, data);
    }, []);

    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        socketService.on(event, callback);
    }, []);

    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        socketService.off(event, callback);
    }, []);

    return {
        emit,
        on,
        off,
        isConnected: socketService.isConnected(),
        // Helper methods
        joinRankedQueue: () => socketService.joinRankedQueue(),
        cancelSearch: () => socketService.cancelSearch(),
        sendChatMessage: (text: string) => socketService.sendChatMessage(text),
    };
};
