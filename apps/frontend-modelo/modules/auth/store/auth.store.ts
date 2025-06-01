import { create } from 'zustand';
import { AuthState, User } from '../types';
import { AuthService } from '../services/auth.service';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
      error: null,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  reset: () => set(initialState),
})); 