# IRCTC Connect — Indian Railways Train Ticketing Portal

A modern, high-speed, and responsive train ticket booking web application for **Indian Railways & IRCTC**, featuring Vande Bharat Express, Rajdhani, Shatabdi, Duronto, and Superfast express trains.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm

### Running Locally
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Building for Production
```bash
npm run build
```

---

## 🚆 Features Implemented

* **Authentic Rail Design System**:
  - Deep Navy header (`#0f172a`), signature rail teal (`#00a3a6`), and high-contrast typography.
  - Official brand color schemes for Vande Bharat, Rajdhani, Shatabdi, Tejas, Duronto, and Humsafar.

* **Interactive Train Search Engine**:
  - Origin & Destination station search with autocomplete covering major Indian railway junctions (NDLS, MMCT, CSMT, HWH, MAS, SBC, BSB, JP, GOA, etc.).
  - One-way & Round trip options.
  - Date of journey selection with quick shortcuts (Today, Tomorrow, Next Week).
  - Passenger configuration (Adults, Children, Senior Citizens).
  - IRCTC Booking Quotas (General, Tatkal, Premium Tatkal, Ladies, Senior Citizen lower berth).
  - Travel class selection (CC / 3A vs EC / 2A / 1A).

* **Live Train Search Results & Timetables**:
  - Real-time scheduled departures simulated with accurate duration, departure/arrival times, and platform numbers.
  - Filter by train category (All, Vande Bharat, Rajdhani, Shatabdi, Duronto).
  - Sort by earliest departure, lowest fare, or fastest duration.
  - Authentic Indian Railways electric traction CO₂ emissions savings compared to road and flight.

* **Seat & Berth Selection Modal**:
  - Berth preferences: Window Seat (WS), Lower Berth (LB), Upper Berth (UB), Side Lower (SL).
  - IRCTC onboard catering preferences: Pure Vegetarian Thali, Non-Vegetarian, Jain Satvik Meal, or No Meal.
  - Senior citizen lower berth allocation priority.

* **Seamless Passenger Booking & E-Ticket Generation**:
  - Passenger details form with Government ID verification (Aadhaar, PAN, Passport, Voter ID).
  - Optional add-ons: IRCTC Comprehensive Travel Insurance (₹0.45), Hot Pantry Meal (₹180), and fresh bedroll linen kit.
  - Realistic 10-digit PNR generation (e.g. `248-8193421`).
  - **Electronic Reservation Slip (ERS)**: Printable e-ticket modal with QR code for TTE verification, train details, and Indian Railways 24x7 Helpline `139`.

* **Explore India & Top Destinations**:
  - Filterable by region: North & Central India, South & Western India, East & Northeast India.
  - Popular rail corridors with direct booking shortcuts.
  - Official IRCTC FAQ accordion addressing Tatkal rules, booking advance periods (ARP 120 days), and PNR status.
