import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { 
  saveTicketToDb, 
  saveUserToDb, 
  getTicketFromDb, 
  verifyTicketAuthenticity, 
  getAllTicketsFromDb, 
  getAllUsersFromDb, 
  getDatabaseStats,
  cancelTicketInDb
} from './server/hashDb.js';
import { getSqliteStats } from './server/sqliteDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
let etherealAccount = null;

// Send email helper: Priority: 1. Resend API (Real Inbox), 2. Gmail SMTP, 3. Ethereal fallback
async function dispatchEmail({ to, subject, html, text }) {
  // 1. Resend API (Direct real inbox delivery)
  if (resendClient && process.env.RESEND_API_KEY) {
    try {
      const fromAddress = process.env.RESEND_FROM || 'IRCTC Connect <onboarding@resend.dev>';
      const res = await resendClient.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || subject,
      });

      if (res.data?.id) {
        console.log(`[Resend SUCCESS] Real email delivered to ${to}. ID:`, res.data.id);
        return { success: true, provider: 'resend', id: res.data.id };
      }
      if (res.error) {
        console.warn('[Resend Error, falling back]:', res.error.message);
      }
    } catch (err) {
      console.warn('[Resend Exception, falling back]:', err.message);
    }
  }

  // 2. Gmail SMTP (if valid credentials provided)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      const info = await transporter.sendMail({
        from: `"IRCTC Security & E-Ticketing" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[Gmail SMTP SUCCESS] Delivered to ${to}. MessageId:`, info.messageId);
      return { success: true, provider: 'gmail', messageId: info.messageId };
    } catch (err) {
      console.warn('[Gmail SMTP Error, falling back]:', err.message);
    }
  }

  // 3. Ethereal SMTP fallback
  if (!etherealAccount) {
    try {
      etherealAccount = await nodemailer.createTestAccount();
    } catch (err) {
      console.error('Error creating ethereal test account:', err);
    }
  }

  if (etherealAccount) {
    const transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"IRCTC Security & E-Ticketing" <${etherealAccount.user}>`,
      to,
      subject,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[Ethereal Fallback] Preview in browser:', previewUrl);
    return { success: true, provider: 'ethereal', messageId: info.messageId, previewUrl };
  }

  return { success: false, error: 'No email delivery provider available.' };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    resendConfigured: !!process.env.RESEND_API_KEY,
    gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
    database: getDatabaseStats(),
  });
});

// ==========================================
// HASH VALUE DATABASE ENDPOINTS
// ==========================================

// Save user & ticket into Hash Database
app.post('/api/db/save-booking', (req, res) => {
  const { ticket } = req.body;
  if (!ticket) {
    return res.status(400).json({ success: false, error: 'Ticket record is required' });
  }

  try {
    const savedTicket = saveTicketToDb(ticket);
    return res.json({
      success: true,
      ticketHash: savedTicket.ticketHash,
      digitalSignature: savedTicket.digitalSignature,
      userHash: savedTicket.userHash,
      pnr: savedTicket.pnr,
      savedTicket
    });
  } catch (err) {
    console.error('Error saving to hash database:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Verify ticket authenticity by PNR or SHA-256 Hash
app.get('/api/db/verify/:hashOrPnr', (req, res) => {
  const { hashOrPnr } = req.params;
  try {
    const verification = verifyTicketAuthenticity(hashOrPnr);
    return res.json(verification);
  } catch (err) {
    console.error('Error verifying ticket:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve all tickets from Hash Database
app.get('/api/db/tickets', (req, res) => {
  try {
    const tickets = getAllTicketsFromDb();
    return res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve all users from Hash Database
app.get('/api/db/users', (req, res) => {
  try {
    const users = getAllUsersFromDb();
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get database summary stats
app.get('/api/db/stats', (req, res) => {
  try {
    const hashStats = getDatabaseStats();
    const sqliteStats = getSqliteStats();
    return res.json({ 
      success: true, 
      databaseEngine: 'SQLite 3 (ACID Relational) + SHA-256 Hash Ledger',
      sqlite: sqliteStats,
      hashDb: hashStats 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Send OTP via Email (Real Inbox delivery via Resend)
app.post('/api/send-otp-email', async (req, res) => {
  const { email, otp, name } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const subject = `IRCTC Booking Verification Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 18px; border-radius: 14px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 19px; letter-spacing: 1px;">IRCTC CONNECT VERIFICATION</h2>
      </div>
      <div style="padding: 24px 8px;">
        <p style="font-size: 15px; color: #334155;">Hello <strong>${name || 'Traveler'}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">
          Your one-time security verification code (OTP) for Indian Railways E-Ticketing is:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00a3a6; background-color: #f0fdfa; padding: 12px 28px; border-radius: 12px; border: 2px dashed #00a3a6; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          This OTP is valid for <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          Indian Railway Catering and Tourism Corporation Ltd. • Official E-Ticketing Portal
        </p>
      </div>
    </div>
  `;

  const result = await dispatchEmail({ to: email, subject, html });
  return res.json(result);
});

// Send E-Ticket styled like the BookMyShow / Event pass M-Ticket
app.post('/api/send-ticket-email', async (req, res) => {
  const { email, ticket } = req.body;

  if (!email || !ticket) {
    return res.status(400).json({ success: false, error: 'Email and ticket data are required' });
  }

  // 1. Automatically persist into Hash Value Database
  let savedRecord = null;
  try {
    savedRecord = saveTicketToDb(ticket);
  } catch (err) {
    console.warn('Hash database auto-save warning:', err.message);
  }

  const {
    pnr,
    passengerName,
    idType,
    idNumber,
    train,
    travelClass,
    seatDetails,
    searchParams,
    totalPrice,
  } = ticket;

  const ticketHash = savedRecord?.ticketHash || ticket.ticketHash || 'SHA256-PENDING';
  const shortHash = ticketHash.length > 20 ? `${ticketHash.slice(0, 10)}...${ticketHash.slice(-8)}` : ticketHash;

  // Passenger count
  const pCount = seatDetails?.passengerCount || searchParams?.passengers || 1;
  const trainName = train?.carrier || 'Vande Bharat Express';
  const trainNum = train?.trainNumber || '22436';
  const fromCity = searchParams?.from || train?.departureStation || 'New Delhi';
  const toCity = searchParams?.to || train?.arrivalStation || 'Varanasi';
  const depTime = train?.departureTime || '06:00 AM';
  const dateStr = searchParams?.date || 'Today';
  const coachNum = seatDetails?.coach || 'C1';
  const seatNum = seatDetails?.selectedSeat || '12';
  const berthType = seatDetails?.berthType || 'Window / CNF';
  const classLabel = (travelClass || 'CC').toUpperCase();

  // Dynamic QR Code generation URL incorporating Cryptographic Hash
  const qrData = encodeURIComponent(`IRCTC|PNR:${pnr}|TRAIN:${trainNum}|SEAT:${coachNum}-${seatNum}|HASH:${ticketHash}|PASS:${passengerName}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&color=0f172a&bgcolor=f1f5f9&margin=1`;

  const subject = `🎟️ Confirmed M-Ticket: ${trainName} (${fromCity} ➔ ${toCity}) - PNR ${pnr}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmed M-Ticket</title>
    </head>
    <body style="margin: 0; padding: 24px 10px; background-color: #6d54c7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      <!-- Center Container with Purple Card Background matching the user reference image -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #6d54c7;">
        <tr>
          <td align="center">
            
            <!-- Outer Ticket Card Wrapper (White Ticket with Notch Corners) -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25);">
              
              <!-- TOP SECTION: Train / Event Info + Thumbnail + M-Ticket Pill -->
              <tr>
                <td style="padding: 24px 24px 18px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <!-- Neon Cyan Train Logo Badge (Perfect Geometric Center PNG) -->
                      <td width="92" valign="top" style="padding-right: 16px;">
                        <div style="width: 88px; height: 88px; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 200, 206, 0.35);">
                          <img 
                            src="https://files.catbox.moe/ax3f5g.png" 
                            alt="Train Logo" 
                            width="88" 
                            height="88" 
                            style="width: 88px; height: 88px; display: block; border: 0;" 
                          />
                        </div>
                      </td>

                      <!-- Title & Details -->
                      <td valign="top">
                        <div style="font-size: 21px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 5px;">
                          ${trainName}
                        </div>
                        <div style="font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 3px;">
                          ${classLabel} Class • Confirmed (CNF)
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                          ${dateStr} | ${depTime}
                        </div>
                        <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                          ${fromCity} ➔ ${toCity}
                        </div>
                      </td>

                      <!-- Vertical M-Ticket Label -->
                      <td width="24" valign="middle" align="right" style="padding-left: 8px;">
                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">
                          M-Ticket
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- PERFORATED TICKET CUT LINE (With side circular notches) -->
              <tr>
                <td style="padding: 0; position: relative;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <!-- Left notch -->
                      <td width="16" style="background: radial-gradient(circle at left, #6d54c7 14px, transparent 15px); height: 28px;"></td>
                      <!-- Dashed Line -->
                      <td style="border-bottom: 2px dashed #cbd5e1; height: 14px;"></td>
                      <!-- Right notch -->
                      <td width="16" style="background: radial-gradient(circle at right, #6d54c7 14px, transparent 15px); height: 28px;"></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- MIDDLE SECTION: Gray Container with Big Seat Info + Real QR Code -->
              <tr>
                <td style="padding: 16px 22px 20px 22px;">
                  <div style="background-color: #f1f5f9; border-radius: 20px; padding: 18px 16px; border: 1px solid #e2e8f0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- QR Code -->
                        <td width="112" align="center" valign="middle" style="padding-right: 14px;">
                          <div style="background-color: #ffffff; padding: 6px; border-radius: 12px; border: 1px solid #cbd5e1; display: inline-block;">
                            <img src="${qrCodeUrl}" alt="Ticket QR" width="100" height="100" style="display: block; border-radius: 8px;" />
                          </div>
                        </td>

                        <!-- Seat / Hall Details -->
                        <td valign="middle" align="center">
                          <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 3px;">
                            ${pCount > 1 ? `Passengers: ${pCount}` : 'Single Passenger'}
                          </div>
                          
                          <!-- Big Seat Highlight -->
                          <div style="font-size: 23px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; text-transform: uppercase;">
                            COACH ${coachNum} - SEAT ${seatNum}
                          </div>

                          <div style="font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 8px;">
                            ${berthType}
                          </div>

                          <!-- Booking ID / PNR Box -->
                          <div style="font-size: 12px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">
                            BOOKING PNR - <span style="font-family: monospace; color: #00838f; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">${pnr}</span>
                          </div>
                          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
                            Show this QR to TTE during journey
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- PASSENGER & GOVT ID VERIFIED BOX -->
              <tr>
                <td style="padding: 0 22px 24px 22px;">
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Passenger:</td>
                        <td align="right" style="font-weight: 700; color: #0f172a;">${passengerName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding-top: 6px;">Govt ID (${idType}):</td>
                        <td align="right" style="font-weight: 700; color: #0f172a; font-family: monospace; padding-top: 6px;">${idNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding-top: 6px;">Total Paid:</td>
                        <td align="right" style="font-weight: 900; color: #00838f; font-size: 15px; padding-top: 6px;">₹${totalPrice}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600; padding-top: 6px;">SHA-256 Hash:</td>
                        <td align="right" style="font-weight: 700; color: #0284c7; font-family: monospace; font-size: 11px; padding-top: 6px;" title="${ticketHash}">
                          ${shortHash}
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

            </table>
            <!-- End Ticket Card -->

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  const result = await dispatchEmail({ to: email, subject, html });
  return res.json(result);
});

// Cancel Ticket and process refund endpoint
app.post('/api/cancel-ticket', (req, res) => {
  try {
    const { pnr, refundData } = req.body;
    if (!pnr) {
      return res.status(400).json({ success: false, message: 'PNR is required' });
    }

    const cancelResult = cancelTicketInDb(pnr, refundData);
    if (!cancelResult.success) {
      return res.status(404).json(cancelResult);
    }

    console.log(`[Cancellation SUCCESS] Ticket PNR ${pnr} marked CANCELLED. Refund: ₹${refundData?.refundAmount || 0}`);
    return res.json(cancelResult);
  } catch (err) {
    console.error('Error during ticket cancellation:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend email & verification server running on http://localhost:${PORT}`);
});
