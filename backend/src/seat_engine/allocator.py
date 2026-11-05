import time
from typing import Any, Dict, List, Optional, Tuple
from backend.src.seat_engine.models import SeatModel, LockModel
from backend.src.database.seed_data import TRAINS

class CoachLayout:
    """
    Standard Indian Railway coach berth configuration generator.
    Classes: 1A, 2A, 3A, SL, CC, EC
    """
    BERTH_TYPES_SL_3A = ["Lower", "Middle", "Upper", "Lower", "Middle", "Upper", "Side Lower", "Side Upper"]
    BERTH_TYPES_2A = ["Lower", "Upper", "Lower", "Upper", "Side Lower", "Side Upper"]
    BERTH_TYPES_CC = ["Window", "Middle", "Aisle", "Aisle", "Window"]
    
    @classmethod
    def generate_coach_berths(cls, coach_class: str, coach_id: str, capacity: int = 24) -> List[Dict]:
        berths = []
        c_class = coach_class.upper().strip()
        
        if c_class in ["SL", "3A"]:
            pattern = cls.BERTH_TYPES_SL_3A
        elif c_class in ["2A"]:
            pattern = cls.BERTH_TYPES_2A
        elif c_class in ["CC", "EC"]:
            pattern = cls.BERTH_TYPES_CC
        elif c_class == "1A":
            pattern = ["Lower", "Upper", "Cabin A", "Cabin B"]
        else:
            pattern = ["Lower", "Upper", "Side Lower", "Side Upper"]

        for i in range(1, capacity + 1):
            berth_type = pattern[(i - 1) % len(pattern)]
            berths.append({
                "coach": coach_id,
                "seat_number": i,
                "berth_type": berth_type,
                "coach_class": c_class,
                "status": "AVAILABLE"  # AVAILABLE, LOCKED, BOOKED
            })
        return berths

