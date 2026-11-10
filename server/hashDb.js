import crypto from 'crypto';
import { 
  saveUserToSqlite, 
  saveTicketToSqlite, 
  cancelTicketInSqlite,
  getTicketFromSqlite,
  getAllTicketsFromSqlite,
  getAllUsersFromSqlite,
  getSqliteStats
} from './sqliteDb.js';

// Secret salt for digital HMAC signatures
const HMAC_SALT = process.env.DB_HMAC_SALT || 'irctc_indian_railways_secure_salt_2026';

/**
 * SHA-256 Hash helper
 */
export function sha256(input) {
  return crypto.createHash('sha256').update(String(input).trim()).digest('hex');
}

/**
 * Digital HMAC-SHA256 signature helper
 */
export function generateHmacSignature(payload) {
  return crypto.createHmac('sha256', HMAC_SALT).update(JSON.stringify(payload)).digest('hex');
}

/**
 * Save or update user into SQLite Database
 */
export function saveUserToDb({ name, email, mobile, idType, idNumber, gender, age }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
  const cleanId = (idNumber || '').replace(/[\s-]/g, '').toUpperCase();

  // Primary User Hash: SHA-256(email + mobile + idNumber)
  const userHash = sha256(`USER|${cleanEmail}|${cleanMobile}|${cleanId}`);
  const idNumberHash = sha256(`GOVT_ID|${idType}|${cleanId}`);

  const updatedUser = {
    userHash,
    name: name || 'Passenger',
    email: cleanEmail,
    mobile: '+91 ' + cleanMobile,
    gender: gender || 'Other',
    age: age || '',
    idType: idType || 'Aadhaar Card',
    idNumber: idNumber || '',
    idNumberHash,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  saveUserToSqlite(updatedUser);
  return updatedUser;
}

/**
 * Save confirmed ticket into SQLite Database
 */
export function saveTicketToDb(ticketRecord) {
  const {
    pnr,
    passengerName,
    email,
    phone,
    gender,
    age,
    idType,
    idNumber,
    train,
    travelClass,
    seatDetails,
    searchParams,
    addons,
    totalPrice,
    bookedAt = new Date().toISOString()
  } = ticketRecord;

  // 1. Ensure user is stored and hashed
  const user = saveUserToDb({
    name: passengerName,
    email,
    mobile: phone,
    gender,
    age,
    idType,
    idNumber
  });

  // 2. Generate tamper-proof SHA-256 Ticket Hash
  const hashPayload = `TICKET|PNR:${pnr}|TRAIN:${train?.trainNumber || train?.carrier}|SEAT:${seatDetails?.coach}-${seatDetails?.selectedSeat || seatDetails?.seat}|USER:${user.userHash}|TIME:${bookedAt}|FARE:${totalPrice}`;
  const ticketHash = sha256(hashPayload);
  const digitalSignature = generateHmacSignature({ ticketHash, pnr, fare: totalPrice });

  const ticketEntry = {
    ticketHash,
    digitalSignature,
    pnr: String(pnr),
    userHash: user.userHash,
    passengerName,
    email: user.email,
    phone: user.mobile,
    gender,
    age,
    idType,
    idNumber,
    idNumberHash: user.idNumberHash,
    train: {
      carrier: train?.carrier || 'Vande Bharat Express',
      trainNumber: train?.trainNumber || '22436',
      origin: train?.origin || train?.departureStation || searchParams?.from || 'New Delhi',
      destination: train?.destination || train?.arrivalStation || searchParams?.to || 'Varanasi',
      departureTime: train?.departureTime || '06:00 AM',
      arrivalTime: train?.arrivalTime || '02:00 PM',
      duration: train?.duration || '8h 00m'
    },
    travelClass,
    seatDetails: {
      coach: seatDetails?.coach || 'C1',
      selectedSeat: seatDetails?.selectedSeat || seatDetails?.seat || '12',
      berthType: seatDetails?.berthType || seatDetails?.position || 'Window',
      arrangement: seatDetails?.arrangement || 'Pure Veg Meal',
      passengerCount: seatDetails?.passengerCount || searchParams?.passengers || 1
    },
    searchParams: {
      from: searchParams?.from || 'New Delhi',
      to: searchParams?.to || 'Varanasi',
      depDate: searchParams?.depDate || searchParams?.date || 'Today'
    },
    addons,
    totalPrice,
    bookedAt,
    status: 'CONFIRMED'
  };

  saveTicketToSqlite(ticketEntry);
  return ticketEntry;
}

/**
 * Lookup ticket by SHA-256 hash or 10-digit PNR
 */
export function getTicketFromDb(hashOrPnr) {
  return getTicketFromSqlite(hashOrPnr);
}

/**
 * Verify cryptographic authenticity of ticket
 */
export function verifyTicketAuthenticity(hashOrPnr) {
  const ticket = getTicketFromDb(hashOrPnr);
  if (!ticket) {
    return { valid: false, message: 'Ticket not found in SQLite Database' };
  }

  // Re-verify digital signature
  const expectedSig = generateHmacSignature({
    ticketHash: ticket.ticketHash,
    pnr: ticket.pnr,
    fare: ticket.totalPrice
  });

  const isAuthentic = expectedSig === ticket.digitalSignature;

  return {
    valid: isAuthentic,
    pnr: ticket.pnr,
    ticketHash: ticket.ticketHash,
    digitalSignature: ticket.digitalSignature,
    status: ticket.status,
    passengerName: ticket.passengerName,
    train: ticket.train,
    bookedAt: ticket.bookedAt,
    verifiedAt: new Date().toISOString(),
    isTampered: !isAuthentic
  };
}

/**
 * Cancel ticket and store refund record in SQLite Database
 */
export function cancelTicketInDb(pnr, refundData) {
  const ticket = getTicketFromDb(pnr);
  if (!ticket) {
    return { success: false, message: 'Ticket not found for cancellation' };
  }

  const cancellationHash = sha256(`CANCEL|${ticket.pnr}|${ticket.ticketHash}|${refundData?.refundId || ''}`);
  const ok = cancelTicketInSqlite(pnr, refundData, cancellationHash);

  if (!ok) {
    return { success: false, message: 'Failed to update cancellation in SQLite' };
  }

  ticket.status = 'CANCELLED';
  ticket.cancelledAt = new Date().toISOString();
  ticket.refundDetails = refundData;
  ticket.cancellationHash = cancellationHash;

  return {
    success: true,
    ticket
  };
}

/**
 * Get all stored tickets from SQLite
 */
export function getAllTicketsFromDb() {
  return getAllTicketsFromSqlite();
}

/**
 * Get all stored users from SQLite
 */
export function getAllUsersFromDb() {
  return getAllUsersFromSqlite();
}

/**
 * Get database summary statistics
 */
export function getDatabaseStats() {
  return getSqliteStats();
}
