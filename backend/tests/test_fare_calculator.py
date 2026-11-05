import pytest
from backend.src.fare_calculator.calculator import FareCalculatorService

@pytest.fixture
def calc():
    return FareCalculatorService()

# TC_VINAYAK_01: Verify base fare calculation for Sleeper (SL)
def test_calculate_fare_sleeper(calc):
    fare = calc.calculate_fare(distance_km=360, coach_class="SL", concession_type="NONE")
    # Base: 360 * 0.45 = 162 + 30 superfast = 192 (no GST on SL)
    assert fare["base_fare"] == 162.0
    assert fare["gst"] == 0.0
    assert fare["total_fare"] == 192

# TC_VINAYAK_02: Verify AC fare with GST application (3A class)
def test_calculate_fare_ac_with_gst(calc):
    fare = calc.calculate_fare(distance_km=360, coach_class="3A")
    # Base: 360 * 1.40 = 504 + 45 superfast = 549 + 5% GST = 27.45 -> total 576
    assert fare["base_fare"] == 504.0
    assert fare["superfast_surcharge"] == 45.0
    assert fare["gst"] > 0
    assert fare["total_fare"] == 576

# TC_VINAYAK_03: Senior Citizen Male concession (40% discount)
def test_senior_citizen_concession(calc):
    reg_fare = calc.calculate_fare(500, "2A", "NONE")
    sc_fare = calc.calculate_fare(500, "2A", "SENIOR_CITIZEN_MALE")
    assert sc_fare["discount_amount"] == round(reg_fare["base_fare"] * 0.40, 2)
    assert sc_fare["total_fare"] < reg_fare["total_fare"]

# TC_VINAYAK_04: Divyangjan concession (75% discount)
def test_divyangjan_concession(calc):
    fare = calc.calculate_fare(1000, "3A", "DIVYANGJAN")
    assert fare["concession_type"] == "DIVYANGJAN"
    assert fare["discount_amount"] > 0

# TC_VINAYAK_05: Tatkal quota premium surcharge
def test_tatkal_quota_fare(calc):
    gen_fare = calc.calculate_fare(500, "3A", quota="GENERAL")
    tatkal_fare = calc.calculate_fare(500, "3A", quota="TATKAL")
    assert tatkal_fare["tatkal_surcharge"] > 0
    assert tatkal_fare["total_fare"] > gen_fare["total_fare"]

# TC_VINAYAK_06: Invalid coach class exception handling
def test_invalid_coach_class(calc):
    with pytest.raises(ValueError, match="Invalid coach class"):
        calc.calculate_fare(100, "INVALID_CLASS")

# TC_VINAYAK_07: Zero or negative distance validation
def test_invalid_distance(calc):
    with pytest.raises(ValueError, match="Distance must be greater than zero"):
        calc.calculate_fare(-50, "3A")

# TC_VINAYAK_08: Cancellation refund > 48 hours before departure
def test_cancellation_refund_more_than_48_hours(calc):
    refund = calc.calculate_cancellation_refund(total_paid=1000, hours_before_departure=50)
    assert refund["cancellation_charge"] == 180.0
    assert refund["refund_amount"] == 820.0

# TC_VINAYAK_09: Cancellation refund < 4 hours before departure (no refund)
def test_cancellation_refund_under_4_hours(calc):
    refund = calc.calculate_cancellation_refund(total_paid=1000, hours_before_departure=2)
    assert refund["refund_amount"] == 0.0

# TC_VINAYAK_10: Payment simulation success and failure handling
def test_simulate_payment(calc):
    res_success = calc.simulate_payment(550.0, "UPI")
    assert res_success["status"] == "SUCCESS"
    assert "TXN_" in res_success["transaction_id"]

    res_fail = calc.simulate_payment(-100.0)
    assert res_fail["status"] == "FAILED"


# TC_VINAYAK_11: Armed forces and defense concession
def test_armed_forces_concession(calc):
    fare = calc.calculate_fare(500, '3A', concession_type='ARMED_FORCES')
    assert fare['concession_type'] == 'ARMED_FORCES'
    assert fare['discount_amount'] > 0

# TC_VINAYAK_12: Child and infant concession policies
def test_child_and_infant_fare_policy(calc):
    child_fare = calc.calculate_fare(400, 'SL', concession_type='CHILD_5_11')
    assert child_fare['discount_amount'] > 0

    infant_fare = calc.calculate_fare(400, 'SL', concession_type='INFANT_UNDER_5')
    assert infant_fare['discount_amount'] == infant_fare['base_fare']

# TC_VINAYAK_13: Cancellation refund tier 48 to 12 hours (25% deduction)
def test_cancellation_refund_tier_48_to_12_hours(calc):
    refund = calc.calculate_cancellation_refund(total_paid=1200, hours_before_departure=24, coach_class='3A')
    assert refund['cancellation_charge'] == 300.0  # 25% of 1200
    assert refund['refund_amount'] == 900.0

# TC_VINAYAK_14: Cancellation refund tier 12 to 4 hours (50% deduction)
def test_cancellation_refund_tier_12_to_4_hours(calc):
    refund = calc.calculate_cancellation_refund(total_paid=1200, hours_before_departure=6, coach_class='3A')
    assert refund['cancellation_charge'] == 600.0  # 50% of 1200
    assert refund['refund_amount'] == 600.0

# TC_VINAYAK_15: Waitlist/RAC flat clerkage refund and UPI QR payload
def test_cancellation_refund_waitlist_clerkage(calc):
    refund = calc.calculate_cancellation_refund(total_paid=500, hours_before_departure=1, status='WL')
    assert refund['cancellation_charge'] == 60.0
    assert refund['refund_amount'] == 440.0

    pay = calc.simulate_payment(440.0, 'UPI')
    assert 'upi://pay' in pay['upi_qr_payload']


# TC_VINAYAK_16: Peak festival & holiday calendar verification
def test_festival_dates_definition():
    from backend.src.fare_calculator.calculator import FESTIVAL_DATES
    assert '2026-12-25' in FESTIVAL_DATES
    assert '2026-01-01' in FESTIVAL_DATES
