from typing import Dict, List, Optional, Any
from datetime import datetime, date
from backend.src.database.seed_data import TRAINS, STATIONS, STATION_FACILITIES

class RailwayAPIService:
    """
    Simulates external Indian Railway (IRCTC/CRIS) API gateway.
    Includes caching and live status simulation.
    """
    def __init__(self):
        self._cache: Dict[str, Dict] = {}

    def fetch_live_status(self, train_number: str) -> Dict[str, Any]:
        """
        Simulate real-time GPS tracking status from National Train Enquiry System (NTES).
        """
        train = next((t for t in TRAINS if t["train_number"] == train_number), None)
        if not train:
            return {"status": "ERROR", "message": f"Train {train_number} not found."}
        
        current_station = train["halts"][1]["station_code"] if len(train["halts"]) > 1 else train["source"]
        return {
            "status": "SUCCESS",
            "train_number": train["train_number"],
            "train_name": train["train_name"],
            "current_station": current_station,
            "delay_minutes": 5,
            "status_message": "Running on time (5 mins delay)",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    def fetch_live_gps_tracking(self, train_number: str) -> Dict[str, Any]:
        """
        Simulates GPS satellite telemetry with speed, coordinates, and approaching halt.
        """
        train = next((t for t in TRAINS if t["train_number"] == train_number), None)
        if not train:
            return {"status": "ERROR", "message": f"Train {train_number} not found"}

        halts = train["halts"]
        current_halt = halts[1] if len(halts) > 1 else halts[0]
        next_halt = halts[2] if len(halts) > 2 else halts[-1]

        return {
            "status": "SUCCESS",
            "train_number": train["train_number"],
            "train_name": train["train_name"],
            "speed_kmh": 85.4,
            "telemetry": {
                "latitude": 12.9716,
                "longitude": 77.5946,
                "heading": "NE"
            },
            "current_halt": current_halt["station_code"],
            "next_halt": next_halt["station_code"],
            "eta_next_halt": next_halt["dep"],
            "distance_remaining_km": next_halt["distance_km"] - current_halt["distance_km"],
            "delay_minutes": 3,
            "signal_status": "GREEN"
        }

    def fetch_live_running_status(self, train_number: str) -> Dict[str, Any]:
        """
        Simulates NTES live station-by-station running status, platform allocation, and timetable delay tracking.
        """
        train = next((t for t in TRAINS if t["train_number"] == train_number), None)
        if not train:
            return {"status": "ERROR", "message": f"Train {train_number} not found"}

        halts = train["halts"]
        running_stops = []
        for i, h in enumerate(halts):
            status = "DEPARTED" if i == 0 else ("ARRIVED" if i == 1 else "UPCOMING")
            delay = 0 if i == 0 else (4 if i == 1 else 6)
            arr_time = h.get("arr", h.get("dep", "--:--"))
            dep_time = h.get("dep", "--:--")
            running_stops.append({
                "station_code": h["station_code"],
                "scheduled_arrival": arr_time,
                "scheduled_departure": dep_time,
                "actual_arrival": arr_time,
                "actual_departure": dep_time,
                "delay_minutes": delay,
                "platform": (i % 5) + 1,
                "status": status
            })

        return {
            "status": "SUCCESS",
            "train_number": train["train_number"],
            "train_name": train["train_name"],
            "chart_status": "CHART PREPARED",
            "overall_delay_minutes": 4,
            "current_location": halts[1]["station_code"] if len(halts) > 1 else halts[0]["station_code"],
            "station_status": running_stops
        }

class TrainCatalogService:
    """
    Train Catalog and Route Search Subsystem (Owned by Sabbir Mondal).
    Provides station discovery, route calculation, schedule inspection, and multi-criteria queries.
    """
    def __init__(self, api_service: Optional[RailwayAPIService] = None):
        self.api_service = api_service or RailwayAPIService()
        self.stations = STATIONS
        self.facilities = STATION_FACILITIES
        self.trains = TRAINS

    def get_all_stations(self) -> List[Dict[str, str]]:
        return list(self.stations.values())

    def get_station_by_code(self, code: str) -> Optional[Dict[str, str]]:
        if not code:
            return None
        return self.stations.get(code.strip().upper())

    def get_station_facilities(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve station infrastructure and passenger amenities.
        """
        if not code:
            return None
        clean_code = code.strip().upper()
        station = self.stations.get(clean_code)
        facilities = self.facilities.get(clean_code)
        if not station or not facilities:
            return None
        return {
            "station_code": clean_code,
            "station_name": station["name"],
            "zone": station["zone"],
            "facilities": facilities
        }

    def get_all_trains(self) -> List[Dict]:
        return [
            {
                "train_number": t["train_number"],
                "train_name": t["train_name"],
                "train_type": t["train_type"],
                "source": t["source"],
                "destination": t["destination"],
                "departure_time": t["departure_time"],
                "arrival_time": t["arrival_time"],
                "distance_km": t["distance_km"],
                "available_classes": t["available_classes"],
                "days_of_run": t["days_of_run"]
            }
            for t in self.trains
        ]

    def search_trains(self, source: str, destination: str, travel_date: Optional[str] = None) -> List[Dict]:
        """
        Search trains between two stations (direct or via route halts).
        """
        if not source or not destination:
            return []
            
        src = source.strip().upper()
        dst = destination.strip().upper()
        if src == dst:
            return []
            
        results = []
        day_of_week = None
        if travel_date:
            try:
                dt = datetime.strptime(travel_date.strip(), "%Y-%m-%d")
                day_of_week = dt.strftime("%a").upper()
            except ValueError:
                pass

        for train in self.trains:
            halt_codes = [h["station_code"] for h in train["halts"]]
            if src in halt_codes and dst in halt_codes:
                src_idx = halt_codes.index(src)
                dst_idx = halt_codes.index(dst)
                
                # Check directional sequence (source must be reached before destination)
                if src_idx < dst_idx:
                    if day_of_week and day_of_week not in train["days_of_run"]:
                        continue
                    
                    segment_distance = train["halts"][dst_idx]["distance_km"] - train["halts"][src_idx]["distance_km"]
                    results.append({
                        "train_number": train["train_number"],
                        "train_name": train["train_name"],
                        "train_type": train["train_type"],
                        "source": src,
                        "destination": dst,
                        "departure_time": train["halts"][src_idx]["dep"],
                        "arrival_time": train["halts"][dst_idx]["dep"],
                        "segment_distance_km": segment_distance,
                        "available_classes": train["available_classes"],
                        "days_of_run": train["days_of_run"],
                        "halts": train["halts"]
                    })
        return results

    def get_train_schedule(self, train_number: str) -> Optional[Dict]:
        """
        Retrieve complete schedule and station halt timetable.
        """
        if not train_number:
            return None
        t_num = train_number.strip()
        train = next((t for t in self.trains if t["train_number"] == t_num), None)
        if not train:
            return None
        
        live = self.api_service.fetch_live_status(t_num)
        return {
            "train_info": train,
            "live_status": live
        }

    def get_live_gps_tracking(self, train_number: str) -> Optional[Dict]:
        """
        Retrieve live satellite GPS tracking telemetry for train.
        """
        if not train_number:
            return None
        return self.api_service.fetch_live_gps_tracking(train_number.strip())

    def get_live_running_status(self, train_number: str) -> Optional[Dict]:
        """
        Retrieve live station-by-station running status and timetable delays.
        """
        if not train_number:
            return None
        return self.api_service.fetch_live_running_status(train_number.strip())
