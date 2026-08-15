export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin?: boolean;
  plan_tier?: 'free' | 'basic' | 'pro';
  created_at?: string;
  updated_at?: string;
}

export interface Family {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  members_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Person {
  id: number;
  family_id: number;
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
  current_lat?: number;
  current_lng?: number;
  current_location_name?: string;
  status_message?: string;
  last_location_update?: string;
  generation?: number;
  created_at?: string;
  updated_at?: string;

  // Relational structures attached for detailed view
  parents?: Person[];
  children?: Person[];
  spouses?: Person[];
  siblings?: Person[];
}

export interface LocationHistoryItem {
  id: number;
  person_id: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  status_message?: string;
  recorded_at: string;
}

export interface Relationship {
  id: number;
  family_id: number;
  person_1_id: number;
  person_2_id: number;
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling' | 'grandparent' | 'grandchild' | 'relative';
  created_at?: string;
}

export interface TreeDataResponse {
  family: Family;
  total_generations: number;
  nodes: {
    id: string;
    type: string;
    data: Person;
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: string;
    data: { relationship_id: number; type: 'parent' | 'spouse' };
  }[];
  people: Person[];
  relationships: Relationship[];
}

export interface DashboardStats {
  total_families: number;
  total_members: number;
  total_relationships: number;
}
