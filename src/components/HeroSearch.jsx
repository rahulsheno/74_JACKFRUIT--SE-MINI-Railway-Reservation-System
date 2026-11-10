import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRightLeft, 
  Search, 
  CreditCard, 
  ChevronDown, 
  Plus, 
  Minus,
  Train
} from 'lucide-react';
import { STATIONS, DISCOUNT_CARDS } from '../data/irctcData';
import { useLanguage } from '../context/LanguageContext';
import { getLocalDateString } from '../services/dateHelper';

export default function HeroSearch({ onSearch, isSearching }) {
  const { t } = useLanguage();

  // Search parameters
  const [tripType, setTripType] = useState('oneway'); // 'oneway' | 'return'
  const [origin, setOrigin] = useState(STATIONS[0]); // New Delhi (NDLS)
  const [destination, setDestination] = useState(STATIONS[7]); // Varanasi Junction (BSB)
  
  // Dates in local timezone (IST) - avoids UTC shift bug
  const today = getLocalDateString();
  const tomorrow = getLocalDateString(Date.now() + 86400000);
  const nextWeek = getLocalDateString(Date.now() + 86400000 * 7);

  const [depDate, setDepDate] = useState(today);
  const [retDate, setRetDate] = useState(nextWeek);
  const [depTime, setDepTime] = useState('06:00');
  const [travelClass, setTravelClass] = useState('second'); // 'second' (CC / 3A) | 'first' (EC / 2A / 1A)

  // Passengers & Quota state
  const [passengers, setPassengers] = useState({
    adults: 1,
    youths: 0,
    seniors: 0,
    children: 0
  });
  const [selectedCard, setSelectedCard] = useState('none');
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);

  // Station dropdown states
  const [originQuery, setOriginQuery] = useState(origin?.name || 'New Delhi (NDLS)');
  const [destQuery, setDestQuery] = useState(destination?.name || 'Varanasi Junction (BSB)');
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  const passengerRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Total passengers count
  const totalPassengers = passengers.adults + passengers.youths + passengers.seniors + passengers.children;

  // Swap origin and destination
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setOriginQuery(destination.name);
    setDestQuery(temp.name);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (passengerRef.current && !passengerRef.current.contains(event.target)) {
        setPassengerDropdownOpen(false);
      }
      if (originRef.current && !originRef.current.contains(event.target)) {
        setOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setDestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOriginStations = STATIONS.filter(s => 
    s.name.toLowerCase().includes(originQuery.toLowerCase()) || 
    s.city.toLowerCase().includes(originQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(originQuery.toLowerCase())
  );

  const filteredDestStations = STATIONS.filter(s => 
    s.name.toLowerCase().includes(destQuery.toLowerCase()) || 
    s.city.toLowerCase().includes(destQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(destQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      tripType,
      origin,
      destination,
      depDate,
      retDate: tripType === 'return' ? retDate : null,
      depTime,
      passengers: totalPassengers,
      passengersDetail: passengers,
      discountCard: selectedCard,
      travelClass
    });
  };

  return (
    <div id="search" className="relative bg-[#0f172a] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00a3a6] blur-[120px]"></div>
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-blue-600 blur-[130px]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Hero headline - clean, dignified without intrusive badge */}
        <div className="text-center md:text-left mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {t('hero.heading')}
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl">
            {t('hero.subheading')}
          </p>
        </div>

        {/* Search Console Card */}
        <div className="bg-[#131d2e]/95 backdrop-blur-md rounded-3xl border border-slate-700/80 p-5 sm:p-7 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit}>
            {/* Top Bar: Book Train Tickets Title & Class Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a3a6]/20 border border-[#00a3a6]/40 flex items-center justify-center text-[#00a3a6]">
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    {t('nav.bookTickets', 'Book Train Tickets')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live seat availability & verified train schedules
                  </p>
                </div>
              </div>

              {/* Class preference toggle */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {t('hero.travelClass')}:
                </span>
                <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700/80 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setTravelClass('second')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      travelClass === 'second' 
                        ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/25' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t('hero.classStandard')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelClass('first')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      travelClass === 'first' 
                        ? 'bg-[#00a3a6] text-white shadow-md shadow-[#00a3a6]/25' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t('hero.classExecutive')}
                  </button>
                </div>
              </div>
            </div>

            {/* Input Grid: Stations with proper spacing */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 sm:gap-4 mt-6 items-end">
              {/* Origin Station */}
              <div className="md:col-span-5 relative" ref={originRef}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('hero.fromLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00a3a6]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setOriginOpen(true);
                    }}
                    onFocus={() => setOriginOpen(true)}
                    placeholder={t('hero.fromPlaceholder')}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a3a6] font-medium"
                    required
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {originOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800">
                    <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      {t('hero.popularJunctions')}
                    </div>
                    {filteredOriginStations.map((station) => (
                      <button
                        type="button"
                        key={station.id}
                        onClick={() => {
                          setOrigin(station);
                          setOriginQuery(station.name);
                          setOriginOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#00a3a6] shrink-0" />
                          <div>
                            <span className="font-semibold text-white block">{station.name}</span>
                            <span className="text-[11px] text-slate-400">{station.state}, {station.country}</span>
                          </div>
                        </div>
                        {station.popular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400 font-medium">
                            IRCTC Hub
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap Button with centered alignment */}
              <div className="hidden md:flex md:col-span-1 items-center justify-center pb-0.5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-11 h-11 rounded-full bg-slate-800 hover:bg-[#00a3a6] text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition shadow-md group cursor-pointer"
                  title="Swap stations"
                >
                  <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* Destination Station */}
              <div className="md:col-span-5 relative" ref={destRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('hero.toLabel')}
                  </label>
                  {/* Mobile swap button */}
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="md:hidden text-xs text-[#00a3a6] flex items-center gap-1 font-medium mb-1 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3 h-3" /> Swap
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setDestOpen(true);
                    }}
                    onFocus={() => setDestOpen(true)}
                    placeholder={t('hero.toPlaceholder')}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00a3a6] font-medium"
                    required
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {destOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800">
                    <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      {t('hero.popularJunctions')}
                    </div>
                    {filteredDestStations.map((station) => (
                      <button
                        type="button"
                        key={station.id}
                        onClick={() => {
                          setDestination(station);
                          setDestQuery(station.name);
                          setDestOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-white block">{station.name}</span>
                            <span className="text-[11px] text-slate-400">{station.state}, {station.country}</span>
                          </div>
                        </div>
                        {station.popular && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400 font-medium">
                            IRCTC Hub
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Second row: Dates & Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mt-4">
              {/* Journey Date */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('hero.journeyDate')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={depDate}
                    onChange={(e) => setDepDate(e.target.value)}
                    min={today}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00a3a6] font-medium"
                    required
                  />
                </div>
              </div>

              {/* Time slot */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Time Slot
                </label>
                <select
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00a3a6] font-medium cursor-pointer"
                >
                  <option value="06:00">06:00 (Early Vande Bharat)</option>
                  <option value="08:00">08:00 (Morning Express)</option>
                  <option value="12:00">12:00 (Afternoon)</option>
                  <option value="16:00">16:00 (Evening Express)</option>
                  <option value="18:30">18:30 (Overnight Rajdhani)</option>
                  <option value="22:00">22:00 (Night Superfast)</option>
                </select>
              </div>

              {/* Passengers & Booking Quota */}
              <div className="md:col-span-5 relative" ref={passengerRef}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('hero.passengers')} & {t('hero.quota')}
                </label>
                <button
                  type="button"
                  onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white text-left focus:outline-none focus:ring-2 focus:ring-[#00a3a6] font-medium flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Users className="w-4 h-4 text-[#00a3a6] shrink-0" />
                    <span className="truncate">
                      {totalPassengers} {totalPassengers === 1 ? t('results.traveler') : t('results.travelers')}
                      {selectedCard !== 'none' ? ` • ${DISCOUNT_CARDS.find(c => c.id === selectedCard)?.name.split(' ')[0]}` : ` • ${t('hero.quotaGeneral')}`}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                {/* Passenger Selector Popup */}
                {passengerDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                      {t('hero.passengers')}
                    </div>

                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{t('hero.adults')}</div>
                        <div className="text-xs text-slate-400">Standard passenger fare</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={passengers.adults <= 1 && totalPassengers <= 1}
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.max(0, p.adults - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{passengers.adults}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Seniors */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{t('hero.seniors')}</div>
                        <div className="text-xs text-slate-400">Lower berth allocation priority</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={passengers.seniors <= 0}
                          onClick={() => setPassengers(p => ({ ...p, seniors: Math.max(0, p.seniors - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{passengers.seniors}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, seniors: p.seniors + 1 }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{t('hero.children')}</div>
                        <div className="text-xs text-slate-400">Half fare / full berth option</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={passengers.children <= 0}
                          onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{passengers.children}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                          className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* IRCTC Quota Selection */}
                    <div className="pt-3 border-t border-slate-800">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                        {t('hero.quota')} / Category
                      </label>
                      <select
                        value={selectedCard}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00a3a6] cursor-pointer"
                      >
                        {DISCOUNT_CARDS.map(card => (
                          <option key={card.id} value={card.id}>
                            {card.name} {card.discount ? `(-${Math.round(card.discount * 100)}%)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPassengerDropdownOpen(false)}
                      className="w-full py-2 bg-[#00a3a6] hover:bg-[#008f92] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {t('hero.confirm', 'Confirm')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Submit Action with Quick Dates cleanly positioned */}
            <div className="mt-6 pt-5 border-t border-slate-700/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Quick date shortcuts */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{t('hero.quickDates', 'Quick Dates:')}</span>
                <button
                  type="button"
                  onClick={() => setDepDate(today)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    depDate === today
                      ? 'bg-[#00a3a6] text-white border-[#00a3a6]'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {t('hero.today', 'Today')}
                </button>
                <button
                  type="button"
                  onClick={() => setDepDate(tomorrow)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    depDate === tomorrow
                      ? 'bg-[#00a3a6] text-white border-[#00a3a6]'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {t('hero.tomorrow', 'Tomorrow')}
                </button>
                <button
                  type="button"
                  onClick={() => setDepDate(nextWeek)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    depDate === nextWeek
                      ? 'bg-[#00a3a6] text-white border-[#00a3a6]'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {t('hero.nextWeek', 'Next Week')}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto px-9 py-3.5 bg-gradient-to-r from-[#00a3a6] to-[#008b8e] hover:from-[#00b2b5] hover:to-[#009da0] text-white font-extrabold text-base rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#00a3a6]/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('hero.searching')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{t('hero.findTrains')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
