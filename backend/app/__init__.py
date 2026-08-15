from flask import Flask
from app.config import Config
from app.extensions import db, jwt, cors, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )
    migrate.init_app(app, db)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.family_routes import family_bp
    from app.routes.person_routes import person_bp
    from app.routes.relationship_routes import relationship_bp
    from app.routes.tree_routes import tree_bp
    from app.routes.contact_routes import contact_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(person_bp)
    app.register_blueprint(relationship_bp)
    app.register_blueprint(tree_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(admin_bp)

    # Automatically expand database schema without dropping existing tables
    with app.app_context():
        # Import all models so SQLAlchemy metadata is fully populated
        from app.models import User, Family, Person, Relationship, LocationHistory

        # Creates newly added tables if they do not exist (preserves existing data)
        db.create_all()

        # Safe non-destructive column migrations for existing tables
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN plan_tier VARCHAR(20) DEFAULT 'free'"))
                conn.commit()
        except Exception:
            pass

        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                conn.commit()
        except Exception:
            pass

    @app.route('/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'service': 'family-tree-api'}, 200

    return app
