# Sprint 2 Backlog Specification
**Topic 74**: Railway Ticket Reservation System (RRS) & IRCTC Connect  
**Course Code**: `UE24CS341A` • Software Engineering Mini-Project 2026  
**Jira Board**: [https://rahulshenoy0000.atlassian.net/jira/software/c/projects/RRS/boards/1/backlog](https://rahulshenoy0000.atlassian.net/jira/software/c/projects/RRS/boards/1/backlog)  
**Total Story Points**: 36 SP | **Target Sprint**: Sprint 2  

---

## 📋 Sprint 2 User Story Breakdown

### Subsystem 1: Train Catalog & Live Services
**Owner**: Sabbir Mondal (`fakesabm@gmail.com`) • **Reporter**: Rahul Shenoy (`rahulshenoy0000@gmail.com`)

---

#### 🔹 [RRS-17] Local Timezone Scheduling and Indian Standard Time Date Handler
* **Issue Type**: Story
* **Epic**: Train Catalog
* **Story Points**: 3 SP
* **Status**: To Do
* **Description**:
  > **As a** passenger searching for train journeys across India,  
  > **I want** the search date and timetable queries to strictly reflect Indian Standard Time (IST, UTC+5:30),  
  > **So that** late-night bookings between 12:00 AM and 05:30 AM IST do not shift backwards to yesterday's date due to UTC anomalies.
* **Acceptance Criteria**:
  - `Given` a user searches for trains between 12:00 AM and 05:30 AM IST,
  - `When` the "Today" quick filter is clicked,
  - `Then` the selected date must match local IST calendar date (`YYYY-MM-DD` / `DD-MM-YYYY`).
  - `Given` departure timestamps across train cards,
  - `When` rendered in the UI,
  - `Then` all time displays must match the local clock without UTC drift.
* **Technical Artifacts**:
  - Implementation: `src/services/dateHelper.js` (`getLocalDateString`, `getLocalDateObj`)
  - Integration: `src/components/HeroSearch.jsx`, `src/components/BookingModal.jsx`

---

#### 🔹 [RRS-18] Live GPS Train Radar Telemetry and Real-Time Delay Tracking
* **Issue Type**: Story
* **Epic**: Train Catalog
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** passenger or rail commuter,  
  > **I want** to view real-time satellite telemetry and live radar status for selected trains,  
  > **So that** I can track current speed, upcoming halts, platform numbers, and live delay minutes.
* **Acceptance Criteria**:
  - `Given` a valid train number (e.g., `#22436` Vande Bharat),
  - `When` the user opens the Live Train Radar modal,
  - `Then` real-time GPS coordinates, speed (km/h), delay status, and approaching junction are displayed.
  - `Given` network or satellite latency,
  - `When` fetching live telemetry,
  - `Then` an active radar pulse visualizer indicates live data refresh.
* **Technical Artifacts**:
  - Implementation: `src/services/railRadarService.js`
  - Integration: `src/components/LiveTrainModal.jsx`

---

### Subsystem 2: Seat Engine & Concurrency
**Owner**: Samvit Atur (`samvitaturbtw@gmail.com`) • **Reporter**: Rahul Shenoy (`rahulshenoy0000@gmail.com`)

---

#### 🔹 [RRS-19] Interactive 2D Coach Visualizer with Authentic IRCTC Berth Layouts
* **Issue Type**: Story
* **Epic**: Seat Engine
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** passenger booking a train ticket,  
  > **I want** an interactive 2D graphical map of the coach layout,  
  > **So that** I can view and choose specific seat positions (Window Seat, Lower Berth, Middle Berth, Upper Berth, Side Lower).
* **Acceptance Criteria**:
  - `Given` selected travel class (AC Executive, 1A, 2A, 3A, SL),
  - `When` the seat selector modal is opened,
  - `Then` a 2D coach visualizer displays occupied vs. available berths with clear color indicators.
  - `Given` an available berth is clicked,
  - `When` confirmed,
  - `Then` the selected seat number and berth preference are bound to the passenger booking payload.
* **Technical Artifacts**:
  - Implementation: `src/components/SeatSelectorModal.jsx`
  - Backend: `backend/src/seat_engine/`

---

#### 🔹 [RRS-20] Lower Berth Priority Allocation for Senior Citizens & Onboard Catering
* **Issue Type**: Story
* **Epic**: Seat Engine
* **Story Points**: 3 SP
* **Status**: To Do
* **Description**:
  > **As a** senior citizen (age 60+) or female passenger,  
  > **I want** the system to automatically prioritize lower berths and offer onboard meal options,  
  > **So that** travel comfort and accessibility requirements are met per IRCTC policy.
* **Acceptance Criteria**:
  - `Given` a passenger whose entered age is 60 or above,
  - `When` seats are allocated,
  - `Then` the seat engine prioritizes Lower Berth (LB) allocation over Upper/Middle.
  - `Given` meal preference selection during booking,
  - `When` chosen (Pure Veg, Non-Veg, Jain Satvik, No Meal),
  - `Then` catering preferences are recorded and displayed on the Electronic Reservation Slip (ERS).
* **Technical Artifacts**:
  - Implementation: `src/components/BookingModal.jsx`
  - Data Mapping: `src/data/mockTrains.js`

---

### Subsystem 3: CRIS Dynamic Fare Engine
**Owner**: Vinayak Kalal (`kalalvinayak23@gmail.com`) • **Reporter**: Rahul Shenoy (`rahulshenoy0000@gmail.com`)

---

#### 🔹 [RRS-21] Automated Live PRS Departure Countdown Timer & IRCTC Tiered Refund
* **Issue Type**: Story
* **Epic**: Fare Engine
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** passenger requesting ticket cancellation,  
  > **I want** the system to automatically compute the hours remaining before scheduled departure,  
  > **So that** statutory IRCTC deduction tiers (>48h flat clerkage, 48-12h 25%, 12-4h 50%, <4h 0% refund) are locked automatically without manual input.
* **Acceptance Criteria**:
  - `Given` a booked ticket with a departure date and time,
  - `When` the Cancellation modal is opened,
  - `Then` a live countdown clock calculates hours, minutes, and seconds until departure.
  - `Given` the computed departure countdown,
  - `When` the deduction tier is evaluated,
  - `Then` the statutory refund policy is auto-selected and the net refund amount is calculated in real time.
* **Technical Artifacts**:
  - Implementation: `src/components/CancellationModal.jsx`
  - Backend: `backend/src/fare_calculator/calculator.py`

---

#### 🔹 [RRS-22] Cryptographic Cancellation Audit Logging & Refund Reference Generation
* **Issue Type**: Story
* **Epic**: Fare Engine
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** system auditor and accounts manager,  
  > **I want** every cancellation to generate a cryptographically verifiable refund reference (`CRIS-RFND-XXXXXX`),  
  > **So that** financial deductions, clerkage charges, and refund payouts are immutably logged in the database.
* **Acceptance Criteria**:
  - `Given` a confirmed cancellation request,
  - `When` processed by the cancellation handler,
  - `Then` a unique refund reference ID is generated.
  - `Given` the cancellation record,
  - `When` committed,
  - `Then` original fare, deduction amount, net refund, and timestamp are inserted into SQLite `cancellations` table.
* **Technical Artifacts**:
  - Implementation: `server/sqliteDb.js` (`recordCancellation`, `getCancellations`)
  - Database Model: `backend/src/database/models.py` (`CancellationModel`)

---

### Subsystem 4: Core Architecture & Booking Lifecycle
**Owner**: Rahul Shenoy (`rahulshenoy0000@gmail.com`) • **Reporter**: Rahul Shenoy (`rahulshenoy0000@gmail.com`)

---

#### 🔹 [RRS-23] ACID-Compliant SQLite 3 Relational Database & ORM Integration
* **Issue Type**: Story
* **Epic**: Core Architecture
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** software engineer,  
  > **I want** a unified SQLite 3 relational database (`railway.db`) with ACID transaction semantics,  
  > **So that** train schedules, seat locks, bookings, cancellations, and tickets are stored reliably without JSON file corruption.
* **Acceptance Criteria**:
  - `Given` the railway system persistence layer,
  - `When` initialized,
  - `Then` relational schema for `stations`, `trains`, `bookings`, `cancellations`, `seat_locks`, `users`, and `tickets` is created.
  - `Given` concurrent writes and reads,
  - `When` executed across FastAPI (SQLAlchemy) and Node.js (`node:sqlite`),
  - `Then` transactions maintain complete ACID integrity.
* **Technical Artifacts**:
  - Database Engine: `data/railway.db`
  - Python ORM: `backend/src/database/models.py`, `backend/src/database/db_session.py`
  - Node Driver: `server/sqliteDb.js`

---

#### 🔹 [RRS-24] Client-Server Dual-Layer Persistence & Browser Refresh Synchronization
* **Issue Type**: Story
* **Epic**: Core Architecture
* **Story Points**: 5 SP
* **Status**: To Do
* **Description**:
  > **As a** passenger using the web portal,  
  > **I want** booked tickets and cancellation statuses to persist seamlessly across browser refreshes (F5),  
  > **So that** tickets are never lost when reloading the application.
* **Acceptance Criteria**:
  - `Given` a passenger has successfully booked a ticket,
  - `When` the browser page is refreshed (F5),
  - `Then` the ticket remains visible in the booked tickets tab via `localStorage` and backend SQLite sync (`/api/db/tickets`).
  - `Given` a ticket is cancelled,
  - `When` the user re-queries the PNR,
  - `Then` the status updates to `CANCELLED` across both client storage and backend database.
* **Technical Artifacts**:
  - Frontend: `src/App.jsx`
  - Express API: `server.js` (`/api/db/tickets`, `/api/db/sync-ticket`, `/api/db/cancel`)

