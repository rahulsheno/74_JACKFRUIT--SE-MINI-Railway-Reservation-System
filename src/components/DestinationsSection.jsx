import React, { useState } from 'react';
import { TOP_DESTINATIONS } from '../data/irctcData';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DestinationsSection({ onSelectCity }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('french'); // 'french' (North) | 'european' (South/West) | 'countries' (East/Northeast)

  const currentList = TOP_DESTINATIONS[activeTab];

  return (
    <section id="destinations" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00a3a6]">
          {t('destinations.badge')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          {t('destinations.heading')}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {t('destinations.subheading')}
        </p>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab('french')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'french' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('common.northIndia', 'North & Central India')}
            </button>
            <button
              onClick={() => setActiveTab('european')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'european' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('common.southIndia', 'South & Western India')}
            </button>
            <button
              onClick={() => setActiveTab('countries')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'countries' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('common.eastIndia', 'East & Northeast India')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Destination Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {currentList.map((dest) => (
          <div
            key={dest.name}
            onClick={() => onSelectCity(dest.name)}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Background image */}
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80';
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

            {/* Price Pill in ₹ */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-black shadow">
              {t('destinations.faresFrom')} {dest.price}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-white">
              <span className="text-[11px] font-semibold text-[#22d3ee] block">
                {dest.region}
              </span>
              <h3 className="text-lg font-black tracking-tight text-white group-hover:text-[#00a3a6] transition-colors flex items-center justify-between">
                <span>{dest.name}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
