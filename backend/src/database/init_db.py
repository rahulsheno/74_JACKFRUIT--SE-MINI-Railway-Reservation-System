import json
import os
from backend.src.database.db_session import engine, Base, SessionLocal
from backend.src.database.models import StationModel, TrainModel, BookingModel, CancellationModel, SeatLockModel
from backend.src.database.seed_data import STATIONS, STATION_FACILITIES, TRAINS

def initialize_database():
    """Create all SQLite tables and seed initial railway catalog if empty."""
    print("Initializing SQLite database with SQLAlchemy...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Stations
        existing_stations = db.query(StationModel).count()
        if existing_stations == 0:
            print("Seeding railway stations into SQLite...")
            for code, data in STATIONS.items():
                facilities = STATION_FACILITIES.get(code, {})
                station_entry = StationModel(
                    code=code,
                    name=data["name"],
                    zone=data["zone"],
                    facilities_json=json.dumps(facilities)
                )
                db.add(station_entry)
            db.commit()
            print(f"Seeded {len(STATIONS)} stations.")
        else:
            print(f"Stations already present ({existing_stations} records).")

        # 2. Seed Trains
        existing_trains = db.query(TrainModel).count()
        if existing_trains == 0:
            print("Seeding railway train catalog into SQLite...")
            for train in TRAINS:
                train_entry = TrainModel(
                    train_number=train["train_number"],
                    train_name=train["train_name"],
                    train_type=train["train_type"],
                    source=train["source"],
                    destination=train["destination"],
                    departure_time=train["departure_time"],
                    arrival_time=train["arrival_time"],
                    distance_km=train["distance_km"],
                    days_of_run_json=json.dumps(train["days_of_run"]),
                    available_classes_json=json.dumps(train["available_classes"]),
                    halts_json=json.dumps(train["halts"])
                )
                db.add(train_entry)
            db.commit()
            print(f"Seeded {len(TRAINS)} trains.")
        else:
            print(f"Trains already present ({existing_trains} records).")

        print("SQLite Database initialized successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    initialize_database()

