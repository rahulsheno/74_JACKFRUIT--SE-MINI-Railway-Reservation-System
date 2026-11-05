from dataclasses import dataclass
from typing import Optional, List

@dataclass
class SeatModel:
    coach: str
    seat_number: int
    berth_type: str
    coach_class: str
    status: str  # AVAILABLE, LOCKED, BOOKED

@dataclass
class LockModel:
    lock_id: str
    seat_number: int
    user_id: str
    locked_at: float
    expires_at: float

