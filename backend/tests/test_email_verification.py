from app.services.email_verification_service import VERIFICATION_CODES


def test_send_code_and_verify_register(client):
    # 1. Send code
    res = client.post('/api/auth/send-code', json={
        'email': 'otp_test@example.com'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'message' in data

    # 2. Retrieve code directly from in-memory store (since email is not sent in test env)
    code = VERIFICATION_CODES.get('otp_test@example.com', {}).get('code')
    assert code is not None, "OTP code should be saved in VERIFICATION_CODES store"
    assert len(code) == 6

    # 3. Try registering with wrong code
    res_wrong = client.post('/api/auth/verify-and-register', json={
        'email': 'otp_test@example.com',
        'code': '999999',
        'password': 'password123',
        'first_name': 'OTP',
        'last_name': 'Tester'
    })
    assert res_wrong.status_code == 400

    # 4. Re-send code since wrong attempt didn't consume it
    # (Need a fresh code since wrong attempt cleared nothing)
    res2 = client.post('/api/auth/send-code', json={
        'email': 'otp_test2@example.com'
    })
    assert res2.status_code == 200
    code2 = VERIFICATION_CODES.get('otp_test2@example.com', {}).get('code')

    # 5. Register with correct 6-digit code
    res_correct = client.post('/api/auth/verify-and-register', json={
        'email': 'otp_test2@example.com',
        'code': code2,
        'password': 'password123',
        'first_name': 'OTP',
        'last_name': 'Tester'
    })
    assert res_correct.status_code == 201
    reg_data = res_correct.get_json()
    assert 'access_token' in reg_data
    assert reg_data['user']['email'] == 'otp_test2@example.com'
