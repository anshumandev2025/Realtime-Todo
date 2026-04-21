import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status:string | 'todo' | 'in-progress' | 'done';
  projectId: string;
  assignedTo?: string[];
  order: number;
  checklist?: { text: string; completed: boolean }[];
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks:(tasks:Task[])=>void;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (payload: { title: string; projectId: string; status?: string }) => Promise<Task>;
  moveTask: (taskId: string, projectId: string, newStatus: string, newOrder: number) => Promise<void>;
  applySocketCreate: (task: Task) => void;
  applySocketUpdate: (task: Task) => void;
  applySocketMove: (task: Pick<Task, '_id' | 'status' | 'order'>) => void;
  clear: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  setTasks:(tasks)=>set({tasks}),
  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/tasks/project/${projectId}`);
      set({ tasks: data.data ?? [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Failed to load tasks', isLoading: false });
    }
  },

  createTask: async (payload) => {
    const { data } = await api.post('/tasks', payload);
    const newTask: Task = data.data;
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  moveTask: async (taskId, projectId, newStatus, newOrder) => {
    // Optimistic update first
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus as Task['status'], order: newOrder } : t
      ),
    }));
    try {
      await api.patch(`/tasks/${taskId}/move`, { newStatus, newOrder });
    } catch {
      // On failure, refetch to restore correct state
      await get().fetchTasks(projectId);
    }
  },

  // Socket-driven updates (no API call, just mutate local state)
  applySocketCreate: (task) =>
    set((state) => {
      const exists = state.tasks.some((t) => t._id === task._id);
      return exists ? {} : { tasks: [...state.tasks, task] };
    }),

  applySocketUpdate: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? { ...t, ...task } : t)),
    })),

  applySocketMove: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === task._id ? { ...t, status: task.status, order: task.order } : t
      ),
    })),

  clear: () => set({ tasks: [], error: null }),
}));
