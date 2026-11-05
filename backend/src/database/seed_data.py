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

# Station Amenities and Infrastructure Facilities
STATION_FACILITIES = {
    "SBC": {
        "platforms": 10,
        "wifi": True,
        "retiring_rooms": 18,
        "wheelchair_accessible": True,
        "food_court": ["IRCTC Food Plaza", "KFC", "Cafe Coffee Day"],
        "cloak_room": True,
        "parking": "2-Wheeler & 4-Wheeler Multi-level"
    },
    "MAS": {
        "platforms": 12,
        "wifi": True,
        "retiring_rooms": 24,
        "wheelchair_accessible": True,
        "food_court": ["Saravana Bhavan", "IRCTC Jan Aahar", "Subway"],
        "cloak_room": True,
        "parking": "Premium Parking with EV Charging"
    },
    "NDLS": {
        "platforms": 16,
        "wifi": True,
        "retiring_rooms": 40,
        "wheelchair_accessible": True,
        "food_court": ["Haldiram's", "Bikanervala", "McDonald's"],
        "cloak_room": True,
        "parking": "Ajmeri Gate & Paharganj Side Parking"
    },
    "HWH": {
        "platforms": 23,
        "wifi": True,
        "retiring_rooms": 32,
        "wheelchair_accessible": True,
        "food_court": ["Composur Food Plaza", "Jan Aahar", "Mio Amore"],
        "cloak_room": True,
        "parking": "Station Complex Parking"
    },
    "CSMT": {
        "platforms": 18,
        "wifi": True,
        "retiring_rooms": 20,
        "wheelchair_accessible": True,
        "food_court": ["IRCTC Food Court", "Monginis", "Chai Point"],
        "cloak_room": True,
        "parking": "Suburban & Mainline Parking"
    },
    "HYB": {
        "platforms": 6,
        "wifi": True,
        "retiring_rooms": 12,
        "wheelchair_accessible": True,
        "food_court": ["Paradise Biryani Express", "Jan Aahar"],
        "cloak_room": True,
        "parking": "Station Frontage Parking"
    }
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
    },
    {
        "train_number": "11302",
        "train_name": "Udyan Express",
        "train_type": "Superfast Express",
        "source": "SBC",
        "destination": "CSMT",
        "departure_time": "20:45",
        "arrival_time": "19:55",
        "distance_km": 1153,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "SBC", "distance_km": 0, "halt_time": "00:00", "dep": "20:45"},
            {"station_code": "GTL", "distance_km": 308, "halt_time": "00:05", "dep": "02:50"},
            {"station_code": "WADI", "distance_km": 546, "halt_time": "00:05", "dep": "07:10"},
            {"station_code": "PUNE", "distance_km": 961, "halt_time": "00:05", "dep": "15:45"},
            {"station_code": "CSMT", "distance_km": 1153, "halt_time": "00:00", "dep": "19:55"}
        ]
    },
    {
        "train_number": "12786",
        "train_name": "Kacheguda Superfast Express",
        "train_type": "Superfast Express",
        "source": "SBC",
        "destination": "HYB",
        "departure_time": "18:20",
        "arrival_time": "05:40",
        "distance_km": 622,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "SBC", "distance_km": 0, "halt_time": "00:00", "dep": "18:20"},
            {"station_code": "DMM", "distance_km": 170, "halt_time": "00:05", "dep": "21:30"},
            {"station_code": "KRNT", "distance_km": 376, "halt_time": "00:02", "dep": "00:45"},
            {"station_code": "MBNR", "distance_km": 482, "halt_time": "00:02", "dep": "02:18"},
            {"station_code": "HYB", "distance_km": 622, "halt_time": "00:00", "dep": "05:40"}
        ]
    },
    {
        "train_number": "12657",
        "train_name": "Chennai - Bengaluru Mail",
        "train_type": "Superfast Express",
        "source": "MAS",
        "destination": "SBC",
        "departure_time": "23:15",
        "arrival_time": "04:50",
        "distance_km": 362,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "MAS", "distance_km": 0, "halt_time": "00:00", "dep": "23:15"},
            {"station_code": "AJJ", "distance_km": 70, "halt_time": "00:02", "dep": "00:15"},
            {"station_code": "KPD", "distance_km": 136, "halt_time": "00:05", "dep": "01:20"},
            {"station_code": "JTJ", "distance_km": 221, "halt_time": "00:05", "dep": "02:40"},
            {"station_code": "BWT", "distance_km": 292, "halt_time": "00:02", "dep": "03:45"},
            {"station_code": "SBC", "distance_km": 362, "halt_time": "00:00", "dep": "04:50"}
        ]
    },
    {
        "train_number": "22692",
        "train_name": "Hazrat Nizamuddin - Bengaluru Rajdhani",
        "train_type": "Rajdhani",
        "source": "NDLS",
        "destination": "SBC",
        "departure_time": "20:45",
        "arrival_time": "06:40",
        "distance_km": 2365,
        "days_of_run": ["MON", "TUE", "THU", "SAT"],
        "available_classes": ["1A", "2A", "3A"],
        "halts": [
            {"station_code": "NDLS", "distance_km": 0, "halt_time": "00:00", "dep": "20:45"},
            {"station_code": "VGLJ", "distance_km": 423, "halt_time": "00:08", "dep": "01:25"},
            {"station_code": "BPL", "distance_km": 715, "halt_time": "00:10", "dep": "05:25"},
            {"station_code": "NGP", "distance_km": 1105, "halt_time": "00:10", "dep": "11:20"},
            {"station_code": "SC", "distance_km": 1685, "halt_time": "00:15", "dep": "18:50"},
            {"station_code": "SBC", "distance_km": 2365, "halt_time": "00:00", "dep": "06:40"}
        ]
    },
    {
        "train_number": "12027",
        "train_name": "Chennai - Bengaluru Shatabdi Express",
        "train_type": "Shatabdi",
        "source": "MAS",
        "destination": "SBC",
        "departure_time": "17:30",
        "arrival_time": "22:25",
        "distance_km": 362,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        "available_classes": ["CC", "EC"],
        "halts": [
            {"station_code": "MAS", "distance_km": 0, "halt_time": "00:00", "dep": "17:30"},
            {"station_code": "KPD", "distance_km": 136, "halt_time": "00:02", "dep": "19:28"},
            {"station_code": "KJM", "distance_km": 348, "halt_time": "00:02", "dep": "21:58"},
            {"station_code": "SBC", "distance_km": 362, "halt_time": "00:00", "dep": "22:25"}
        ]
    },
    {
        "train_number": "12839",
        "train_name": "Howrah - Chennai Mail",
        "train_type": "Superfast Express",
        "source": "HWH",
        "destination": "MAS",
        "departure_time": "23:55",
        "arrival_time": "03:45",
        "distance_km": 1661,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "HWH", "distance_km": 0, "halt_time": "00:00", "dep": "23:55"},
            {"station_code": "BBS", "distance_km": 437, "halt_time": "00:05", "dep": "06:15"},
            {"station_code": "VSKP", "distance_km": 880, "halt_time": "00:20", "dep": "13:45"},
            {"station_code": "BZA", "distance_km": 1230, "halt_time": "00:10", "dep": "19:30"},
            {"station_code": "MAS", "distance_km": 1661, "halt_time": "00:00", "dep": "03:45"}
        ]
    },
    {
        "train_number": "11301",
        "train_name": "CSMT - Bengaluru Udyan Express",
        "train_type": "Superfast Express",
        "source": "CSMT",
        "destination": "SBC",
        "departure_time": "08:10",
        "arrival_time": "08:50",
        "distance_km": 1153,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "CSMT", "distance_km": 0, "halt_time": "00:00", "dep": "08:10"},
            {"station_code": "PUNE", "distance_km": 192, "halt_time": "00:05", "dep": "11:50"},
            {"station_code": "WADI", "distance_km": 607, "halt_time": "00:05", "dep": "19:20"},
            {"station_code": "GTL", "distance_km": 845, "halt_time": "00:05", "dep": "23:45"},
            {"station_code": "SBC", "distance_km": 1153, "halt_time": "00:00", "dep": "08:50"}
        ]
    },
    {
        "train_number": "12785",
        "train_name": "Kacheguda - Bengaluru Superfast Express",
        "train_type": "Superfast Express",
        "source": "HYB",
        "destination": "SBC",
        "departure_time": "19:05",
        "arrival_time": "06:25",
        "distance_km": 622,
        "days_of_run": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        "available_classes": ["1A", "2A", "3A", "SL"],
        "halts": [
            {"station_code": "HYB", "distance_km": 0, "halt_time": "00:00", "dep": "19:05"},
            {"station_code": "MBNR", "distance_km": 140, "halt_time": "00:02", "dep": "20:58"},
            {"station_code": "KRNT", "distance_km": 246, "halt_time": "00:02", "dep": "22:48"},
            {"station_code": "DMM", "distance_km": 452, "halt_time": "00:05", "dep": "02:35"},
            {"station_code": "SBC", "distance_km": 622, "halt_time": "00:00", "dep": "06:25"}
        ]
    }
]
