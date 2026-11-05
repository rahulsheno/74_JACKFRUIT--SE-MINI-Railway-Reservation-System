import pytest
from fastapi.testclient import TestClient
from backend.src.main import app

@pytest.fixture
def client():
    return TestClient(app)

# 1. Station & Train Catalog API Tests
def test_api_get_stations(client):
    res = client.get("/api/stations")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 6
    codes = [s["code"] for s in data]
    assert "SBC" in codes
    assert "MAS" in codes
    assert "CSMT" in codes

def test_api_get_trains(client):
    res = client.get("/api/trains")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    nums = [t["train_number"] for t in data]
    assert "12658" in nums
    assert "22691" in nums

def test_api_search_trains(client):
    res = client.get("/api/trains/search?source=SBC&destination=MAS&travel_date=2026-11-20")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 2
    assert any(t["train_number"] == "12658" for t in data["trains"])

def test_api_search_trains_same_station(client):
    res = client.get("/api/trains/search?source=SBC&destination=SBC")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 0

def test_api_get_train_schedule(client):
    res = client.get("/api/trains/12658/schedule")
    assert res.status_code == 200
    data = res.json()
    assert data["train_info"]["train_name"] == "Bengaluru - Chennai Mail"
    assert len(data["train_info"]["halts"]) == 6
    assert data["live_status"]["status"] == "SUCCESS"

def test_api_get_train_schedule_not_found(client):
    res = client.get("/api/trains/99999/schedule")
    assert res.status_code == 404

# 2. Seat Layout & Lock Engine Tests
def test_api_get_coach_layout(client):
    res = client.get("/api/seats/layout?train_number=12658&journey_date=2026-11-20&coach_class=3A")
    assert res.status_code == 200
    data = res.json()
    assert len(data["seats"]) == 16
    assert data["seats"][0]["berth_type"] == "Lower"

def test_api_get_seat_availability(client):
    res = client.get("/api/seats/availability?train_number=12658&journey_date=2026-11-20&coach_class=3A")
    assert res.status_code == 200
    data = res.json()
    assert data["total_seats"] == 16
    assert data["available"] >= 1
    assert "status_text" in data

