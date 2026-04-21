import { Server, Socket } from 'socket.io';

export const registerProjectHandlers = (io: Server, socket: Socket) => {
  // Join a project room to receive real-time updates for its tasks
  socket.on('project:join', (projectId: string) => {
    socket.join(projectId);
    console.log(`User ${(socket as any).user.id} joined project room: ${projectId}`);
  });

  socket.on('project:leave', (projectId: string) => {
    socket.leave(projectId);
    console.log(`User ${(socket as any).user.id} left project room: ${projectId}`);
  });
};
