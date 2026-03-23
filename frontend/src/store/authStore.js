import { create } from 'zustand';
import { api } from '../api/client';
import { supabase } from '../config/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  // Standard Email/Password Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) throw authError;

      const data = await api.post('/auth/sso', { access_token: authData.session.access_token });
      localStorage.setItem('accessToken', data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Email OTP Sign In (Sends the code/link)
  signInWithOTP: async (email) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          shouldCreateUser: true
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

  // Verify the 6-digit OTP code
  verifyOTP: async (email, token) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (error) throw error;
      
      if (data.session?.access_token) {
        const backendData = await api.post('/auth/sso', { access_token: data.session.access_token });
        localStorage.setItem('accessToken', backendData.token);
        set({ user: backendData.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
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

  logout: async () => {
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const user = await api.get('/auth/me');
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
