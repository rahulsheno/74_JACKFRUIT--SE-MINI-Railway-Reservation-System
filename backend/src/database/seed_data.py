from typing import Dict, List, Any

# Seed Station Directory
STATIONS = {
    "SBC": {"code": "SBC", "name": "KSR Bengaluru City", "zone": "SWR"},
    "MAS": {"code": "MAS", "name": "MGR Chennai Central", "zone": "SR"},
    "NDLS": {"code": "NDLS", "name": "New Delhi", "zone": "NR"},
    "HWH": {"code": "HWH", "name": "Howrah Junction", "zone": "ER"},
    "CSMT": {"code": "CSMT", "name": "Mumbai Chhatrapati Shivaji Terminus", "zone": "CR"},
    "HYB": {"code": "HYB", "name": "Hyderabad Deccan", "zone": "SCR"}
}

# Seed Train Catalog with Route Halts, Distances, and Classes
TRAINS: List[Dict[str, Any]] = [
    {
        "train_number": "12658",
        "train_name": "Bengaluru - Chennai Mail",
        "train_type": "Superfast Express",
        "source": "SBC",
        "destination": "MAS",
        "departure_time": "22:40",
        "arrival_time": "04:15",
        "distance_km": 362,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "SBC", "distance_km": 0, "halt_time": "00:00", "dep": "22:40"},
            {"station_code": "BWT", "distance_km": 70, "halt_time": "00:02", "dep": "23:45"},
            {"station_code": "JTJ", "distance_km": 141, "halt_time": "00:05", "dep": "00:55"},
            {"station_code": "KPD", "distance_km": 226, "halt_time": "00:05", "dep": "02:10"},
            {"station_code": "AJJ", "distance_km": 292, "halt_time": "00:02", "dep": "03:15"},
            {"station_code": "MAS", "distance_km": 362, "halt_time": "00:00", "dep": "04:15"}
        ]
    },
    {
        "train_number": "22691",
        "train_name": "Bengaluru Rajdhani Express",
        "train_type": "Rajdhani",
        "source": "SBC",
        "destination": "NDLS",
        "departure_time": "20:00",
        "arrival_time": "05:30",
        "distance_km": 2365,
        "days_of_run": ["MON", "WED", "FRI", "SUN"],
        "available_classes": ["1A", "2A", "3A"],
        "halts": [
            {"station_code": "SBC", "distance_km": 0, "halt_time": "00:00", "dep": "20:00"},
            {"station_code": "SC", "distance_km": 680, "halt_time": "00:15", "dep": "07:15"},
            {"station_code": "NGP", "distance_km": 1260, "halt_time": "00:10", "dep": "14:40"},
            {"station_code": "BPL", "distance_km": 1650, "halt_time": "00:10", "dep": "20:30"},
            {"station_code": "VGLJ", "distance_km": 1942, "halt_time": "00:08", "dep": "00:45"},
            {"station_code": "NDLS", "distance_km": 2365, "halt_time": "00:00", "dep": "05:30"}
        ]
    },
    {
        "train_number": "12028",
        "train_name": "Shatabdi Express",
        "train_type": "Shatabdi",
        "source": "SBC",
        "destination": "MAS",
        "departure_time": "06:00",
        "arrival_time": "11:00",
        "distance_km": 362,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        "available_classes": ["CC", "EC"],
        "halts": [
            {"station_code": "SBC", "distance_km": 0, "halt_time": "00:00", "dep": "06:00"},
            {"station_code": "KJM", "distance_km": 14, "halt_time": "00:02", "dep": "06:17"},
            {"station_code": "KPD", "distance_km": 226, "halt_time": "00:02", "dep": "09:08"},
            {"station_code": "MAS", "distance_km": 362, "halt_time": "00:00", "dep": "11:00"}
        ]
    },
    {
        "train_number": "12840",
        "train_name": "Howrah Mail",
        "train_type": "Superfast Express",
        "source": "MAS",
        "destination": "HWH",
        "departure_time": "19:00",
        "arrival_time": "23:00",
        "distance_km": 1661,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "MAS", "distance_km": 0, "halt_time": "00:00", "dep": "19:00"},
            {"station_code": "BZA", "distance_km": 431, "halt_time": "00:10", "dep": "01:45"},
            {"station_code": "VSKP", "distance_km": 781, "halt_time": "00:20", "dep": "07:20"},
            {"station_code": "BBS", "distance_km": 1224, "halt_time": "00:05", "dep": "14:40"},
            {"station_code": "HWH", "distance_km": 1661, "halt_time": "00:00", "dep": "23:00"}
        ]
    }
]
