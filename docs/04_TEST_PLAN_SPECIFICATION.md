# Test Plan & Validation Specification
## Topic 74: Railway Ticket Reservation System
**Subject Code**: UE24CS341A • Jackfruit Phase-3 Deliverable

---

## 1. Overview & Test Strategy
- Total Automated Test Cases: **74 Unit, Component & API Integration Tests** across all 4 student modules.
- Framework: `pytest`
- Execution: Automated in CI/CD pipeline via GitHub Actions on every Pull Request and merge to `main`.
- Pass Rate: **100% (74/74 Passed)**.

---

## 2. Test Cases Table (As per Course Template)

### Member 1: Sabbir Mondal (Train Catalog & Railway API - 15 Tests)
| Test Case ID | Name of Module | Test Case Description | Pre-conditions | Test Steps | Test Data | Expected Result | Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC_SABBIR_01` | Train Service | Retrieve all registered stations | Catalog loaded | Call `get_all_stations()` | None | Count >= 5 stations | **PASS** |
| `TC_SABBIR_02` | Train Service | Fetch valid station by code | Station exists | Call `get_station_by_code('SBC')` | Code: SBC | Returns KSR Bengaluru City | **PASS** |
| `TC_SABBIR_03` | Train Service | Fetch invalid station code | None | Call `get_station_by_code('XYZ99')` | Code: XYZ99 | Returns None | **PASS** |
| `TC_SABBIR_04` | Train Service | Search direct train route | Route active | Call `search_trains('SBC', 'MAS')` | SBC -> MAS | Returns trains 12658 & 12028 | **PASS** |
| `TC_SABBIR_05` | Train Service | Filter by day of run | Date provided | Call with Mon vs Tue date | 2026-11-09 | Matches scheduled days only | **PASS** |
| `TC_SABBIR_06` | Train Service | Search intermediate halt route | Halts exist | Call `search_trains('SBC', 'KPD')` | SBC -> KPD | Distance: 226km calculated | **PASS** |
| `TC_SABBIR_07` | Train Service | Reverse direction exclusion | Directional graph | Call `search_trains('MAS', 'SBC')` | MAS -> SBC | Excludes wrong direction trains | **PASS** |
| `TC_SABBIR_08` | Train Service | Fetch valid train schedule | Train exists | Call `get_train_schedule('12658')` | Train: 12658 | Returns timetable & live status | **PASS** |
| `TC_SABBIR_09` | Train Service | Fetch invalid train schedule | Train absent | Call `get_train_schedule('99999')` | Train: 99999 | Returns None | **PASS** |
| `TC_SABBIR_10` | Train Service | External API error response | NTES mock | Call `fetch_live_status('00000')` | Train: 00000 | Status: ERROR message | **PASS** |
| `TC_SABBIR_11` | Train Service | Return paired train search | Catalog loaded | Call `search_trains('MAS', 'SBC')` | MAS -> SBC | Finds 12657 & 12027 paired trains | **PASS** |
| `TC_SABBIR_12` | Train Service | Station amenities lookup | SBC exists | Call `get_station_facilities('SBC')` | SBC | Returns WiFi, platforms & amenities | **PASS** |
| `TC_SABBIR_13` | Train Service | Invalid station facilities | Bad code | Call `get_station_facilities('BAD')` | Bad code | Returns None | **PASS** |
| `TC_SABBIR_14` | Train Service | Live satellite GPS telemetry | Valid train | Call `get_live_gps_tracking('12658')` | Train: 12658 | Returns coordinates, speed, heading | **PASS** |
| `TC_SABBIR_15` | Train Service | GPS telemetry invalid train | Invalid train | Call `get_live_gps_tracking('00000')` | Train: 00000 | Returns ERROR status | **PASS** |

### Member 2: Samvit Atur (Seat Layout & Concurrency Locks - 15 Tests)
| Test Case ID | Name of Module | Test Case Description | Pre-conditions | Test Steps | Test Data | Expected Result | Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC_SAMVIT_01` | Seat Engine | Generate Sleeper coach layout | SL Class | Call `generate_coach_berths('SL', 'SL-1')` | Capacity: 16 | 16 berths with Lower/Middle/Upper | **PASS** |
| `TC_SAMVIT_02` | Seat Engine | Fetch inventory layout | Inventory ready | Call `get_coach_layout('12658', '2026-11-15', '3A')` | Class: 3A | Returns 16 available berths | **PASS** |
| `TC_SAMVIT_03` | Seat Engine | Successfully lock available seat | Seat available | Call `lock_seat(seat=1)` | Seat #1 | Returns True & Lock ID | **PASS** |
| `TC_SAMVIT_04` | Seat Engine | Prevent double-locking (Race test) | Seat 2 locked | User 2 calls `lock_seat(seat=2)` | Seat #2 | Returns False (Already LOCKED) | **PASS** |
| `TC_SAMVIT_05` | Seat Engine | Lock non-existent seat | Out of range | Call `lock_seat(seat=999)` | Seat #999 | Returns False (Seat not found) | **PASS** |
| `TC_SAMVIT_06` | Seat Engine | Manually release active lock | Lock active | Call `release_lock(lock_id)` | Lock ID | Seat returns to AVAILABLE | **PASS** |
| `TC_SAMVIT_07` | Seat Engine | Automatic expired lock cleanup | 301s passed | Advance time past 300s & query layout | Expired lock | Status resets to AVAILABLE | **PASS** |
| `TC_SAMVIT_08` | Seat Engine | Lower berth preference allocation | Lower available | Call `allocate_best_seat(pref='Lower')` | Lower pref | Allocates Lower berth | **PASS** |
| `TC_SAMVIT_09` | Seat Engine | Default fallback allocation | Unknown pref | Call `allocate_best_seat(pref='Any')` | Invalid pref | Allocates first available seat | **PASS** |
| `TC_SAMVIT_10` | Seat Engine | Queue overflow to RAC and WL | Coach 100% full | Book 17th and 21st passenger | Over capacity | Assigns RAC 1 and WL 1 | **PASS** |
| `TC_SAMVIT_11` | Seat Engine | Contiguous family group booking | Available seats | Call `allocate_group_seats(count=3)` | 3 passengers | Allocates contiguous seats 1, 2, 3 | **PASS** |
| `TC_SAMVIT_12` | Seat Engine | Explicit user seat unlock | User locked seat | Call `release_user_seat_lock()` | Seat #5 | Seat reverts to AVAILABLE | **PASS** |
| `TC_SAMVIT_13` | Seat Engine | Heartbeat lock renewal | Active lock | Call `renew_seat_lock(lock_id)` | Valid lock | Extends lock by 5 minutes | **PASS** |
| `TC_SAMVIT_14` | Seat Engine | Renew invalid or unauthorized lock | Expired/Bad user | Call with bad lock id | Invalid id | Returns False | **PASS** |
| `TC_SAMVIT_15` | Seat Engine | Coach availability summary | Inventory ready | Call `get_seat_availability_summary()` | Class: 3A | Returns counts and status text | **PASS** |

