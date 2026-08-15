import api from '../lib/axios';
import { Relationship } from '../types';

export interface RelationshipPayload {
  person_1_id: number;
  person_2_id: number;
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'relative';
}

export const relationshipApi = {
  getRelationshipsByFamily: async (familyId: number): Promise<Relationship[]> => {
    const res = await api.get(`/families/${familyId}/relationships`);
    return res.data;
  },
  createRelationship: async (familyId: number, payload: RelationshipPayload): Promise<Relationship> => {
    const res = await api.post(`/families/${familyId}/relationships`, payload);
    return res.data;
  },
  deleteRelationship: async (id: number): Promise<void> => {
    await api.delete(`/relationships/${id}`);
  },
};
