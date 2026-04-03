'use client';

/**
 * @fileoverview Client-side auth state management using Zustand.
 * Manages user session, provides login/logout helpers, and
 * handles auth redirects on 401 responses.
 */

import { create } from 'zustand';
import { authApi, ApiError } from './api-client';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 * @property {string} preferredLang
 * @property {string} [phone]
 * @property {string} [avatarUrl]
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {string | null} error
 * @property {() => Promise<void>} initialize
 * @property {(data: { email: string, password: string }) => Promise<void>} login
 * @property {(data: { email: string, password: string, name: string }) => Promise<void>} register
 * @property {() => Promise<void>} logout
 * @property {() => void} clearError
 */

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  /**
   * Initialize auth state by checking current session.
   * Called once on app mount.
   */
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await authApi.me();
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      // 401 means not logged in — that's normal
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Login with email and password.
   * @param {{ email: string, password: string }} credentials
   */
  login: async ({ email, password }) => {
    try {
      set({ isLoading: true, error: null });
      const data = await authApi.login({ email, password });
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  /**
   * Register a new account.
   * @param {{ email: string, password: string, name: string, phone?: string }} data
   */
  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.register(data);
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  /**
   * Logout and clear session.
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors — clear state anyway
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  },

  /**
   * Send password reset OTP to email.
   * @param {string} email
   */
  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.forgotPassword({ email });
      set({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to send OTP. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  /**
   * Reset password with OTP.
   * @param {{ email: string, otp: string, newPassword: string }} data
   */
  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.resetPassword({ email, otp, newPassword });
      set({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to reset password. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),
}));

/**
 * Hook to get user's display name.
 * @returns {string}
 */
export function useUserDisplayName() {
  const user = useAuthStore((state) => state.user);
  if (!user) return '';
  return user.name || user.email.split('@')[0];
}

/**
 * Hook to check if current user is admin.
 * @returns {boolean}
 */
export function useIsAdmin() {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
}
