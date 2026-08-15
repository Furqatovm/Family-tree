from app.extensions import db
from app.models.person import Person

class PersonRepository:
    @staticmethod
    def get_by_id(person_id):
        return Person.query.get(person_id)

    @staticmethod
    def get_all_by_family(family_id):
        return Person.query.filter_by(family_id=family_id).order_by(Person.created_at.asc()).all()

    @staticmethod
    def create(family_id, first_name, last_name, gender, middle_name=None, date_of_birth=None, date_of_death=None, birthplace=None, occupation=None, biography=None, photo_url=None, current_lat=None, current_lng=None, current_location_name=None, status_message=None):
        lat_float = None
        lng_float = None
        if current_lat is not None and str(current_lat).strip() != '':
            try:
                lat_float = float(current_lat)
            except (ValueError, TypeError):
                lat_float = None

        if current_lng is not None and str(current_lng).strip() != '':
            try:
                lng_float = float(current_lng)
            except (ValueError, TypeError):
                lng_float = None

        person = Person(
            family_id=family_id,
            first_name=first_name,
            middle_name=middle_name or None,
            last_name=last_name,
            gender=gender or 'other',
            date_of_birth=date_of_birth or None,
            date_of_death=date_of_death or None,
            birthplace=birthplace or None,
            occupation=occupation or None,
            biography=biography or None,
            photo_url=photo_url or None,
            current_lat=lat_float,
            current_lng=lng_float,
            current_location_name=current_location_name or None,
            status_message=status_message or None
        )
        db.session.add(person)
        db.session.commit()

        if lat_float is not None and lng_float is not None:
            from app.models.location_history import LocationHistory
            history = LocationHistory(
                person_id=person.id,
                latitude=lat_float,
                longitude=lng_float,
                location_name=current_location_name,
                status_message=status_message
            )
            db.session.add(history)
            db.session.commit()

        return person

    @staticmethod
    def update_location(person, lat, lng, location_name=None, status_message=None):
        from datetime import datetime
        from app.models.location_history import LocationHistory

        person.current_lat = lat
        person.current_lng = lng
        if location_name is not None:
            person.current_location_name = location_name
        if status_message is not None:
            person.status_message = status_message
        person.last_location_update = datetime.utcnow()

        history = LocationHistory(
            person_id=person.id,
            latitude=lat,
            longitude=lng,
            location_name=person.current_location_name,
            status_message=person.status_message,
            recorded_at=person.last_location_update
        )
        db.session.add(history)
        db.session.commit()
        return person

    @staticmethod
    def get_location_history(person_id, limit=50):
        from app.models.location_history import LocationHistory
        return LocationHistory.query.filter_by(person_id=person_id).order_by(LocationHistory.recorded_at.asc()).limit(limit).all()

    @staticmethod
    def update(person, data):
        for key, value in data.items():
            if hasattr(person, key):
                if key in ['current_lat', 'current_lng']:
                    try:
                        val_float = float(value) if value is not None and str(value).strip() != '' else None
                    except (ValueError, TypeError):
                        val_float = None
                    setattr(person, key, val_float)
                else:
                    val_cleaned = None if (isinstance(value, str) and value.strip() == '') else value
                    setattr(person, key, val_cleaned)
        db.session.commit()
        return person

    @staticmethod
    def delete(person):
        from app.models.location_history import LocationHistory
        from app.models.relationship import Relationship
        LocationHistory.query.filter_by(person_id=person.id).delete()
        Relationship.query.filter((Relationship.person_1_id == person.id) | (Relationship.person_2_id == person.id)).delete()
        db.session.delete(person)
        db.session.commit()
