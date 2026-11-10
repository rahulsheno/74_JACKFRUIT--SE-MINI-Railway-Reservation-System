/**
 * Real Email Delivery Service supporting:
 * 1. Resend API (Direct verified inbox delivery)
 * 2. Express Backend (Nodemailer / Gmail App Password)
 * 3. SMTPJS direct browser delivery
 */

const BACKEND_URL = 'http://localhost:5000/api';

/**
 * Send real email OTP via SMTPJS (direct browser-based SMTP)
 * Works with your SMTPJS secure token or host/user/pass credentials
 */
export async function sendOtpViaSmtpJs(email, otp, name = 'Traveler') {
  if (typeof window !== 'undefined' && window.Email) {
    try {
      const secureToken = import.meta.env.VITE_SMTPJS_SECURE_TOKEN;
      const host = import.meta.env.VITE_SMTP_HOST || 'smtp.elasticemail.com';
      const username = import.meta.env.VITE_SMTP_USERNAME;
      const password = import.meta.env.VITE_SMTP_PASSWORD;
      const fromEmail = import.meta.env.VITE_SMTP_FROM || 'no-reply@irctc-connect.gov.in';

      const emailPayload = {
        To: email,
        From: fromEmail,
        Subject: `Your IRCTC Security Verification Code is: ${otp}`,
        Body: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background-color: #0f172a; padding: 14px; border-radius: 8px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">IRCTC CONNECT - EMAIL OTP</h2>
            </div>
            <div style="padding: 20px 8px;">
              <p style="font-size: 15px; color: #334155;">Hello <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #475569;">Your one-time email verification code is:</p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00a3a6; background-color: #f0fdfa; padding: 10px 24px; border-radius: 8px; border: 2px dashed #00a3a6; display: inline-block;">
                  ${otp}
                </span>
              </div>
              <p style="font-size: 13px; color: #64748b;">This code is valid for 10 minutes. Do not share it with anyone.</p>
            </div>
          </div>
        `
      };

      if (secureToken) {
        emailPayload.SecureToken = secureToken;
      } else if (username && password) {
        emailPayload.Host = host;
        emailPayload.Username = username;
        emailPayload.Password = password;
      } else {
        // Fallback to backend or return token notice
        return { success: false, reason: 'NO_SMTPJS_CREDENTIALS' };
      }

      const message = await window.Email.send(emailPayload);
      if (message === 'OK' || message?.toLowerCase?.() === 'ok') {
        return { success: true, message: 'Email sent via SMTPJS' };
      }
      return { success: false, error: message };
    } catch (err) {
      console.warn('SMTPJS send error:', err);
      return { success: false, error: err.message };
    }
  }
  return { success: false, reason: 'SMTPJS_NOT_LOADED' };
}

/**
 * Send real OTP to passenger's Gmail (Tries SMTPJS first, then backend Nodemailer)
 */
export async function sendOtpToGmail(email, otp, name) {
  // 1. Try SMTPJS if credentials present in browser
  const smtpJsRes = await sendOtpViaSmtpJs(email, otp, name);
  if (smtpJsRes.success) {
    return smtpJsRes;
  }

  // 2. Delegate to local Express Nodemailer backend
  try {
    const res = await fetch(`${BACKEND_URL}/send-otp-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, name }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to send email OTP via backend:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send confirmed E-Ticket with ticket photo & barcode styling to Gmail
 */
export async function sendTicketToGmail(email, ticket) {
  try {
    const res = await fetch(`${BACKEND_URL}/send-ticket-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ticket }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to send ticket email:', err);
    return { success: false, error: err.message };
  }
}
