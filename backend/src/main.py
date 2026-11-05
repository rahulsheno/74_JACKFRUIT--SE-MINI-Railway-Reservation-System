from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional
import os

from backend.src.train_service.catalog import TrainCatalogService
from backend.src.seat_engine.allocator import SeatAllocationEngine
from backend.src.fare_calculator.calculator import FareCalculatorService
from backend.src.booking_lifecycle.lifecycle import BookingLifecycleService

app = FastAPI(
    title="Railway Ticket Reservation System (RRS)",
    description="Topic 74 - Jackfruit SE Mini-Project REST API",
    version="1.0.0"
)

# Enable CORS for browser frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core domain services
catalog_service = TrainCatalogService()
seat_engine = SeatAllocationEngine()
fare_calculator = FareCalculatorService()
booking_service = BookingLifecycleService(catalog_service, seat_engine, fare_calculator)

# ----------------- PYDANTIC REQUEST SCHEMAS -----------------
class PassengerSchema(BaseModel):
    name: str
    age: int
    gender: Optional[str] = "M"
    berth_preference: Optional[str] = None
    seat_number: Optional[int] = None
    concession_type: Optional[str] = "NONE"

class BookingRequest(BaseModel):
    user_id: str
    train_number: str
    journey_date: str
    source: str
    destination: str
    coach_class: str
    quota: Optional[str] = "GENERAL"
    passengers: List[PassengerSchema]

class SeatLockRequest(BaseModel):
    train_number: str
    journey_date: str
    coach_class: str
    seat_number: int
    user_id: str

class SeatUnlockRequest(BaseModel):
    train_number: str
    journey_date: str
    coach_class: str
    seat_number: int
    user_id: Optional[str] = None

class SeatRenewRequest(BaseModel):
    lock_id: str
    user_id: Optional[str] = None

class CancellationRequest(BaseModel):
    pnr: str
    hours_before_departure: Optional[float] = 50.0

# ----------------- 1. TRAIN CATALOG ENDPOINTS (SABBIR) -----------------
@app.get("/api/stations", tags=["Train Catalog - Sabbir"])
def get_stations():
    return catalog_service.get_all_stations()

@app.get("/api/trains", tags=["Train Catalog - Sabbir"])
def get_all_trains():
    return catalog_service.get_all_trains()

@app.get("/api/trains/search", tags=["Train Catalog - Sabbir"])
def search_trains(source: str, destination: str, travel_date: Optional[str] = None):
    results = catalog_service.search_trains(source, destination, travel_date)
    return {"count": len(results), "trains": results}

@app.get("/api/trains/{train_number}/schedule", tags=["Train Catalog - Sabbir"])
def get_train_schedule(train_number: str):
    schedule = catalog_service.get_train_schedule(train_number)
    if not schedule:
        raise HTTPException(status_code=404, detail="Train schedule not found")
    return schedule

@app.get("/api/stations/{station_code}/facilities", tags=["Train Catalog - Sabbir"])
def get_station_facilities(station_code: str):
    fac = catalog_service.get_station_facilities(station_code)
    if not fac:
        raise HTTPException(status_code=404, detail="Station facilities not found")
    return fac

@app.get("/api/trains/{train_number}/live-tracking", tags=["Train Catalog - Sabbir"])
def get_live_gps_tracking(train_number: str):
    tracking = catalog_service.get_live_gps_tracking(train_number)
    if not tracking or tracking.get("status") == "ERROR":
        raise HTTPException(status_code=404, detail="Train GPS tracking telemetry unavailable")
    return tracking

# ----------------- 2. SEAT LAYOUT & LOCKING (SAMVIT) -----------------
@app.get("/api/seats/layout", tags=["Seat Allocation Engine - Samvit"])
def get_coach_layout(train_number: str, journey_date: str, coach_class: str):
    layout = seat_engine.get_coach_layout(train_number, journey_date, coach_class)
    return {"train_number": train_number, "coach_class": coach_class, "seats": layout}

