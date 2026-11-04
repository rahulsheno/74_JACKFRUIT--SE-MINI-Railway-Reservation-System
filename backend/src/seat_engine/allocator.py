import time
from typing import Dict, List, Optional, Tuple

class CoachLayout:
    """
    Standard Indian Railway coach berth configuration generator.
    Classes: 1A, 2A, 3A, SL, CC
    """
    BERTH_TYPES_SL_3A = ["Lower", "Middle", "Upper", "Lower", "Middle", "Upper", "Side Lower", "Side Upper"]
    BERTH_TYPES_2A = ["Lower", "Upper", "Lower", "Upper", "Side Lower", "Side Upper"]
    
    @classmethod
    def generate_coach_berths(cls, coach_class: str, coach_id: str, capacity: int = 24) -> List[Dict]:
        berths = []
        pattern = cls.BERTH_TYPES_SL_3A if coach_class in ["SL", "3A"] else cls.BERTH_TYPES_2A
        if coach_class == "1A":
            pattern = ["Lower", "Upper", "Cabin A", "Cabin B"]

        for i in range(1, capacity + 1):
            berth_type = pattern[(i - 1) % len(pattern)]
            berths.append({
                "coach": coach_id,
                "seat_number": i,
                "berth_type": berth_type,
                "coach_class": coach_class,
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
        if train_number not in self.inventory:
            self.inventory[train_number] = {}
        if journey_date not in self.inventory[train_number]:
            self.inventory[train_number][journey_date] = {}
        if coach_class not in self.inventory[train_number][journey_date]:
            coach_id = f"{coach_class}-1"
            self.inventory[train_number][journey_date][coach_class] = CoachLayout.generate_coach_berths(coach_class, coach_id, capacity=16)

    def get_coach_layout(self, train_number: str, journey_date: str, coach_class: str) -> List[Dict]:
        self._init_inventory(train_number, journey_date, coach_class)
        self._clean_expired_locks()
        return self.inventory[train_number][journey_date][coach_class]

    def _clean_expired_locks(self):
        now = time.time()
        expired_keys = [k for k, v in self.active_locks.items() if now - v["locked_at"] > self.LOCK_TIMEOUT_SECONDS]
        for k in expired_keys:
            lock = self.active_locks.pop(k)
            seat = lock["seat"]
            if seat["status"] == "LOCKED":
                seat["status"] = "AVAILABLE"

    def lock_seat(self, train_number: str, journey_date: str, coach_class: str, seat_number: int, user_id: str) -> Tuple[bool, str]:
        """
        Atomically lock a specific seat for 5 minutes during checkout.
        """
        self._init_inventory(train_number, journey_date, coach_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][coach_class]
        seat = next((s for s in seats if s["seat_number"] == seat_number), None)

        if not seat:
            return False, "Seat not found."
        
        if seat["status"] != "AVAILABLE":
            return False, f"Seat {seat_number} is already {seat['status']}."

        lock_id = f"{train_number}_{journey_date}_{coach_class}_{seat_number}"
        seat["status"] = "LOCKED"
        self.active_locks[lock_id] = {
            "seat": seat,
            "locked_at": time.time(),
            "user_id": user_id
        }
        return True, lock_id

    def release_lock(self, lock_id: str) -> bool:
        if lock_id in self.active_locks:
            lock = self.active_locks.pop(lock_id)
            if lock["seat"]["status"] == "LOCKED":
                lock["seat"]["status"] = "AVAILABLE"
            return True
        return False

    def allocate_best_seat(self, train_number: str, journey_date: str, coach_class: str, preference: Optional[str] = None) -> Dict:
        """
        Auto-allocate berth based on preference (Lower, Upper, Window) or return RAC / WL when full.
        """
        self._init_inventory(train_number, journey_date, coach_class)
        self._clean_expired_locks()

        seats = self.inventory[train_number][journey_date][coach_class]
        available_seats = [s for s in seats if s["status"] == "AVAILABLE"]

        if available_seats:
            if preference:
                preferred = next((s for s in available_seats if s["berth_type"].lower() == preference.lower()), None)
                if preferred:
                    preferred["status"] = "BOOKED"
                    return {"status": "CNF", "seat": preferred, "queue_position": None}
            
            # Default first available
            selected = available_seats[0]
            selected["status"] = "BOOKED"
            return {"status": "CNF", "seat": selected, "queue_position": None}

        # Handle RAC & WL queue
        queue_key = f"{train_number}_{journey_date}_{coach_class}"
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
