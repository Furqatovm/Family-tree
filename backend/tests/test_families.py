def test_family_crud(client, auth_headers):
    # Create family
    res = client.post('/api/families', json={
        'name': 'The Smiths',
        'description': 'Smith family tree'
    }, headers=auth_headers)
    assert res.status_code == 201
    family = res.get_json()
    family_id = family['id']
    assert family['name'] == 'The Smiths'

    # Get families
    res_list = client.get('/api/families', headers=auth_headers)
    assert res_list.status_code == 200
    assert len(res_list.get_json()) == 1

    # Update family
    res_up = client.put(f'/api/families/{family_id}', json={
        'name': 'The Smith Legacy'
    }, headers=auth_headers)
    assert res_up.status_code == 200
    assert res_up.get_json()['name'] == 'The Smith Legacy'

    # Delete family
    res_del = client.delete(f'/api/families/{family_id}', headers=auth_headers)
    assert res_del.status_code == 200
