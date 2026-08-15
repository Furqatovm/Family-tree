import api from '../lib/axios';
import { TreeDataResponse } from '../types';

export const treeApi = {
  getTreeData: async (familyId: number): Promise<TreeDataResponse> => {
    const res = await api.get(`/families/${familyId}/tree`);
    return res.data;
  },
};
