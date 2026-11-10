import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { getFaqsForLang } from '../data/faqsMultilingual';
import { useLanguage } from '../context/LanguageContext';

export default function FaqSection() {
  const { language, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqsList = getFaqsForLang(language);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faqs" className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-xs font-bold text-slate-700 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#00a3a6]" />
            <span>{t('faqs.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('faqs.heading')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {t('faqs.subheading')}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqsList.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#00a3a6] transition cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#00a3a6] text-white' : 'text-slate-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
