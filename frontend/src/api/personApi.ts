import api from '../lib/axios';
import { Person } from '../types';

export interface PersonPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  date_of_birth?: string;
  date_of_death?: string;
  birthplace?: string;
  occupation?: string;
  biography?: string;
  photo_url?: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  location_name?: string;
  status_message?: string;
}

export const personApi = {
  getPeopleByFamily: async (familyId: number): Promise<Person[]> => {
    const res = await api.get(`/families/${familyId}/people`);
    return res.data;
  },
  getPerson: async (id: number): Promise<Person> => {
    const res = await api.get(`/people/${id}`);
    return res.data;
  },
  createPerson: async (familyId: number, payload: PersonPayload): Promise<Person> => {
    const res = await api.post(`/families/${familyId}/people`, payload);
    return res.data;
  },
  updatePerson: async (id: number, payload: Partial<PersonPayload>): Promise<Person> => {
    const res = await api.put(`/people/${id}`, payload);
    return res.data;
  },
  updateLocation: async (id: number, payload: LocationPayload): Promise<Person> => {
    const res = await api.post(`/people/${id}/location`, payload);
    return res.data;
  },
  getLocationHistory: async (id: number): Promise<any[]> => {
    const res = await api.get(`/people/${id}/location-history`);
    return res.data;
  },
  deletePerson: async (id: number): Promise<void> => {
    await api.delete(`/people/${id}`);
  },
};
