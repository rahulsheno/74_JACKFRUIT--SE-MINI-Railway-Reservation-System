# Project Synopsis: Railway Ticket Reservation System (Topic 74)
**Course**: Software Engineering (UE24CS341A)  
**Subject Teacher Approved Group Size**: 4 Members  

---

## 1. Team Profile & Ownership

| Sl. No | Team Member Name | GitHub Username | Primary System Functionality Owned |
| :---: | :--- | :--- | :--- |
| **1** | **Sabbir Mondal** | `SabbirMondal314159` | **Train Catalog, Route Search & Railway API Integration** |
| **2** | **Samvit Atur** | `samvitOK` | **Coach Layout Engine, Seat Allocation & Concurrency Locks** |
| **3** | **Vinayak Kalal** | `kalalvinayak23` | **Dynamic Fare Engine, Concession Matrix & Refunds** |
| **4** | **Rahul Shenoy (Lead)** | `rahulsheno` | **Booking Lifecycle, 10-Digit PNR Engine & Cascade Cancellation** |

---

## 2. Proposed Project Description & Problem Statement
Conventional railway reservation systems suffer from high lock-contention, opaque waiting list updates, and rigid fare computation. This project delivers an automated, full-stack, modular Railway Ticket Reservation System compliant with CRIS/IRCTC standards. The system enables real-time station-to-station route lookup, 2D coach visual seat selection with temporary concurrency locking (preventing double-booking race conditions), dynamic fare scaling with government concessions, 10-digit tamper-proof PNR issuance, and automated cascade promotions (Waitlist -> RAC -> Confirmed) upon cancellation.

---

## 3. Product Ownership & Functional Scope

### Member 1: Sabbir Mondal
- Train search by origin, destination, and travel date with directional sequence verification.
- Inter-station distance graph and stoppage halt timetable query engine.
- External Railway API gateway simulation with caching and live train running status.

### Member 2: Samvit Atur
- 2D coach berth layout generation across 1A, 2A, 3A, Sleeper (SL), and Chair Car (CC).
- Concurrency control engine providing 5-minute atomic seat locks during checkout.
- Automated berth preference allocation and transition into RAC/Waiting List queues upon capacity exhaustion.

### Member 3: Vinayak Kalal
- Distance-based base fare computation scaled by travel class and superfast surcharges.
- Multi-tier concession verification (Senior Citizen 40–50%, Student 50%, Divyangjan 75%).
- Transaction payment simulation and tiered IRCTC cancellation refund matrix (>48h, 48–12h, <4h).

### Member 4: Rahul Shenoy (Lead)
- 10-digit cryptographic PNR number generation and real-time tracking dashboard.
- Cancellation engine with automated promotion cascade (promoting RAC to Confirmed and WL to RAC).
- REST API orchestration (FastAPI), CI/CD pipeline (GitHub Actions), Dockerization, and documentation.
