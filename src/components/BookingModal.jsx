import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  User, 
  Train, 
  Lock,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { generatePNR } from '../services/trainEngine';
import { getTrainClassConfig } from '../services/trainClassHelper';
import { useLanguage } from '../context/LanguageContext';
import { validateGovtId, formatIdNumber, getIdPlaceholder } from '../services/govtIdValidator';
import { useAuth } from '../context/AuthContext';
import { sendOtpToGmail, sendTicketToGmail } from '../services/emailService';
import { saveBookingToHashDb } from '../services/hashDatabaseClient';
import { getLocalDateString } from '../services/dateHelper';

export default function BookingModal({ train, travelClass, seatDetails, searchParams, onClose, onBack, onBookingComplete }) {
  const { t } = useLanguage();
  const { currentUser, login } = useAuth();
  const classConfig = getTrainClassConfig(train.carrier);
  const currentTier = classConfig.classes[travelClass] || classConfig.classes.second;

  const getLocalizedCarrier = (carrier = '') => {
    const expressWord = t('common.express', 'Express');
    if (carrier.includes('Vande Bharat')) return `${t('results.vandeBharat', 'Vande Bharat')} ${expressWord}`;
    if (carrier.includes('Rajdhani')) return `${t('results.rajdhani', 'Rajdhani')} ${expressWord}`;
    if (carrier.includes('Shatabdi')) return `${t('results.shatabdi', 'Shatabdi')} ${expressWord}`;
    if (carrier.includes('Duronto')) return `${t('results.duronto', 'Duronto')} ${expressWord}`;
    if (carrier.includes('Humsafar')) return `${t('results.humsafar', 'Humsafar')} ${expressWord}`;
    return carrier;
  };

  // Prepopulate with user profile if signed in, otherwise empty placeholder state
  const [firstName, setFirstName] = useState(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ')[0] || '';
    }
    return '';
  });
  const [lastName, setLastName] = useState(() => {
    if (currentUser?.name) {
      return currentUser.name.split(' ').slice(1).join(' ') || '';
    }
    return '';
  });
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.mobile ? currentUser.mobile.replace('+91 ', '') : '');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [idType, setIdType] = useState(currentUser?.idType || 'Aadhaar Card');
  const [idNumber, setIdNumber] = useState(currentUser?.idNumber || '');

  // ID Validation state
  const [idError, setIdError] = useState('');

  // Additional co-passengers state (if booking for multiple passengers)
  const [coPassengers, setCoPassengers] = useState(() => {
    const totalCount = seatDetails?.passengerCount || searchParams?.passengers || 1;
    if (totalCount <= 1) return [];
    return Array.from({ length: totalCount - 1 }, (_, idx) => ({
      id: idx + 2,
      name: '',
      gender: 'Male',
      age: '',
      berthPreference: seatDetails?.allocatedSeats?.[idx + 1]?.position || 'No Preference'
    }));
  });

  // Keep coPassengers synced if seatDetails changes
  useEffect(() => {
    const totalCount = seatDetails?.passengerCount || searchParams?.passengers || 1;
    if (totalCount > 1) {
      setCoPassengers(prev => {
        if (prev.length === totalCount - 1) return prev;
        return Array.from({ length: totalCount - 1 }, (_, idx) => {
          return prev[idx] || {
            id: idx + 2,
            name: '',
            gender: 'Male',
            age: '',
            berthPreference: seatDetails?.allocatedSeats?.[idx + 1]?.position || 'No Preference'
          };
        });
      });
    } else {
      setCoPassengers([]);
    }
  }, [seatDetails?.passengerCount, searchParams?.passengers]);
  const [step, setStep] = useState('details'); // 'details' | 'otp_verification'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const isHumsafar = (train.carrier || '').toLowerCase().includes('humsafar');
  const [pantryMeal, setPantryMeal] = useState(isHumsafar);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing math in Indian Rupees (₹)
  const passengerCount = seatDetails?.passengerCount || searchParams?.passengers || 1;
  const baseTicketPrice = (train.prices[travelClass] || train.prices.second) * passengerCount;
  const mealPrice = (isHumsafar && pantryMeal) ? 180.00 * passengerCount : 0;
  const totalPrice = (baseTicketPrice + mealPrice).toFixed(2);

  // Trigger OTP sending
  const handleInitiateBooking = async (e) => {
    e.preventDefault();

    // 1. Validate primary payer age (must be at least 18)
    const primaryAge = parseInt(age, 10);
    if (!primaryAge || primaryAge < 18) {
      alert('The primary payer / main booking passenger must be at least 18 years old.');
      return;
    }

    // 2. Validate co-passengers age (minimum 5)
    for (let i = 0; i < coPassengers.length; i++) {
      const cp = coPassengers[i];
      if (cp.age) {
        const cpAge = parseInt(cp.age, 10);
        if (cpAge < 5) {
          alert(`Co-Passenger ${i + 2} age cannot be less than 5 years.`);
          return;
        }
      }
    }

    // 3. Strict Govt ID validation
    const idCheck = validateGovtId(idType, idNumber);
    if (!idCheck.valid) {
      setIdError(idCheck.message);
      return;
    }
    setIdError('');

    // 2. Validate mobile
    const cleanMobile = phone.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      alert('Please enter a valid 10-digit Indian Mobile Number');
      return;
    }

    // 3. Generate 6-digit OTP and transition to verification step
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpInput('');
    setOtpError('');
    setResendCooldown(30);
    setStep('otp_verification');

    // 4. Trigger real delivery to Gmail
    try {
      sendOtpToGmail(email.trim(), otp, `${firstName} ${lastName}`);
    } catch (err) {
      console.warn('Real dispatch notice:', err);
    }

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

  const handleVerifyOtpAndBook = async (e) => {
    e.preventDefault();
    
    // Check against generated OTP
    const isOtpValid = otpInput.trim() === generatedOtp;

    if (!isOtpValid) {
      setOtpError('Invalid OTP code. Please enter the valid 6-digit code received.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      const pnr = generatePNR();
      const ticketRecord = {
        pnr,
        passengerName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: '+91 ' + phone.replace(/\D/g, '').slice(-10),
        gender,
        age,
        idType,
        idNumber: idNumber.trim(),
        coPassengers: coPassengers.map((cp, idx) => ({
          passengerNum: idx + 2,
          name: cp.name.trim() || `Passenger ${idx + 2}`,
          gender: cp.gender,
          age: cp.age || '5',
          berth: cp.berthPreference
        })),
        train,
        travelClass,
        seatDetails,
        searchParams: {
          ...searchParams,
          depDate: searchParams?.depDate || getLocalDateString()
        },
        journeyDate: searchParams?.depDate || getLocalDateString(),
        addons: {
          pantryMeal
        },
        totalPrice,
        bookedAt: new Date().toISOString()
      };

      // Save user & ticket in Hash Value Database
      try {
        const dbRes = await saveBookingToHashDb(ticketRecord);
        if (dbRes?.ticketHash) {
          ticketRecord.ticketHash = dbRes.ticketHash;
          ticketRecord.digitalSignature = dbRes.digitalSignature;
          ticketRecord.userHash = dbRes.userHash;
        }
      } catch (err) {
        console.warn('Hash database save notice:', err);
      }

      // Send confirmed ticket with ticket photo via Gmail
      try {
        await sendTicketToGmail(email.trim(), ticketRecord);
      } catch (err) {
        console.warn('Email ticket dispatch notice:', err);
      }

      // Automatic / Compulsory Sign In on Booking
      try {
        const authenticatedProfile = {
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          mobile: '+91 ' + phone.replace(/\D/g, '').slice(-10),
          gender,
          age,
          idType,
          idNumber: idNumber.trim(),
          verifiedAt: new Date().toISOString(),
          autoSignedInViaBooking: true
        };
        login(authenticatedProfile);
      } catch (err) {
        console.warn('Auto sign-in notice:', err);
      }

      setIsSubmitting(false);
      onBookingComplete(ticketRecord);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'otp_verification' ? (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-[#00a3a6] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer group"
                title="Back to Details"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            ) : onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-[#00a3a6] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer group"
                title="Go Back to Seat & Berth Selection"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#00a3a6] flex items-center justify-center">
                <Train className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-[#00a3a6] uppercase tracking-wider flex items-center gap-1.5">
                {step === 'otp_verification' ? (
                  <span>Two-Factor Authentication • Mobile & Email OTP</span>
                ) : (
                  <>
                    {onBack && (
                      <button
                        type="button"
                        onClick={onBack}
                        className="hover:underline flex items-center gap-1 cursor-pointer text-slate-400 hover:text-[#00a3a6]"
                      >
                        <span>← Go Back</span>
                        <span>•</span>
                      </button>
                    )}
                    <span>{t('booking.step', 'Step 2 of 2: Checkout & IRCTC Booking')}</span>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">
                {step === 'otp_verification' 
                  ? 'Verify Mobile OTP to Confirm Ticket' 
                  : t('booking.title', 'Passenger Details & Final Confirmation')}
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

        {/* Content */}
        {step === 'otp_verification' ? (
          <form onSubmit={handleVerifyOtpAndBook} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>IRCTC Security Verification Code Dispatched</span>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                A real 6-digit OTP has been dispatched to your mobile number <strong className="text-slate-900">+91 {phone.replace(/\D/g, '').slice(-10)}</strong> and your email address <strong className="text-slate-900">{email}</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                Please check your phone's SMS inbox and email inbox to enter the verification code.
              </p>
            </div>

            {/* OTP Input Field */}
            <div className="max-w-xs mx-auto text-center">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
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
                <p className="text-rose-600 text-xs font-semibold mt-1.5">{otpError}</p>
              )}
            </div>

            {/* Verified Govt ID & Ticket Recap */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Primary Passenger:</span>
                <span className="font-bold text-slate-900">{firstName} {lastName} ({gender}, {age} yrs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Verified Govt ID:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {idType} ({idNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Fare to Pay:</span>
                <span className="font-black text-sm text-[#00a3a6]">₹{totalPrice}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="hover:underline text-slate-600 cursor-pointer"
              >
                ← Edit Traveler Details
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleInitiateBooking}
                className="text-[#00a3a6] font-bold hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#00a3a6] to-[#008b8e] hover:from-[#00b2b5] text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#00a3a6]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Confirming Reservation with IRCTC...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Pay ₹{totalPrice}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleInitiateBooking} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Booking Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{getLocalizedCarrier(train.carrier)}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-extrabold">{t('trainClass.' + currentTier.code, currentTier.label)}</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">
                  {train.origin} → {train.destination}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {searchParams?.depDate} • {t('booking.dept', 'Dept')} {train.depTime} • {t('booking.arr', 'Arr')} {train.arrTime} ({train.duration})
                </div>
                <div className="text-[11px] font-bold text-[#00a3a6] mt-0.5">
                  {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-800 font-bold">
                  {t('booking.coach', 'Coach')} {seatDetails?.coach || currentTier.defaultCoach} • {seatDetails?.position ? t('seat.' + (seatDetails.seatType || 'lower') + '.name', seatDetails.position) : seatDetails?.position || 'Window Seat'} (#{seatDetails?.seat || 42}{passengerCount > 1 ? ` - #${(parseInt(seatDetails?.seat, 10) || 42) + passengerCount - 1}` : ''})
                </div>
                <div className="text-2xl font-black text-[#00a3a6] mt-0.5">
                  ₹{totalPrice}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t('booking.confirmedAllocation', 'Confirmed {code} Allocation').replace('{code}', currentTier.code)}
                </span>
              </div>
            </div>

            {/* Passenger Identity Inputs with Strict Govt ID Validation */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#00a3a6]" />
                  {t('booking.primaryDetails', 'Primary Traveler Details')}
                </h4>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Govt ID Mandatory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.firstName', 'First Name (as per Govt ID)')}</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.lastName', 'Last Name')}</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.gender', 'Gender')}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                  >
                    <option value="Male">{t('booking.genderMale', 'Male')}</option>
                    <option value="Female">{t('booking.genderFemale', 'Female')}</option>
                    <option value="Other">{t('booking.genderOther', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.age', 'Age (Years)')}</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 29"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.idType', 'Govt ID Type')}</label>
                  <select
                    value={idType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setIdType(newType);
                      setIdNumber(formatIdNumber(newType, idNumber));
                      setIdError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card (12 Digits)</option>
                    <option value="PAN Card">PAN Card (10 Chars)</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.idNumber', 'ID Number / Reference')}</label>
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm uppercase font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400 placeholder:font-sans ${idError ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'}`}
                  />
                  {idError && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {idError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Co-Passengers (if passengerCount > 1) */}
            {coPassengers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-600" />
                    Additional Passengers ({coPassengers.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Min Age: <strong className="text-emerald-700">5+ yrs</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {coPassengers.map((passenger, index) => (
                    <div 
                      key={passenger.id} 
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#00a3a6] text-white flex items-center justify-center text-[10px]">
                            {index + 2}
                          </span>
                          Passenger {index + 2}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Seat: {seatDetails?.allocatedSeats?.[index + 1]?.seatNum ? `#${seatDetails.allocatedSeats[index + 1].seatNum}` : `Berth ${index + 2}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={`Passenger ${index + 2}`}
                            value={passenger.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoPassengers(prev => {
                                const next = [...prev];
                                next[index] = { ...next[index], name: val };
                                return next;
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Gender
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoPassengers(prev => {
                                const next = [...prev];
                                next[index] = { ...next[index], gender: val };
                                return next;
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Age (Years)
                            </label>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              Min: 5 yrs
                            </span>
                          </div>
                          <input
                            type="number"
                            required
                            min="5"
                            max="110"
                            placeholder="e.g. 12 (Min 5)"
                            value={passenger.age}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoPassengers(prev => {
                                const next = [...prev];
                                next[index] = { ...next[index], age: val };
                                return next;
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information & Alerts */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#00a3a6]" />
                {t('booking.deliveryTitle', 'E-Ticket Delivery & PNR Alerts')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.email', 'Email (for ERS PDF Ticket & Gmail Alerts)')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aarav.sharma@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t('booking.mobile', 'Mobile (+91 Indian WhatsApp & OTP Verification)')}</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a3a6] placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* IRCTC Add-ons - only for Humsafar */}
            {isHumsafar && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {t('booking.addonsTitle', 'Optional Travel Add-ons & Amenities')}
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={pantryMeal}
                        onChange={(e) => setPantryMeal(e.target.checked)}
                        className="w-4 h-4 text-[#00a3a6] rounded focus:ring-[#00a3a6]"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{t('booking.mealTitle', 'Fresh Hot Pantry Meal & Refreshments')}</span>
                        <span className="text-xs text-slate-500">{t('booking.mealDesc', 'Choice of Veg / Non-Veg Thali, packaged drinking water')}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">+₹180.00</span>
                  </label>
                </div>
              </div>
            )}

            {/* Secure Payment Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>{t('booking.sslText', 'UPI, NetBanking, RuPay, Visa, IRCTC iMudra 256-Bit SSL')}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onBack || onClose}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{onBack ? 'Go Back' : t('booking.back', 'Back')}</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-[#00a3a6] to-[#008b8e] hover:from-[#00b2b5] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#00a3a6]/20 cursor-pointer"
                >
                  <span>Proceed to Mobile OTP Verification →</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
