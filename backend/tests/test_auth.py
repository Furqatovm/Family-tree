def test_register_and_login(client):
    # Register
    res = client.post('/api/auth/register', json={
        'email': 'alice@example.com',
        'password': 'password123',
        'first_name': 'Alice',
        'last_name': 'Smith'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'access_token' in data
    assert data['user']['email'] == 'alice@example.com'

    # Duplicate register
    res_dup = client.post('/api/auth/register', json={
        'email': 'alice@example.com',
        'password': 'password123',
        'first_name': 'Alice',
        'last_name': 'Smith'
    })
    assert res_dup.status_code == 409

    # Login
    res_login = client.post('/api/auth/login', json={
        'email': 'alice@example.com',
        'password': 'password123'
    })
    assert res_login.status_code == 200
    assert 'access_token' in res_login.get_json()

    # Invalid login
    res_bad = client.post('/api/auth/login', json={
        'email': 'alice@example.com',
        'password': 'wrongpassword'
    })
    assert res_bad.status_code == 401

    # GET /api/auth/me with JWT token
    token = res_login.get_json()['access_token']
    res_me = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert res_me.status_code == 200
    assert res_me.get_json()['email'] == 'alice@example.com'
