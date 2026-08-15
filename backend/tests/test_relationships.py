def test_relationship_validation_and_sibling_derivation(client, auth_headers):
    # 1. Create family
    fam_res = client.post('/api/families', json={'name': 'Test Tree'}, headers=auth_headers)
    family_id = fam_res.get_json()['id']

    # 2. Add Father, Mother, Child 1, Child 2
    p1 = client.post(f'/api/families/{family_id}/people', json={
        'first_name': 'Father', 'last_name': 'Test', 'gender': 'male'
    }, headers=auth_headers).get_json()

    p2 = client.post(f'/api/families/{family_id}/people', json={
        'first_name': 'Mother', 'last_name': 'Test', 'gender': 'female'
    }, headers=auth_headers).get_json()

    c1 = client.post(f'/api/families/{family_id}/people', json={
        'first_name': 'Child1', 'last_name': 'Test', 'gender': 'male'
    }, headers=auth_headers).get_json()

    c2 = client.post(f'/api/families/{family_id}/people', json={
        'first_name': 'Child2', 'last_name': 'Test', 'gender': 'female'
    }, headers=auth_headers).get_json()

    # 3. Add Relationships
    # Spouse
    client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p1['id'], 'person_2_id': p2['id'], 'relationship_type': 'spouse'
    }, headers=auth_headers)

    # Parents -> Child 1
    client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p1['id'], 'person_2_id': c1['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)
    client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p2['id'], 'person_2_id': c1['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)

    # Parents -> Child 2
    client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p1['id'], 'person_2_id': c2['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)
    client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p2['id'], 'person_2_id': c2['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)

    # 4. Test self-relationship validation
    res_self = client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p1['id'], 'person_2_id': p1['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)
    assert res_self.status_code == 400

    # 5. Test cycle prevention (Child 1 cannot be parent of Father)
    res_cycle = client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': c1['id'], 'person_2_id': p1['id'], 'relationship_type': 'parent'
    }, headers=auth_headers)
    assert res_cycle.status_code == 400

    # 6. Test extended relationship types (sibling, grandparent, relative)
    res_sib = client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': c1['id'], 'person_2_id': c2['id'], 'relationship_type': 'sibling'
    }, headers=auth_headers)
    assert res_sib.status_code == 201

    res_rel = client.post(f'/api/families/{family_id}/relationships', json={
        'person_1_id': p1['id'], 'person_2_id': c1['id'], 'relationship_type': 'relative'
    }, headers=auth_headers)
    assert res_rel.status_code == 201

    # 7. Verify tree data & derived sibling logic
    tree_res = client.get(f'/api/families/{family_id}/tree', headers=auth_headers)
    assert tree_res.status_code == 200
    tree_data = tree_res.get_json()

    # Find Child 1 in people list
    child1_data = next(p for p in tree_data['people'] if p['id'] == c1['id'])
    # Verify Child 1 has Child 2 in siblings list automatically!
    sibling_ids = [s['id'] for s in child1_data['siblings']]
    assert c2['id'] in sibling_ids
