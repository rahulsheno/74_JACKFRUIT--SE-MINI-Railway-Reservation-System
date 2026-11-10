import React, { useState } from 'react';
import { 
  Train, 
  Clock, 
  Wifi, 
  Zap, 
  Coffee, 
  ArrowRight, 
  SlidersHorizontal, 
  ChevronRight, 
  Check,
  ShieldCheck,
  Armchair,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTrainClassConfig } from '../services/trainClassHelper';

export default function SearchResults({ results, searchParams, onSelectTrain, isLiveRailRadar, onCheckLiveStatus }) {
  const { t } = useLanguage();
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'price' | 'duration'
  const [selectedClassMap, setSelectedClassMap] = useState({}); // trainId -> 'second' | 'first'

  if (!results || results.length === 0) {
    return null;
  }

  // Filter
  const filtered = results.filter(item => {
    if (carrierFilter === 'ALL') return true;
    return item.carrier.toLowerCase().includes(carrierFilter.toLowerCase());
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') {
      const pA = a.prices.second;
      const pB = b.prices.second;
      return pA - pB;
    }
    if (sortBy === 'duration') {
      return a.durationMinutes - b.durationMinutes;
    }
    // Default time
    return a.depTime.localeCompare(b.depTime);
  });

  const getCarrierBadgeColor = (carrier) => {
    if (carrier.includes('Vande Bharat')) return 'bg-[#1d4ed8] text-white';
    if (carrier.includes('Rajdhani')) return 'bg-[#b91c1c] text-white';
    if (carrier.includes('Shatabdi')) return 'bg-[#0f766e] text-white';
    if (carrier.includes('Tejas')) return 'bg-[#0d9488] text-white';
    if (carrier.includes('Duronto')) return 'bg-[#d97706] text-white';
    if (carrier.includes('Humsafar')) return 'bg-[#0284c7] text-white';
    return 'bg-[#4338ca] text-white';
  };

  const getLocalizedCarrier = (carrier = '') => {
    const expressWord = t('common.express', 'Express');
    if (carrier.includes('Vande Bharat')) return `${t('results.vandeBharat', 'Vande Bharat')} ${expressWord}`;
    if (carrier.includes('Rajdhani')) return `${t('results.rajdhani', 'Rajdhani')} ${expressWord}`;
    if (carrier.includes('Shatabdi')) return `${t('results.shatabdi', 'Shatabdi')} ${expressWord}`;
    if (carrier.includes('Duronto')) return `${t('results.duronto', 'Duronto')} ${expressWord}`;
    if (carrier.includes('Humsafar')) return `${t('results.humsafar', 'Humsafar')} ${expressWord}`;
    return carrier;
  };

  return (
    <section id="results" className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Route header bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>{t('results.journeySchedule')}</span>
            <span>•</span>
            <span>{searchParams?.depDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{searchParams?.origin?.name}</span>
            <ArrowRight className="w-5 h-5 text-[#00a3a6]" />
            <span className="text-xl sm:text-2xl font-black text-slate-900">{searchParams?.destination?.name}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {searchParams?.passengers} {searchParams?.passengers === 1 ? t('results.traveler') : t('results.travelers')}
            {searchParams?.discountCard !== 'none' && ` • ${t('results.quotaApplied')}`}
            {searchParams?.travelClass === 'first' ? ` • ${t('hero.classExecutive')}` : ` • ${t('hero.classStandard')}`}
          </div>
        </div>

        {/* Total found */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Train className="w-4 h-4 text-[#00a3a6]" />
            <span>{sorted.length} {t('results.departuresAvailable')}</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Carrier filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCarrierFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.allTrains')}
          </button>
          <button
            onClick={() => setCarrierFilter('Vande')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'Vande' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.vandeBharat', 'Vande Bharat')}
          </button>
          <button
            onClick={() => setCarrierFilter('Rajdhani')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'Rajdhani' ? 'bg-red-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.rajdhani', 'Rajdhani')}
          </button>
          <button
            onClick={() => setCarrierFilter('Shatabdi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'Shatabdi' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.shatabdi', 'Shatabdi')}
          </button>
          <button
            onClick={() => setCarrierFilter('Duronto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'Duronto' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.duronto', 'Duronto')}
          </button>
          <button
            onClick={() => setCarrierFilter('Humsafar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              carrierFilter === 'Humsafar' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('results.humsafar', 'Humsafar')}
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">{t('results.sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00a3a6] cursor-pointer"
          >
            <option value="time">{t('results.time')}</option>
            <option value="price">{t('results.price')}</option>
            <option value="duration">{t('results.duration')}</option>
          </select>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-5">
        {sorted.map((train) => {
          const selectedTier = selectedClassMap[train.id] || (searchParams?.travelClass === 'first' ? 'first' : 'second');
          const classConfig = getTrainClassConfig(train.carrier);
          const tierSecond = classConfig.classes.second;
          const tierFirst = classConfig.classes.first;

          return (
            <div 
              key={train.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Card top bar */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[11px] tracking-wide ${getCarrierBadgeColor(train.carrier)}`}>
                    {getLocalizedCarrier(train.carrier)}
                  </span>
                  <span className="font-semibold text-slate-700">#{train.trainNumber}</span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-slate-500 font-medium hidden sm:inline">{train.track}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                    {t('trainType.' + classConfig.type, classConfig.typeLabel)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onCheckLiveStatus && onCheckLiveStatus(train)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>{t('results.checkLive', 'Live Running Status')}</span>
                  </button>

                  {train.seatsRemaining <= 6 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                      {t('results.available')} {train.seatsRemaining}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Schedule Row: Departure -> Timeline -> Arrival (Full Width, Zero Overlap!) */}
              <div className="p-5 sm:p-6 pb-4">
                <div className="flex items-center justify-between gap-4 sm:gap-8">
                  {/* Departure Station & Time */}
                  <div className="text-left shrink-0 min-w-[110px] sm:min-w-[140px]">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {train.depTime}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                      {train.origin}
                    </div>
                  </div>

                  {/* Journey Visualizer in the Center */}
                  <div className="flex-1 max-w-sm flex flex-col items-center px-2">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{train.duration}</span>
                    </div>
                    <div className="w-full flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00a3a6]"></div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-[#00a3a6] via-slate-300 to-[#00a3a6] relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600 font-bold uppercase tracking-wider whitespace-nowrap">
                          {t('results.directExpress', 'Direct Express')}
                        </span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00a3a6]"></div>
                    </div>
                  </div>

                  {/* Arrival Station & Time */}
                  <div className="text-right shrink-0 min-w-[110px] sm:min-w-[140px]">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {train.arrTime}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                      {train.destination}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Selection & Booking Action Bar (Spacious, Clear, Dedicated) */}
              <div className="px-5 sm:px-6 pb-5 pt-3.5 border-t border-slate-100 bg-[#f8fafc]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                {/* Available Classes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {/* Standard / Base Class Pill */}
                  <button
                    type="button"
                    onClick={() => setSelectedClassMap(prev => ({ ...prev, [train.id]: 'second' }))}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      selectedTier === 'second' 
                        ? 'border-[#00a3a6] bg-[#f0fdfa] ring-2 ring-[#00a3a6]/25 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 tracking-wide">{t('trainClass.' + tierSecond.code, tierSecond.label)}</span>
                        {selectedTier === 'second' && <Check className="w-3.5 h-3.5 text-[#00a3a6]" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t('trainSubtitle.' + tierSecond.code, tierSecond.subtitle)}</div>
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <div className="text-lg font-black text-slate-900">₹{train.prices.second}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{t('results.availablePill', 'Available')}</div>
                    </div>
                  </button>

                  {/* Executive / Upper Class Pill */}
                  <button
                    type="button"
                    onClick={() => setSelectedClassMap(prev => ({ ...prev, [train.id]: 'first' }))}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      selectedTier === 'first' 
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/25 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-amber-950 tracking-wide">{t('trainClass.' + tierFirst.code, tierFirst.label)}</span>
                        {selectedTier === 'first' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t('trainSubtitle.' + tierFirst.code, tierFirst.subtitle)}</div>
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <div className="text-lg font-black text-amber-900">₹{train.prices.first}</div>
                      <div className="text-[10px] text-amber-700 font-semibold">{t('results.availablePill', 'Available')}</div>
                    </div>
                  </button>
                </div>

                {/* Book Now Button */}
                <button
                  type="button"
                  onClick={() => onSelectTrain(train, selectedTier)}
                  className="px-6 py-3.5 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-[#00a3a6]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <span>{t('common.bookNow')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Amenities footer */}
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {t('common.kavach', 'Kavach Collision Protection')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> {t('common.charging', '220V Mobile / Laptop Charging')}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Armchair className="w-3.5 h-3.5 text-emerald-600" /> {classConfig.type === 'chaircar' ? t('common.recline', 'Ergonomic Recline') : t('results.cateringIncluded', 'Fresh Bedroll Available')}
                  </span>
                  <span className="hidden md:flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-rose-500" /> {classConfig.hasMeals ? t('common.catering', 'IRCTC Hot Catering') : t('hero.chipCatering', 'E-Catering on Demand')}
                  </span>
                </div>

                <div className="text-slate-400 text-[10px] hidden sm:block">
                  {tierSecond.coachPrefix} / {tierFirst.coachPrefix} Series
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
