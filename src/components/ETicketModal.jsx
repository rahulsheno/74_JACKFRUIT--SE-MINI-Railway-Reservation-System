import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Train, 
  QrCode, 
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { getTrainClassConfig } from '../services/trainClassHelper';
import { useLanguage } from '../context/LanguageContext';

export default function ETicketModal({ ticket, onClose, onOpenCancel }) {
  const { t } = useLanguage();

  if (!ticket) return null;

  const isCancelled = ticket.status === 'CANCELLED';
  const { train, travelClass, seatDetails, passengerName, pnr, totalPrice, searchParams, refundDetails } = ticket;
  const classConfig = getTrainClassConfig(train?.carrier);
  const currentTier = classConfig.classes[travelClass] || classConfig.classes.second;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Top Bar */}
        <div className="bg-[#0f172a] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCancelled 
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400' 
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}>
              {isCancelled ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isCancelled ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isCancelled ? 'Ticket Cancelled & Refunded' : t('eticket.confirmed', 'Booking Confirmed')}
              </span>
              <span className="text-sm font-bold text-white">{t('eticket.ersTitle', 'IRCTC CONNECT Official Electronic Reservation Slip (ERS)')}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto print:p-0 print:m-0 print:max-h-none print:overflow-visible">
          {/* Printable Ticket Area - Target for isolated Print and PDF Export */}
          <div id="printable-ticket" className="space-y-5 bg-white">
          {/* Card Border Styled Ticket */}
          <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            {/* Ticket Header */}
            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00a3a6] flex items-center justify-center text-white font-bold shadow">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 tracking-tight">
                    IRCTC <span className="text-[#00a3a6]">CONNECT</span>
                  </div>
                </div>
              </div>

              {/* 10-Digit PNR Code Badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('eticket.pnrLabel', '10-Digit PNR')}</span>
                <span className="text-lg font-black font-mono tracking-wider text-[#00a3a6] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-lg inline-block">
                  {pnr}
                </span>
              </div>
            </div>

            {/* Passenger & Train info */}
            <div className="py-4 border-b border-dashed border-slate-300 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">{t('eticket.primaryPassenger', 'Primary Passenger')}</span>
                <span className="text-sm font-bold text-slate-900">{passengerName}</span>
                <span className="text-[10px] text-emerald-700 font-extrabold block">
                  {t('trainClass.' + currentTier.code, currentTier.label)} • {t('eticket.quota', 'Quota: GN (General)')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">{t('eticket.trainDate', 'Train & Date')}</span>
                <span className="text-sm font-bold text-slate-900">{train.trainNumber}</span>
                <span className="text-[10px] text-slate-500 block">{searchParams?.depDate}</span>
              </div>
            </div>

            {/* Journey Stations & Times */}
            <div className="py-4 border-b border-dashed border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900">{train.depTime}</div>
                  <div className="text-xs font-bold text-slate-800">{train.origin}</div>
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-1">
                    {train.track}
                  </div>
                </div>

                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] text-slate-400 font-semibold mb-1">{train.duration}</span>
                  <div className="w-20 h-0.5 bg-slate-300 relative flex items-center justify-center">
                    <Train className="w-3.5 h-3.5 text-[#00a3a6] absolute bg-white px-0.5" />
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold mt-1">{classConfig.typeLabel}</span>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">{train.arrTime}</div>
                  <div className="text-xs font-bold text-slate-800">{train.destination}</div>
                  <div className="text-[10px] text-slate-400">{t('eticket.destJunction', 'Destination Junction')}</div>
                </div>
              </div>
            </div>

            {/* Berth, Coach & Catering details */}
            <div className="py-4 border-b border-dashed border-slate-300 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('eticket.coach', 'Coach')}</span>
                <span className="text-base font-black text-slate-900">{seatDetails?.coach || 'C1'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('eticket.seatBerth', 'Seat / Berth')}</span>
                <span className="text-base font-black text-[#00a3a6]">{seatDetails?.seat || '42'}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('eticket.berthType', 'Berth Type')}</span>
                <span className="text-xs font-black text-slate-900 truncate block mt-0.5">
                  {seatDetails?.position || 'Window'}
                </span>
              </div>
            </div>

            {/* Catering & Status */}
            <div className="py-2.5 flex items-center justify-between text-[11px] text-slate-600 border-b border-dashed border-slate-300">
              <span>{t('eticket.catering', 'Catering:')} <strong className="text-slate-800">{seatDetails?.arrangement || 'Pure Veg Meal'}</strong></span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">{t('eticket.status', 'Status: CNF (Confirmed)')}</span>
            </div>

            {/* QR Code and Verification info */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-inner">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-800 block mb-0.5">{t('eticket.tteVerify', 'IRCTC CONNECT TTE Verification Advisory')}</span>
                  {t('eticket.tteDesc', 'Scan at train boarding or platform gate. Carry original Govt ID (Aadhaar / Voter ID).')}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('eticket.totalFare', 'Total Fare Paid')}</span>
                <span className="text-2xl font-black text-slate-900">₹{totalPrice}</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash Database Seal */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-mono bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00a3a6]" />
                <span className="font-bold text-slate-700">SHA-256 Database Hash:</span>
              </div>
              <span className="font-black text-[#00838f] truncate max-w-[220px]" title={ticket.ticketHash || 'SHA-256-AUTHENTICATED'}>
                {ticket.ticketHash ? `${ticket.ticketHash.slice(0, 10)}...${ticket.ticketHash.slice(-8)}` : 'e3b0c442...a89c4f'}
              </span>
            </div>

            {/* Cancelled Ticket Status Banner */}
            {isCancelled && (
              <div className="mt-4 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>RESERVATION CANCELLED & REFUND PROCESSED</span>
                </div>
                {refundDetails && (
                  <div className="text-[11px] text-rose-700 flex justify-between pt-1 border-t border-rose-200">
                    <span>Clerkage Deducted: <strong>₹{refundDetails.deductionCharge?.toFixed(2)}</strong></span>
                    <span>Net Refund: <strong className="text-emerald-700">₹{refundDetails.refundAmount?.toFixed(2)}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Passenger Advisory Note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{t('eticket.advisoryTitle', 'IRCTC CONNECT Travel Advisory:')}</strong> {t('eticket.advisoryDesc', 'Chart will be prepared 4 hours prior to departure. Passengers must carry valid original Photo ID proof during the journey.')}
            </div>
          </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          {!isCancelled ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCancel) onOpenCancel(ticket);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>✕ Cancel Ticket & Claim Refund</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
              Ticket Cancelled
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs transition cursor-pointer shadow-sm shadow-[#00a3a6]/20"
          >
            {t('eticket.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
