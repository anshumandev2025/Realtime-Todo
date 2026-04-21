import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (payload: { name: string; description?: string; }) => Promise<Project>;
  clear: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/projects/${userId}`);
      set({ projects: data.data ?? [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? 'Failed to load projects', isLoading: false });
    }
  },

  createProject: async (payload) => {
    const { data } = await api.post('/projects', payload);
    const newProject: Project = data.data;
    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  clear: () => set({ projects: [], error: null }),
}));
