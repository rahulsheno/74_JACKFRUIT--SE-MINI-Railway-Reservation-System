import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data', 'railway.db');
let dbInstance = null;

export function getSqliteDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);

    // Initialize users and tickets tables in SQLite
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_hash TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        mobile TEXT,
        gender TEXT,
        age TEXT,
        id_type TEXT,
        id_number TEXT,
        id_number_hash TEXT,
        created_at TEXT,
        last_active_at TEXT
      );

      CREATE TABLE IF NOT EXISTS tickets (
        ticket_hash TEXT PRIMARY KEY,
        pnr TEXT UNIQUE,
        user_hash TEXT,
        passenger_name TEXT,
        email TEXT,
        mobile TEXT,
        id_type TEXT,
        id_number TEXT,
        train_number TEXT,
        train_name TEXT,
        origin TEXT,
        destination TEXT,
        journey_date TEXT,
        travel_class TEXT,
        seat_details_json TEXT,
        total_price REAL,
        digital_signature TEXT,
        status TEXT,
        refund_details_json TEXT,
        booked_at TEXT,
        cancelled_at TEXT,
        cancellation_hash TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_pnr ON tickets (pnr);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    `);
  }
  return dbInstance;
}

/**
 * Save user to SQLite
 */
export function saveUserToSqlite(user) {
  try {
    const db = getSqliteDb();
    const stmt = db.prepare(`
      INSERT INTO users (user_hash, name, email, mobile, gender, age, id_type, id_number, id_number_hash, created_at, last_active_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_hash) DO UPDATE SET
        name=excluded.name,
        email=excluded.email,
        mobile=excluded.mobile,
        gender=excluded.gender,
        age=excluded.age,
        id_type=excluded.id_type,
        id_number=excluded.id_number,
        last_active_at=excluded.last_active_at
    `);

    stmt.run(
      user.userHash || '',
      user.name || 'Passenger',
      user.email || '',
      user.mobile || '',
      user.gender || 'Other',
      String(user.age || ''),
      user.idType || 'Aadhaar Card',
      user.idNumber || '',
      user.idNumberHash || '',
      user.createdAt || new Date().toISOString(),
      user.lastActiveAt || new Date().toISOString()
    );
    return true;
  } catch (err) {
    console.error('Error saving user to SQLite:', err);
    return false;
  }
}

/**
 * Save ticket to SQLite
 */
export function saveTicketToSqlite(ticket) {
  try {
    const db = getSqliteDb();
    const stmt = db.prepare(`
      INSERT INTO tickets (
        ticket_hash, pnr, user_hash, passenger_name, email, mobile,
        id_type, id_number, train_number, train_name, origin, destination,
        journey_date, travel_class, seat_details_json, total_price,
        digital_signature, status, refund_details_json, booked_at, cancelled_at, cancellation_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(ticket_hash) DO UPDATE SET
        status=excluded.status,
        refund_details_json=excluded.refund_details_json,
        cancelled_at=excluded.cancelled_at,
        cancellation_hash=excluded.cancellation_hash
    `);

    stmt.run(
      ticket.ticketHash || '',
      String(ticket.pnr || ''),
      ticket.userHash || '',
      ticket.passengerName || 'Passenger',
      ticket.email || '',
      ticket.phone || ticket.mobile || '',
      ticket.idType || 'Aadhaar Card',
      ticket.idNumber || '',
      ticket.train?.trainNumber || '',
      ticket.train?.carrier || ticket.train?.trainName || '',
      ticket.train?.origin || ticket.train?.departureStation || '',
      ticket.train?.destination || ticket.train?.arrivalStation || '',
      ticket.searchParams?.depDate || '',
      ticket.travelClass || '',
      JSON.stringify(ticket.seatDetails || {}),
      Number(ticket.totalPrice || 0),
      ticket.digitalSignature || '',
      ticket.status || 'CONFIRMED',
      ticket.refundDetails ? JSON.stringify(ticket.refundDetails) : null,
      ticket.bookedAt || new Date().toISOString(),
      ticket.cancelledAt || null,
      ticket.cancellationHash || null
    );
    return true;
  } catch (err) {
    console.error('Error saving ticket to SQLite:', err);
    return false;
  }
}

/**
 * Cancel ticket in SQLite
 */
export function cancelTicketInSqlite(pnr, refundData, cancellationHash) {
  try {
    const db = getSqliteDb();
    const stmt = db.prepare(`
      UPDATE tickets
      SET status = 'CANCELLED',
          cancelled_at = ?,
          refund_details_json = ?,
          cancellation_hash = ?
      WHERE pnr = ?
    `);

    const result = stmt.run(
      new Date().toISOString(),
      JSON.stringify(refundData || {}),
      cancellationHash,
      String(pnr)
    );
    return result.changes > 0;
  } catch (err) {
    console.error('Error cancelling ticket in SQLite:', err);
    return false;
  }
}

/**
 * Get ticket from SQLite by PNR or Hash
 */
export function getTicketFromSqlite(hashOrPnr) {
  try {
    const db = getSqliteDb();
    const query = String(hashOrPnr).trim();
    const stmt = db.prepare(`
      SELECT * FROM tickets WHERE pnr = ? OR ticket_hash = ?
    `);
    const r = stmt.get(query, query);
    if (!r) return null;
    return {
      ticketHash: r.ticket_hash,
      pnr: r.pnr,
      userHash: r.user_hash,
      passengerName: r.passenger_name,
      email: r.email,
      phone: r.mobile,
      idType: r.id_type,
      idNumber: r.id_number,
      train: {
        trainNumber: r.train_number,
        carrier: r.train_name,
        origin: r.origin,
        destination: r.destination
      },
      travelClass: r.travel_class,
      seatDetails: JSON.parse(r.seat_details_json || '{}'),
      searchParams: {
        from: r.origin,
        to: r.destination,
        depDate: r.journey_date,
        date: r.journey_date
      },
      journeyDate: r.journey_date,
      totalPrice: r.total_price,
      digitalSignature: r.digital_signature,
      status: r.status,
      refundDetails: r.refund_details_json ? JSON.parse(r.refund_details_json) : null,
      bookedAt: r.booked_at,
      cancelledAt: r.cancelled_at,
      cancellationHash: r.cancellation_hash
    };
  } catch (err) {
    console.error('Error querying SQLite for ticket:', err);
    return null;
  }
}

/**
 * Get all stored tickets from SQLite
 */
export function getAllTicketsFromSqlite() {
  try {
    const db = getSqliteDb();
    const rows = db.prepare('SELECT * FROM tickets ORDER BY booked_at DESC').all();
    return rows.map(r => ({
      ticketHash: r.ticket_hash,
      pnr: r.pnr,
      userHash: r.user_hash,
      passengerName: r.passenger_name,
      email: r.email,
      phone: r.mobile,
      idType: r.id_type,
      idNumber: r.id_number,
      train: {
        trainNumber: r.train_number,
        carrier: r.train_name,
        origin: r.origin,
        destination: r.destination
      },
      travelClass: r.travel_class,
      seatDetails: JSON.parse(r.seat_details_json || '{}'),
      searchParams: {
        from: r.origin,
        to: r.destination,
        depDate: r.journey_date,
        date: r.journey_date
      },
      journeyDate: r.journey_date,
      totalPrice: r.total_price,
      digitalSignature: r.digital_signature,
      status: r.status,
      refundDetails: r.refund_details_json ? JSON.parse(r.refund_details_json) : null,
      bookedAt: r.booked_at,
      cancelledAt: r.cancelled_at,
      cancellationHash: r.cancellation_hash
    }));
  } catch (err) {
    console.error('Error fetching tickets from SQLite:', err);
    return [];
  }
}

/**
 * Get all stored users from SQLite
 */
export function getAllUsersFromSqlite() {
  try {
    const db = getSqliteDb();
    const rows = db.prepare('SELECT * FROM users ORDER BY last_active_at DESC').all();
    return rows.map(r => ({
      userHash: r.user_hash,
      name: r.name,
      email: r.email,
      mobile: r.mobile,
      gender: r.gender,
      age: r.age,
      idType: r.id_type,
      idNumber: r.id_number,
      idNumberHash: r.id_number_hash,
      createdAt: r.created_at,
      lastActiveAt: r.last_active_at
    }));
  } catch (err) {
    console.error('Error fetching users from SQLite:', err);
    return [];
  }
}

/**
 * Get database summary statistics
 */
export function getSqliteStats() {
  try {
    const db = getSqliteDb();
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const ticketsCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get()?.count || 0;
    return {
      engine: 'SQLite 3 (ACID Relational)',
      databasePath: DB_PATH,
      totalUsers: usersCount,
      totalTickets: ticketsCount
    };
  } catch (err) {
    return { engine: 'SQLite 3', error: err.message };
  }
}
