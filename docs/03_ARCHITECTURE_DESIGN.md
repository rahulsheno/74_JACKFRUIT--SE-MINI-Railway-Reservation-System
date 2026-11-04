# System Architecture & Software Design Document
## Topic 74: Railway Ticket Reservation System
**Subject Code**: UE24CS341A • Jackfruit Phase-2 Deliverable

---

## 1. Modular High-Level Architecture (HLD)

```mermaid
flowchart TD
    Client["Frontend Web Client (HTML5 / CSS3 / Vanilla JS)"]
    API["FastAPI REST Application Layer (main.py)"]
    
    subgraph Core_Services ["Modular Domain Engines"]
        M1["Train Catalog & Route Service (Sabbir)"]
        M2["Seat Allocation & Lock Engine (Samvit)"]
        M3["Fare Engine & Concession Matrix (Vinayak)"]
        M4["Booking Lifecycle & Cascade Engine (Rahul)"]
    end

    subgraph Data_Layer ["Data & Simulation Store"]
        DB["In-Memory Inventory & Transaction Registry"]
        EXT["Simulated NTES / CRIS Railway API"]
    end

    Client -->|HTTP / JSON REST| API
    API --> M1
    API --> M2
    API --> M3
    API --> M4
    M1 --> EXT
    M1 & M2 & M3 & M4 --> DB
```

---

## 2. Low-Level Design (LLD) & UML Sequence Flow

### Seat Lock & Booking Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Passenger
    participant Frontend as Web Client
    participant SeatEngine as Seat Allocation Engine (Samvit)
    participant FareEngine as Fare Engine (Vinayak)
    participant BookingSvc as Booking Lifecycle (Rahul)

    Passenger->>Frontend: Select Coach Class & Preferred Berth
    Frontend->>SeatEngine: POST /api/seats/lock (Seat #, User ID)
    SeatEngine-->>Frontend: 200 OK (5-min Lock ID issued)
    Passenger->>Frontend: Select Concession & Confirm Details
    Frontend->>FareEngine: GET /api/fare/calculate (Distance, Class, Concession)
    FareEngine-->>Frontend: Itemized Breakdown (Base, Discount, GST, Total)
    Passenger->>Frontend: Submit Payment & Book
    Frontend->>BookingSvc: POST /api/bookings
    BookingSvc->>SeatEngine: Confirm Seat & Release Lock
    BookingSvc->>FareEngine: Simulate Payment Transaction
    BookingSvc-->>Frontend: 200 OK with 10-digit PNR Receipt
```

---

## 3. Cascade Cancellation State Machine

```mermaid
stateDiagram-v2
    [*] --> Available : Inventory Initialization
    Available --> Locked : User Selects Berth (5-min lock)
    Locked --> Available : Timeout Expired / Lock Released
    Locked --> Booked_CNF : Payment Successful
    Booked_CNF --> Cancelled : Passenger Initiates Cancellation
    
    state Cancellation_Cascade {
        Cancelled --> Promote_RAC_to_CNF : Assign Released Berth
        Promote_RAC_to_CNF --> Promote_WL_to_RAC : Upgrade Waitlist Pos
    }
```
