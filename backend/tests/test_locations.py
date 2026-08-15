import pytest

def test_location_update_and_history(client, auth_headers):
    # 1. Create family
    res_fam = client.post('/api/families', json={'name': 'Map Test Family'}, headers=auth_headers)
    assert res_fam.status_code == 201
    family_id = res_fam.get_json()['id']

    # 2. Create person with location
    res_person = client.post(f'/api/families/{family_id}/people', json={
        'first_name': 'Navruz',
        'last_name': 'Kamilov',
        'gender': 'male',
        'current_lat': 41.311,
        'current_lng': 69.279,
        'current_location_name': 'Tashkent Park',
        'status_message': 'Walking around'
    }, headers=auth_headers)
    assert res_person.status_code == 201
    person_id = res_person.get_json()['id']
    assert res_person.get_json()['current_lat'] == 41.311

    # 3. Update location via location endpoint
    res_loc = client.post(f'/api/people/{person_id}/location', json={
        'latitude': 41.320,
        'longitude': 69.290,
        'location_name': 'Samarkand Darvoza',
        'status_message': 'Shopping'
    }, headers=auth_headers)
    assert res_loc.status_code == 200
    assert res_loc.get_json()['current_location_name'] == 'Samarkand Darvoza'

    # 4. Check location history trail
    res_hist = client.get(f'/api/people/{person_id}/location-history', headers=auth_headers)
    assert res_hist.status_code == 200
    history = res_hist.get_json()
    assert len(history) == 2
    assert history[1]['location_name'] == 'Samarkand Darvoza'
