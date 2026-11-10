import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateGovtId, formatIdNumber, getIdPlaceholder } from '../services/govtIdValidator';
import { sendOtpToGmail } from '../services/emailService';

export default function AuthModal({ isOpen, onClose }) {
  const { login, authMode, setAuthMode } = useAuth();

  // Mode: 'signin' | 'signup' | 'otp'
  const [mode, setMode] = useState(authMode || 'signin');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [name, setName] = useState('Aarav Sharma');
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('5621-8902-3341');

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [idError, setIdError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // Validate ID if registering
    if (mode === 'signup') {
      const idCheck = validateGovtId(idType, idNumber);
      if (!idCheck.valid) {
        setIdError(idCheck.message);
        return;
      }
      setIdError('');
    }

    const cleanNumber = mobile.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      alert('Please enter a valid 10-digit Indian Mobile Number');
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    // Dispatch OTP via Email (Resend inbox delivery)
    try {
      await sendOtpToGmail(email.trim(), code, name);
    } catch (err) {
      console.warn('Email dispatch notice:', err);
    }

    setIsSendingOtp(false);
    setMode('otp');
    setOtpInput('');
    setResendCooldown(45);

    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setOtpError('');

    const isOtpValid = generatedOtp && otpInput.trim() === generatedOtp;
    setIsVerifyingOtp(false);

    if (!isOtpValid) {
      setOtpError('Invalid OTP code. Please enter the valid 6-digit OTP code sent to your email.');
      return;
    }

    // Success! Log the user in
    const userRecord = {
      name: name.trim() || 'IRCTC Passenger',
      mobile: '+91 ' + mobile.replace(/\D/g, '').slice(-10),
      email: email.trim(),
      idType,
      idNumber: idNumber.trim(),
      verifiedAt: new Date().toISOString()
    };

    login(userRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a3a6] flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#00a3a6] uppercase tracking-wider">
                IRCTC Secure Access
              </div>
              <h3 className="text-lg font-bold text-white">
                {mode === 'otp' ? 'Verify Mobile OTP' : mode === 'signup' ? 'IRCTC Passenger Registration' : 'Sign In with Mobile OTP'}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {mode === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 block mb-1">
                  Verification Code Dispatched
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A real 6-digit verification code has been emailed to <strong className="text-slate-900">{email}</strong>.
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Please check your Gmail inbox (or spam folder) and enter the 6-digit OTP code below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength="6"
                  autoFocus
                  required
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, ''));
                    setOtpError('');
                  }}
                  className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                />
                {otpError && (
                  <p className="text-rose-600 text-xs font-semibold text-center mt-1.5">{otpError}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="hover:underline text-slate-600 cursor-pointer"
                >
                  Change Details
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSendingOtp}
                  onClick={handleSendOtp}
                  className="text-[#00a3a6] font-bold hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : isSendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-3.5 bg-gradient-to-r from-[#00a3a6] to-[#008b8e] hover:from-[#00b2b5] text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#00a3a6]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Sign In'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name (as per Govt ID)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Govt ID Type</label>
                      <select
                        value={idType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setIdType(newType);
                          setIdNumber(formatIdNumber(newType, idNumber));
                          setIdError('');
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ID Number</label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={(e) => {
                          const formatted = formatIdNumber(idType, e.target.value);
                          setIdNumber(formatted);
                          setIdError('');
                        }}
                        placeholder={getIdPlaceholder(idType)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs uppercase font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400 placeholder:font-sans"
                      />
                    </div>
                  </div>
                  {idError && (
                    <p className="text-rose-600 text-[11px] font-semibold">{idError}</p>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile (+91 Indian WhatsApp & SMS)</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email ID (for ERS PDF Ticket & Gmail Alerts)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3.5 bg-gradient-to-r from-[#00a3a6] to-[#008b8e] hover:from-[#00b2b5] text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#00a3a6]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSendingOtp ? 'Sending Real OTP...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
                {mode === 'signin' ? (
                  <span>
                    New to IRCTC?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#00a3a6] font-bold hover:underline cursor-pointer"
                    >
                      Register with Govt ID
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#00a3a6] font-bold hover:underline cursor-pointer"
                    >
                      Sign In with OTP
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
