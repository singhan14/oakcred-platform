import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      const user = await api.get('/auth/me');
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
