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
