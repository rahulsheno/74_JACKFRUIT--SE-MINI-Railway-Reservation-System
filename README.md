# 🚆 Railway Ticket Reservation System (RRS)
**Course**: UE24CS341A - Software Engineering Mini-Project (2026)  
**Topic 74**: Railway Reservation System  
**Repository**: [rahulsheno/74_JACKFRUIT--SE-MINI-Railway-Reservation-System](https://github.com/rahulsheno/74_JACKFRUIT--SE-MINI-Railway-Reservation-System)

---

## 👥 Team Members & Functional Ownership Matrix

| Member | Name & GitHub | Module & Ownership | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Sabbir Mondal** (`SabbirMondal314159`) | **Train Catalog, Routes & Railway API Integration** | Train search by stations & date, live schedule lookup, station routes graph, external Railway API simulation & caching |
| **Member 2** | **Samvit Atur** (`samvitOK`) | **Seat Layout Engine, Allocation & Concurrency Lock** | 2D coach berth layout (1A, 2A, 3A, SL), berth preferences, 5-minute atomic seat locking, RAC/WL queuing |
| **Member 3** | **Vinayak Kalal** (`kalalvinayak23`) | **Fare Calculation Engine, Concessions & Payments** | Dynamic base fare by distance/class, Senior Citizen/Student/Divyangjan concessions, Tatkal surcharges, payment simulation |
| **Member 4 (Lead)** | **Rahul Shenoy** (`rahulsheno`) | **Booking Lifecycle, PNR Engine, Cascade Cancellation** | User JWT Auth, 10-digit PNR tracker, cancellation with automatic promotion cascade (WL -> RAC -> CNF), CI/CD & Docker |

---

## 🏗️ Architecture & Modules

```
railway-reservation-system/
├── backend/
│   ├── src/
│   │   ├── main.py                     # Unified FastAPI application entrypoint
│   │   ├── train_service/              # [Sabbir] Train search, routes, external API mock
│   │   ├── seat_engine/                # [Samvit] Coach layouts, berth allocation, locks
│   │   ├── fare_calculator/            # [Vinayak] Fare engine, concessions, refund rules
│   │   ├── booking_lifecycle/          # [Rahul] PNR generation, cancellation, JWT auth
│   │   └── database/                   # Seed data & in-memory/JSON store
│   └── tests/
│       ├── test_train_service.py       # [Sabbir] 15 Unit tests (Routes, Stations & GPS Radar)
│       ├── test_seat_engine.py         # [Samvit] 15 Unit tests (Coach 2D maps, Locking & Groups)
│       ├── test_fare_calculator.py     # [Vinayak] 16 Unit tests (Tariff, Concessions & Refunds)
│       ├── test_booking_lifecycle.py   # [Rahul] 10 Unit tests (PNR tracker & Cascade Promotion)
│       └── test_api_endpoints.py       # [Full-Stack] 19 REST API Integration Tests
├── frontend/                           # Responsive Interactive UI
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── docs/                               # SE Course Deliverables
│   ├── 01_SYNOPSIS.md
│   ├── 02_SRS_DOCUMENT.md
│   ├── 03_ARCHITECTURE_DESIGN.md
│   └── 04_TEST_PLAN_SPECIFICATION.md
├── .github/workflows/ci.yml            # CI/CD Automated Test Pipeline
├── Dockerfile & docker-compose.yml
└── requirements.txt
```

---

## 🚀 Getting Started

### 1. Run with Python
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.src.main:app --reload --port 8000
```
Open **http://localhost:8000** in your browser to view the interactive UI, or **http://localhost:8000/docs** for the interactive Swagger API documentation.

### 2. Run with Docker
```bash
docker compose up --build
```

### 3. Run Tests with Coverage
```bash
pytest --cov=backend/src --cov-report=term-missing --cov-fail-under=80
```

