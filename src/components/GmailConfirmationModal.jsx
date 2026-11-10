import React from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  Train, 
  QrCode, 
  Paperclip,
  Share2
} from 'lucide-react';

export default function GmailConfirmationModal({ emailData, onClose, onOpenTicket }) {
  if (!emailData) return null;

  const { to, subject, passengerName, pnr, train, date, classLabel, seatNumber, totalFare, ticket } = emailData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Gmail Emulated Header */}
        <div className="bg-[#ea4335] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#ea4335] flex items-center justify-center font-bold shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Gmail Notification Dispatched
              </div>
              <h3 className="text-base font-bold text-white">
                Ticket Sent to {to}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Preview Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-slate-50">
          {/* Metadata bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">From:</span>
              <span className="text-slate-800 font-bold">ticketadmin@irctc.co.in</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">To:</span>
              <span className="text-slate-800 font-bold">{to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Subject:</span>
              <span className="text-[#0f766e] font-extrabold">{subject}</span>
            </div>
          </div>

          {/* Email Body Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Dear {passengerName},</h4>
                <p className="text-xs text-slate-500 mt-0.5">Thank you for booking with Indian Railways & IRCTC.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                CNF • Confirmed
              </span>
            </div>

            {/* Visual Mini Ticket Graphic embedded in email */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1629] to-[#1e293b] text-white space-y-3 shadow-md border border-slate-700">
              <div className="flex justify-between items-center text-xs border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Train className="w-4 h-4" />
                  <span>{train?.carrier || 'Indian Railways'} ({train?.trainNumber})</span>
                </div>
                <div className="font-mono text-emerald-400 font-extrabold">
                  PNR: {pnr}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <div className="font-black text-lg text-white">{train?.depTime}</div>
                  <div className="text-xs text-slate-300 font-medium">{train?.origin}</div>
                </div>
                <div className="text-center text-[10px] text-slate-400">
                  <div>{train?.duration}</div>
                  <div className="w-16 h-0.5 bg-slate-600 my-1 mx-auto"></div>
                  <div className="text-cyan-400 font-bold">{classLabel}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg text-white">{train?.arrTime}</div>
                  <div className="text-xs text-slate-300 font-medium">{train?.destination}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex justify-between items-center text-xs">
                <span className="text-slate-300">Berth: <strong className="text-white">{seatNumber}</strong></span>
                <span className="text-emerald-400 font-bold">Total Fare: ₹{totalFare}</span>
              </div>
            </div>

            {/* Attached Ticket Slip Indicator */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-800 block">IRCTC_ERS_Ticket_{pnr}.pdf</span>
                  <span className="text-[10px] text-slate-500">Government Authorized PDF with Barcode • 420 KB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenTicket(ticket)}
                className="px-3 py-1.5 bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Automated SMS also delivered to mobile.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTicket(ticket);
              }}
              className="px-5 py-2 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#00a3a6]/20 cursor-pointer"
            >
              <span>View Full E-Ticket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

