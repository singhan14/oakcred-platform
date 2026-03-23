import { create } from 'zustand';
import { api } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  // Standard Password Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Custom OTP Send (via our backend SMTP)
  signInWithOTP: async (email) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/otp/send', { email });
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Custom OTP Verify (via our backend)
  verifyOTP: async (email, otp) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/otp/verify', { email, otp });
      localStorage.setItem('accessToken', data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Signup redirect to OTP
  signUpWithEmail: async (email, password) => {
    return get().signInWithOTP(email);
  },

  logout: async () => {
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
