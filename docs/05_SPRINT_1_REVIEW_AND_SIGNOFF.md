# Sprint 1 Review, Retrospective & Formal Sign-Off
## Topic 74: Railway Ticket Reservation System (RRS)
**Course**: UE24CS341A • Software Engineering Mini-Project 2026  
**Sprint Cycle**: Sprint 1 (Concluded: 06-11-2026)  
**Sprint 2 Commencement**: Wednesday, 07-11-2026  
**Sprint 1 Release Milestone**: `v1.0.0-sprint1` (Production-Ready MVP)

---

## 1. Executive Summary
Sprint 1 focused on architecting and delivering the **Core Operational Foundation** of the Railway Ticket Reservation System. Operating under strict Agile/Scrum and SDLC standards, the team successfully engineered four independent, highly cohesive modules with clean interface boundaries, full test automation, a responsive web user interface, and an automated CI/CD pipeline.

All 16 Jira User Stories planned for Sprint 1 have reached **DONE** status with **100% test pass rate (84/84 automated tests)** and equal 4-way student contributions. This document represents the **final code freeze and sign-off for Sprint 1**. Development is formally locked until Sprint 2 kicks off on **Wednesday, 07-11-2026**.

---

## 2. Sprint 1 Backlog & Traceability Matrix (All 16 Stories DONE)

| Jira Key | Issue Type | Story Title | Module Owner | Assignee | Story Points | Automated Test IDs | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **RRS-1** | Story | Train Catalog & Station Lookup API | Train Service | **Sabbir Mondal** | 3 | `TC_SABBIR_01` to `03`, `TC_API_01`, `02` | **DONE** |
| **RRS-2** | Story | Multi-Station Route Graph & Bidirectional Routing | Train Service | **Sabbir Mondal** | 5 | `TC_SABBIR_04` to `07`, `11`, `TC_API_03`, `04`| **DONE** |
| **RRS-3** | Story | Live Station Delays & Satellite GPS Telemetry | Train Service | **Sabbir Mondal** | 5 | `TC_SABBIR_12` to `17`, `TC_API_15`, `16`, `20`| **DONE** |
| **RRS-4** | Story | Train Service Pytest Automation & Timetables | Train Service | **Sabbir Mondal** | 3 | `TC_SABBIR_08` to `10`, `TC_API_05`, `06` | **DONE** |
| **RRS-5** | Story | Realistic 2D Coach Berth Deck Generator | Seat Engine | **Samvit Atur** | 5 | `TC_SAMVIT_01`, `02`, `TC_API_07` | **DONE** |
| **RRS-6** | Story | Coach Data Models & Inventory Schemas | Seat Engine | **Samvit Atur** | 3 | `TC_SAMVIT_15`, `TC_API_08` | **DONE** |
| **RRS-7** | Story | Concurrency Locks & Real-time Occupancy Radar | Seat Engine | **Samvit Atur** | 5 | `TC_SAMVIT_03` to `07`, `16`, `17`, `TC_API_09`, `17`, `18`, `21` | **DONE** |
| **RRS-8** | Story | Seat Engine Unit Suite & Family Group Allocation | Seat Engine | **Samvit Atur** | 3 | `TC_SAMVIT_08` to `14` | **DONE** |
| **RRS-9** | Story | CRIS Distance Tariff & Rate Schemas | Fare Engine | **Vinayak Kalal** | 3 | `TC_VINAYAK_01`, `02`, `06`, `07`, `TC_API_10`, `13` | **DONE** |
| **RRS-10** | Story | Concession Policies & Peak Holiday Surcharges | Fare Engine | **Vinayak Kalal** | 5 | `TC_VINAYAK_03` to `05`, `11`, `12`, `16`, `TC_API_11`, `12` | **DONE** |
| **RRS-11** | Story | Official CRIS GST Tax Invoice (SAC 9964) | Fare Engine | **Vinayak Kalal** | 5 | `TC_VINAYAK_17`, `18`, `TC_API_22` | **DONE** |
| **RRS-12** | Story | Tiered Refund Matrix & UPI Payment Simulation | Fare Engine | **Vinayak Kalal** | 3 | `TC_VINAYAK_08` to `10`, `13` to `15`, `TC_API_19` | **DONE** |
| **RRS-13** | Story | 10-Digit PNR Generator & Booking Lifecycle | Booking Lifecycle | **Rahul Shenoy** | 5 | `TC_LEAD_01` to `07`, `TC_API_14` | **DONE** |
| **RRS-14** | Story | Cascading Auto-Promotion Queue Re-indexing | Booking Lifecycle | **Rahul Shenoy** | 5 | `TC_LEAD_08` to `10` | **DONE** |
| **RRS-15** | Story | Unified REST Gateway, Responsive UI & Modals | Full-Stack | **Rahul Shenoy** | 5 | `TC_API_01` to `22` (Full Integration Suite) | **DONE** |
| **RRS-16** | Story | CI/CD Automation, Test Matrix & SDLC Documents | DevOps | **Rahul Shenoy** | 3 | GitHub Actions CI/CD Pipeline & 5 SDLC Docs | **DONE** |

**Total Sprint 1 Story Points**: 65 SP  
**Velocity Achieved**: 65 SP (100% Commitment Fulfillment)

---

## 3. Four-Way Equal Contribution Breakdown

