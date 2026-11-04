import pytest
from backend.src.booking_lifecycle.lifecycle import BookingLifecycleService

@pytest.fixture
def service():
    return BookingLifecycleService()

# TC_LEAD_01: End-to-end booking of confirmed ticket
def test_book_confirmed_ticket(service):
    passengers = [{"name": "Ravi Kumar", "age": 28, "berth_preference": "Lower"}]
    booking = service.book_ticket(
        user_id="user_123",
        train_number="12658",
        journey_date="2026-11-20",
        source="SBC",
        destination="MAS",
        coach_class="3A",
        passengers=passengers
    )
    assert len(booking["pnr"]) == 10
    assert booking["booking_status"] == "CONFIRMED"
    assert booking["passengers"][0]["status"] == "CNF"
    assert booking["passengers"][0]["coach"] == "3A-1"
    assert booking["payment"]["status"] == "SUCCESS"

# TC_LEAD_02: Fetch PNR status by valid PNR
def test_get_pnr_status_valid(service):
    passengers = [{"name": "Anita Roy", "age": 25}]
    b = service.book_ticket("u1", "12658", "2026-11-20", "SBC", "MAS", "SL", passengers)
    pnr = b["pnr"]
    status = service.get_pnr_status(pnr)
    assert status is not None
    assert status["pnr"] == pnr
    assert status["train_name"] == "Bengaluru - Chennai Mail"

# TC_LEAD_03: Fetch PNR status by non-existent PNR
def test_get_pnr_status_invalid(service):
    status = service.get_pnr_status("0000000000")
    assert status is None

# TC_LEAD_04: Booking validation with empty passenger list
def test_book_empty_passengers_error(service):
    with pytest.raises(ValueError, match="At least one passenger is required"):
        service.book_ticket("u1", "12658", "2026-11-20", "SBC", "MAS", "3A", [])

# TC_LEAD_05: Booking validation for non-existent train
def test_book_invalid_train(service):
    with pytest.raises(ValueError, match="Train 99999 not found"):
        service.book_ticket("u1", "99999", "2026-11-20", "SBC", "MAS", "3A", [{"name": "P1", "age": 30}])

# TC_LEAD_06: Booking validation for invalid station halts
def test_book_invalid_route(service):
    with pytest.raises(ValueError, match="Invalid source or destination"):
        service.book_ticket("u1", "12658", "2026-11-20", "NDLS", "HWH", "3A", [{"name": "P1", "age": 30}])

# TC_LEAD_07: Retrieve user booking history
def test_get_user_bookings(service):
    service.book_ticket("u5", "12658", "2026-11-20", "SBC", "MAS", "SL", [{"name": "P1", "age": 20}])
    service.book_ticket("u5", "12658", "2026-11-21", "SBC", "MAS", "SL", [{"name": "P2", "age": 22}])
    history = service.get_user_bookings("u5")
    assert len(history) == 2

# TC_LEAD_08: Ticket cancellation and refund calculation
def test_cancel_ticket_success(service):
    b = service.book_ticket("u1", "12658", "2026-11-20", "SBC", "MAS", "3A", [{"name": "P1", "age": 30}])
    res = service.cancel_ticket(b["pnr"], hours_before_departure=50.0)
    assert res["status"] == "SUCCESS"
    assert res["refund"]["refund_amount"] > 0
    # Booking status updated
    updated = service.get_pnr_status(b["pnr"])
    assert updated["booking_status"] == "CANCELLED"

# TC_LEAD_09: Double cancellation prevention
def test_double_cancellation_error(service):
    b = service.book_ticket("u1", "12658", "2026-11-20", "SBC", "MAS", "3A", [{"name": "P1", "age": 30}])
    service.cancel_ticket(b["pnr"])
    with pytest.raises(ValueError, match="already cancelled"):
        service.cancel_ticket(b["pnr"])

# TC_LEAD_10: Cascade Auto-Promotion (RAC upgraded to CNF when CNF is cancelled)
def test_cascade_auto_promotion(service):
    # Book all 16 seats in coach for CNF
    cnf_pnrs = []
    for i in range(16):
        b = service.book_ticket(f"user_{i}", "22691", "2026-11-25", "SBC", "NDLS", "1A", [{"name": f"CNF_User_{i}", "age": 30}])
        cnf_pnrs.append(b["pnr"])
    
    # Book 17th ticket (should be RAC 1)
    rac_booking = service.book_ticket("rac_user", "22691", "2026-11-25", "SBC", "NDLS", "1A", [{"name": "RAC_Passenger", "age": 28}])
    assert rac_booking["passengers"][0]["status"] == "RAC"

    # Now cancel first CNF booking
    service.cancel_ticket(cnf_pnrs[0])

    # Check RAC passenger status - should now be promoted to CNF!
    promoted_status = service.get_pnr_status(rac_booking["pnr"])
    assert promoted_status["passengers"][0]["status"] == "CNF"
    assert promoted_status["passengers"][0]["seat_number"] is not None
