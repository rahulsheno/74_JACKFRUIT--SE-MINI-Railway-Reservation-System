# Railway Ticket Reservation System (RRS) & IRCTC Connect
## Comprehensive Full-Stack Operational Manual
**Topic 74**: Railway Ticket Reservation System  
**Course Code**: `UE24CS341A` • Software Engineering Mini-Project 2026  
**Milestone Release**: `v1.0.0-sprint1` (Sprint 1 MVP) & Modern Full-Stack Portal (IRCTC Connect)

---

## 📋 Table of Contents
1. [Overview & Tech Stack](#1-overview--tech-stack)
2. [How to Run the Application](#2-how-to-run-the-application)
   - [Method A: Modern React 19 + Express Full-Stack Portal (Recommended)](#method-a-modern-react-19--express-full-stack-portal)
   - [Method B: FastAPI Python Backend & Core Engine](#method-b-fastapi-python-backend--core-engine)
3. [Web Endpoints & Access URLs](#3-web-endpoints--access-urls)
4. [Running the Automated Test Suite (84/84 Tests)](#4-running-the-automated-test-suite-8484-tests)
5. [Feature Guide & Capabilities](#5-feature-guide--capabilities)
6. [Team Member Ownership & Contributions](#6-team-member-ownership--contributions)
7. [Project Directory Architecture](#7-project-directory-architecture)

---

## 1. Overview & Tech Stack

The repository provides a dual, enterprise-grade architecture:

1. **Modern Frontend (IRCTC Connect)**:
   * **Framework**: React 19, Vite 6, Tailwind CSS
   * **UI/UX**: Lucide React icons, responsive mobile-first Indian Railways theme, authentic Vande Bharat & Rajdhani branding
   * **Features**: Live train search, interactive berth selection, meal preference selector, PDF ticket generator (`jspdf`, `html2canvas`), PNR status modal, live GPS tracking radar (`RailRadar API`).

2. **Express & SHA-256 Hash Backend (`server.js`)**:
   * **Server**: Node.js & Express (Port `5000`)
   * **Security**: SHA-256 cryptographic hash-chained ticket verification database (`server/hashDb.js`, `server/sqliteDb.js`, `data/railway.db`)
   * **Communication**: Real email delivery via Resend API and Gmail SMTP for instant e-ticket reservation slips.

3. **FastAPI Engine & Test Suite (`backend/src/main.py`)**:
   * **Server**: Python FastAPI & Uvicorn (Port `8000`)
   * **Quality**: 84 Automated pytest unit and integration tests across 4 student modules.

---

## 2. How to Run the Application

### Method A: Modern React 19 + Express Full-Stack Portal

This launches both the **Express backend server** (port 5000) and the **Vite React frontend** (port 5173) simultaneously:

```powershell
npm run all
```

*Or launch them in separate terminals if preferred:*
* **Terminal 1 (Backend Server)**:
  ```powershell
  npm run server
  ```
* **Terminal 2 (React Frontend)**:
  ```powershell
  npm run dev
  ```

> Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

### Method B: FastAPI Python Backend & Core Engine

To start the FastAPI REST API server:

```powershell
python -m uvicorn backend.src.main:app --host 127.0.0.1 --port 8000 --reload
```

> Open your browser and navigate to: **[http://127.0.0.1:8000](http://127.0.0.1:8000)** (or Swagger Docs at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**)

---

## 3. Web Endpoints & Access URLs

| Application / Service | URL | Technology | Description |
| :--- | :--- | :--- | :--- |
| **IRCTC Connect Web Portal** | [http://localhost:5173](http://localhost:5173) | React 19 + Tailwind | Complete interactive booking UI |
| **Email & Hash DB Server** | [http://localhost:5000](http://localhost:5000) | Express.js | Ticket hashing & real inbox delivery |
| **FastAPI REST API Gateway** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | FastAPI | Core academic REST API & Static UI |
| **Interactive Swagger API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | OpenAPI / Swagger | Interactive endpoint execution |
| **ReDoc API Documentation** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | ReDoc | Clean schema & data models |

---

## 4. Running the Automated Test Suite (84/84 Tests)

To execute all **84 automated tests** across all 4 student modules:

```powershell
python -m pytest backend/tests/ -v
```

### Module Test Breakdown:
* **Train Catalog & Routes (Sabbir - 17 Tests)**:
  ```powershell
  python -m pytest backend/tests/test_train_service.py -v
  ```
* **Seat Allocation & Concurrency Locks (Samvit - 17 Tests)**:
  ```powershell
  python -m pytest backend/tests/test_seat_engine.py -v
  ```
* **CRIS Fare Engine & Tax Invoices (Vinayak - 18 Tests)**:
  ```powershell
  python -m pytest backend/tests/test_fare_calculator.py -v
  ```
* **Booking Lifecycle & Cascade Promotion (Rahul - 10 Tests)**:
  ```powershell
  python -m pytest backend/tests/test_booking_lifecycle.py -v
  ```
* **API Integration Tests (22 Tests)**:
  ```powershell
  python -m pytest backend/tests/test_api_endpoints.py -v
  ```

---

## 5. Feature Guide & Capabilities

### 1. Interactive Train Search Engine
* Search between major junctions (NDLS, MMCT, CSMT, HWH, MAS, SBC, BSB, JP, GOA, etc.) with autocomplete.
* Class selection (CC / 3A / 2A / 1A / EC / SL).
* Quota selection: General, Tatkal, Premium Tatkal, Ladies, and Senior Citizen lower berth.

### 2. Live Satellite Radar & Train Tracking
* Real-time GPS coordinates, speed (km/h), and approaching halt powered by the `RailRadar API`.
* Interactive delay indicators and timetable tracking.

### 3. Interactive Coach & Berth Selector
* Realistic visual layout for selecting specific berths: Window Seat (WS), Lower Berth (LB), Middle Berth (MB), Upper Berth (UB), Side Lower (SL), and Side Upper (SU).
* Priority allocation of lower berths for senior citizen passengers.
* IRCTC Onboard Catering selection: Pure Veg, Non-Veg, Jain Satvik, or No Meal.

### 4. Cryptographic SHA-256 E-Ticket Verification
* Every booked ticket generates a tamper-proof SHA-256 cryptographic hash.
* Hashed records are stored in `data/railway.db` and verified on demand.

### 5. Email Confirmation & Printable PDF Ticket
* Real inbox e-ticket delivery powered by Resend API and Gmail SMTP.
* Direct in-browser PDF Electronic Reservation Slip (ERS) generation with QR code for TTE verification.

---

## 6. Team Member Ownership & Contributions

| Member | Student ID / GitHub | Subsystem Responsibility | Key Technical Deliverables |
| :--- | :--- | :--- | :--- |
| **Sabbir Mondal** | `SabbirMondal314159` | **Train Catalog & Live Services** | Train search graph, station amenities directory, live GPS satellite telemetry, timetable delay tracking. |
| **Samvit Atur** | `samvitOK` | **Seat Engine & Concurrency** | 2D coach visualizer, 5-minute concurrency seat locks, heartbeat renewals, coach occupancy radar. |
| **Vinayak Kalal** | `kalalvinayak23` | **CRIS Dynamic Fare Engine** | Distance tariffs, 5 concession policies, festival surge pricing, 4-tier refund matrix, GST tax invoices (SAC 9964). |
| **Rahul Shenoy** | `rahulsheno` | **Booking Lifecycle & Full-Stack Lead** | 10-digit PNR state machine, cascading RAC/WL auto-promotion, unified API gateway, CI/CD pipeline, and system integration. |

---

## 7. Project Directory Architecture

```
Railway Reservation System/
├── src/                                # React 19 Frontend Components
│   ├── components/                     # HeroSearch, BookingModal, ETicketModal, SeatSelectorModal, etc.
│   ├── context/                        # Auth & Language Contexts
│   ├── services/                       # RailRadar, Email, Govt ID Validator, Train Engine
│   ├── data/                           # IRCTC static timetables & multilingual data
│   ├── App.jsx                         # Main React application controller
│   └── main.jsx                        # React root entry
├── public/                             # Static public assets & destination images
├── server/                             # Node backend services
│   └── hashDb.js                       # Cryptographic SHA-256 ticket database service
├── data/                               # Persistence store
│   └── railway.db                      # SQLite 3 ACID relational & hash ledger
├── backend/                            # Python FastAPI Backend
│   ├── src/                            # 4 Subsystems (Train, Seat, Fare, Booking)
│   └── tests/                          # 84 Automated pytest unit and integration tests
├── docs/                               # SE Course Deliverables
│   ├── 01_SYNOPSIS.md
│   ├── 02_SRS_DOCUMENT.md
│   ├── 03_ARCHITECTURE_DESIGN.md
│   ├── 04_TEST_PLAN_SPECIFICATION.md
│   ├── 05_SPRINT_1_REVIEW_AND_SIGNOFF.md
│   └── jira_import_ready.csv
├── server.js                           # Express.js Email & Ticket Verification Server
├── vite.config.js                      # Vite frontend bundler config
├── package.json                        # Node.js dependencies & scripts
├── requirements.txt                    # Python dependencies
└── gemini.md                           # Operational Execution Manual
```
