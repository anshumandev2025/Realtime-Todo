import { create } from 'zustand';
import { registerTokenGetter, registerAuthUpdater, registerLogoutHandler } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up the interceptor registry once the store is created
  registerTokenGetter(() => get().accessToken);
  registerAuthUpdater((user, token) => get().setUser(user, token));
  registerLogoutHandler(() => get().logout());

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,

    setUser: (user, token) => {
      set({
        user,
        accessToken: token ?? null,
        isAuthenticated: !!user,
      });
    },

    logout: () =>
      set({ user: null, accessToken: null, isAuthenticated: false }),
  };
});
