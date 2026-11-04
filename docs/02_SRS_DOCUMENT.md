# Software Requirements Specification (SRS)
## Topic 74: Railway Ticket Reservation System
**Subject Code**: UE24CS341A • Jackfruit Phase-1 Deliverable

---

## 1. Introduction & Scope
The Railway Ticket Reservation System is an end-to-end web platform designed to streamline train discovery, seat allocation, fare pricing with concessions, and real-time PNR tracking.

---

## 2. Overall Description & User Characteristics
- **Passengers**: Search routes, view visual coach layouts, apply eligible concessions, complete bookings, track PNRs, and cancel tickets.
- **System Admin / Railway CRIS**: Maintain train schedules, inspect active seat locks, manage refund allocations.

---

## 3. Specific Functional Requirements (Organized by Member Module)

### Feature 1: Train Search & Railway API Integration (Owned by Sabbir Mondal)
- **FR1.1**: The system shall list all valid Indian railway stations with code, name, and operational zone.
- **FR1.2**: The system shall accept source, destination, and travel date and return all available trains traversing that path in the correct directional sequence.
- **FR1.3**: The system shall calculate intermediate segment distances and halt departure times.
- **FR1.4**: The system shall simulate an external Railway API (NTES) to retrieve live running status and delay minutes.

### Feature 2: Coach Layout & Concurrency Seat Engine (Owned by Samvit Atur)
- **FR2.1**: The system shall render interactive coach berth configurations for 1A, 2A, 3A, and Sleeper classes.
- **FR2.2**: The system shall allow users to lock an available seat for a 300-second (5-minute) timeout window during payment.
- **FR2.3**: The system shall reject concurrent lock requests on already locked or booked seats.
- **FR2.4**: When confirmed seats reach 100% capacity, the system shall assign passengers to RAC (max 4) and then Waiting List (WL).

### Feature 3: Fare Calculation & Concession Engine (Owned by Vinayak Kalal)
- **FR3.1**: The system shall calculate base fares using distance * class rate per km with minimum fare thresholds.
- **FR3.2**: The system shall apply statutory concessions: Senior Citizen (40% male, 50% female), Student Pass (50%), and Divyangjan (75%).
- **FR3.3**: The system shall calculate 5% GST for AC classes and add standard superfast charges.
- **FR3.4**: The system shall compute cancellation refunds according to time thresholds (>48 hrs, 48–12 hrs, 12–4 hrs, <4 hrs).

### Feature 4: Booking Lifecycle & Cascade Cancellation (Owned by Rahul Shenoy)
- **FR4.1**: The system shall generate a unique 10-digit PNR for each confirmed or waitlisted booking.
- **FR4.2**: The system shall allow public queries for any 10-digit PNR returning passenger status, coach, and seat numbers.
- **FR4.3**: The system shall provide one-click ticket cancellation with instant refund computation.
- **FR4.4**: Upon cancellation of a confirmed ticket, the system shall automatically promote the first RAC passenger to Confirmed (CNF) and the first Waiting List passenger to RAC.

---

## 4. Non-Functional Requirements
- **Performance**: Train search and fare computation shall respond in under 200ms.
- **Reliability & Consistency**: Atomic seat locks prevent duplicate seat allocations.
- **Portability**: Full containerization via Docker and Docker Compose.
- **Test Coverage**: Automated test suite must exceed 80% line and branch coverage in CI/CD pipeline.
