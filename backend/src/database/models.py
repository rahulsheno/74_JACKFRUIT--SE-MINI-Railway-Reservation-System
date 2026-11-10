import json
import time
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, ForeignKey
from backend.src.database.db_session import Base

class StationModel(Base):
    __tablename__ = "stations"

    code = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone = Column(String(10), nullable=False)
    facilities_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "code": self.code,
            "name": self.name,
            "zone": self.zone,
            "facilities": json.loads(self.facilities_json) if self.facilities_json else {}
        }


class TrainModel(Base):
    __tablename__ = "trains"

    train_number = Column(String(10), primary_key=True, index=True)
    train_name = Column(String(100), nullable=False)
    train_type = Column(String(50), nullable=False)
    source = Column(String(10), nullable=False, index=True)
    destination = Column(String(10), nullable=False, index=True)
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    distance_km = Column(Integer, nullable=False)
    days_of_run_json = Column(Text, nullable=False)
    available_classes_json = Column(Text, nullable=False)
    halts_json = Column(Text, nullable=False)

    def to_dict(self):
        return {
            "train_number": self.train_number,
            "train_name": self.train_name,
            "train_type": self.train_type,
            "source": self.source,
            "destination": self.destination,
            "departure_time": self.departure_time,
            "arrival_time": self.arrival_time,
            "distance_km": self.distance_km,
            "days_of_run": json.loads(self.days_of_run_json) if self.days_of_run_json else [],
            "available_classes": json.loads(self.available_classes_json) if self.available_classes_json else [],
            "halts": json.loads(self.halts_json) if self.halts_json else []
        }


class BookingModel(Base):
    __tablename__ = "bookings"

    pnr = Column(String(10), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    train_number = Column(String(10), nullable=False, index=True)
    train_name = Column(String(100), nullable=False)
    source = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    journey_date = Column(String(20), nullable=False)
    coach_class = Column(String(10), nullable=False)
    quota = Column(String(20), default="GENERAL")
    total_fare = Column(Float, nullable=False)
    booking_status = Column(String(30), default="CONFIRMED")
    booked_at = Column(Float, default=time.time)
    departure_time = Column(String(10), nullable=True)
    arrival_time = Column(String(10), nullable=True)
    passengers_json = Column(Text, nullable=False)
    payment_json = Column(Text, nullable=True)
    refund_details_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "pnr": self.pnr,
            "user_id": self.user_id,
            "train_number": self.train_number,
            "train_name": self.train_name,
            "source": self.source,
            "destination": self.destination,
            "journey_date": self.journey_date,
            "coach_class": self.coach_class,
            "quota": self.quota,
            "total_fare": self.total_fare,
            "booking_status": self.booking_status,
            "booked_at": self.booked_at,
            "departure_time": self.departure_time,
            "arrival_time": self.arrival_time,
            "passengers": json.loads(self.passengers_json) if self.passengers_json else [],
            "payment": json.loads(self.payment_json) if self.payment_json else {},
            "refund_details": json.loads(self.refund_details_json) if self.refund_details_json else None
        }


class CancellationModel(Base):
    __tablename__ = "cancellations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pnr = Column(String(10), ForeignKey("bookings.pnr"), nullable=False, index=True)
    cancelled_at = Column(Float, default=time.time)
    hours_before_departure = Column(Float, nullable=False)
    clerkage_charge = Column(Float, nullable=False)
    refund_amount = Column(Float, nullable=False)
    refund_id = Column(String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "pnr": self.pnr,
            "cancelled_at": self.cancelled_at,
            "hours_before_departure": self.hours_before_departure,
            "clerkage_charge": self.clerkage_charge,
            "refund_amount": self.refund_amount,
            "refund_id": self.refund_id
        }


class SeatLockModel(Base):
    __tablename__ = "seat_locks"

    lock_id = Column(String(50), primary_key=True)
    train_number = Column(String(10), nullable=False, index=True)
    journey_date = Column(String(20), nullable=False)
    coach = Column(String(10), nullable=False)
    seat_number = Column(Integer, nullable=False)
    user_id = Column(String(100), nullable=False)
    locked_at = Column(Float, nullable=False)
    expires_at = Column(Float, nullable=False)

