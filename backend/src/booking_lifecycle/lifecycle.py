import random
import time
from typing import Dict, List, Optional
from backend.src.train_service.catalog import TrainCatalogService
from backend.src.seat_engine.allocator import SeatAllocationEngine
from backend.src.fare_calculator.calculator import FareCalculatorService

class BookingLifecycleService:
    """
    Booking Lifecycle, PNR Generator & Cascade Cancellation Subsystem (Owned by Rahul Shenoy).
    Manages end-to-end ticket issuance, 10-digit cryptographic PNR generation, real-time PNR tracking,
    and automated waitlist promotion cascade on cancellation.
    """
    def __init__(
        self,
        train_catalog: Optional[TrainCatalogService] = None,
        seat_engine: Optional[SeatAllocationEngine] = None,
        fare_calculator: Optional[FareCalculatorService] = None
    ):
        self.catalog = train_catalog or TrainCatalogService()
        self.seat_engine = seat_engine or SeatAllocationEngine()
        self.fare_calc = fare_calculator or FareCalculatorService()
        
        # PNR -> Booking details
        self.bookings: Dict[str, Dict] = {}
        # User ID -> list of PNRs
        self.user_history: Dict[str, List[str]] = {}

    def _generate_pnr(self) -> str:
        """
        Generate unique 10-digit CRIS/IRCTC compliant PNR number.
        Zone prefix (3 digits) + 7-digit random identifier.
        """
        while True:
            pnr = f"4{random.randint(10, 99)}{random.randint(1000000, 9999999)}"
            if pnr not in self.bookings:
                return pnr

    def book_ticket(
        self,
        user_id: str,
        train_number: str,
        journey_date: str,
        source: str,
        destination: str,
        coach_class: str,
        passengers: List[Dict],
        quota: str = "GENERAL"
    ) -> Dict:
        """
        Create confirmed or waitlisted booking with seat allocation and fare breakdown.
        """
        if not passengers:
            raise ValueError("At least one passenger is required to book a ticket.")

        # 1. Resolve distance from train schedule
        train = next((t for t in self.catalog.trains if t["train_number"] == train_number), None)
        if not train:
            raise ValueError(f"Train {train_number} not found.")

        halt_codes = [h["station_code"] for h in train["halts"]]
        if source not in halt_codes or destination not in halt_codes:
            raise ValueError("Invalid source or destination for selected train.")

        src_idx = halt_codes.index(source)
        dst_idx = halt_codes.index(destination)
        distance_km = train["halts"][dst_idx]["distance_km"] - train["halts"][src_idx]["distance_km"]

        # 2. Process each passenger (seat allocation & fare)
        booked_passengers = []
        total_fare = 0.0

        for p in passengers:
            pref = p.get("berth_preference")
            concession = p.get("concession_type", "NONE")
            
            # Allocate seat
            alloc = self.seat_engine.allocate_best_seat(train_number, journey_date, coach_class, pref)
            
            # Calculate individual fare
            fare_info = self.fare_calc.calculate_fare(distance_km, coach_class, concession, quota)
            total_fare += fare_info["total_fare"]

            booked_passengers.append({
                "name": p["name"],
                "age": p["age"],
                "gender": p.get("gender", "M"),
                "status": alloc["status"],
                "coach": alloc["seat"]["coach"] if alloc["seat"] else None,
                "seat_number": alloc["seat"]["seat_number"] if alloc["seat"] else None,
                "berth_type": alloc["seat"]["berth_type"] if alloc["seat"] else None,
                "queue_position": alloc.get("queue_position"),
                "fare": fare_info["total_fare"],
                "concession_type": concession
            })

        # 3. Simulate payment transaction
        payment = self.fare_calc.simulate_payment(total_fare)
        pnr = self._generate_pnr()

        booking_record = {
            "pnr": pnr,
            "user_id": user_id,
            "train_number": train_number,
            "train_name": train["train_name"],
            "source": source,
            "destination": destination,
            "journey_date": journey_date,
            "coach_class": coach_class,
            "passengers": booked_passengers,
            "total_fare": total_fare,
            "booking_status": "CONFIRMED" if all(p["status"] == "CNF" for p in booked_passengers) else "PARTIAL/WAITLISTED",
            "payment": payment,
            "booked_at": time.time()
        }

        self.bookings[pnr] = booking_record
        if user_id not in self.user_history:
            self.user_history[user_id] = []
        self.user_history[user_id].append(pnr)

        return booking_record

    def get_pnr_status(self, pnr: str) -> Optional[Dict]:
        return self.bookings.get(pnr)

    def get_user_bookings(self, user_id: str) -> List[Dict]:
        pnrs = self.user_history.get(user_id, [])
        return [self.bookings[p] for p in pnrs if p in self.bookings]

    def cancel_ticket(self, pnr: str, hours_before_departure: float = 49.0) -> Dict:
        """
        Cancel ticket, calculate refund, and execute cascade promotion of RAC/WL passengers.
        """
        booking = self.bookings.get(pnr)
        if not booking:
            raise ValueError(f"PNR {pnr} not found.")

        if booking["booking_status"] == "CANCELLED":
            raise ValueError("Ticket is already cancelled.")

        # Calculate refund
        refund_info = self.fare_calc.calculate_cancellation_refund(
            booking["total_fare"],
            hours_before_departure,
            status="CNF" if any(p["status"] == "CNF" for p in booking["passengers"]) else "WL"
        )

        booking["booking_status"] = "CANCELLED"
        booking["refund_details"] = refund_info

        # Execute Auto-promotion cascade for freed seats
        for p in booking["passengers"]:
            if p["status"] == "CNF" and p["seat_number"] is not None:
                # Release seat status in inventory
                train_num = booking["train_number"]
                j_date = booking["journey_date"]
                c_class = booking["coach_class"]
                
                # Check RAC promotion
                queue_key = f"{train_num}_{j_date}_{c_class}"
                rac_queue = self.seat_engine.rac_queues.get(queue_key, [])
                if rac_queue:
                    # Promote first RAC to CNF
                    promoted_rac = rac_queue.pop(0)
                    self._promote_passenger_to_cnf(train_num, j_date, c_class, p["seat_number"], p["coach"], p["berth_type"])
                    
                    # Promote first WL to RAC
                    wl_queue = self.seat_engine.wl_queues.get(queue_key, [])
                    if wl_queue:
                        promoted_wl = wl_queue.pop(0)
                        rac_queue.append({"status": "RAC", "position": len(rac_queue) + 1})
                        self._promote_passenger_to_rac(train_num, j_date, c_class, len(rac_queue))
                else:
                    # Make seat available again
                    seats = self.seat_engine.inventory[train_num][j_date][c_class]
                    seat = next((s for s in seats if s["seat_number"] == p["seat_number"]), None)
                    if seat:
                        seat["status"] = "AVAILABLE"

        return {
            "status": "SUCCESS",
            "pnr": pnr,
            "refund": refund_info,
            "message": "Ticket successfully cancelled."
        }

    def _promote_passenger_to_cnf(self, train_num: str, j_date: str, c_class: str, seat_num: int, coach: str, berth_type: str):
        for b in self.bookings.values():
            if b["train_number"] == train_num and b["journey_date"] == j_date and b["coach_class"] == c_class:
                for p in b["passengers"]:
                    if p["status"] == "RAC":
                        p["status"] = "CNF"
                        p["seat_number"] = seat_num
                        p["coach"] = coach
                        p["berth_type"] = berth_type
                        p["queue_position"] = None
                        return

    def _promote_passenger_to_rac(self, train_num: str, j_date: str, c_class: str, rac_pos: int):
        for b in self.bookings.values():
            if b["train_number"] == train_num and b["journey_date"] == j_date and b["coach_class"] == c_class:
                for p in b["passengers"]:
                    if p["status"] == "WL":
                        p["status"] = "RAC"
                        p["queue_position"] = rac_pos
                        return