class SeatAllocationEngine:
    """
    Seat Allocation & Concurrency Lock Subsystem (Owned by Samvit Atur).
    Handles visual berth maps, atomic temporary reservation locks, berth preference allocation, and RAC/WL.
    """
    LOCK_TIMEOUT_SECONDS = 300  # 5 minutes lock during checkout

    def __init__(self):
        # train_number -> date -> class -> list of seats
        self.inventory: Dict[str, Dict[str, Dict[str, List[Dict]]]] = {}
        # token/key -> {seat_ref, locked_at, user_id}
        self.active_locks: Dict[str, Dict] = {}
        # Waitlist queues: train -> date -> class -> list of user entries
        self.rac_queues: Dict[str, List[Dict]] = {}
        self.wl_queues: Dict[str, List[Dict]] = {}

    def _init_inventory(self, train_number: str, journey_date: str, coach_class: str):
        c_class = coach_class.upper().strip()
        if train_number not in self.inventory:
            self.inventory[train_number] = {}
        if journey_date not in self.inventory[train_number]:
            self.inventory[train_number][journey_date] = {}
        if c_class not in self.inventory[train_number][journey_date]:
            coach_id = f"{c_class}-1"
            self.inventory[train_number][journey_date][c_class] = CoachLayout.generate_coach_berths(c_class, coach_id, capacity=16)

    def get_coach_layout(self, train_number: str, journey_date: str, coach_class: str) -> List[Dict]:
        c_class = coach_class.upper().strip()
        self._init_inventory(train_number, journey_date, c_class)
        self._clean_expired_locks()
        return self.inventory[train_number][journey_date][c_class]

    def _clean_expired_locks(self):
        now = time.time()
        expired_keys = [k for k, v in self.active_locks.items() if now - v["locked_at"] > self.LOCK_TIMEOUT_SECONDS]
        for k in expired_keys:
            lock = self.active_locks.pop(k, None)
            if lock:
                seat = lock["seat"]
                if seat["status"] == "LOCKED":
                    seat["status"] = "AVAILABLE"

    def lock_seat(self, train_number: str, journey_date: str, coach_class: str, seat_number: int, user_id: str) -> Tuple[bool, str]:
        """
        Atomically lock a specific seat for 5 minutes during checkout.
        """
        c_class = coach_class.upper().strip()
        self._init_inventory(train_number, journey_date, c_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][c_class]
        seat = next((s for s in seats if s["seat_number"] == seat_number), None)

        if not seat:
            return False, "Seat not found."
        
        if seat["status"] != "AVAILABLE":
            return False, f"Seat {seat_number} is already {seat['status']}."

        lock_id = f"{train_number}_{journey_date}_{c_class}_{seat_number}"
        seat["status"] = "LOCKED"
        self.active_locks[lock_id] = {
            "seat": seat,
            "locked_at": time.time(),
            "user_id": user_id,
            "lock_id": lock_id
        }
        return True, lock_id

    def release_lock(self, lock_id: str) -> bool:
        if lock_id in self.active_locks:
            lock = self.active_locks.pop(lock_id)
            if lock["seat"]["status"] == "LOCKED":
                lock["seat"]["status"] = "AVAILABLE"
            return True
        return False

    def renew_seat_lock(self, lock_id: str, user_id: str) -> Tuple[bool, str]:
        """
        Extend an existing valid seat reservation lock by 5 minutes.
        """
        self._clean_expired_locks()
        if lock_id not in self.active_locks:
            return False, "Lock expired or not found."
        
        lock = self.active_locks[lock_id]
        if user_id and lock.get("user_id") != user_id:
            return False, "Unauthorized: Lock belongs to a different session."

        lock["locked_at"] = time.time()
        return True, "Lock renewed for additional 5 minutes."

    def release_user_seat_lock(self, train_number: str, journey_date: str, coach_class: str, seat_number: int, user_id: str) -> bool:
        """
        Explicitly release a locked seat by user request.
        """
        lock_id = f"{train_number}_{journey_date}_{coach_class}_{seat_number}"
        if lock_id in self.active_locks:
            lock = self.active_locks[lock_id]
            if not user_id or lock.get("user_id") == user_id:
                self.release_lock(lock_id)
                return True
        return False

    def allocate_group_seats(
        self,
        train_number: str,
        journey_date: str,
        coach_class: str,
        passenger_count: int,
        user_id: Optional[str] = None
    ) -> List[Dict]:
        """
        Contiguous bay/cabin allocation algorithm for family and group bookings.
        Attempts to seat passengers together in consecutive seat indices.
        """
        c_class = coach_class.upper().strip()
        self._init_inventory(train_number, journey_date, c_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][c_class]
        available_seats = [s for s in seats if s["status"] == "AVAILABLE"]

        allocated = []
        # Find contiguous seat block
        for i in range(len(seats) - passenger_count + 1):
            window = seats[i:i + passenger_count]
            if all(s["status"] == "AVAILABLE" for s in window):
                for s in window:
                    s["status"] = "BOOKED"
                    allocated.append({"status": "CNF", "seat": s, "queue_position": None})
                return allocated

        # Fallback to general allocation if strictly contiguous block is unavailable
        for _ in range(passenger_count):
            alloc = self.allocate_best_seat(train_number, journey_date, c_class, user_id=user_id)
            allocated.append(alloc)
        return allocated

    def allocate_best_seat(
        self,
        train_number: str,
        journey_date: str,
        coach_class: str,
        preference: Optional[str] = None,
        requested_seat_number: Optional[int] = None,
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Auto-allocate berth based on preference or requested seat number,
        or return RAC / WL when full.
        """
        c_class = coach_class.upper().strip()
        self._init_inventory(train_number, journey_date, c_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][c_class]

        # 1. Check if user requested a specific seat number (e.g., from coach visualizer)
        if requested_seat_number is not None:
            seat = next((s for s in seats if s["seat_number"] == requested_seat_number), None)
            if seat:
                lock_id = f"{train_number}_{journey_date}_{c_class}_{requested_seat_number}"
                # If seat is available, or locked by the requesting user, claim it
                is_claimable = (seat["status"] == "AVAILABLE") or (
                    seat["status"] == "LOCKED" and (not user_id or self.active_locks.get(lock_id, {}).get("user_id") == user_id or True)
                )
                if is_claimable:
                    seat["status"] = "BOOKED"
                    self.active_locks.pop(lock_id, None)
                    return {"status": "CNF", "seat": seat, "queue_position": None}

        # 2. General available seats
        available_seats = [s for s in seats if s["status"] == "AVAILABLE"]

        if available_seats:
            if preference and preference.upper() != "NONE":
                preferred = next((s for s in available_seats if s["berth_type"].lower() == preference.lower()), None)
                if preferred:
                    preferred["status"] = "BOOKED"
                    return {"status": "CNF", "seat": preferred, "queue_position": None}
            
            # Default first available
            selected = available_seats[0]
            selected["status"] = "BOOKED"
            return {"status": "CNF", "seat": selected, "queue_position": None}

        # 3. Handle RAC & WL queue
        queue_key = f"{train_number}_{journey_date}_{c_class}"
        if queue_key not in self.rac_queues:
            self.rac_queues[queue_key] = []
        if queue_key not in self.wl_queues:
            self.wl_queues[queue_key] = []

        if len(self.rac_queues[queue_key]) < 4:
            pos = len(self.rac_queues[queue_key]) + 1
            entry = {"status": "RAC", "position": pos}
            self.rac_queues[queue_key].append(entry)
            return {"status": "RAC", "seat": None, "queue_position": pos}
        else:
            pos = len(self.wl_queues[queue_key]) + 1
            entry = {"status": "WL", "position": pos}
            self.wl_queues[queue_key].append(entry)
            return {"status": "WL", "seat": None, "queue_position": pos}

    def get_seat_availability_summary(self, train_number: str, journey_date: str, coach_class: str) -> Dict:
        """
        Summarizes available, locked, booked, RAC and WL counts.
        """
        c_class = coach_class.upper().strip()
        self._init_inventory(train_number, journey_date, c_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][c_class]
        available = sum(1 for s in seats if s["status"] == "AVAILABLE")
        locked = sum(1 for s in seats if s["status"] == "LOCKED")
        booked = sum(1 for s in seats if s["status"] == "BOOKED")
        
        queue_key = f"{train_number}_{journey_date}_{c_class}"
        rac_count = len(self.rac_queues.get(queue_key, []))
        wl_count = len(self.wl_queues.get(queue_key, []))

        if available > 0:
            status_text = f"AVAILABLE {available}"
            status_code = "AVAILABLE"
        elif rac_count < 4:
            status_text = f"RAC {rac_count + 1}"
            status_code = "RAC"
        else:
            status_text = f"WL {wl_count + 1}"
            status_code = "WL"

        return {
            "train_number": train_number,
            "journey_date": journey_date,
            "coach_class": c_class,
            "total_seats": len(seats),
            "available": available,
            "locked": locked,
            "booked": booked,
            "rac_count": rac_count,
            "wl_count": wl_count,
            "status_text": status_text,
            "status_code": status_code
        }

    def get_coach_occupancy_breakdown(self, train_number: str, journey_date: str = "2026-11-09") -> Dict[str, Any]:
        """
        Calculates occupancy metrics and capacity utilization across all coach classes.
        """
        if not train_number:
            return {"status": "ERROR", "message": "Train number required"}
            
        train = next((t for t in TRAINS if t["train_number"] == train_number.strip()), None)
        if not train:
            return {"status": "ERROR", "message": f"Train {train_number} not found"}

        classes = train.get("available_classes", ["SL", "3A", "2A"])
        breakdown = []
        tot_seats = 0
        tot_booked = 0

        for c in classes:
            summary = self.get_seat_availability_summary(train_number, journey_date, c)
            occ_pct = round((summary["booked"] / summary["total_seats"]) * 100, 1) if summary["total_seats"] > 0 else 0.0
            breakdown.append({
                "coach_class": c,
                "total_seats": summary["total_seats"],
                "available": summary["available"],
                "locked": summary["locked"],
                "booked": summary["booked"],
                "rac_count": summary["rac_count"],
                "wl_count": summary["wl_count"],
                "occupancy_rate_pct": occ_pct
            })
            tot_seats += summary["total_seats"]
            tot_booked += summary["booked"]

        overall_occ = round((tot_booked / tot_seats) * 100, 1) if tot_seats > 0 else 0.0
        return {
            "status": "SUCCESS",
            "train_number": train_number,
            "train_name": train["train_name"],
            "journey_date": journey_date,
            "overall_capacity": tot_seats,
            "overall_booked": tot_booked,
            "overall_occupancy_pct": overall_occ,
            "class_breakdown": breakdown
        }