def test_api_seat_lock_and_unlock(client):
    # Lock seat 12
    lock_payload = {
        "train_number": "12658",
        "journey_date": "2026-11-20",
        "coach_class": "3A",
        "seat_number": 12,
        "user_id": "test_user_api"
    }
    res = client.post("/api/seats/lock", json=lock_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    lock_id = data["lock_id"]

    # Double lock must fail
    res_conflict = client.post("/api/seats/lock", json=lock_payload)
    assert res_conflict.status_code == 400

    # Release lock
    res_unlock = client.delete(f"/api/seats/unlock/{lock_id}")
    assert res_unlock.status_code == 200
    assert res_unlock.json()["status"] == "SUCCESS"

# 3. Fare Calculation API Tests
def test_api_calculate_fare_general(client):
    res = client.get("/api/fare/calculate?distance_km=362&coach_class=SL&concession_type=NONE&quota=GENERAL")
    assert res.status_code == 200
    data = res.json()
    assert data["coach_class"] == "SL"
    assert data["total_fare"] == 193 or data["total_fare"] == 192

def test_api_calculate_fare_concession_senior_male(client):
    res_gen = client.get("/api/fare/calculate?distance_km=500&coach_class=2A&concession_type=NONE")
    res_sc = client.get("/api/fare/calculate?distance_km=500&coach_class=2A&concession_type=SENIOR_CITIZEN_MALE")
    assert res_sc.status_code == 200
    assert res_sc.json()["total_fare"] < res_gen.json()["total_fare"]
    assert res_sc.json()["discount_amount"] > 0

def test_api_calculate_fare_tatkal(client):
    res_gen = client.get("/api/fare/calculate?distance_km=500&coach_class=3A&quota=GENERAL")
    res_tat = client.get("/api/fare/calculate?distance_km=500&coach_class=3A&quota=TATKAL")
    assert res_tat.status_code == 200
    assert res_tat.json()["tatkal_surcharge"] > 0
    assert res_tat.json()["total_fare"] > res_gen.json()["total_fare"]

def test_api_calculate_fare_invalid_input(client):
    res = client.get("/api/fare/calculate?distance_km=-100&coach_class=3A")
    assert res.status_code == 400

# 4. Booking Lifecycle & Cancellation API Tests
def test_api_booking_and_pnr_tracking(client):
    booking_req = {
        "user_id": "test_passenger_api",
        "train_number": "12658",
        "journey_date": "2026-11-20",
        "source": "SBC",
        "destination": "MAS",
        "coach_class": "3A",
        "quota": "GENERAL",
        "passengers": [
            {
                "name": "Arun Kumar",
                "age": 32,
                "gender": "M",
                "berth_preference": "Lower",
                "concession_type": "NONE"
            },
            {
                "name": "Meera Kumar",
                "age": 29,
                "gender": "F",
                "berth_preference": "Middle",
                "concession_type": "NONE"
            }
        ]
    }
    res = client.post("/api/bookings", json=booking_req)
    assert res.status_code == 200
    booking = res.json()
    assert len(booking["pnr"]) == 10
    assert len(booking["passengers"]) == 2
    assert booking["booking_status"] == "CONFIRMED"
    pnr = booking["pnr"]

    # Query PNR status
    res_pnr = client.get(f"/api/pnr/{pnr}")
    assert res_pnr.status_code == 200
    assert res_pnr.json()["pnr"] == pnr
    assert res_pnr.json()["train_name"] == "Bengaluru - Chennai Mail"

    # Query user bookings
    res_user = client.get("/api/users/test_passenger_api/bookings")
    assert res_user.status_code == 200
    assert any(b["pnr"] == pnr for b in res_user.json())

    # Cancel ticket
    res_cancel = client.post("/api/bookings/cancel", json={"pnr": pnr, "hours_before_departure": 52.0})
    assert res_cancel.status_code == 200
    assert res_cancel.json()["status"] == "SUCCESS"
    assert res_cancel.json()["refund"]["refund_amount"] > 0

    # PNR reflects cancelled status
    res_pnr_after = client.get(f"/api/pnr/{pnr}")
    assert res_pnr_after.json()["booking_status"] == "CANCELLED"



def test_api_station_facilities(client):
    res = client.get('/api/stations/SBC/facilities')
    assert res.status_code == 200
    data = res.json()
    assert data['station_code'] == 'SBC'
    assert 'facilities' in data
    assert data['facilities']['wifi'] is True

def test_api_live_gps_tracking(client):
    res = client.get('/api/trains/12658/live-tracking')
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'SUCCESS'
    assert data['speed_kmh'] > 0

def test_api_explicit_seat_unlock(client):
    # Lock seat 10
    lock_req = {
        'train_number': '12658',
        'journey_date': '2026-12-10',
        'coach_class': '3A',
        'seat_number': 10,
        'user_id': 'api_user_unlock'
    }
    client.post('/api/seats/lock', json=lock_req)

    # Unlock seat 10 explicitly
    unlock_req = {
        'train_number': '12658',
        'journey_date': '2026-12-10',
        'coach_class': '3A',
        'seat_number': 10,
        'user_id': 'api_user_unlock'
    }
    res_unlock = client.post('/api/seats/unlock', json=unlock_req)
    assert res_unlock.status_code == 200
    assert res_unlock.json()['status'] == 'SUCCESS'

def test_api_lock_renew(client):
    lock_req = {
        'train_number': '12658',
        'journey_date': '2026-12-10',
        'coach_class': '3A',
        'seat_number': 11,
        'user_id': 'api_user_renew'
    }
    res_lock = client.post('/api/seats/lock', json=lock_req)
    lock_id = res_lock.json()['lock_id']

    renew_req = {'lock_id': lock_id, 'user_id': 'api_user_renew'}
    res_renew = client.post('/api/seats/lock/renew', json=renew_req)
    assert res_renew.status_code == 200
    assert res_renew.json()['status'] == 'SUCCESS'

def test_api_refund_estimate(client):
    res = client.get('/api/fare/refund-estimate?total_paid=1000&hours_before_departure=24&coach_class=3A')
    assert res.status_code == 200
    data = res.json()
    assert data['cancellation_charge'] == 250.0
    assert data['refund_amount'] == 750.0


def test_api_live_running_status(client):
    res = client.get('/api/trains/12658/running-status')
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'SUCCESS'
    assert 'station_status' in data

def test_api_coach_occupancy(client):
    res = client.get('/api/trains/12658/occupancy?journey_date=2026-12-10')
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'SUCCESS'
    assert 'overall_occupancy_pct' in data

def test_api_eticket_invoice(client):
    payload = {
        'pnr': 'PNR998877665',
        'train_number': '12658',
        'coach_class': '2A',
        'fare_summary': {'total_fare': 1500.0},
        'passengers': [{'name': 'Vikram', 'age': 40}]
    }
    res = client.post('/api/fare/eticket-invoice', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'SUCCESS'
    assert data['sac_code'] == '9964'
    assert data['itemized_charges']['grand_total'] > 1500.0
