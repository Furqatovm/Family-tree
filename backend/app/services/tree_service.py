from app.repositories.person_repository import PersonRepository
from app.repositories.relationship_repository import RelationshipRepository
from app.repositories.family_repository import FamilyRepository

class TreeService:
    @staticmethod
    def get_family_tree_data(family_id, user_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != user_id:
            raise PermissionError("Access denied")

        people = PersonRepository.get_all_by_family(family_id)
        relationships = RelationshipRepository.get_all_by_family(family_id)

        people_dict = {p.id: p.to_dict() for p in people}
        
        # Build relational graphs
        # parents: child_id -> list of parent_ids
        # children: parent_id -> list of child_ids
        # spouses: person_id -> list of spouse_ids
        parents_map = {p.id: [] for p in people}
        children_map = {p.id: [] for p in people}
        spouses_map = {p.id: [] for p in people}

        for rel in relationships:
            p1 = rel.person_1_id
            p2 = rel.person_2_id

            if rel.relationship_type == 'parent':
                if p2 in parents_map:
                    parents_map[p2].append(p1)
                if p1 in children_map:
                    children_map[p1].append(p2)
            elif rel.relationship_type == 'spouse':
                if p1 in spouses_map and p2 not in spouses_map[p1]:
                    spouses_map[p1].append(p2)
                if p2 in spouses_map and p1 not in spouses_map[p2]:
                    spouses_map[p2].append(p1)

        # Derive sibling relationships: people sharing at least one parent
        siblings_map = {p.id: set() for p in people}
        for person_id, p_list in parents_map.items():
            for parent_id in p_list:
                for sibling_id in children_map.get(parent_id, []):
                    if sibling_id != person_id:
                        siblings_map[person_id].add(sibling_id)

        # Assign generations (topological depth or level calculation)
        generations = TreeService._calculate_generations(people_dict, parents_map, spouses_map)

        # Build detailed relational profiles for each person
        people_with_relations = {}
        for p_id, p_data in people_dict.items():
            p_copy = dict(p_data)
            p_copy['generation'] = generations.get(p_id, 1)
            p_copy['parents'] = [people_dict[pid] for pid in parents_map[p_id] if pid in people_dict]
            p_copy['children'] = [people_dict[cid] for cid in children_map[p_id] if cid in people_dict]
            p_copy['spouses'] = [people_dict[sid] for sid in spouses_map[p_id] if sid in people_dict]
            p_copy['siblings'] = [people_dict[sibid] for sibid in list(siblings_map[p_id]) if sibid in people_dict]
            people_with_relations[p_id] = p_copy

        # Generate React Flow nodes and edges
        nodes = []
        for p_id, p_info in people_with_relations.items():
            nodes.append({
                'id': str(p_id),
                'type': 'personNode',
                'data': p_info,
                'position': {'x': 0, 'y': 0} # Will be arranged by frontend layout engine
            })

        edges = []
        for rel in relationships:
            if rel.relationship_type == 'parent':
                edges.append({
                    'id': f"e-parent-{rel.id}",
                    'source': str(rel.person_1_id),
                    'target': str(rel.person_2_id),
                    'type': 'parentChildEdge',
                    'data': {'relationship_id': rel.id, 'type': 'parent'}
                })
            elif rel.relationship_type == 'spouse':
                edges.append({
                    'id': f"e-spouse-{rel.id}",
                    'source': str(rel.person_1_id),
                    'target': str(rel.person_2_id),
                    'type': 'spouseEdge',
                    'data': {'relationship_id': rel.id, 'type': 'spouse'}
                })

        # Calculate max generations present
        max_gen = max(generations.values()) if generations else 1

        return {
            'family': family.to_dict(include_counts=True),
            'total_generations': max_gen,
            'nodes': nodes,
            'edges': edges,
            'people': list(people_with_relations.values()),
            'relationships': [r.to_dict() for r in relationships]
        }

    @staticmethod
    def _calculate_generations(people_dict, parents_map, spouses_map):
        """
        Calculates generation level (1, 2, 3...) for each person.
        Root ancestors (no parents) = generation 1.
        Children = max(parents' generation) + 1.
        Spouses are aligned to the same generation level as their partner.
        """
        generations = {}
        
        # Step 1: Initialize roots (people with no parents)
        for p_id in people_dict:
            if not parents_map[p_id]:
                generations[p_id] = 1

        # If no roots found (e.g. cyclic or empty tree), default everyone to 1
        if not generations and people_dict:
            for p_id in people_dict:
                generations[p_id] = 1
            return generations

        # Step 2: Propagate generations to children
        changed = True
        iterations = 0
        max_iterations = len(people_dict) * 2

        while changed and iterations < max_iterations:
            changed = False
            iterations += 1

            for p_id in people_dict:
                p_parents = parents_map[p_id]
                if p_parents:
                    parent_gens = [generations[pid] for pid in p_parents if pid in generations]
                    if parent_gens:
                        new_gen = max(parent_gens) + 1
                        if generations.get(p_id) != new_gen:
                            generations[p_id] = new_gen
                            changed = True

            # Align spouses
            for p_id in list(generations.keys()):
                curr_gen = generations[p_id]
                for spouse_id in spouses_map.get(p_id, []):
                    if spouse_id in people_dict and generations.get(spouse_id) != curr_gen:
                        generations[spouse_id] = curr_gen
                        changed = True

        # Fallback for any unassigned people
        for p_id in people_dict:
            if p_id not in generations:
                generations[p_id] = 1

        return generations