@app.get("/api/seats/availability", tags=["Seat Allocation Engine - Samvit"])
def get_seat_availability(train_number: str, journey_date: str, coach_class: str):
    return seat_engine.get_seat_availability_summary(train_number, journey_date, coach_class)

@app.post("/api/seats/lock", tags=["Seat Allocation Engine - Samvit"])
def lock_seat(req: SeatLockRequest):
    ok, result = seat_engine.lock_seat(req.train_number, req.journey_date, req.coach_class, req.seat_number, req.user_id)
    if not ok:
        raise HTTPException(status_code=400, detail=result)
    return {"status": "SUCCESS", "lock_id": result, "message": "Seat locked for 5 minutes"}

@app.delete("/api/seats/unlock/{lock_id}", tags=["Seat Allocation Engine - Samvit"])
def release_seat_lock(lock_id: str):
    ok = seat_engine.release_lock(lock_id)
    return {"status": "SUCCESS" if ok else "NOT_FOUND"}

@app.post("/api/seats/unlock", tags=["Seat Allocation Engine - Samvit"])
def release_user_seat(req: SeatUnlockRequest):
    ok = seat_engine.release_user_seat_lock(req.train_number, req.journey_date, req.coach_class, req.seat_number, req.user_id or "")
    if not ok:
        raise HTTPException(status_code=400, detail="Seat was not locked or already released")
    return {"status": "SUCCESS", "message": f"Seat {req.seat_number} unlocked"}

@app.post("/api/seats/lock/renew", tags=["Seat Allocation Engine - Samvit"])
def renew_seat_lock(req: SeatRenewRequest):
    ok, msg = seat_engine.renew_seat_lock(req.lock_id, req.user_id or "")
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "SUCCESS", "message": msg}

# ----------------- 3. FARE CALCULATION & CONCESSIONS (VINAYAK) -----------------
@app.get("/api/fare/calculate", tags=["Fare Engine - Vinayak"])
def calculate_fare(
    distance_km: float,
    coach_class: str,
    concession_type: str = "NONE",
    quota: str = "GENERAL",
    is_superfast: bool = True
):
    try:
        fare = fare_calculator.calculate_fare(
            distance_km=distance_km,
            coach_class=coach_class,
            concession_type=concession_type,
            quota=quota,
            is_superfast=is_superfast
        )
        return fare
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/fare/refund-estimate", tags=["Fare Engine - Vinayak"])
def estimate_cancellation_refund(
    total_paid: float,
    hours_before_departure: float = 48.0,
    coach_class: str = "3A",
    status: str = "CNF"
):
    try:
        return fare_calculator.calculate_cancellation_refund(
            total_paid=total_paid,
            hours_before_departure=hours_before_departure,
            status=status,
            coach_class=coach_class
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- 4. BOOKING LIFECYCLE & PNR TRACKING (RAHUL) -----------------
@app.post("/api/bookings", tags=["Booking Lifecycle - Rahul"])
def book_ticket(req: BookingRequest):
    try:
        passengers_data = [p.model_dump() for p in req.passengers]
        booking = booking_service.book_ticket(
            user_id=req.user_id,
            train_number=req.train_number,
            journey_date=req.journey_date,
            source=req.source,
            destination=req.destination,
            coach_class=req.coach_class,
            passengers=passengers_data,
            quota=req.quota or "GENERAL"
        )
        return booking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/pnr/{pnr}", tags=["Booking Lifecycle - Rahul"])
def get_pnr_status(pnr: str):
    booking = booking_service.get_pnr_status(pnr)
    if not booking:
        raise HTTPException(status_code=404, detail="PNR not found")
    return booking

@app.get("/api/users/{user_id}/bookings", tags=["Booking Lifecycle - Rahul"])
def get_user_history(user_id: str):
    return booking_service.get_user_bookings(user_id)

@app.post("/api/bookings/cancel", tags=["Booking Lifecycle - Rahul"])
def cancel_ticket(req: CancellationRequest):
    try:
        res = booking_service.cancel_ticket(req.pnr, req.hours_before_departure or 50.0)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Mount Frontend Static Assets
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
