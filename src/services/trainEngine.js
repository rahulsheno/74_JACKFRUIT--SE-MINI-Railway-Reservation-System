// Train search & pricing simulator based on real Indian Railways & IRCTC operational patterns

import { getLocalDateString } from './dateHelper';

export function generateSchedules(params) {
  const {
    origin,
    destination,
    date = getLocalDateString(),
    passengers = 1,
    discountCard = 'none',
    travelClass = 'second'
  } = params;

  const baseOrigin = origin?.city || 'New Delhi';
  const baseDest = destination?.city || 'Varanasi';

  // Determine standard route specs
  const routeKey = `${baseOrigin}-${baseDest}`;
  const reverseKey = `${baseDest}-${baseOrigin}`;

  const ROUTE_SPECS = {
    'New Delhi-Varanasi': { durationMinutes: 480, basePrice: 980, distanceKm: 760, co2Train: 4.2, co2Car: 85.0, co2Flight: 165.0, flagshipCarrier: 'Vande Bharat' },
    'New Delhi-Mumbai': { durationMinutes: 930, basePrice: 1450, distanceKm: 1384, co2Train: 7.8, co2Car: 160.0, co2Flight: 290.0, flagshipCarrier: 'Rajdhani Express' },
    'New Delhi-Jaipur': { durationMinutes: 220, basePrice: 550, distanceKm: 308, co2Train: 1.8, co2Car: 38.0, co2Flight: 75.0, flagshipCarrier: 'Vande Bharat' },
    'New Delhi-Agra': { durationMinutes: 100, basePrice: 390, distanceKm: 195, co2Train: 1.2, co2Car: 25.0, co2Flight: 52.0, flagshipCarrier: 'Gatimaan Express' },
    'Mumbai-Ahmedabad': { durationMinutes: 315, basePrice: 720, distanceKm: 493, co2Train: 2.8, co2Car: 62.0, co2Flight: 115.0, flagshipCarrier: 'Vande Bharat' },
    'Mumbai-Goa': { durationMinutes: 465, basePrice: 890, distanceKm: 580, co2Train: 3.5, co2Car: 75.0, co2Flight: 140.0, flagshipCarrier: 'Vande Bharat / Tejas' },
    'Bengaluru-Chennai': { durationMinutes: 255, basePrice: 580, distanceKm: 358, co2Train: 2.1, co2Car: 45.0, co2Flight: 88.0, flagshipCarrier: 'Vande Bharat' },
    'Bengaluru-Hyderabad': { durationMinutes: 510, basePrice: 780, distanceKm: 610, co2Train: 3.6, co2Car: 78.0, co2Flight: 148.0, flagshipCarrier: 'Vande Bharat' },
    'Howrah-New Delhi': { durationMinutes: 1020, basePrice: 1650, distanceKm: 1445, co2Train: 8.2, co2Car: 172.0, co2Flight: 310.0, flagshipCarrier: 'Rajdhani Express' },
    'New Delhi-Amritsar': { durationMinutes: 330, basePrice: 620, distanceKm: 448, co2Train: 2.6, co2Car: 56.0, co2Flight: 108.0, flagshipCarrier: 'Vande Bharat' }
  };

  const spec = ROUTE_SPECS[routeKey] || ROUTE_SPECS[reverseKey] || {
    durationMinutes: 360,
    basePrice: 680,
    distanceKm: 520,
    co2Train: 3.0,
    co2Car: 65.0,
    co2Flight: 125.0,
    flagshipCarrier: 'Vande Bharat'
  };

  // Indian Railways authentic station platform assignments
  const timeSlots = [
    { hour: 6, min: 0, carrier: 'Vande Bharat Express', trainNum: '22436', track: 'Platform 16', highlight: 'Fastest 160 km/h • Ajmeri Gate' },
    { hour: 7, min: 15, carrier: 'Shatabdi Express', trainNum: '12002', track: 'Platform 1', highlight: 'Morning Intercity • Paharganj' },
    { hour: 9, min: 30, carrier: 'Tejas Express', trainNum: '82501', track: 'Platform 9', highlight: 'Smart AC Coach' },
    { hour: 11, min: 45, carrier: 'Superfast Express', trainNum: '12424', track: 'Platform 16', highlight: 'Best Value' },
    { hour: 14, min: 10, carrier: 'Duronto Express', trainNum: '12260', track: 'Platform 7', highlight: 'Non-Stop Direct' },
    { hour: 16, min: 55, carrier: 'Vande Bharat Express', trainNum: '20901', track: 'Platform 16', highlight: 'Evening High-Speed' },
    { hour: 18, min: 30, carrier: 'Rajdhani Express', trainNum: '12952', track: 'Platform 1', highlight: 'Premier Overnight • Paharganj' },
    { hour: 20, min: 20, carrier: 'Humsafar Express', trainNum: '12910', track: 'Platform 6', highlight: 'All-AC Comfort' },
    { hour: 22, min: 45, carrier: 'Superfast Mail', trainNum: '12626', track: 'Platform 3', highlight: 'Overnight Superfast' }
  ];

  // Apply discount / concession calculation
  let discountRate = 0;
  if (discountCard === 'senior') discountRate = 0.20;
  else if (discountCard === 'ladies') discountRate = 0.10;
  else if (discountCard === 'divyang') discountRate = 0.50;

  return timeSlots.map((slot, index) => {
    const depTime = `${String(slot.hour).padStart(2, '0')}:${String(slot.min).padStart(2, '0')}`;
    
    // Calculate arrival time
    const totalMinutes = slot.hour * 60 + slot.min + spec.durationMinutes;
    const arrHour = Math.floor(totalMinutes / 60) % 24;
    const arrMin = totalMinutes % 60;
    const arrTime = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

    const durHours = Math.floor(spec.durationMinutes / 60);
    const durMins = spec.durationMinutes % 60;
    const durationStr = `${durHours}h ${durMins.toString().padStart(2, '0')}m`;

    // Calculate realistic Indian Railways pricing tiers
    const isPeak = (slot.hour >= 6 && slot.hour <= 8) || (slot.hour >= 17 && slot.hour <= 19);
    const peakMultiplier = isPeak ? 1.15 : 0.95;

    // Calculate authentic Indian Railways official tariff by distance & carrier
    const d = spec.distanceKm || 760;
    const carrierLower = slot.carrier.toLowerCase();

    let standardPrice = 450;
    let firstClassPrice = 1150;

    if (carrierLower.includes('vande')) {
      // Vande Bharat CC & EC with catering
      standardPrice = 450 + Math.round(d * 1.12) + 40 + 45 + Math.round((450 + d * 1.12) * 0.05) + (d > 500 ? 364 : 240);
      firstClassPrice = 900 + Math.round(d * 2.25) + 50 + 45 + Math.round((900 + d * 2.25) * 0.05) + (d > 500 ? 419 : 290);
    } else if (carrierLower.includes('rajdhani')) {
      // Rajdhani 3A & 2A with catering
      standardPrice = 480 + Math.round(d * 0.92) + 40 + 45 + Math.round((480 + d * 0.92) * 0.05) + 375;
      firstClassPrice = 750 + Math.round(d * 1.45) + 50 + 45 + Math.round((750 + d * 1.45) * 0.05) + 405;
    } else if (carrierLower.includes('humsafar')) {
      // Humsafar 3A & 3E
      standardPrice = 380 + Math.round(d * 0.95) + 40 + 45 + Math.round((380 + d * 0.95) * 0.05);
      firstClassPrice = 340 + Math.round(d * 0.88) + 40 + 45 + Math.round((340 + d * 0.88) * 0.05);
    } else if (carrierLower.includes('shatabdi') || carrierLower.includes('tejas')) {
      // Shatabdi CC & EC
      standardPrice = 320 + Math.round(d * 0.98) + 40 + 45 + Math.round((320 + d * 0.98) * 0.05) + (d > 400 ? 285 : 185);
      firstClassPrice = 680 + Math.round(d * 1.95) + 50 + 45 + Math.round((680 + d * 1.95) * 0.05) + (d > 400 ? 340 : 230);
    } else {
      // Classic Superfast: SL & 3A
      standardPrice = 140 + Math.round(d * 0.35) + 20 + 30; // SL
      firstClassPrice = 340 + Math.round(d * 0.88) + 40 + 45 + Math.round((340 + d * 0.88) * 0.05); // 3A
    }

    if (discountRate > 0) {
      standardPrice = Math.round(standardPrice * (1 - discountRate));
      firstClassPrice = Math.round(firstClassPrice * (1 - discountRate));
    }

    let sleeperPrice = standardPrice;
    let executivePrice = firstClassPrice;

    const seatsRemaining = (index % 3 === 0) ? 4 : (index % 2 === 0 ? 9 : 24);

    return {
      id: `IR-${index}-${slot.trainNum}`,
      trainNumber: `${slot.trainNum} ${slot.carrier}`,
      carrier: slot.carrier,
      track: slot.track,
      origin: origin?.name || `${baseOrigin} Junction`,
      destination: destination?.name || `${baseDest} Junction`,
      depTime,
      arrTime,
      duration: durationStr,
      durationMinutes: spec.durationMinutes,
      date,
      seatsRemaining,
      isDirect: true,
      distanceKm: spec.distanceKm,
      co2Kg: spec.co2Train,
      co2SavedKg: Math.round(spec.co2Car - spec.co2Train),
      services: [
        'Kavach Safety Protected',
        'Mobile & Laptop 220V/USB',
        slot.carrier.includes('Vande') ? '180° Executive Swivel Seats' : 'IRCTC Hot Pantry Meal',
        'Clean Bio-Vacuum Toilets',
        'Free Infotainment Wi-Fi'
      ],
      prices: {
        prems: sleeperPrice * passengers,
        second: standardPrice * passengers,
        first: firstClassPrice * passengers,
        optimum: executivePrice * passengers
      },
      perPassengerPrices: {
        prems: sleeperPrice,
        second: standardPrice,
        first: firstClassPrice,
        optimum: executivePrice
      }
    };
  });
}

// Generates authentic 10-digit IRCTC PNR (e.g. 248-8193421)
export function generatePNR() {
  const zonePrefixes = ['241', '248', '452', '631', '820', '194', '512'];
  const prefix = zonePrefixes[Math.floor(Math.random() * zonePrefixes.length)];
  const remaining = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${remaining}`;
}
