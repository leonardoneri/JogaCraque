import { Socket } from 'socket.io';

export const handleChat = (socket: Socket) => {
    socket.on('chat:message', (data: { text: string }) => {
        console.log('💬 Chat message from', socket.id, ':', data.text);

        // Broadcast para a sala (implementar lógica de salas depois)
        socket.broadcast.emit('chat_message', {
            id: `msg-${Date.now()}`,
            sender: socket.id,
            text: data.text,
            timestamp: Date.now()
        });
    });
};
