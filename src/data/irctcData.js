// Official Indian Railways & IRCTC Train Tickets Dataset

export const STATIONS = [
  { id: 'NDLS', name: 'New Delhi (NDLS)', city: 'New Delhi', state: 'Delhi', country: 'India', popular: true, major: true },
  { id: 'MMCT', name: 'Mumbai Central (MMCT)', city: 'Mumbai', state: 'Maharashtra', country: 'India', popular: true, major: true },
  { id: 'CSMT', name: 'Mumbai CSMT (CSMT)', city: 'Mumbai', state: 'Maharashtra', country: 'India', popular: true, major: true },
  { id: 'HWH', name: 'Howrah Junction (HWH)', city: 'Kolkata', state: 'West Bengal', country: 'India', popular: true, major: true },
  { id: 'MAS', name: 'Chennai Central (MAS)', city: 'Chennai', state: 'Tamil Nadu', country: 'India', popular: true, major: true },
  { id: 'SBC', name: 'KSR Bengaluru (SBC)', city: 'Bengaluru', state: 'Karnataka', country: 'India', popular: true, major: true },
  { id: 'ADI', name: 'Ahmedabad Jn (ADI)', city: 'Ahmedabad', state: 'Gujarat', country: 'India', popular: true, major: true },
  { id: 'BSB', name: 'Varanasi Junction (BSB)', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', popular: true, major: true },
  { id: 'JP', name: 'Jaipur Junction (JP)', city: 'Jaipur', state: 'Rajasthan', country: 'India', popular: true, major: true },
  { id: 'SC', name: 'Secunderabad (SC)', city: 'Hyderabad', state: 'Telangana', country: 'India', popular: true, major: true },
  { id: 'PUNE', name: 'Pune Junction (PUNE)', city: 'Pune', state: 'Maharashtra', country: 'India', popular: true, major: true },
  { id: 'LKO', name: 'Lucknow Charbagh (LKO)', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', popular: true, major: true },
  { id: 'MAO', name: 'Madgaon Junction (MAO)', city: 'Goa', state: 'Goa', country: 'India', popular: true, major: true },
  { id: 'AGC', name: 'Agra Cantt (AGC)', city: 'Agra', state: 'Uttar Pradesh', country: 'India', popular: true, major: true },
  { id: 'ASR', name: 'Amritsar Junction (ASR)', city: 'Amritsar', state: 'Punjab', country: 'India', popular: true, major: true },
  { id: 'PNBE', name: 'Patna Junction (PNBE)', city: 'Patna', state: 'Bihar', country: 'India', popular: true, major: true },
  { id: 'GHY', name: 'Guwahati (GHY)', city: 'Guwahati', state: 'Assam', country: 'India', popular: true, major: true },
  { id: 'CDG', name: 'Chandigarh Junction (CDG)', city: 'Chandigarh', state: 'Punjab', country: 'India', popular: false, major: true },
  { id: 'CNB', name: 'Kanpur Central (CNB)', city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', popular: false, major: true },
  { id: 'BPL', name: 'Bhopal Junction (BPL)', city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', popular: false, major: true },
  { id: 'JAT', name: 'Jammu Tawi (JAT)', city: 'Jammu', state: 'Jammu & Kashmir', country: 'India', popular: true, major: true },
  { id: 'TVC', name: 'Thiruvananthapuram (TVC)', city: 'Trivandrum', state: 'Kerala', country: 'India', popular: false, major: true },
  { id: 'ERS', name: 'Ernakulam Junction (ERS)', city: 'Kochi', state: 'Kerala', country: 'India', popular: true, major: true },
  { id: 'BZA', name: 'Vijayawada Junction (BZA)', city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', popular: false, major: true },
  { id: 'PURI', name: 'Puri Terminus (PURI)', city: 'Puri', state: 'Odisha', country: 'India', popular: true, major: true },
  { id: 'UDZ', name: 'Udaipur City (UDZ)', city: 'Udaipur', state: 'Rajasthan', country: 'India', popular: true, major: true }
];

export const CARRIERS = [
  {
    name: 'Vande Bharat Express',
    code: 'VANDE',
    color: '#1d4ed8',
    textColor: '#ffffff',
    tagline: 'India\'s 160 km/h semi-high speed flagship with Kavach safety',
    badge: 'Flagship High-Speed',
    services: ['180° Rotatable Executive Seats', 'Gourmet Indian Catering', 'Free Infotainment & Wi-Fi', 'Automatic Plug Doors & Bio-Vacuum Toilets'],
    logoUrl: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Rajdhani Express',
    code: 'RAJDHANI',
    color: '#b91c1c',
    textColor: '#ffffff',
    tagline: 'Premier luxury overnight trains connecting the Capital to major states',
    badge: 'Premier AC Sleeper',
    services: ['Complimentary Hot Gourmet Meals', 'Fresh Sanitized Bedroll & Linens', 'Highest Track Clearance Priority', 'Lockable 1A Coupés & 2A/3A Berths'],
    logoUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Shatabdi & Tejas Express',
    code: 'SHATABDI',
    color: '#0f766e',
    textColor: '#ffffff',
    tagline: 'Superfast daytime intercity trains with AC Chair Car & Executive Class',
    badge: 'Intercity Day Express',
    services: ['Complimentary Breakfast & Dinner', 'Punctual Same-Day Turnaround', 'Spacious Reclining Seats', 'Dedicated Laptop & Mobile Sockets'],
    logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Duronto Express',
    code: 'DURONTO',
    color: '#d97706',
    textColor: '#ffffff',
    tagline: 'Point-to-point non-stop long distance trains saving crucial journey hours',
    badge: 'Non-Stop Superfast',
    services: ['Zero or Minimum Technical Stops', 'Distinctive Yellow-Green Livery', 'AC 1A, 2A, 3A & Sleeper Coaches', 'Onboard Hygienic Pantry Service'],
    logoUrl: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Humsafar & Garib Rath',
    code: 'HUMSAFAR',
    color: '#0284c7',
    textColor: '#ffffff',
    tagline: 'All-AC 3-Tier luxury designed for comfortable and affordable family travel',
    badge: 'Modern Affordable AC',
    services: ['GPS Passenger Information System', 'CCTV Surveillance & Fire Alarms', 'Tea & Coffee Vending Machines', 'Curtained Berths & Charging Ports'],
    logoUrl: 'https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Superfast Mail & Express',
    code: 'MAIL_EXP',
    color: '#4338ca',
    textColor: '#ffffff',
    tagline: 'The timeless lifeline of Indian Railways connecting thousands of towns',
    badge: 'Pan-India Network',
    services: ['1A, 2A, 3A, SL & 2S Class Options', 'Instant Tatkal Quota Access', 'Affordable Fares Across India', 'Luggage & Parcel Transit Services'],
    logoUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=400&q=80'
  }
];

export const PROMOTIONAL_DEALS = [
  {
    id: 'vande-bharat-next-gen',
    badge: 'Flagship High-Speed',
    title: 'Experience Vande Bharat Express at 160 km/h across India',
    subtitle: 'World-class semi-high speed comfort on Delhi–Varanasi, Mumbai–Goa, and Bengaluru–Chennai corridors.',
    discount: 'From ₹850',
    priceNote: '180° rotatable seats, Kavach safety & hot gourmet catering',
    carrier: 'Vande Bharat',
    imageUrl: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=600&q=80',
    buttonText: 'Book Vande Bharat',
    link: '#search'
  },
  {
    id: 'irctc-bharat-gaurav',
    badge: 'Heritage & Spiritual',
    title: 'IRCTC Bharat Gaurav Tourist Trains & Sacred Circuits',
    subtitle: 'All-inclusive pilgrim & heritage tours covering Ramayana Circuit, Golden Triangle, Jyotirlinga, and Temple tours.',
    discount: 'All-Inclusive',
    priceNote: 'Train travel, 3-star AC hotel stay, transfers & pure satvik meals',
    carrier: 'IRCTC Tourism',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    buttonText: 'Explore Tours',
    link: '#search'
  },
  {
    id: 'konkan-goa-tejas',
    badge: 'Scenic Coastline',
    title: 'Mumbai to Goa: The Majestic Konkan Railway Route',
    subtitle: 'Witness breathtaking Western Ghats, viaducts, tunnels, and lush Arabian sea views aboard Tejas & Vande Bharat.',
    discount: 'From ₹990',
    priceNote: 'Direct in 7h 45m from CSMT Mumbai to Madgaon, Goa',
    carrier: 'Tejas / Vande Bharat',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    buttonText: 'Book Goa Express',
    link: '#search'
  },
  {
    id: 'varanasi-spiritual-express',
    badge: 'Spiritual Capital',
    title: 'Varanasi, the Spiritual Soul of India on the Holy Ganges',
    subtitle: 'Witness the iconic evening Ganga Aarti and Kashi Vishwanath corridor with direct high-speed trains from Delhi.',
    discount: 'From ₹650',
    priceNote: 'Direct in 8h from New Delhi with morning & evening departures',
    carrier: 'Vande Bharat / Rajdhani',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
    buttonText: 'Book Varanasi',
    link: '#search'
  }
];

export const TOP_DESTINATIONS = {
  french: [ // North & Central India
    { name: 'New Delhi', region: 'National Capital (India Gate)', price: 450, image: '/destinations/new-delhi.jpg' },
    { name: 'Varanasi', region: 'Uttar Pradesh (Ganga Ghats)', price: 650, image: '/destinations/varanasi.jpg' },
    { name: 'Jaipur', region: 'Rajasthan (Hawa Mahal)', price: 390, image: '/destinations/jaipur.jpg' },
    { name: 'Agra', region: 'Uttar Pradesh (Taj Mahal)', price: 280, image: '/destinations/agra.jpeg' },
    { name: 'Amritsar', region: 'Punjab (Golden Temple)', price: 480, image: '/destinations/amritsar.jpg' },
    { name: 'Shimla', region: 'Himachal Pradesh (Christ Church)', price: 350, image: '/destinations/shimla.jpg' },
    { name: 'Jammu', region: 'Jammu & Kashmir (Bahu Fort)', price: 890, image: '/destinations/jammu.jpg' },
    { name: 'Udaipur', region: 'Rajasthan (City Palace)', price: 550, image: '/destinations/udaipur.jpg' }
  ],
  european: [ // South & Western India
    { name: 'Mumbai', region: 'Maharashtra (Gateway of India)', price: 620, image: '/destinations/mumbai.jpg' },
    { name: 'Goa', region: 'Goa (Sinquerim Beach & Coast)', price: 750, image: '/destinations/goa.jpg' },
    { name: 'Bengaluru', region: 'Karnataka (Vidhana Soudha)', price: 520, image: '/destinations/bengaluru.jpg' },
    { name: 'Chennai', region: 'Tamil Nadu (Central Heritage Station)', price: 480, image: '/destinations/chennai.jpg' },
    { name: 'Kochi', region: 'Kerala (Chinese Fishing Nets)', price: 690, image: '/destinations/kochi.jpg' },
    { name: 'Hyderabad', region: 'Telangana (Charminar)', price: 540, image: '/destinations/hyderabad.jpg' },
    { name: 'Ahmedabad', region: 'Gujarat (Adalaj Stepwell)', price: 420, image: '/destinations/ahmedabad.jpg' },
    { name: 'Pune', region: 'Maharashtra (Shaniwar Wada)', price: 340, image: '/destinations/pune.jpg' }
  ],
  countries: [ // East & Northeast India
    { name: 'Kolkata', region: 'West Bengal (Victoria Memorial)', price: 590, image: '/destinations/kolkata.jpg' },
    { name: 'Darjeeling', region: 'West Bengal (Batasia Loop)', price: 620, image: '/destinations/darjeeling.jpg' },
    { name: 'Puri', region: 'Odisha (Jagannath Temple)', price: 510, image: '/destinations/puri.jpg' },
    { name: 'Guwahati', region: 'Assam (Kamakhya Temple)', price: 780, image: '/destinations/guwahati.jpg' },
    { name: 'Lucknow', region: 'Uttar Pradesh (Rumi Darwaza)', price: 380, image: '/destinations/lucknow.jpg' },
    { name: 'Bhopal', region: 'Madhya Pradesh (Upper Lake / Bhojtal)', price: 410, image: '/destinations/bhopal.jpg' },
    { name: 'Patna', region: 'Bihar (Golghar)', price: 490, image: '/destinations/patna.jpg' },
    { name: 'Bikaner', region: 'Rajasthan (Junagarh Fort)', price: 530, image: '/destinations/bikaner.jpg' }
  ]
};

export const POPULAR_ROUTES = [
  { origin: 'New Delhi', destination: 'Mumbai Central', time: '15h 30m', price: 1450, carrier: '12952 Mumbai Rajdhani', highlight: 'Most Booked' },
  { origin: 'New Delhi', destination: 'Varanasi', time: '8h 00m', price: 980, carrier: '22436 Vande Bharat', highlight: 'Flagship Superfast' },
  { origin: 'New Delhi', destination: 'Jaipur', time: '3h 40m', price: 550, carrier: '20978 Vande Bharat', highlight: 'Royal Express' },
  { origin: 'New Delhi', destination: 'Agra Cantt', time: '1h 40m', price: 390, carrier: '12050 Gatimaan Express', highlight: 'Fastest Link' },
  { origin: 'Mumbai Central', destination: 'Ahmedabad', time: '5h 15m', price: 720, carrier: '20901 Vande Bharat', highlight: 'Commercial Hub' },
  { origin: 'Mumbai CSMT', destination: 'Madgaon (Goa)', time: '7h 45m', price: 890, carrier: '22229 Vande Bharat / Tejas', highlight: 'Konkan Coast' },
  { origin: 'KSR Bengaluru', destination: 'Chennai Central', time: '4h 15m', price: 580, carrier: '20608 Vande Bharat', highlight: 'Tech Corridor' },
  { origin: 'Howrah', destination: 'New Delhi', time: '17h 00m', price: 1650, carrier: '12301 Howrah Rajdhani', highlight: 'Grand Trunk' }
];

export const FAQS = [
  {
    question: "What is IRCTC and how does online train ticket booking work?",
    answer: "IRCTC (Indian Railway Catering and Tourism Corporation) is an enterprise under the Ministry of Railways, Government of India. It operates the official next-generation online e-ticketing portal for Indian Railways. You can search live train timetables, check seat availability across classes (Vande Bharat, Rajdhani, Shatabdi, Duronto, Express), book Electronic Reservation Slips (ERS), check 10-digit PNR status, order onboard meals, and cancel bookings seamlessly."
  },
  {
    question: "What is Tatkal and Premium Tatkal quota and when do bookings open?",
    answer: "• Tatkal Booking: Created for emergency and short-notice travel. Tatkal booking opens at 10:00 AM IST for AC classes (1A, 2A, 3A, CC, EC) and at 11:00 AM IST for Non-AC classes (Sleeper, 2S), exactly one day before the train's scheduled departure date from the origin station.\n• Premium Tatkal (PT): Follows dynamic fare pricing where ticket costs increase with demand as available seats decrease, with instant confirmed berth allocation."
  },
  {
    question: "What are the different travel classes on Indian Railways?",
    answer: "• 1A (AC First Class): Lockable 2-berth & 4-berth coupés, attendant service, freshly laundered bedroll, and hot gourmet catering.\n• 2A (AC 2-Tier): 6 berths per compartment with privacy curtains, wide reading lamps, clean linens, and charging sockets.\n• 3A (AC 3-Tier): 8 berths per bay, fully air-conditioned, bedroll included, the most popular AC choice for families.\n• CC (AC Chair Car): Comfortable 3x2 reclining seating, overhead luggage racks, and meal services on daytime intercity trains.\n• EC (Executive Chair Car): Premium 2x2 rotatable 180° seating, ample legroom, and chef-curated meals on Vande Bharat and Shatabdi.\n• SL (Sleeper Class): Non-AC berths providing the most affordable way to travel across India."
  },
  {
    question: "How do I check my 10-digit PNR status and berth confirmation?",
    answer: "Every IRCTC e-ticket has a unique 10-digit Passenger Name Record (PNR) number printed on the Electronic Reservation Slip (ERS). You can check your booking status anytime to verify whether your ticket is Confirmed (CNF), Reservation Against Cancellation (RAC), or Waitlisted (WL). Coach number and berth numbers are assigned at booking or finalized during chart preparation 4 hours before departure."
  },
  {
    question: "How far in advance can I book train tickets on IRCTC?",
    answer: "• Advance Reservation Period (ARP): Long-distance trains can be booked up to 120 days in advance (excluding the date of journey).\n• Special Holiday Trains: Additional seasonal holiday trains for Diwali, Chhath, Durga Puja, and summer vacations are opened 30 to 60 days ahead.\n• Foreign Tourist Quota: International travelers and NRIs can reserve tickets up to 365 days in advance."
  },
  {
    question: "What amenities, Wi-Fi, and catering options are provided onboard?",
    answer: "Modern trains like Vande Bharat Express and Rajdhani feature automatic plug doors, Kavach anti-collision safety systems, bio-vacuum toilets, free infotainment Wi-Fi portals, USB/220V charging sockets at every seat, and hygienic onboard catering offering fresh breakfast, lunch, and dinner (including pure vegetarian, non-vegetarian, and Jain meal preferences)."
  }
];

export const DISCOUNT_CARDS = [
  { id: 'none', name: 'General Quota (GN)', discount: 0, desc: 'Standard booking quota open for all travelers' },
  { id: 'tatkal', name: 'Tatkal Quota (TQ)', discount: 0, desc: 'Emergency quota opens 1 day prior to departure' },
  { id: 'premium-tatkal', name: 'Premium Tatkal (PT)', discount: 0, desc: 'Dynamic pricing instant confirmation quota' },
  { id: 'ladies', name: 'Ladies Quota (LD)', discount: 0.10, desc: 'Dedicated berths for female travelers traveling alone' },
  { id: 'senior', name: 'Senior Citizen / Lower Berth', discount: 0.20, desc: 'Lower berth priority for seniors (60+ men, 58+ women)' },
  { id: 'divyang', name: 'Divyangjan Concession', discount: 0.50, desc: 'Concession and accessible coach for specially-abled passengers' }
];

