from app.extensions import db
from app.models.user import User
from app.models.family import Family
from app.models.person import Person
from app.models.relationship import Relationship
from app.models.location_history import LocationHistory

def seed_demo_data_if_missing():
    """Ensure default Super Admin and Demo User with full Family Tree exist."""
    try:
        # 1. Ensure Super Admin exists
        admin_user = User.query.filter_by(email='admin@example.com').first()
        if not admin_user:
            admin_user = User(
                email='admin@example.com',
                first_name='Super',
                last_name='Admin',
                is_admin=True,
                plan_tier='pro'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("[*] Super Admin created: admin@example.com / admin123")
        else:
            if not admin_user.is_admin or admin_user.plan_tier != 'pro':
                admin_user.is_admin = True
                admin_user.plan_tier = 'pro'
                db.session.commit()

        # 2. Ensure Demo User and Family Tree exist
        demo_user = User.query.filter_by(email='demo@example.com').first()
        if not demo_user:
            demo_user = User(
                email='demo@example.com',
                first_name='Eleanor',
                last_name='Sterling',
                is_admin=False,
                plan_tier='pro'
            )
            demo_user.set_password('password123')
            db.session.add(demo_user)
            db.session.commit()
            print("[*] Demo user created: demo@example.com / password123")

        # 3. Ensure Demo Family Tree exists for demo user
        demo_family = Family.query.filter_by(owner_id=demo_user.id).first()
        if not demo_family:
            demo_family = Family(
                name='The Sterling Dynasty',
                description='A lineage of visionaries, artists, and engineers originating in Boston and spreading across the globe.',
                owner_id=demo_user.id
            )
            db.session.add(demo_family)
            db.session.commit()

            # Generation 1 (Grandparents)
            g1_grandfather = Person(
                family_id=demo_family.id,
                first_name='Arthur',
                middle_name='Edward',
                last_name='Sterling',
                gender='male',
                date_of_birth='1938-04-12',
                date_of_death='2018-11-05',
                birthplace='Boston, MA',
                occupation='Architect & Master Builder',
                biography='Arthur founded Sterling Architecture in 1965, designing landmark libraries and civic centers across New England.',
                photo_url='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                current_lat=42.3601,
                current_lng=-71.0589,
                current_location_name='Boston Memorial Gardens, MA',
                status_message='Resting in peace'
            )
            g1_grandmother = Person(
                family_id=demo_family.id,
                first_name='Margaret',
                middle_name='Rose',
                last_name='Vance',
                gender='female',
                date_of_birth='1942-08-25',
                date_of_death=None,
                birthplace='Cambridge, MA',
                occupation='Professor of Literature',
                biography='Margaret taught 20th-century poetry at Radcliffe and Harvard for over 35 years. Passionate painter and gardener.',
                photo_url='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                current_lat=41.2995,
                current_lng=69.2401,
                current_location_name='Tashkent Central Library, Uzbekistan',
                status_message='Reading classic poetry'
            )
            db.session.add_all([g1_grandfather, g1_grandmother])
            db.session.commit()

            r_g1_spouse = Relationship(family_id=demo_family.id, person_1_id=g1_grandfather.id, person_2_id=g1_grandmother.id, relationship_type='spouse')
            db.session.add(r_g1_spouse)
            db.session.commit()

            # Generation 2 (Parents & Aunts/Uncles)
            g2_father = Person(
                family_id=demo_family.id,
                first_name='Robert',
                middle_name='Arthur',
                last_name='Sterling',
                gender='male',
                date_of_birth='1968-02-14',
                date_of_death=None,
                birthplace='Boston, MA',
                occupation='Structural Engineer',
                biography='Chief Engineer leading sustainable urban infrastructure projects across North America.',
                photo_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                current_lat=42.3601,
                current_lng=-71.0589,
                current_location_name='Boston Financial District, MA',
                status_message='Inspecting bridge site'
            )
            g2_mother = Person(
                family_id=demo_family.id,
                first_name='Catherine',
                middle_name='Elizabeth',
                last_name='Chen',
                gender='female',
                date_of_birth='1971-09-30',
                date_of_death=None,
                birthplace='San Francisco, CA',
                occupation='Concert Pianist & Composer',
                biography='International soloist who performed with the Boston Symphony Orchestra and taught at Berklee College of Music.',
                photo_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                current_lat=37.7749,
                current_lng=-122.4194,
                current_location_name='Davies Symphony Hall, San Francisco, CA',
                status_message='Concert rehearsal'
            )
            g2_uncle = Person(
                family_id=demo_family.id,
                first_name='Julian',
                middle_name='Vance',
                last_name='Sterling',
                gender='male',
                date_of_birth='1973-12-19',
                date_of_death=None,
                birthplace='Boston, MA',
                occupation='Documentary Filmmaker',
                biography='Emmy-award-winning director focusing on oceanic wildlife conservation and climate storytelling.',
                photo_url='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                current_lat=40.7128,
                current_lng=-74.0060,
                current_location_name='SoHo Film Studio, New York, NY',
                status_message='Editing documentary footage'
            )
            db.session.add_all([g2_father, g2_mother, g2_uncle])
            db.session.commit()

            r_p1 = Relationship(family_id=demo_family.id, person_1_id=g1_grandfather.id, person_2_id=g2_father.id, relationship_type='parent')
            r_p2 = Relationship(family_id=demo_family.id, person_1_id=g1_grandmother.id, person_2_id=g2_father.id, relationship_type='parent')
            r_p3 = Relationship(family_id=demo_family.id, person_1_id=g1_grandfather.id, person_2_id=g2_uncle.id, relationship_type='parent')
            r_p4 = Relationship(family_id=demo_family.id, person_1_id=g1_grandmother.id, person_2_id=g2_uncle.id, relationship_type='parent')
            r_g2_spouse = Relationship(family_id=demo_family.id, person_1_id=g2_father.id, person_2_id=g2_mother.id, relationship_type='spouse')
            db.session.add_all([r_p1, r_p2, r_p3, r_p4, r_g2_spouse])
            db.session.commit()

            # Generation 3 (User & Siblings & Spouse)
            g3_user = Person(
                family_id=demo_family.id,
                first_name='Eleanor',
                middle_name='Rose',
                last_name='Sterling',
                gender='female',
                date_of_birth='1996-06-18',
                date_of_death=None,
                birthplace='Boston, MA',
                occupation='Software Engineer & Genealogist',
                biography='Creator of digital archiving platforms. Passionate about preserving multi-generational oral histories.',
                photo_url='https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                current_lat=41.31108,
                current_lng=69.2797,
                current_location_name='Tashkent City Park, Uzbekistan',
                status_message='Coding & enjoying coffee ☕'
            )
            g3_brother = Person(
                family_id=demo_family.id,
                first_name='Lucas',
                middle_name='Robert',
                last_name='Sterling',
                gender='male',
                date_of_birth='1999-11-03',
                date_of_death=None,
                birthplace='Boston, MA',
                occupation='Biomedical Researcher',
                biography='PhD candidate at MIT focusing on neurodegenerative therapeutic design and genomic mapping.',
                photo_url='https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
                current_lat=42.3601,
                current_lng=-71.0942,
                current_location_name='MIT Koch Institute, Cambridge, MA',
                status_message='In bio genetics laboratory 🔬'
            )
            g3_spouse = Person(
                family_id=demo_family.id,
                first_name='Oliver',
                middle_name='James',
                last_name='Bennett',
                gender='male',
                date_of_birth='1994-03-22',
                date_of_death=None,
                birthplace='Seattle, WA',
                occupation='Industrial Designer',
                biography='Leads sustainable hardware product design for renewable energy storage devices.',
                photo_url='https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
                current_lat=47.6062,
                current_lng=-122.3321,
                current_location_name='Seattle Design District, WA',
                status_message='Testing solar battery prototype ⚡'
            )
            db.session.add_all([g3_user, g3_brother, g3_spouse])
            db.session.commit()

            r_p5 = Relationship(family_id=demo_family.id, person_1_id=g2_father.id, person_2_id=g3_user.id, relationship_type='parent')
            r_p6 = Relationship(family_id=demo_family.id, person_1_id=g2_mother.id, person_2_id=g3_user.id, relationship_type='parent')
            r_p7 = Relationship(family_id=demo_family.id, person_1_id=g2_father.id, person_2_id=g3_brother.id, relationship_type='parent')
            r_p8 = Relationship(family_id=demo_family.id, person_1_id=g2_mother.id, person_2_id=g3_brother.id, relationship_type='parent')
            r_g3_spouse = Relationship(family_id=demo_family.id, person_1_id=g3_user.id, person_2_id=g3_spouse.id, relationship_type='spouse')
            db.session.add_all([r_p5, r_p6, r_p7, r_p8, r_g3_spouse])
            db.session.commit()

            # Generation 4 (Children)
            g4_child = Person(
                family_id=demo_family.id,
                first_name='Clara',
                middle_name='Mae',
                last_name='Sterling-Bennett',
                gender='female',
                date_of_birth='2024-01-15',
                date_of_death=None,
                birthplace='Boston, MA',
                occupation='Student / Child',
                biography='The newest addition to the Sterling family lineage.',
                photo_url='https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
                current_lat=41.3150,
                current_lng=69.2820,
                current_location_name='Magic City Park, Tashkent',
                status_message='Walking with family 🎠'
            )
            db.session.add(g4_child)
            db.session.commit()

            r_p9 = Relationship(family_id=demo_family.id, person_1_id=g3_user.id, person_2_id=g4_child.id, relationship_type='parent')
            r_p10 = Relationship(family_id=demo_family.id, person_1_id=g3_spouse.id, person_2_id=g4_child.id, relationship_type='parent')
            db.session.add_all([r_p9, r_p10])
            db.session.commit()

            # Location history breadcrumbs for Eleanor
            histories = [
                LocationHistory(person_id=g3_user.id, latitude=41.3000, longitude=69.2400, location_name="Tashkent Airport", status_message="Arrived in Tashkent"),
                LocationHistory(person_id=g3_user.id, latitude=41.3050, longitude=69.2600, location_name="Grand Hotel Tashkent", status_message="Checked in"),
                LocationHistory(person_id=g3_user.id, latitude=41.31108, longitude=69.2797, location_name="Tashkent City Park", status_message="Coding & enjoying coffee ☕"),
            ]
            db.session.add_all(histories)
            db.session.commit()
            print("[*] Demo Family Tree created successfully with 4 generations!")

    except Exception as e:
        db.session.rollback()
        print(f"[!] Auto-seeding notice: {e}")
