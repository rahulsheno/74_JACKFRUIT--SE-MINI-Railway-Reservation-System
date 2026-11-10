import React from 'react';
import { Train, ShieldCheck, BellRing, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onOpenLegal }) {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0b1120] text-slate-400 border-t border-slate-800 text-xs">
      {/* Top Value Proposition Grid */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[#00a3a6] shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('footer.bestFareTitle')}</h4>
              <p className="text-slate-400 text-xs mt-0.5">{t('footer.bestFareDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('footer.secureTitle')}</h4>
              <p className="text-slate-400 text-xs mt-0.5">{t('footer.secureDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('footer.ticketTitle')}</h4>
              <p className="text-slate-400 text-xs mt-0.5">{t('footer.ticketDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{t('footer.supportTitle')}</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {t('footer.supportDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Link Columns */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">{t('footer.categoryTitle')}</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#search" className="hover:text-white transition">Vande Bharat 2.0</a></li>
              <li><a href="#search" className="hover:text-white transition">Rajdhani Express</a></li>
              <li><a href="#search" className="hover:text-white transition">Shatabdi Express</a></li>
              <li><a href="#search" className="hover:text-white transition">Tejas Express</a></li>
              <li><a href="#search" className="hover:text-white transition">Duronto Non-Stop</a></li>
              <li><a href="#search" className="hover:text-white transition">Bharat Gaurav Tourist Trains</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">{t('footer.servicesTitle')}</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#faqs" className="hover:text-white transition">{t('footer.links.tatkalRules')}</a></li>
              <li><a href="#search" className="hover:text-white transition">{t('footer.links.pnrEnquiry')}</a></li>
              <li><a href="#deals" className="hover:text-white transition">{t('footer.links.vandeBharatNetwork')}</a></li>
              <li><a href="#faqs" className="hover:text-white transition">{t('footer.links.eCatering')}</a></li>
              <li><a href="#faqs" className="hover:text-white transition">{t('footer.links.refundRules')}</a></li>
              <li><a href="#faqs" className="hover:text-white transition">{t('footer.links.trainSchedule')}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">{t('common.popularHubs', 'Popular Railway Hubs')}</h5>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#search" className="hover:text-white transition">New Delhi (NDLS)</a></li>
              <li><a href="#search" className="hover:text-white transition">Mumbai CSMT (CSMT)</a></li>
              <li><a href="#search" className="hover:text-white transition">Howrah Junction (HWH)</a></li>
              <li><a href="#search" className="hover:text-white transition">Chennai Central (MAS)</a></li>
              <li><a href="#search" className="hover:text-white transition">Bengaluru City (SBC)</a></li>
              <li><a href="#search" className="hover:text-white transition">Varanasi Junction (BSB)</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">{t('footer.aboutTitle')}</h5>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              IRCTC Connect is the digital portal of Indian Railways, the fourth-largest national rail network in the world, serving 24 million daily passengers across 68 divisions.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">{t('common.digitalIndia', 'Digital India Initiative')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Legal */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-end gap-4 text-slate-500 text-[11px]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button 
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('privacy')}
              className="hover:text-cyan-400 transition cursor-pointer text-slate-400 font-medium"
            >
              {t('legal.privacyPolicy', 'Privacy Policy')}
            </button>
            <button 
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('terms')}
              className="hover:text-cyan-400 transition cursor-pointer text-slate-400 font-medium"
            >
              {t('legal.termsOfService', 'Terms of Service')}
            </button>
            <button 
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('security')}
              className="hover:text-cyan-400 transition cursor-pointer text-slate-400 font-medium"
            >
              {t('legal.securityGuidelines', 'Security & Guidelines')}
            </button>
            <button 
              type="button"
              onClick={() => onOpenLegal && onOpenLegal('contact')}
              className="hover:text-cyan-400 transition cursor-pointer text-slate-400 font-medium"
            >
              {t('legal.contactCris', 'Contact CRIS / IRCTC')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
