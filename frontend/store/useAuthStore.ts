import { create } from 'zustand';
import { registerTokenGetter, registerAuthUpdater, registerLogoutHandler } from '@/lib/api';

export interface Organization {
  _id: string;
  name: string;
  owner: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  accountType: 'individual' | 'organization_owner';
  organizations: Organization[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  activeOrganizationId: string | null;
  setUser: (user: User | null, token?: string) => void;
  setActiveOrganizationId: (id: string | null) => void;
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
    activeOrganizationId: null,

    setUser: (user, token) => {
      const defaultOrgId =
        user?.organizations?.length ? user.organizations[0]._id : null;
      set({
        user,
        accessToken: token ?? null,
        isAuthenticated: !!user,
        activeOrganizationId: defaultOrgId,
      });
    },

    setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),

    logout: () =>
      set({ user: null, accessToken: null, isAuthenticated: false, activeOrganizationId: null }),
  };
});
