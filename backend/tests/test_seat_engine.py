import pytest
import time
from backend.src.seat_engine.allocator import SeatAllocationEngine, CoachLayout

@pytest.fixture
def engine():
    return SeatAllocationEngine()

# TC_SAMVIT_01: Verify coach layout generation for Sleeper (SL)
def test_coach_layout_generation():
    berths = CoachLayout.generate_coach_berths("SL", "SL-1", capacity=16)
    assert len(berths) == 16
    assert berths[0]["berth_type"] == "Lower"
    assert berths[0]["status"] == "AVAILABLE"

# TC_SAMVIT_02: Fetch inventory coach layout
def test_get_coach_layout(engine):
    layout = engine.get_coach_layout("12658", "2026-11-15", "3A")
    assert len(layout) == 16
    assert layout[0]["coach"] == "3A-1"

# TC_SAMVIT_03: Successfully lock an available seat
def test_lock_available_seat(engine):
    ok, lock_id = engine.lock_seat("12658", "2026-11-15", "3A", 1, "user_1")
    assert ok is True
    assert "12658_2026-11-15_3A_1" in lock_id

    # Verify state changed to LOCKED
    layout = engine.get_coach_layout("12658", "2026-11-15", "3A")
    assert layout[0]["status"] == "LOCKED"

# TC_SAMVIT_04: Prevent double-locking on already locked seat (Concurrency race test)
def test_double_lock_prevention(engine):
    ok1, _ = engine.lock_seat("12658", "2026-11-15", "3A", 2, "user_1")
    assert ok1 is True
    ok2, msg = engine.lock_seat("12658", "2026-11-15", "3A", 2, "user_2")
    assert ok2 is False
    assert "already LOCKED" in msg

# TC_SAMVIT_05: Locking non-existent seat number
def test_lock_invalid_seat(engine):
    ok, msg = engine.lock_seat("12658", "2026-11-15", "3A", 999, "user_1")
    assert ok is False
    assert "Seat not found" in msg

# TC_SAMVIT_06: Release active lock manually
def test_release_lock(engine):
    ok, lock_id = engine.lock_seat("12658", "2026-11-15", "3A", 3, "user_1")
    assert ok is True
    released = engine.release_lock(lock_id)
    assert released is True
    layout = engine.get_coach_layout("12658", "2026-11-15", "3A")
    assert layout[2]["status"] == "AVAILABLE"

# TC_SAMVIT_07: Automatic expiration of timed-out locks
def test_expired_lock_cleanup(engine):
    ok, lock_id = engine.lock_seat("12658", "2026-11-15", "3A", 4, "user_1")
    assert ok is True
    # Simulate time lapse past timeout
    engine.active_locks[lock_id]["locked_at"] = time.time() - 301
    layout = engine.get_coach_layout("12658", "2026-11-15", "3A")
    assert layout[3]["status"] == "AVAILABLE"

# TC_SAMVIT_08: Auto-allocate seat with Lower berth preference
def test_allocate_seat_preference(engine):
    res = engine.allocate_best_seat("12658", "2026-11-15", "SL", preference="Lower")
    assert res["status"] == "CNF"
    assert res["seat"]["berth_type"] == "Lower"
    assert res["seat"]["status"] == "BOOKED"

# TC_SAMVIT_09: Auto-allocation defaults when preferred berth unavailable
def test_allocate_seat_default(engine):
    res = engine.allocate_best_seat("12658", "2026-11-15", "SL", preference="NonExistentType")
    assert res["status"] == "CNF"
    assert res["seat"] is not None

# TC_SAMVIT_10: Exhaustion to RAC and Waiting List (WL) queues
def test_exhaustion_to_rac_and_wl(engine):
    # Book all 16 seats in coach
    for _ in range(16):
        engine.allocate_best_seat("22691", "2026-11-20", "1A")
    
    # 17th booking should be RAC 1
    rac_res = engine.allocate_best_seat("22691", "2026-11-20", "1A")
    assert rac_res["status"] == "RAC"
    assert rac_res["queue_position"] == 1

    # Book 3 more RACs (total 4 RACs)
    for _ in range(3):
        engine.allocate_best_seat("22691", "2026-11-20", "1A")

    # Next booking should go to Waiting List (WL 1)
    wl_res = engine.allocate_best_seat("22691", "2026-11-20", "1A")
    assert wl_res["status"] == "WL"
    assert wl_res["queue_position"] == 1


# TC_SAMVIT_11: Contiguous bay/cabin allocation for family bookings
def test_contiguous_group_allocation(engine):
    group = engine.allocate_group_seats('12658', '2026-12-01', '3A', passenger_count=3)
    assert len(group) == 3
    assert all(g['status'] == 'CNF' for g in group)
    seat_nums = [g['seat']['seat_number'] for g in group]
    assert seat_nums == [1, 2, 3]

# TC_SAMVIT_12: Explicit user seat unlock
def test_explicit_user_seat_unlock(engine):
    ok, lock_id = engine.lock_seat('12658', '2026-12-01', '2A', 5, 'session_user_42')
    assert ok is True
    unlocked = engine.release_user_seat_lock('12658', '2026-12-01', '2A', 5, 'session_user_42')
    assert unlocked is True
    layout = engine.get_coach_layout('12658', '2026-12-01', '2A')
    assert layout[4]['status'] == 'AVAILABLE'

# TC_SAMVIT_13: Extend valid lock via heartbeat renewal
def test_renew_seat_lock_valid(engine):
    ok, lock_id = engine.lock_seat('12658', '2026-12-01', 'SL', 6, 'session_user_42')
    assert ok is True
    renewed, msg = engine.renew_seat_lock(lock_id, 'session_user_42')
    assert renewed is True
    assert 'renewed' in msg.lower()

# TC_SAMVIT_14: Renew lock for non-existent or unauthorized lock
def test_renew_seat_lock_expired_or_invalid(engine):
    renewed, msg = engine.renew_seat_lock('invalid_lock_999', 'user_xyz')
    assert renewed is False

# TC_SAMVIT_15: Availability summary report
def test_coach_layout_accessibility_and_summary(engine):
    summary = engine.get_seat_availability_summary('12658', '2026-12-01', '3A')
    assert 'total_seats' in summary
    assert 'available' in summary
    assert summary['total_seats'] == 16


# TC_SAMVIT_16: Coach occupancy breakdown calculation
def test_coach_occupancy_breakdown_valid(engine):
    res = engine.get_coach_occupancy_breakdown('12658', '2026-12-01')
    assert res['status'] == 'SUCCESS'
    assert 'class_breakdown' in res
    assert len(res['class_breakdown']) > 0
    assert 'overall_occupancy_pct' in res

# TC_SAMVIT_17: Coach occupancy breakdown for non-existent train
def test_coach_occupancy_breakdown_invalid(engine):
    res = engine.get_coach_occupancy_breakdown('999999', '2026-12-01')
    assert res['status'] == 'ERROR'
    res_empty = engine.get_coach_occupancy_breakdown('', '2026-12-01')
    assert res_empty['status'] == 'ERROR'
