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
        person = Person(
            family_id=family_id,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            gender=gender,
            date_of_birth=date_of_birth,
            date_of_death=date_of_death,
            birthplace=birthplace,
            occupation=occupation,
            biography=biography,
            photo_url=photo_url,
            current_lat=current_lat,
            current_lng=current_lng,
            current_location_name=current_location_name,
            status_message=status_message
        )
        db.session.add(person)
        db.session.commit()

        if current_lat is not None and current_lng is not None:
            from app.models.location_history import LocationHistory
            history = LocationHistory(
                person_id=person.id,
                latitude=current_lat,
                longitude=current_lng,
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
                setattr(person, key, value)
        db.session.commit()
        return person

    @staticmethod
    def delete(person):
        db.session.delete(person)
        db.session.commit()
