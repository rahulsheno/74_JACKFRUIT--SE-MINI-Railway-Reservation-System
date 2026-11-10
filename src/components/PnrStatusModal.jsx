import React, { useState } from 'react';
import { X, Search, Train, CheckCircle2, AlertTriangle, ShieldCheck, Clock, User, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchLivePnr } from '../services/railRadarService';

export default function PnrStatusModal({ bookedTickets = [], onClose, onOpenTicket, onOpenCancel }) {
  const { t } = useLanguage();
  const [pnrInput, setPnrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnrInput || pnrInput.trim().length !== 10) return;

    setLoading(true);
    setResult(null);

    // First check if it matches a recently booked ticket in this session
    const localMatch = bookedTickets.find(b => b.pnr === pnrInput.trim());
    if (localMatch) {
      setResult({
        type: 'local',
        ticket: localMatch,
        pnr: localMatch.pnr,
        chartPrepared: true,
        status: localMatch.status === 'CANCELLED' ? 'CAN (Cancelled)' : 'CNF (Confirmed)',
        trainNumber: localMatch.train?.trainNumber,
        trainName: localMatch.train?.carrier,
        origin: localMatch.train?.origin,
        destination: localMatch.train?.destination
      });
      setLoading(false);
      return;
    }

    // Otherwise query live RailRadar PRS API
    const liveRes = await fetchLivePnr(pnrInput.trim());
    setResult({
      type: 'api',
      ...liveRes
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a3a6] flex items-center justify-center text-white font-bold">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  {t('pnrModal.subtitle', 'Real-Time PRS Passenger Reservation System Verification')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {t('pnrModal.title', 'Live 10-Digit PNR Status Enquiry')}
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

        {/* Search bar */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <input
              type="text"
              maxLength="10"
              pattern="[0-9]{10}"
              required
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
              placeholder={t('pnrModal.inputPlaceholder', 'Enter 10-digit PNR number...')}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00a3a6]"
            />
            <button
              type="submit"
              disabled={loading || pnrInput.length !== 10}
              className="px-6 py-3 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{t('pnrModal.searchBtn', 'Check Live PNR')}</span>
            </button>
          </form>

          {/* Results display */}
          {result && (
            <div className="p-4 rounded-2xl border transition animate-fade-in">
              {result.success !== false ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">10-Digit PNR</span>
                      <span className="text-xl font-black font-mono tracking-wider text-[#00a3a6]">
                        {result.pnr}
                      </span>
                    </div>
                    {result.ticket?.status === 'CANCELLED' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Cancelled (Refund Processed)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('pnrModal.statusConfirmed', 'Confirmed (CNF)')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Train Details:</span>
                      <strong className="text-slate-900 block mt-0.5">#{result.trainNumber} • {result.trainName}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Chart Status:</span>
                      <span className="font-bold text-emerald-700 block mt-0.5">
                        {result.chartPrepared ? t('pnrModal.chartPrepared') : t('pnrModal.chartNotPrepared')}
                      </span>
                    </div>
                  </div>

                  {result.ticket && (
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenTicket(result.ticket);
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
                      >
                        View Full Electronic Reservation Slip (ERS)
                      </button>

                      {result.ticket.status !== 'CANCELLED' && onOpenCancel && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCancel(result.ticket);
                          }}
                          className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          ✕ Cancel Ticket & Claim Refund
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">{t('pnrModal.flushedNotice')}</strong>
                    <span>{result.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recently Booked in Session */}
          {bookedTickets.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2.5">
                {t('pnrModal.demoPnrNotice', 'Recently Booked Tickets in this Session:')}
              </span>
              <div className="space-y-2">
                {bookedTickets.map((tkt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPnrInput(tkt.pnr);
                      setResult({
                        type: 'local',
                        ticket: tkt,
                        pnr: tkt.pnr,
                        chartPrepared: true,
                        status: tkt.status === 'CANCELLED' ? 'CAN (Cancelled)' : 'CNF (Confirmed)',
                        trainNumber: tkt.train?.trainNumber,
                        trainName: tkt.train?.carrier,
                        origin: tkt.train?.origin,
                        destination: tkt.train?.destination
                      });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#00a3a6] bg-slate-50/70 hover:bg-cyan-50/40 text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-[#00a3a6]">{tkt.pnr}</div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">{tkt.passengerName} • {tkt.train?.carrier}</div>
                    </div>
                    {tkt.status === 'CANCELLED' ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Confirmed
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

