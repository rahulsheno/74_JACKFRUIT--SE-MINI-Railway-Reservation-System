from typing import Dict, List, Optional, Any
from datetime import datetime, date
from backend.src.database.seed_data import TRAINS, STATIONS

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
        
        return {
            "status": "SUCCESS",
            "train_number": train["train_number"],
            "train_name": train["train_name"],
            "current_station": train["halts"][1]["station_code"] if len(train["halts"]) > 1 else train["source"],
            "delay_minutes": 5,
            "status_message": "Running on time (5 mins delay)",
            "last_updated": datetime.now().isoformat()
        }

class TrainCatalogService:
    """
    Train Catalog and Route Search Subsystem (Owned by Sabbir Mondal).
    Provides station discovery, route calculation, schedule inspection, and multi-criteria queries.
    """
    def __init__(self, api_service: Optional[RailwayAPIService] = None):
        self.api_service = api_service or RailwayAPIService()
        self.stations = STATIONS
        self.trains = TRAINS

    def get_all_stations(self) -> List[Dict[str, str]]:
        return list(self.stations.values())

    def get_station_by_code(self, code: str) -> Optional[Dict[str, str]]:
        return self.stations.get(code.upper())

    def search_trains(self, source: str, destination: str, travel_date: Optional[str] = None) -> List[Dict]:
        """
        Search trains between two stations (direct or via route halts).
        """
        src = source.upper()
        dst = destination.upper()
        results = []

        day_of_week = None
        if travel_date:
            try:
                dt = datetime.strptime(travel_date, "%Y-%m-%d")
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
                        "days_of_run": train["days_of_run"]
                    })
        return results

    def get_train_schedule(self, train_number: str) -> Optional[Dict]:
        """
        Retrieve complete schedule and station halt timetable.
        """
        train = next((t for t in self.trains if t["train_number"] == train_number), None)
        if not train:
            return None
        
        live = self.api_service.fetch_live_status(train_number)
        return {
            "train_info": train,
            "live_status": live
        }
