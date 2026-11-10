import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  PhoneCall, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LegalModal({ activeTab = 'privacy', onClose }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState(activeTab);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pnr: '',
    category: 'Ticket Booking / ERS',
    message: ''
  });

  // Keep internal tab in sync if prop changes
  useEffect(() => {
    if (activeTab) setTab(activeTab);
  }, [activeTab]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setGrievanceSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', pnr: '', category: 'Ticket Booking / ERS', message: '' });
      setGrievanceSubmitted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] text-slate-200 rounded-3xl max-w-4xl w-full border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 to-[#0f172a] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a3a6]/20 border border-[#00a3a6]/40 flex items-center justify-center text-[#00a3a6]">
              {tab === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {tab === 'terms' && <FileText className="w-5 h-5" />}
              {tab === 'security' && <Lock className="w-5 h-5" />}
              {tab === 'contact' && <PhoneCall className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t('legal.modalTitle', 'IRCTC Official Passenger & Legal Directory')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('legal.modalSubtitle', 'Indian Railways Regulatory Compliance, Consumer Protection & Direct Assistance')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title={t('legal.closeBtn', 'Close dialog (Esc)')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto shrink-0 flex items-center gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              tab === 'privacy'
                ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('legal.privacyPolicy', 'Privacy Policy')}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              tab === 'terms'
                ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('legal.termsOfService', 'Terms of Service')}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              tab === 'security'
                ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t('legal.securityGuidelines', 'Security & Guidelines')}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('contact')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              tab === 'contact'
                ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('legal.contactCris', 'Contact CRIS / IRCTC')}</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-300">
          {/* TAB 1: PRIVACY POLICY */}
          {tab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs">
                <span className="font-bold block text-cyan-100 text-sm mb-1">
                  {t('legal.dpdpBadge', 'Indian Railways E-Ticketing Data Protection Statement')}
                </span>
                {t('legal.dpdpDesc', 'Compliant with the Digital Personal Data Protection (DPDP) Act 2023 and the Information Technology Act 2000. Your personal and journey data is stored on secure sovereign cloud servers within the Republic of India.')}
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a3a6]"></span>
                  {t('legal.infoCollectTitle', '1. Information We Collect from Passengers')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-2">
                  {t('legal.infoCollectDesc', 'To issue valid Electronic Reservation Slips (ERS) and comply with Indian Railways safety standards, IRCTC collects:')}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.personalData', 'Personal Identification Data: Full passenger names, gender, age, berth preferences, and senior citizen concession declarations.')}</li>
                  <li>{t('legal.contactDetails', 'Contact Details: Verified 10-digit mobile phone numbers and email addresses used for instant SMS PNR delivery and emergency travel alerts.')}</li>
                  <li>{t('legal.kycData', 'KYC Verification: Aadhaar authentication (last 4 digits masked), Voter ID, Passport, or Driving License details for tatkal bookings.')}</li>
                  <li>{t('legal.txnRecords', 'Transaction Records: PNR numbers, transaction reference codes, payment timestamps, and refund account references.')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a3a6]"></span>
                  {t('legal.purposeTitle', '2. Purpose & Utilization of Data')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-2">
                  {t('legal.purposeDesc', 'Passenger data collected on this portal is strictly utilized for authorized public railway operations:')}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.prsCharts', 'Preparation of official passenger reservation charts (PRS) displayed on train coaches and railway platforms.')}</li>
                  <li>{t('legal.smsDispatch', 'Automated dispatch of live train status, platform assignments, and journey delay advisories via SMS/Email.')}</li>
                  <li>{t('legal.securityCoord', 'Coordination with Travelling Ticket Examiners (TTE) and Railway Protection Force (RPF) for passenger security.')}</li>
                  <li>{t('legal.refundProcessing', 'Automated processing of ticket refunds directly back into the passenger\'s source payment mode.')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a3a6]"></span>
                  {t('legal.paymentSecTitle', '3. Payment Security & Zero Commercial Monetization')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {t('legal.paymentSecDesc', 'IRCTC maintains a strict zero commercial sale policy. We never sell, rent, or trade your travel history, phone numbers, or emails to private advertisers. All financial transactions are processed through RBI-approved PCI-DSS Level 1 encrypted payment gateways. Sensitive credentials like UPI PINs, NetBanking passwords, or CVVs are never saved on our databases.')}
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a3a6]"></span>
                  {t('legal.retentionTitle', '4. Data Retention & Grievance Officer')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {t('legal.retentionDesc', 'Passenger reservation logs are archived in accordance with Railway Board audit regulations. For any privacy queries or data requests, contact our designated Grievance Officer:')}
                  <span className="block mt-1 font-semibold text-slate-300">
                    {t('legal.grievanceOfficerInfo', 'Chief Data Protection & Grievance Officer, IRCTC Corporate Office, Barakhamba Road, New Delhi - 110001 (Email: grievance@irctc.co.in)')}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {tab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                <span className="font-bold block text-amber-100 text-sm mb-1">
                  {t('legal.termsBadge', 'Indian Railways E-Ticketing Fair Usage & Booking Rules')}
                </span>
                {t('legal.termsDesc', 'By booking train tickets on IRCTC Connect, you agree to abide by the Indian Railways Act, 1989 and Railway Board e-ticketing provisions. Unauthorized commercial reselling of tickets is a punishable offence.')}
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t('legal.accRegTitle', '1. User Account Registration & Master Passenger List')}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.accReg1', 'Only individual citizens can register a personal user account using a valid mobile number and email ID.')}</li>
                  <li>{t('legal.accReg2', 'Users may book up to 12 tickets per calendar month (or up to 24 tickets if the primary user is Aadhaar-authenticated).')}</li>
                  <li>{t('legal.accReg3', 'Transfer of tickets or user accounts to third parties for commercial gain without an official IRCTC Principal Service Provider (PSP) license is strictly prohibited under Section 143 of the Railways Act, 1989.')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t('legal.timingsTitle', '2. Official E-Ticketing Timings & Tatkal Quota Rules')}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.timings1', 'General Reservation: Open daily between 00:20 hrs to 23:45 hrs IST (35-minute nightly maintenance window from 23:45 to 00:20 hrs).')}</li>
                  <li>{t('legal.timings2', 'AC Tatkal Booking: Opens precisely at 10:00 AM IST one day prior to train origin departure for 1A, 2A, 3A, CC, and EC.')}</li>
                  <li>{t('legal.timings3', 'Non-AC Tatkal Booking: Opens precisely at 11:00 AM IST for Sleeper (SL) and Second Sitting (2S).')}</li>
                  <li>{t('legal.timings4', 'During the first 30 minutes of Tatkal windows, only 1 ticket booking per user login session/IP address is permitted.')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t('legal.travelAuthTitle', '3. Travel Authority & Original ID Verification')}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-2">
                  {t('legal.travelAuthDesc', 'The Electronic Reservation Slip (ERS) or Virtual Reservation Message (VRM SMS) on a mobile device is valid travel authority only when accompanied by at least one passenger\'s original government photo ID:')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 font-medium">
                  <span className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-center">{t('legal.aadhaar', 'Aadhaar Card')}</span>
                  <span className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-center">{t('legal.voterId', 'Voter ID Card')}</span>
                  <span className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-center">{t('legal.passport', 'Passport')}</span>
                  <span className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-center">{t('legal.dl', 'Driving License')}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t('legal.cancellationTitle', '4. Cancellation, TDR Filing & Refund Schedule')}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.cancel1', 'Confirmed Tickets: Flat cancellation charges apply if cancelled more than 48 hours before train departure.')}</li>
                  <li>{t('legal.cancel3', 'Tatkal Tickets: No refund is admissible on confirmed Tatkal reservations upon cancellation.')}</li>
                  <li>{t('legal.cancel2', 'RAC / Waitlist: Fully refundable up to 30 minutes before train departure, subject to clerkage fee of ₹60.')}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & GUIDELINES */}
          {tab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs">
                <span className="font-bold block text-rose-100 text-sm mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {t('legal.secBadge', 'Official Cyber Safety Advisory Against Fraud & Phishing')}
                </span>
                {t('legal.secDesc', 'Indian Railways and IRCTC officials will NEVER ask you for your ATM PIN, UPI PIN, OTP, password, or CVV. Report suspicious links or fraudulent calls immediately to 139.')}
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {t('legal.antiFraudTitle', '1. Safe E-Ticketing & Transaction Rules')}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.antiFraud1', 'Always verify the official portal URL before entering login credentials or initiating payments.')}</li>
                  <li>{t('legal.antiFraud2', 'Never download third-party software, browser automation extensions, or unofficial APKs promising "Guaranteed Tatkal Booking".')}</li>
                  <li>{t('legal.antiFraud3', 'Pay exclusively through verified 3D-secure payment gateways, official RuPay cards, or authorized UPI handles.')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {t('legal.safetyGuideTitle', '2. Onboard Passenger Security & Emergency Response')}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-400">
                  <li>{t('legal.safety1', 'Rail Madad 139: Toll-free 24x7 helpline for immediate assistance with medical emergencies, security threats, theft, or coach cleanliness.')}</li>
                  <li>{t('legal.safety2', 'RPF "Meri Saheli" Initiative: Specially trained female Railway Protection Force personnel provide dedicated monitoring for solo female travelers throughout the journey.')}</li>
                  <li>{t('legal.safety3', 'Modern Train Safety Technologies: Indigenous Kavach anti-collision system, LHB coaches, and automatic fire/smoke detection sensors.')}</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT CRIS / IRCTC */}
          {tab === 'contact' && (
            <div className="space-y-6">
              {/* Helplines Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {t('legal.railMadadCard', 'All-India 24x7 Rail Helpline')}
                  </span>
                  <div className="text-2xl font-black text-[#00a3a6]">139</div>
                  <span className="text-[11px] text-slate-400">{t('legal.railMadadCardDesc', 'Toll-free Rail Madad assistance')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {t('legal.pnrHelpCard', 'IRCTC Customer Care Phone')}
                  </span>
                  <div className="text-base font-bold text-white mt-1">0755-6610661</div>
                  <div className="text-xs text-slate-400">{t('legal.pnrHelpCardDesc', '0755-4090400 (Multi-line)')}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {t('legal.crisCard', 'Official E-Mail Support')}
                  </span>
                  <div className="text-xs font-bold text-cyan-300 mt-1">tickets@irctc.co.in</div>
                  <div className="text-[11px] text-slate-400">{t('legal.crisCardDesc', 'etickets@irctc.co.in (Refunds)')}</div>
                </div>
              </div>

              {/* Headquarters & Zonal Offices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#00a3a6]" />
                    IRCTC Corporate Headquarters
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Indian Railway Catering and Tourism Corporation Ltd. (IRCTC)<br />
                    11th Floor, Statesman House, B-148, Barakhamba Road,<br />
                    Connaught Place, New Delhi - 110001
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    CRIS Technical Headquarters
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Centre for Railway Information Systems (CRIS)<br />
                    Ministry of Railways, Chanakyapuri,<br />
                    New Delhi - 110021
                  </p>
                </div>
              </div>

              {/* Interactive Passenger Grievance Form */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
                <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#00a3a6]" />
                  {t('legal.formTitle', 'Submit Grievance / Inquiry to Railway Desk')}
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Tickets, e-catering, refund issues, and berth allocation inquiries are assigned an official tracking ticket.
                </p>

                {grievanceSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block text-white text-sm">{t('legal.submittedSuccess', 'Grievance Registered Successfully!')}</span>
                      Your Rail Madad reference ticket #RM-2026-9812 has been created. An SMS update will be sent to your registered phone.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{t('legal.fullName', 'Passenger Name')}</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a3a6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{t('legal.emailAddress', 'Email Address')}</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. ramesh@example.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a3a6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{t('legal.pnrNumber', '10-Digit PNR / Transaction ID (Optional)')}</label>
                        <input
                          type="text"
                          value={formData.pnr}
                          onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                          placeholder="e.g. 2489128912"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a3a6]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{t('legal.category', 'Inquiry Category')}</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00a3a6] cursor-pointer"
                        >
                          <option value="Ticket Booking / ERS">Ticket Booking & ERS Slip</option>
                          <option value="Cancellation & Refund">Cancellation & Bank Refund</option>
                          <option value="Tatkal Services">Tatkal Availability & Quota</option>
                          <option value="IRCTC E-Catering">E-Catering Food Services</option>
                          <option value="Technical Website Query">Technical Portal / Account Assistance</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{t('legal.message', 'Description / Grievance Details')}</label>
                      <textarea
                        required
                        rows="3"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe your railway inquiry, train number, travel date, or issue..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00a3a6]"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#00a3a6]/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('legal.submitBtn', 'Submit to Rail Madad Desk')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] text-slate-500">
            IRCTC E-Governance Standards • Version 2026.1
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
