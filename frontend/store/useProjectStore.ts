import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { api } from '@/lib/api';

export interface Member {
  _id: string;
  name: string;
  username: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: Member[];
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  currentProjectName:(projectId:string)=>string;
  fetchProjects: () => Promise<void>;
  createProject: (payload: { name: string; description?: string }) => Promise<Project>;
  updateProject: (id: string, payload: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string) => Promise<Project>;
  removeMember: (projectId: string, userId: string) => Promise<Project>;
  clear: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,

      currentProjectName: (projectId: string) => {
        const project = get().projects.find((p) => p._id === projectId);
        return project?.name || "Unknown";
      },

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/projects`);
          set({ projects: data.data ?? [], isLoading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? "Failed to load projects",
            isLoading: false,
          });
        }
      },

      createProject: async (payload) => {
        const { data } = await api.post("/projects", payload);
        const newProject = data.data;
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        return newProject;
      },

      updateProject: async (id, payload) => {
        const { data } = await api.patch(`/projects/${id}`, payload);
        const updated = data.data;
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === id ? updated : p
          ),
        }));
      },

      deleteProject: async (id) => {
        await api.delete(`/projects/${id}`);
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== id),
        }));
      },

      addMember: async (projectId, userId) => {
        const { data } = await api.post(
          `/projects/${projectId}/members`,
          { userId }
        );
        const updated = data.data;
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === projectId ? updated : p
          ),
        }));
        return updated;
      },

      removeMember: async (projectId, userId) => {
        const { data } = await api.delete(
          `/projects/${projectId}/members/${userId}`
        );
        const updated = data.data;
        set((state) => ({
          projects: state.projects.map((p) =>
            p._id === projectId ? updated : p
          ),
        }));
        return updated;
      },

      clear: () => set({ projects: [], error: null }),
    }),
    {
      name: "project-storage", // localStorage key
    }
  )
);
