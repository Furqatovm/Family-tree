import api from '../lib/axios';

export interface AdminStats {
  total_users: number;
  total_families: number;
  total_people: number;
  total_relationships: number;
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  plan_tier?: 'free' | 'basic' | 'pro';
  families_count: number;
  created_at: string;
}

export interface AdminFamily {
  id: number;
  name: string;
  description?: string;
  owner_name: string;
  owner_email: string;
  members_count: number;
  created_at: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  toggleAdmin: async (userId: number): Promise<{ message: string; is_admin: boolean }> => {
    const res = await api.put(`/admin/users/${userId}/toggle-admin`);
    return res.data;
  },
  setUserPlan: async (userId: number, planTier: 'free' | 'basic' | 'pro'): Promise<{ message: string; user: AdminUser }> => {
    const res = await api.put(`/admin/users/${userId}/plan`, { plan_tier: planTier });
    return res.data;
  },
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },
  getFamilies: async (): Promise<AdminFamily[]> => {
    const res = await api.get('/admin/families');
    return res.data;
  },
};
