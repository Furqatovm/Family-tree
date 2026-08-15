from app import create_app

app = create_app()

if __name__ == "__main__":
    try:
        from waitress import serve
        print("[*] Serving Production FamilyTree WSGI app on http://0.0.0.0:5000 via Waitress...")
        serve(app, host="0.0.0.0", port=5000, threads=8)
    except ImportError:
        print("[*] Serving via Flask WSGI runner on http://0.0.0.0:5000...")
        app.run(host="0.0.0.0", port=5000, debug=False)
