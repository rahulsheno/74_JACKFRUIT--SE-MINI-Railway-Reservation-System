import pytest
from backend.src.train_service.catalog import TrainCatalogService, RailwayAPIService

@pytest.fixture
def catalog():
    return TrainCatalogService()

# TC_SABBIR_01: Verify retrieving all stations
def test_get_all_stations(catalog):
    stations = catalog.get_all_stations()
    assert len(stations) >= 5
    codes = [s["code"] for s in stations]
    assert "SBC" in codes
    assert "MAS" in codes

# TC_SABBIR_02: Fetch station by valid station code
def test_get_station_by_valid_code(catalog):
    station = catalog.get_station_by_code("SBC")
    assert station is not None
    assert station["name"] == "KSR Bengaluru City"
    assert station["zone"] == "SWR"

# TC_SABBIR_03: Fetch station with non-existent code
def test_get_station_by_invalid_code(catalog):
    station = catalog.get_station_by_code("XYZ99")
    assert station is None

# TC_SABBIR_04: Search trains for direct valid route
def test_search_trains_direct_route(catalog):
    results = catalog.search_trains("SBC", "MAS")
    assert len(results) >= 2
    train_nums = [r["train_number"] for r in results]
    assert "12658" in train_nums
    assert "12028" in train_nums

# TC_SABBIR_05: Search trains with day-of-run date filtering
def test_search_trains_with_date_filter(catalog):
    # 2026-11-09 is Monday
    results = catalog.search_trains("SBC", "NDLS", "2026-11-09")
    assert any(r["train_number"] == "22691" for r in results)

    # 2026-11-10 is Tuesday (Rajdhani 22691 does not run on Tue)
    results_tue = catalog.search_trains("SBC", "NDLS", "2026-11-10")
    assert not any(r["train_number"] == "22691" for r in results_tue)

# TC_SABBIR_06: Search intermediate halt route
def test_search_intermediate_halt_route(catalog):
    results = catalog.search_trains("SBC", "KPD")
    assert len(results) >= 1
    assert results[0]["segment_distance_km"] == 226

# TC_SABBIR_07: Search reverse direction (should not return wrong directional trains)
def test_search_reverse_direction_trains(catalog):
    # 12658 runs SBC -> MAS, so searching MAS -> SBC on 12658 halts should return 0 direct results
    results = catalog.search_trains("MAS", "SBC")
    train_nums = [r["train_number"] for r in results]
    assert "12658" not in train_nums

# TC_SABBIR_08: Get train schedule with valid train number
def test_get_train_schedule_valid(catalog):
    schedule = catalog.get_train_schedule("12658")
    assert schedule is not None
    assert schedule["train_info"]["train_name"] == "Bengaluru - Chennai Mail"
    assert "live_status" in schedule
    assert schedule["live_status"]["status"] == "SUCCESS"

# TC_SABBIR_09: Get train schedule with non-existent train number
def test_get_train_schedule_invalid(catalog):
    schedule = catalog.get_train_schedule("99999")
    assert schedule is None

# TC_SABBIR_10: External Railway API live status error response
def test_railway_api_service_non_existent():
    api = RailwayAPIService()
    res = api.fetch_live_status("00000")
    assert res["status"] == "ERROR"


# TC_SABBIR_11: Verify bidirectional return train routes (MAS -> SBC)
def test_search_return_paired_trains(catalog):
    results = catalog.search_trains('MAS', 'SBC')
    train_nums = [r['train_number'] for r in results]
    assert '12657' in train_nums
    assert '12027' in train_nums

# TC_SABBIR_12: Verify station amenities and infrastructure lookup
def test_get_station_facilities_valid(catalog):
    fac = catalog.get_station_facilities('SBC')
    assert fac is not None
    assert fac['station_code'] == 'SBC'
    assert fac['facilities']['wifi'] is True
    assert fac['facilities']['wheelchair_accessible'] is True

# TC_SABBIR_13: Station facilities with invalid code
def test_get_station_facilities_invalid(catalog):
    fac = catalog.get_station_facilities('UNKNOWN99')
    assert fac is None

# TC_SABBIR_14: Live satellite GPS tracking telemetry
def test_live_gps_telemetry_valid(catalog):
    gps = catalog.get_live_gps_tracking('12658')
    assert gps['status'] == 'SUCCESS'
    assert gps['speed_kmh'] > 0
    assert 'latitude' in gps['telemetry']
    assert gps['signal_status'] == 'GREEN'

# TC_SABBIR_15: GPS tracking for invalid train
def test_live_gps_telemetry_invalid(catalog):
    gps = catalog.get_live_gps_tracking('00000')
    assert gps['status'] == 'ERROR'
