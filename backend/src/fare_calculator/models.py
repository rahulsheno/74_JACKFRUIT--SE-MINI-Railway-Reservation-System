from dataclasses import dataclass
from typing import Optional, Dict

@dataclass
class FareBreakdownModel:
    distance_km: float
    coach_class: str
    base_fare: float
    concession_type: str
    discount_amount: float
    quota: str
    tatkal_surcharge: float
    superfast_surcharge: float
    gst: float
    total_fare: float

@dataclass
class RefundEstimateModel:
    total_paid: float
    cancellation_charge: float
    refund_amount: float
    hours_before_departure: float
    reason: str

