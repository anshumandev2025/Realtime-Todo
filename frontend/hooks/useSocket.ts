"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useTaskStore } from '@/store/useTaskStore';

const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace('/api', '');

export const useSocket = (projectId: string): Socket | null => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { applySocketCreate, applySocketUpdate, applySocketMove } = useTaskStore();

  // Use a ref so we never trigger re-renders when the socket connects/disconnects
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // SSR guard + require a valid token
    if (typeof window === 'undefined' || !accessToken) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('project:join', projectId);
    });

    // Real-time task events → update store
    socket.on('task:create', applySocketCreate);
    socket.on('task:update', applySocketUpdate);
    socket.on('task:move',   applySocketMove);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('task:create', applySocketCreate);
      socket.off('task:update', applySocketUpdate);
      socket.off('task:move',   applySocketMove);
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, accessToken]);

  return socketRef.current;
};
