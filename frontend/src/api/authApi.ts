import api from '../lib/axios';
import { User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface VerifyAndRegisterPayload extends RegisterPayload {
  code: string;
}

export const authApi = {
  sendVerificationCode: async (email: string): Promise<{ message: string; dev_code?: string }> => {
    const res = await api.post('/auth/send-code', { email });
    return res.data;
  },
  verifyAndRegister: async (payload: VerifyAndRegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/verify-and-register', payload);
    return res.data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (payload: { first_name?: string; last_name?: string; email?: string }): Promise<User> => {
    const res = await api.put('/auth/me', payload);
    return res.data;
  },
  changePassword: async (payload: { old_password: string; new_password: string }): Promise<{ message: string }> => {
    const res = await api.post('/auth/change-password', payload);
    return res.data;
  },
  subscribe: async (plan_tier: 'basic' | 'pro'): Promise<{ message: string; user: User }> => {
    const res = await api.post('/auth/subscribe', { plan_tier });
    return res.data;
  },
  forgotPassword: async (email: string): Promise<{ message: string; dev_code?: string; email_sent?: boolean }> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (payload: { email: string; code: string; new_password: string }): Promise<{ message: string }> => {
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  },
};
