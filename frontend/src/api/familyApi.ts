import api from '../lib/axios';
import { Family, DashboardStats } from '../types';

export interface FamilyCreatePayload {
  name: string;
  description?: string;
}

export const familyApi = {
  getFamilies: async (): Promise<Family[]> => {
    const res = await api.get('/families');
    return res.data;
  },
  getFamily: async (id: number): Promise<Family> => {
    const res = await api.get(`/families/${id}`);
    return res.data;
  },
  createFamily: async (payload: FamilyCreatePayload): Promise<Family> => {
    const res = await api.post('/families', payload);
    return res.data;
  },
  updateFamily: async (id: number, payload: Partial<FamilyCreatePayload>): Promise<Family> => {
    const res = await api.put(`/families/${id}`, payload);
    return res.data;
  },
  deleteFamily: async (id: number): Promise<void> => {
    await api.delete(`/families/${id}`);
  },
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
