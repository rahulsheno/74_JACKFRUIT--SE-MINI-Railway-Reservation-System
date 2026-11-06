# Railway Ticket Reservation System (RRS)
## Comprehensive Execution & Operational Manual
**Topic 74**: Railway Ticket Reservation System  
**Course Code**: `UE24CS341A` • Software Engineering Mini-Project 2026  
**Milestone Release**: `v1.0.0-sprint1` (Sprint 1 Production-Ready MVP)  
**Sprint 1 Status**: **100% Complete & Signed Off**  
**Sprint 2 Commencement**: **Wednesday, 07-11-2026**

---

## 📋 Table of Contents
1. [Prerequisites & Environment Setup](#1-prerequisites--environment-setup)
2. [How to Run the Application](#2-how-to-run-the-application)
3. [Accessing Web Endpoints](#3-accessing-web-endpoints)
4. [Running the Automated Test Suite (84/84 Tests)](#4-running-the-automated-test-suite-8484-tests)
5. [End-to-End Feature Tour & Testing Guide](#5-end-to-end-feature-tour--testing-guide)
6. [Team Member Ownership & Contributions](#6-team-member-ownership--contributions)
7. [Project Structure & Architecture](#7-project-structure--architecture)
8. [Sprint 1 Sign-Off & Sprint 2 Notice](#8-sprint-1-sign-off--sprint-2-notice)

---

## 1. Prerequisites & Environment Setup

### System Requirements
* **Operating System**: Windows 10/11, macOS, or Linux
* **Python**: Python 3.10+ (Tested on Python 3.13)
* **Web Browser**: Any modern browser (Chrome, Firefox, Edge, Safari)

### Setup Instructions
1. Open PowerShell or Command Prompt.
2. Navigate to the project root directory:
   ```powershell
   cd "c:\Users\Prabha Prabhu\Downloads\Railway Reservation System"
   ```
3. (Optional but recommended) Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
4. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

---

## 2. How to Run the Application

The application features a unified FastAPI server that serves both the **REST API backend** and the **responsive single-page frontend** simultaneously.

### Start the Server:
```powershell
python -m uvicorn backend.src.main:app --host 127.0.0.1 --port 8000 --reload
```

* Output in console will display:
  ```
  INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
  INFO:     Started reloader process
  INFO:     Started server process
  INFO:     Application startup complete.
  ```

---

## 3. Accessing Web Endpoints

Once the server is running, open your browser:

| Interface | URL | Purpose |
| :--- | :--- | :--- |
| **Interactive Web Application** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Full customer-facing reservation UI |
| **Interactive API Documentation** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI for executing and testing REST endpoints |
| **Alternative API Reference** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean ReDoc OpenAPI documentation |

---

## 4. Running the Automated Test Suite (84/84 Tests)

The project includes an exhaustive automated test suite using `pytest`. All 84 test cases execute in under 1 second with a **100% pass rate**.

### Execute All 84 Tests:
```powershell
python -m pytest backend/tests/ -v
```

### Run Tests by Subsystem Module:

1. **Sabbir's Module** (Train Service & Route Search - 17 Tests):
   ```powershell
   python -m pytest backend/tests/test_train_service.py -v
   ```

2. **Samvit's Module** (Seat Engine, 2D Coach & Concurrency - 17 Tests):
   ```powershell
   python -m pytest backend/tests/test_seat_engine.py -v
   ```

3. **Vinayak's Module** (Fare Calculation, Concessions & Tax Invoices - 18 Tests):
   ```powershell
   python -m pytest backend/tests/test_fare_calculator.py -v
   ```

4. **Rahul's Module** (Booking Lifecycle, PNR & Cascade Auto-Promotion - 10 Tests):
   ```powershell
   python -m pytest backend/tests/test_booking_lifecycle.py -v
   ```

5. **Full-Stack API Integration Tests** (FastAPI TestClient - 22 Tests):
   ```powershell
   python -m pytest backend/tests/test_api_endpoints.py -v
   ```

---

## 5. End-to-End Feature Tour & Testing Guide

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser and test the following complete workflow:

### Step 1: Train Search & Station Lookup (Sabbir)
* In the **From Station** dropdown, select `KSR Bengaluru City (SBC)`.
* In the **To Station** dropdown, select `MGR Chennai Central (MAS)`.
* Pick any travel date (e.g. `2026-11-09`).
* Click **Find Trains**.
* Search returns bidirectional express trains: **12658 (Chennai Mail)** and **12028 (Shatabdi Express)**.

### Step 2: Station Infrastructure & Amenities Modal (Sabbir)
* On the train card, click on any station code link (e.g. `SBC ℹ️` or `MAS ℹ️`).
* A modal opens displaying real station amenities: Platform count, Wi-Fi status, Retiring rooms, Wheelchair accessibility, Cloak rooms, and Food courts.

### Step 3: Live Satellite GPS Radar Modal (Sabbir)
* Click **[ 🛰️ Live Radar ]** on any train card.
* A live radar modal opens simulating NTES satellite telemetry with speed (km/h), GPS coordinates (latitude/longitude), heading, approaching halt, and green signal status.

### Step 4: Live Station Running Status & Delay Timetable (Sabbir)
* Click **[ ⏱️ Delays ]** on any train card.
* Displays intermediate station halts, scheduled departure, platform numbers, dynamic delay minutes, and status (`DEPARTED`, `ARRIVED`, `UPCOMING`).

### Step 5: 2D Interactive Coach Visualizer & Seat Locking (Samvit)
* Click **[ 💺 2D Coach ]** or navigate to the **2D Coach Visualizer** tab.
* Select a coach class (`3A`, `2A`, `1A`, `SL`, or `CC`).
* Click any green seat to lock it.
* A 5-minute countdown timer appears. You can renew the lock via heartbeat or explicitly click **[ ✕ Release Lock ]** to make it available again.

### Step 6: Coach Occupancy & Capacity Utilization Radar (Samvit)
* Click **[ 📊 Occupancy ]** on a train card.
* Displays class-by-class capacity breakdown, available seats, locked seats, confirmed seats, RAC count, waiting list count, and visual percentage progress bars.

### Step 7: Booking with Concessions & Dynamic Surcharges (Vinayak & Rahul)
* Click **Book Now** on your desired travel class.
* Add passenger names, ages, and genders.
* Choose concessions:
  - `SENIOR_CITIZEN_MALE` (40% discount)
  - `SENIOR_CITIZEN_FEMALE` (50% discount)
  - `DIVYANGJAN` (75% discount)
  - `ARMED_FORCES` (50% defense concession)
  - `CHILD_5_11` (50% child fare policy)
  - `INFANT_UNDER_5` (100% free infant policy)
* Select Quota (`GENERAL` or `TATKAL` premium).
* Click **Proceed to Booking**, choose Payment Method (`UPI`, `Card`, `Net Banking`), and click **Authorize & Book Ticket**.

### Step 8: View Confirmed 10-Digit PNR & E-Ticket (Rahul)
* The system instantly generates a unique 10-digit PNR (e.g. `4829104812`).
* Displays allocated Coach, Seat Number, Berth Type (`Lower`, `Middle`, `Upper`, `Side Lower`), and Transaction ID.

### Step 9: Official CRIS GST Tax Invoice with SAC 9964 (Vinayak)
* On the confirmed ticket, click **[ 🧾 View GST Tax Invoice ]**.
* Opens an itemized official tax invoice complying with Indian Railway CRIS standards:
  - SAC Code: `9964` (Passenger transport by railways)
  - CRIS GSTIN: `29AAACR1234F1Z5`
  - 5% GST breakdown (2.5% CGST + 2.5% SGST) for AC classes, 0% GST exemption for Sleeper
  - IRCTC convenience fee (₹15 + 18% GST) & optional travel insurance (₹0.35/pax)
  - One-click print/save receipt functionality.

### Step 10: Cancellation & Automatic Cascading Promotion (Vinayak & Rahul)
* Click **[ ✕ Cancel Ticket & Claim Refund ]**.
* An interactive cancellation timeframe preview allows selecting cancellation notice:
  - `>48 hours` (Flat clerkage fee)
  - `48 to 12 hours` (25% deduction)
  - `12 to 4 hours` (50% deduction)
  - `<4 hours` (0% refund)
* Confirm cancellation: The booking status updates to `CANCELLED`, refund is processed, and any existing RAC passengers in the queue are **automatically promoted to Confirmed (CNF)** with re-indexed queue positions.

---

## 6. Team Member Ownership & Contributions

| Member | Student ID / GitHub | Subsystem Responsibility | Deliverables Completed | Automated Tests |
| :--- | :--- | :--- | :--- | :---: |
| **Sabbir Mondal** | `SabbirMondal314159` | **Train Catalog & Railway API** | • 6 Junction Terminals & 6 Return Train Pairs<br>• Station Facilities & Amenities Directory<br>• Live GPS Satellite Telemetry<br>• NTES Live Running Delays & Platforms | **17 Tests**<br>(100% Pass) |
| **Samvit Atur** | `samvitOK` | **Seat Layout & Concurrency Locks** | • 2D Coach Berth Visualizer (SL, 3A, 2A, 1A, CC)<br>• 5-minute High-Concurrency Seat Locking<br>• Lock Heartbeat Renewal & Explicit Release<br>• Contiguous Bay/Cabin Family Allocations<br>• Coach Occupancy & Capacity Utilization Radar | **17 Tests**<br>(100% Pass) |
| **Vinayak Kalal** | `kalalvinayak23` | **CRIS Dynamic Fare Engine** | • Distance Tariff Calculation with 5% GST<br>• Concessions: Senior Citizen, Divyangjan, Defense, Child, Infant<br>• Holiday Dynamic Surge Pricing Calendar<br>• Standard 4-Tier Cancellation Refund Matrix<br>• CRIS GST Tax Invoices (SAC 9964) with CGST/SGST | **18 Tests**<br>(100% Pass) |
| **Rahul Shenoy** | `rahulsheno` | **Booking Lifecycle & Full-Stack Lead** | • 10-Digit PNR State Machine & Ticket Store<br>• Cascading Auto-Promotion (RAC->CNF, WL->RAC)<br>• Unified FastAPI Server with CORS & Static Mount<br>• Interactive Single-Page UI with 8 Modal Dialogs<br>• GitHub Actions CI/CD Pipeline | **32 Tests**<br>(100% Pass) |

---

## 7. Project Structure & Architecture

```
74_JACKFRUIT--SE-MINI-Railway-Reservation-System/
├── backend/
│   ├── src/
│   │   ├── main.py                     # Unified FastAPI server & routes
│   │   ├── train_service/              # [Sabbir] Train search, routes, external API mock
│   │   ├── seat_engine/                # [Samvit] Coach 2D layout, locks, family allocator
│   │   ├── fare_calculator/            # [Vinayak] CRIS distance tariff, concessions, GST
│   │   ├── booking_lifecycle/          # [Rahul] 10-digit PNR, auto-promotion cascade
│   │   └── database/                   # Seed data & in-memory store
│   └── tests/
│       ├── test_train_service.py       # [Sabbir] 17 Unit tests
│       ├── test_seat_engine.py         # [Samvit] 17 Unit tests
│       ├── test_fare_calculator.py     # [Vinayak] 18 Unit tests
│       ├── test_booking_lifecycle.py   # [Rahul] 10 Unit tests
│       └── test_api_endpoints.py       # [Full-Stack] 22 REST API Integration Tests
├── frontend/                           # Responsive Interactive UI
│   ├── index.html                      # HTML with 8 modal dialogs
│   ├── app.js                          # REST API client & view controller
│   └── styles.css                      # Modern responsive styling
├── docs/                               # SE Course Deliverables
│   ├── 01_SYNOPSIS.md                  # Project scope & synopsis
│   ├── 02_SRS_DOCUMENT.md              # IEEE 830 SRS document
│   ├── 03_ARCHITECTURE_DESIGN.md       # Architecture & C4 diagrams
│   ├── 04_TEST_PLAN_SPECIFICATION.md   # 84-Test traceability matrix
│   ├── 05_SPRINT_1_REVIEW_AND_SIGNOFF.md # Formal Sprint 1 sign-off report
│   └── jira_import_ready.csv           # 1-click Jira bulk-import template
├── scripts/                            # Automation tooling
│   └── generate_jira_csv.py            # Jira CSV generator
├── .github/workflows/ci.yml            # CI/CD automated test pipeline
├── Dockerfile & docker-compose.yml     # Containerization setup
├── requirements.txt                    # Python dependencies
└── README.md                           # GitHub repository overview
```

---

## 8. Sprint 1 Sign-Off & Sprint 2 Notice

* **Sprint 1 Code Freeze**: Effective as of commit `e4679b7` with Git tag `v1.0.0-sprint1`.
* **Lock Status**: **No code commits** will take place until the team convenes for Sprint 2 on **Wednesday, 07-11-2026**.
* **Sprint 2 Target Goals**:
  1. Persistent Database Layer (SQLite/PostgreSQL with SQLAlchemy & Alembic migrations).
  2. WebSocket Live Telemetry for real-time train movement and push alerts for RAC-to-CNF confirmations.
  3. Payment Gateway Webhook integration for simulated UPI/Card settlement callbacks.
  4. Station Master / Administrative Management Console.
