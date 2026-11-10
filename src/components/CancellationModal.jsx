import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Train, 
  ArrowRight,
  ReceiptText,
  Timer,
  Zap,
  Check,
  Info,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalDateString } from '../services/dateHelper';

export default function CancellationModal({ ticket, onClose, onConfirmCancel }) {
  const { t } = useLanguage();

  if (!ticket) return null;

  const totalPrice = parseFloat(ticket.totalPrice || 0);
  const travelClass = (ticket.travelClass || 'second').toLowerCase();
  
  // Base clerkage fee by class per CRIS/IRCTC rules
  let clerkageBase = 180;
  if (travelClass === 'first' || travelClass.includes('1a') || travelClass.includes('ec')) {
    clerkageBase = 240;
  } else if (travelClass.includes('2a')) {
    clerkageBase = 200;
  } else if (travelClass.includes('sl') || travelClass.includes('sleeper')) {
    clerkageBase = 120;
  }

  // Robust parsing of date strings (DD-MM-YYYY, YYYY-MM-DD, or ISO)
  const parseTicketDate = (dateStr) => {
    if (!dateStr) return new Date();
    const str = String(dateStr).trim();

    // DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyy) {
      return new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
    }

    // YYYY-MM-DD or YYYY/MM/DD
    const yyyymmdd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (yyyymmdd) {
      return new Date(parseInt(yyyymmdd[1], 10), parseInt(yyyymmdd[2], 10) - 1, parseInt(yyyymmdd[3], 10));
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const parseTime = (timeStr) => {
    const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return { hours: 6, minutes: 0 };
    let hrs = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hrs < 12) hrs += 12;
    if (meridiem === 'AM' && hrs === 12) hrs = 0;
    return { hours: hrs, minutes: mins };
  };

  // Derive Scheduled Departure Date & Time from ticket attributes
  const rawDate = ticket.searchParams?.depDate || ticket.journeyDate || ticket.searchParams?.date || getLocalDateString();
  const depTimeStr = ticket.train?.departureTime || ticket.train?.depTime || '06:00 AM';

  const getDepartureTimestamp = () => {
    try {
      const target = parseTicketDate(rawDate);
      const { hours, minutes } = parseTime(depTimeStr);
      target.setHours(hours, minutes, 0, 0);
      return target.getTime();
    } catch {
      return Date.now();
    }
  };

  const [departureTime] = useState(getDepartureTimestamp);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Live ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live seconds and hours remaining relative to current live time
  const isPastDeparture = departureTime <= currentTime;
  const liveDiffMs = isPastDeparture ? 0 : Math.max(0, departureTime - currentTime);
  const liveTotalSeconds = Math.floor(liveDiffMs / 1000);
  const effectiveHours = isPastDeparture ? 0 : (liveTotalSeconds / 3600);

  // Formatted countdown strings
  const displayHours = Math.floor(liveTotalSeconds / 3600);
  const displayMinutes = Math.floor((liveTotalSeconds % 3600) / 60);
  const displaySeconds = liveTotalSeconds % 60;

  // Automatic IRCTC Cancellation Tier Determination based on the timer
  let activeTier = 1;
  let deduction = 0;
  let tierLabel = '';
  let tierPolicy = '';
  let badgeColor = '';

  if (effectiveHours > 48) {
    activeTier = 1;
    deduction = Math.min(totalPrice, clerkageBase);
    tierLabel = '> 48 Hours Prior to Departure';
    tierPolicy = `Flat clerkage deduction of ₹${clerkageBase} (per passenger)`;
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (effectiveHours >= 12 && effectiveHours <= 48) {
    activeTier = 2;
    deduction = Math.max(clerkageBase, Math.round(totalPrice * 0.25));
    tierLabel = 'Between 48 and 12 Hours Prior';
    tierPolicy = '25% of total ticket fare deduction (Subject to minimum clerkage)';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (effectiveHours >= 4 && effectiveHours < 12) {
    activeTier = 3;
    deduction = Math.max(clerkageBase, Math.round(totalPrice * 0.50));
    tierLabel = 'Between 12 and 4 Hours Prior';
    tierPolicy = '50% of total ticket fare deduction (Subject to minimum clerkage)';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    activeTier = 4;
    deduction = totalPrice;
    tierLabel = isPastDeparture
      ? 'Train Already Departed (Chart Closed)' 
      : 'Less than 4 Hours Prior (Chart Prepared)';
    tierPolicy = isPastDeparture
      ? '0% Refund / 100% deduction — No cancellation permitted after departure'
      : '0% Refund / 100% deduction per IRCTC PRS rules';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  deduction = Math.min(totalPrice, deduction);
  const refundAmount = Math.max(0, totalPrice - deduction);

  const handleExecuteCancel = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 900));

    const refundDetails = {
      pnr: ticket.pnr,
      totalPaid: totalPrice,
      deductionCharge: deduction,
      refundAmount: refundAmount,
      timeframeNotice: tierLabel,
      hoursRemaining: effectiveHours.toFixed(1),
      refundReferenceId: `CRIS-RFND-${Math.floor(100000 + Math.random() * 900000)}`,
      cancelledAt: new Date().toISOString()
    };

    setIsProcessing(false);
    setSuccessData(refundDetails);

    if (onConfirmCancel) {
      onConfirmCancel(ticket.pnr, refundDetails);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">IRCTC Cancellation & Refund</span>
              <span className="text-sm font-bold text-white">Live PRS Departure Countdown</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!successData ? (
            <>
              {/* Ticket Summary Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">10-Digit PNR</span>
                  <span className="font-mono font-black text-sm text-[#00a3a6] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-lg">
                    {ticket.pnr}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Passenger Name:</span>
                  <strong className="text-slate-900">{ticket.passengerName}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Train:</span>
                  <span className="font-bold text-slate-800">#{ticket.train?.trainNumber} • {ticket.train?.carrier}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Scheduled Departure:</span>
                  <span className="text-slate-700 font-medium">
                    {ticket.train?.origin || 'New Delhi (NDLS)'} ({depTimeStr}, {rawDate})
                  </span>
                </div>
              </div>

              {/* LIVE COUNTDOWN TIMER CARD */}
              <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/70 via-slate-50 to-blue-50/50 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Timer className="w-4 h-4 text-[#00a3a6] animate-pulse" />
                    <span>Live PRS Departure Countdown:</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Telemetry
                  </span>
                </div>

                {/* Digital Flip Clock Display */}
                {isPastDeparture ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center my-3">
                    <span className="block font-bold text-rose-800 text-xs uppercase tracking-wide">
                      Train Has Already Departed
                    </span>
                    <span className="text-[11px] text-rose-600 mt-0.5 block">
                      Scheduled at {depTimeStr} on {rawDate}. Zero cancellation window remaining.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center my-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs">
                      <span className="block font-mono font-black text-2xl text-slate-900 leading-none">
                        {String(displayHours).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Hours</span>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs">
                      <span className="block font-mono font-black text-2xl text-[#00a3a6] leading-none">
                        {String(displayMinutes).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Minutes</span>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs">
                      <span className="block font-mono font-black text-2xl text-rose-600 leading-none">
                        {String(displaySeconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Seconds</span>
                    </div>
                  </div>
                )}

                {/* Automatically Locked Rule Status */}
                <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-start gap-2 ${badgeColor}`}>
                  <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Auto-Detected Rule: {tierLabel}</strong>
                    <span className="text-[11px] opacity-90 block mt-0.5">{tierPolicy}</span>
                  </div>
                </div>
              </div>

              {/* AUTOMATED IRCTC REFUND TIMEFRAMES BREAKDOWN */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    IRCTC Cancellation Tier Schedule:
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Automatic system rate</span>
                </div>

                <div className="space-y-2">
                  {[
                    { tier: 1, title: 'More than 48 hours prior to departure', sub: `Flat clerkage deduction of ₹${clerkageBase}`, minHours: 48 },
                    { tier: 2, title: 'Between 48 and 12 hours prior', sub: '25% of total ticket fare deduction', minHours: 12 },
                    { tier: 3, title: 'Between 12 and 4 hours prior', sub: '50% of total ticket fare deduction', minHours: 4 },
                    { tier: 4, title: 'Less than 4 hours prior to departure', sub: '0% refund (100% deduction / Chart prepared)', minHours: 0 }
                  ].map(opt => {
                    const isCurrent = activeTier === opt.tier;
                    return (
                      <div 
                        key={opt.tier}
                        className={`p-3 rounded-xl border text-xs transition relative ${
                          isCurrent 
                            ? 'border-emerald-400 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-300' 
                            : 'border-slate-200 bg-slate-50/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className={`font-bold ${isCurrent ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                                {opt.title}
                              </strong>
                              {isCurrent && (
                                <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                  Active Window
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{opt.sub}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Refund Breakdown */}
              <div className="bg-gradient-to-b from-rose-50/80 to-white border border-rose-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total Fare Paid:</span>
                  <strong className="text-slate-900 font-mono">₹{totalPrice.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-xs text-rose-700 font-semibold">
                  <span>IRCTC Clerkage Charge ({tierLabel}):</span>
                  <span className="font-mono">-₹{deduction.toFixed(2)}</span>
                </div>
                <div className="h-px bg-rose-200 border-dashed" />
                <div className="flex justify-between items-center text-sm pt-0.5">
                  <span className="font-bold text-slate-900">Estimated Net Refund:</span>
                  <span className="text-xl font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                    ₹{refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 italic text-center pt-1">
                  * Calculated dynamically based on scheduled departure countdown.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Keep Ticket
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCancel}
                  disabled={isProcessing || isPastDeparture}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Cancellation...</span>
                    </>
                  ) : (
                    <span>
                      {isPastDeparture 
                        ? 'Cannot Cancel (Train Departed)' 
                        : 'Confirm Cancellation & Refund'}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Refund Success Slip */
            <div className="space-y-4 py-2 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Ticket Cancelled & Refund Initiated</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your cancellation request for PNR <strong>{successData.pnr}</strong> has been executed successfully.
                  </p>
                </div>
              </div>

              {/* Refund Audit Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-sans font-bold flex items-center gap-1.5">
                    <ReceiptText className="w-4 h-4 text-slate-700" />
                    Refund Reference ID:
                  </span>
                  <span className="font-bold text-[#00a3a6]">{successData.refundReferenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Total Fare Paid:</span>
                  <span>₹{successData.totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="font-sans">Clerkage / Cancellation Charge:</span>
                  <span>-₹{successData.deductionCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-emerald-700 pt-2 border-t border-slate-200 font-sans">
                  <span>Net Refund Amount:</span>
                  <span className="font-mono text-base">₹{successData.refundAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-sans pt-1">
                  <span>Departure Notice Window:</span>
                  <span className="text-slate-600 font-semibold">{successData.timeframeNotice}</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900">
                <strong>CRIS / Bank Settlement:</strong> The net refund will be credited back to your original payment mode within 3 to 5 banking days.
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