| Member Name | Student ID / GitHub | Subsystem Responsibility | Deliverables Completed | Automated Tests |
| :--- | :--- | :--- | :--- | :---: |
| **Sabbir Mondal** | `SabbirMondal314159` | **Train Catalog & Railway API** | • 6 Junction Terminals & 6 Return Train Pairs<br>• Station Facilities & Amenities Directory<br>• Live GPS Satellite Telemetry<br>• NTES Live Running Delays & Platforms | **17 Tests**<br>(100% Pass) |
| **Samvit Atur** | `samvitOK` | **Seat Layout & Concurrency Locks** | • 2D Coach Berth Visualizer (SL, 3A, 2A, 1A, CC)<br>• 5-minute High-Concurrency Seat Locking<br>• Lock Heartbeat Renewal & Explicit Release<br>• Contiguous Bay/Cabin Family Allocations<br>• Coach Occupancy & Capacity Utilization Radar | **17 Tests**<br>(100% Pass) |
| **Vinayak Kalal** | `kalalvinayak23` | **CRIS Dynamic Fare Engine** | • Distance Tariff Calculation with 5% GST<br>• Concessions: Senior Citizen, Divyangjan, Defense, Child, Infant<br>• Holiday Dynamic Surge Pricing Calendar<br>• Standard 4-Tier Cancellation Refund Matrix<br>• CRIS GST Tax Invoices (SAC 9964) with CGST/SGST | **18 Tests**<br>(100% Pass) |
| **Rahul Shenoy** | `rahulsheno` | **Booking Lifecycle & Full-Stack Lead** | • 10-Digit PNR State Machine & Ticket Store<br>• Cascading Auto-Promotion (RAC->CNF, WL->RAC)<br>• Unified FastAPI Server with CORS & Static Mount<br>• Interactive Single-Page UI with 8 Modal Dialogs<br>• GitHub Actions CI/CD Pipeline | **32 Tests**<br>(100% Pass) |

---

## 4. Quality Gate & Definition of Done (DoD) Checklist

- [x] **Functionality**: All 16 User Stories implemented and verified against acceptance criteria.
- [x] **Test Automation**: 84 unit and integration tests passing (`python -m pytest backend/tests/ -v`).
- [x] **Code Quality**: Strict type hints (`pydantic` schemas, typing generics), zero unresolved warnings.
- [x] **Architectural Modularity**: Clear separation between UI (`frontend/`), Business Logic (`backend/src/`), and Persistence (`seed_data.py`).
- [x] **Interactive Frontend**: Clean, responsive web UI operating without any external framework dependencies.
- [x] **Concurrency Safety**: Active race condition prevention with in-memory lock table and TTL cleanup.
- [x] **Documentation Complete**:
  - `docs/01_SYNOPSIS.md` (Project Scope & Objectives)
  - `docs/02_SRS_DOCUMENT.md` (Functional & Non-Functional Specifications)
  - `docs/03_ARCHITECTURE_DESIGN.md` (C4 & Mermaid Architectural Diagrams)
  - `docs/04_TEST_PLAN_SPECIFICATION.md` (84-Test Traceability Matrix)
  - `docs/05_SPRINT_1_REVIEW_AND_SIGNOFF.md` (Sprint 1 Review & Formal Sign-Off)
  - `README.md` (Setup, Docker, and Architecture Guide)

---

## 5. Sprint 1 Retrospective

### What Went Exceptionally Well:
1. **Modular Decoupling**: Each member worked in a dedicated subsystem folder with isolated unit tests, allowing parallel execution without merge conflicts.
2. **Comprehensive Test Coverage**: Expanding from 40 initial tests to 84 automated tests ensured edge cases (e.g. negative distances, double booking, lock timeout, zero-GST exemptions) are guarded.
3. **Realistic Railway Domain Modeling**: Implemented authentic Indian Railway business rules (RAC half-berths, Tatkal windows, 4-tier cancellation clerkage fees, SAC 9964 GST invoices).

### Challenges Encountered & Addressed:
1. **GitHub Account Spam Filter**: Sabbir's brand-new GitHub account was flagged by GitHub's automated anti-spam heuristic. All commits were authenticated and verified under his user handle; resolution protocol was documented for account unflagging.
2. **Concurrency Race Conditions**: Prevented duplicate seat claims during peak search sessions using UUID lock tokens and a 300-second TTL eviction worker.

---

## 6. Sprint 2 Roadmap (Kickoff: Wednesday, 07-11-2026)

The team will resume development on **Wednesday, 07-11-2026** for Sprint 2, focusing on enterprise capabilities:
1. **Persistent Database Layer**: SQLite / PostgreSQL integration with SQLAlchemy ORM and Alembic schema migrations.
2. **WebSocket Live Telemetry**: Bidirectional WebSocket channels for real-time train GPS position updates and instant RAC-to-CNF ticket promotion alerts.
3. **Payment Gateway Integration**: Webhook validation for simulated UPI QR and mock payment service providers.
4. **Administrative Console**: Role-based access control (Station Master / Admin) for train scheduling, dynamic quota allocation, and coach composition updates.

---

### Sprint 1 Sign-Off Approvals:
- **Lead / Booking Lifecycle**: Rahul Shenoy (`rahulsheno`) — **APPROVED**
- **Train Catalog Subsystem**: Sabbir Mondal (`SabbirMondal314159`) — **APPROVED**
- **Seat Engine Subsystem**: Samvit Atur (`samvitOK`) — **APPROVED**
- **Fare Engine Subsystem**: Vinayak Kalal (`kalalvinayak23`) — **APPROVED**

*Sprint 1 Code Freeze in effect until Wednesday, 07-11-2026.*
