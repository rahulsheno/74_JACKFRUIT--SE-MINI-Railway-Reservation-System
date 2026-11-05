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

        t_num = train_number.strip()
        train = next((t for t in self.catalog.trains if t["train_number"] == t_num), None)
        if not train:
            raise ValueError(f"Train {train_number} not found.")

        src = source.strip().upper()
        dst = destination.strip().upper()
        halt_codes = [h["station_code"] for h in train["halts"]]
        if src not in halt_codes or dst not in halt_codes:
            raise ValueError("Invalid source or destination for selected train.")

        src_idx = halt_codes.index(src)
        dst_idx = halt_codes.index(dst)
        if src_idx >= dst_idx:
            raise ValueError("Destination station must appear after source station on the train route.")

        distance_km = train["halts"][dst_idx]["distance_km"] - train["halts"][src_idx]["distance_km"]
        c_class = coach_class.strip().upper()
        norm_quota = quota.strip().upper()

        # Check if train is superfast
        t_type = train.get("train_type", "").lower()
        is_sf = ("superfast" in t_type) or ("rajdhani" in t_type) or ("shatabdi" in t_type)

        booked_passengers = []
        total_fare = 0.0

        for p in passengers:
            pref = p.get("berth_preference")
            req_seat = p.get("seat_number")
            concession = p.get("concession_type", "NONE")
            
            # Allocate seat
            alloc = self.seat_engine.allocate_best_seat(
                train_number=t_num,
                journey_date=journey_date,
                coach_class=c_class,
                preference=pref,
                requested_seat_number=req_seat,
                user_id=user_id
            )
            
            # Calculate individual fare
            fare_info = self.fare_calc.calculate_fare(
                distance_km=distance_km,
                coach_class=c_class,
                concession_type=concession,
                quota=norm_quota,
                is_superfast=is_sf
            )
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

        # Simulate payment transaction
        payment = self.fare_calc.simulate_payment(total_fare)
        pnr = self._generate_pnr()

        all_cnf = all(p["status"] == "CNF" for p in booked_passengers)
        booking_status = "CONFIRMED" if all_cnf else "PARTIAL/WAITLISTED"

        booking_record = {
            "pnr": pnr,
            "user_id": user_id,
            "train_number": t_num,
            "train_name": train["train_name"],
            "source": src,
            "destination": dst,
            "journey_date": journey_date,
            "coach_class": c_class,
            "quota": norm_quota,
            "passengers": booked_passengers,
            "total_fare": total_fare,
            "booking_status": booking_status,
            "payment": payment,
            "booked_at": time.time(),
            "departure_time": train["halts"][src_idx]["dep"],
            "arrival_time": train["halts"][dst_idx]["dep"]
        }

        self.bookings[pnr] = booking_record
        if user_id not in self.user_history:
            self.user_history[user_id] = []
        self.user_history[user_id].append(pnr)

        return booking_record

    def get_pnr_status(self, pnr: str) -> Optional[Dict]:
        if not pnr:
            return None
        return self.bookings.get(pnr.strip())

    def get_user_bookings(self, user_id: str) -> List[Dict]:
        if not user_id:
            return []
        pnrs = self.user_history.get(user_id.strip(), [])
        return [self.bookings[p] for p in pnrs if p in self.bookings]

    def cancel_ticket(self, pnr: str, hours_before_departure: float = 49.0) -> Dict:
        """
        Cancel ticket, calculate refund, and execute cascade promotion of RAC/WL passengers.
        """
        if not pnr:
            raise ValueError("PNR is required.")
        clean_pnr = pnr.strip()
        booking = self.bookings.get(clean_pnr)
        if not booking:
            raise ValueError(f"PNR {clean_pnr} not found.")

        if booking["booking_status"] == "CANCELLED":
            raise ValueError("Ticket is already cancelled.")

        # Calculate refund
        has_cnf = any(p["status"] == "CNF" for p in booking["passengers"])
        refund_info = self.fare_calc.calculate_cancellation_refund(
            total_paid=booking["total_fare"],
            hours_before_departure=hours_before_departure,
            status="CNF" if has_cnf else "WL",
            coach_class=booking.get("coach_class", "3A")
        )

        booking["booking_status"] = "CANCELLED"
        booking["refund_details"] = refund_info
        for p in booking["passengers"]:
            p["status"] = "CANCELLED"

        # Execute Auto-promotion cascade for freed seats
        train_num = booking["train_number"]
        j_date = booking["journey_date"]
        c_class = booking["coach_class"]
        queue_key = f"{train_num}_{j_date}_{c_class}"

        for p in booking["passengers"]:
            seat_num = p.get("seat_number")
            coach = p.get("coach")
            berth_type = p.get("berth_type")

            if seat_num is not None:
                rac_queue = self.seat_engine.rac_queues.get(queue_key, [])
                if rac_queue:
                    # Promote first RAC to CNF
                    rac_queue.pop(0)
                    self._promote_passenger_to_cnf(train_num, j_date, c_class, seat_num, coach, berth_type)
                    
                    # Promote first WL to RAC
                    wl_queue = self.seat_engine.wl_queues.get(queue_key, [])
                    if wl_queue:
                        wl_queue.pop(0)
                        rac_queue.append({"status": "RAC", "position": len(rac_queue) + 1})
                        self._promote_passenger_to_rac(train_num, j_date, c_class, len(rac_queue))
                    
                    # Re-index remaining queues across all active bookings
                    self._reindex_active_queues(train_num, j_date, c_class)
                else:
                    # Make seat available again in inventory
                    if (
                        train_num in self.seat_engine.inventory
                        and j_date in self.seat_engine.inventory[train_num]
                        and c_class in self.seat_engine.inventory[train_num][j_date]
                    ):
                        seats = self.seat_engine.inventory[train_num][j_date][c_class]
                        seat = next((s for s in seats if s["seat_number"] == seat_num), None)
                        if seat:
                            seat["status"] = "AVAILABLE"

        return {
            "status": "SUCCESS",
            "pnr": clean_pnr,
            "refund": refund_info,
            "message": "Ticket successfully cancelled."
        }

    def _promote_passenger_to_cnf(self, train_num: str, j_date: str, c_class: str, seat_num: int, coach: str, berth_type: str):
        for b in self.bookings.values():
            if b.get("booking_status") == "CANCELLED":
                continue
            if b["train_number"] == train_num and b["journey_date"] == j_date and b["coach_class"] == c_class:
                for p in b["passengers"]:
                    if p["status"] == "RAC":
                        p["status"] = "CNF"
                        p["seat_number"] = seat_num
                        p["coach"] = coach
                        p["berth_type"] = berth_type
                        p["queue_position"] = None
                        if all(ps["status"] == "CNF" for ps in b["passengers"]):
                            b["booking_status"] = "CONFIRMED"
                        return

    def _promote_passenger_to_rac(self, train_num: str, j_date: str, c_class: str, rac_pos: int):
        for b in self.bookings.values():
            if b.get("booking_status") == "CANCELLED":
                continue
            if b["train_number"] == train_num and b["journey_date"] == j_date and b["coach_class"] == c_class:
                for p in b["passengers"]:
                    if p["status"] == "WL":
                        p["status"] = "RAC"
                        p["queue_position"] = rac_pos
                        return

    def _reindex_active_queues(self, train_num: str, j_date: str, c_class: str):
        """
        Re-indexes queue positions for RAC and WL passengers across all active bookings.
        """
        rac_counter = 1
        wl_counter = 1
        for b in self.bookings.values():
            if b.get("booking_status") == "CANCELLED":
                continue
            if b["train_number"] == train_num and b["journey_date"] == j_date and b["coach_class"] == c_class:
                for p in b["passengers"]:
                    if p["status"] == "RAC":
                        p["queue_position"] = rac_counter
                        rac_counter += 1
                    elif p["status"] == "WL":
                        p["queue_position"] = wl_counter
                        wl_counter += 1
