import { create } from 'zustand';
import { api } from '../api/client';
import { supabase } from '../config/supabase';

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

  signInWithSSO: async (provider) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  handleSSOCallback: async (session) => {
    if (!session?.access_token) return;
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/sso', { access_token: session.access_token });
      localStorage.setItem('accessToken', data.token);
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
