import { create } from 'zustand';

interface AuthUser {
  sub: string;
  email: string;
  token: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('rumi_token', user.token);
      localStorage.setItem('rumi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rumi_token');
      localStorage.removeItem('rumi_user');
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('rumi_token');
    localStorage.removeItem('rumi_user');
    set({ user: null, isAuthenticated: false });
  },
  initFromStorage: () => {
    const stored = localStorage.getItem('rumi_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
