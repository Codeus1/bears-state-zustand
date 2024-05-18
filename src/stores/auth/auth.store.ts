// import { AuthState } from './auth.store';
import { StateCreator, create } from 'zustand';
import type { AuthStatus, User } from '../../interfaces';
import { AuthService } from '../../services/auth.service';
import { devtools, persist } from 'zustand/middleware';

export interface AuthState {
    status: AuthStatus;
    token?: string;
    user?: User;
    loginUser: (email: string, password: string) => Promise<void>;
    logoutUser: () => void;
    checkAuthStatus: () => Promise<void>;
}

const storeApi: StateCreator<AuthState> = (set) => ({
    status: 'pending',
    token: undefined,
    user: undefined,
    loginUser: async (email, password) => {
        try {
            const { token, ...user } = await AuthService.login(email, password);
            set({ status: 'authorized', token, user });
        } catch (error) {
            set({ status: 'unauthorized', token: undefined, user: undefined });
            throw new Error('Unauthorize');
        }
    },
    async checkAuthStatus() {
        try {
            const { token, ...user } = await AuthService.checkStatus();
            set({ status: 'authorized', token, user });
        } catch (error) {
            set({ status: 'unauthorized', token: undefined, user: undefined });
        }
    },
    async logoutUser() {
        set({ status: 'unauthorized', token: undefined, user: undefined });
    },
});

export const useAuthStore = create<AuthState>()(
    devtools(persist(storeApi, { name: 'auth-storage' }))
);