### Member 3: Vinayak Kalal (Fare Engine & Concessions - 15 Tests)
| Test Case ID | Name of Module | Test Case Description | Pre-conditions | Test Steps | Test Data | Expected Result | Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC_VINAYAK_01` | Fare Engine | Calculate Sleeper base fare | Dist: 360km | Call `calculate_fare(360, 'SL')` | 360km, SL | Total: ₹192 (no GST) | **PASS** |
| `TC_VINAYAK_02` | Fare Engine | Apply 5% GST on AC 3-Tier | Dist: 360km | Call `calculate_fare(360, '3A')` | 360km, 3A | GST applied, Total: ₹576 | **PASS** |
| `TC_VINAYAK_03` | Fare Engine | Senior Citizen Male discount (40%) | Valid age | Call with `SENIOR_CITIZEN_MALE` | 500km, 2A | 40% discount deducted from base | **PASS** |
| `TC_VINAYAK_04` | Fare Engine | Divyangjan discount (75%) | PwD pass | Call with `DIVYANGJAN` | 1000km, 3A | 75% discount deducted | **PASS** |
| `TC_VINAYAK_05` | Fare Engine | Tatkal quota premium surcharge | Tatkal quota | Call with `quota='TATKAL'` | 500km, 3A | Surcharge added to total | **PASS** |
| `TC_VINAYAK_06` | Fare Engine | Reject invalid coach class | Bad input | Call with class `INVALID` | Invalid class | Raises ValueError | **PASS** |
| `TC_VINAYAK_07` | Fare Engine | Reject negative/zero distance | Bad distance | Call with distance -50km | -50km | Raises ValueError | **PASS** |
| `TC_VINAYAK_08` | Fare Engine | Refund > 48 hours before departure | Departure >48h | Call `calculate_cancellation_refund(1000, 50)` | Paid: 1000 | Flat ₹180 clerkage, refund ₹820 | **PASS** |
| `TC_VINAYAK_09` | Fare Engine | Refund < 4 hours before departure | Departure <4h | Call with hours = 2 | Paid: 1000 | No refund (₹0.00) | **PASS** |
| `TC_VINAYAK_10` | Fare Engine | Payment simulation receipt | Amount > 0 | Call `simulate_payment(550.0, 'UPI')` | ₹550.0 | Status: SUCCESS, TXN ID generated | **PASS** |
| `TC_VINAYAK_11` | Fare Engine | Armed Forces / Defense concession | Defense pass | Call with `ARMED_FORCES` | 500km, 3A | 50% discount deducted | **PASS** |
| `TC_VINAYAK_12` | Fare Engine | Child (5-11) & Infant (<5) policy | Child age | Call with `CHILD_5_11`, `INFANT_UNDER_5` | 400km, SL | Child: 50% off, Infant: Free | **PASS** |
| `TC_VINAYAK_13` | Fare Engine | Refund 48 to 12 hours prior | 24h prior | Call with hours = 24 | Paid: 1200 | 25% deduction, refund ₹900 | **PASS** |
| `TC_VINAYAK_14` | Fare Engine | Refund 12 to 4 hours prior | 6h prior | Call with hours = 6 | Paid: 1200 | 50% deduction, refund ₹600 | **PASS** |
| `TC_VINAYAK_15` | Fare Engine | WL/RAC flat clerkage refund & QR | WL status | Call with status='WL' | Paid: 500 | Flat ₹60 deduction, refund ₹440 | **PASS** |

### Member 4: Rahul Shenoy (Booking Lifecycle, Integration & DevOps - 29 Tests)
| Test Case ID | Name of Module | Test Case Description | Pre-conditions | Test Steps | Test Data | Expected Result | Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC_LEAD_01` | Booking Lifecycle | End-to-end confirmed booking | Seats free | Call `book_ticket()` | SBC->MAS, 3A | 10-digit PNR, Status CNF | **PASS** |
| `TC_LEAD_02` | Booking Lifecycle | Query valid 10-digit PNR | Booking exists | Call `get_pnr_status(pnr)` | Valid PNR | Returns complete ticket object | **PASS** |
| `TC_LEAD_03` | Booking Lifecycle | Query non-existent PNR | None | Call `get_pnr_status('0000000000')` | 0000000000 | Returns None | **PASS** |
| `TC_LEAD_04` | Booking Lifecycle | Reject empty passenger booking | No passengers | Call `book_ticket(passengers=[])` | Empty list | Raises ValueError | **PASS** |
| `TC_LEAD_05` | Booking Lifecycle | Reject non-existent train booking | Invalid train | Call with train `99999` | Train 99999 | Raises ValueError | **PASS** |
| `TC_LEAD_06` | Booking Lifecycle | Reject invalid station route | Bad stations | Call with NDLS->HWH on 12658 | Wrong route | Raises ValueError | **PASS** |
| `TC_LEAD_07` | Booking Lifecycle | Query user booking history | 2 bookings | Call `get_user_bookings('u5')` | User: u5 | Returns both booking records | **PASS** |
| `TC_LEAD_08` | Booking Lifecycle | Cancel ticket & calculate refund | Confirmed ticket| Call `cancel_ticket(pnr, 50.0)` | Valid PNR | Status CANCELLED, refund issued | **PASS** |
| `TC_LEAD_09` | Booking Lifecycle | Reject duplicate cancellation | Already cancel | Call `cancel_ticket(pnr)` twice | Cancelled PNR | Raises ValueError | **PASS** |
| `TC_LEAD_10` | Booking Lifecycle | Cascade Auto-Promotion (RAC->CNF) | RAC passenger | Cancel 1st CNF ticket | Confirmed PNR | RAC passenger upgraded to CNF | **PASS** |
| `TC_API_01` to `19` | Unified REST API | Integration tests for all endpoints | FastAPI Server | HTTP GET/POST via TestClient | 19 API Routes | All HTTP 200/400 verified | **PASS** |