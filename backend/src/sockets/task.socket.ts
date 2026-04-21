import { Server, Socket } from 'socket.io';

export const registerTaskHandlers = (io: Server, socket: Socket) => {
  // If we receive an explicit task move from a client, broadcast to others
  // Although in our controller we emit this directly upon successful API call
  // This allows optimistic UI updates if clients want to push drag & drop events purely via socket
  socket.on('task:client-move', (data: { projectId: string, taskId: string, newStatus: string, newOrder: number }) => {
    socket.to(data.projectId).emit('task:move', {
      _id: data.taskId,
      projectId: data.projectId,
      status: data.newStatus,
      order: data.newOrder
    });
  });
};
