import React, { useState } from 'react';
import { X, Check, Utensils, ArrowRight, Armchair, Shield, Info, Users, Plus, Minus } from 'lucide-react';
import { getTrainClassConfig } from '../services/trainClassHelper';
import { useLanguage } from '../context/LanguageContext';

export default function SeatSelectorModal({ train, travelClass, searchParams, onClose, onConfirm }) {
  const { t } = useLanguage();
  const classConfig = getTrainClassConfig(train.carrier);
  const currentTier = classConfig.classes[travelClass] || classConfig.classes.second;
  const coachNumber = currentTier.defaultCoach;
  const availableSeats = currentTier.seatTypes;

  const initialPassengerCount = searchParams?.passengers || 1;
  const [passengerCount, setPassengerCount] = useState(initialPassengerCount);
  const [activePassengerTab, setActivePassengerTab] = useState(0);

  // Maintain preferences for each passenger
  const [passengersConfig, setPassengersConfig] = useState(() => {
    return Array.from({ length: initialPassengerCount }, (_, i) => ({
      seat: availableSeats[i % availableSeats.length] || availableSeats[0],
      mealChoice: 'veg'
    }));
  });

  const isChairCar = classConfig.type === 'chaircar';
  const isHumsafar = (train.carrier || '').toLowerCase().includes('humsafar');

  const updatePassengerCount = (newCount) => {
    if (newCount < 1 || newCount > 6) return;
    setPassengerCount(newCount);
    setPassengersConfig(prev => {
      if (newCount > prev.length) {
        const added = Array.from({ length: newCount - prev.length }, (_, i) => ({
          seat: availableSeats[(prev.length + i) % availableSeats.length] || availableSeats[0],
          mealChoice: 'veg'
        }));
        return [...prev, ...added];
      } else {
        return prev.slice(0, newCount);
      }
    });
  };

  const updatePassengerSeat = (index, seat) => {
    setPassengersConfig(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], seat };
      return updated;
    });
  };

  const updatePassengerMeal = (index, mealChoice) => {
    setPassengersConfig(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], mealChoice };
      return updated;
    });
  };

  const [seniorPreference, setSeniorPreference] = useState(false);

  const getLocalizedCarrier = (carrier = '') => {
    const expressWord = t('common.express', 'Express');
    if (carrier.includes('Vande Bharat')) return `${t('results.vandeBharat', 'Vande Bharat')} ${expressWord}`;
    if (carrier.includes('Rajdhani')) return `${t('results.rajdhani', 'Rajdhani')} ${expressWord}`;
    if (carrier.includes('Shatabdi')) return `${t('results.shatabdi', 'Shatabdi')} ${expressWord}`;
    if (carrier.includes('Duronto')) return `${t('results.duronto', 'Duronto')} ${expressWord}`;
    if (carrier.includes('Humsafar')) return `${t('results.humsafar', 'Humsafar')} ${expressWord}`;
    return carrier;
  };

  const handleProceed = () => {
    const primarySeat = passengersConfig[0]?.seat || availableSeats[0];
    const primaryMeal = passengersConfig[0]?.mealChoice || 'veg';

    let mealName = 'Pure Vegetarian Meal';
    if (primaryMeal === 'nonveg') mealName = 'Non-Vegetarian Meal';
    else if (primaryMeal === 'jain') mealName = 'Jain Satvik Meal';
    else if (primaryMeal === 'none') mealName = 'No Food Required';

    const allocatedSeats = passengersConfig.map((p, idx) => ({
      passengerNum: idx + 1,
      seatNum: (parseInt(p.seat.seatNum, 10) || 21) + idx,
      position: p.seat.name,
      mealChoice: p.mealChoice
    }));

    onConfirm({
      coach: coachNumber,
      seat: primarySeat.seatNum,
      allocatedSeats,
      passengerCount,
      deck: currentTier.label,
      classCode: currentTier.code,
      className: currentTier.name,
      trainType: classConfig.typeLabel,
      position: primarySeat.name,
      arrangement: mealName,
      quietZone: seniorPreference
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00a3a6] uppercase tracking-wider">
                {getLocalizedCarrier(train.carrier)}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {t('seatSelector.coach', 'Coach')} {coachNumber} ({currentTier.code})
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {isChairCar ? t('seatSelector.selectSeat', 'Select Your Seat Preference') : t('seatSelector.selectBerth', 'Select Your Berth Preference')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{train.origin} → {train.destination}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{t('trainClass.' + currentTier.code, currentTier.label)}</span>
              <span>•</span>
              <span>{t('layout.' + (isChairCar ? 'chaircar' : '3x2_ac'), currentTier.seatLayout)}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Passenger Count Selection (Number of People) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00a3a6]/10 text-[#00a3a6] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Number of Passengers (People)
                </div>
                <div className="text-[11px] text-slate-500">
                  Select how many people are traveling on this booking (Max 6 per PNR)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs">
              <button
                type="button"
                disabled={passengerCount <= 1}
                onClick={() => updatePassengerCount(passengerCount - 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-black text-slate-900">
                {passengerCount}
              </span>
              <button
                type="button"
                disabled={passengerCount >= 6}
                onClick={() => updatePassengerCount(passengerCount + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Passenger Selector Tabs (When multiple people are traveling) */}
          {passengerCount > 1 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Person to Customize Berth & Meal:
                </span>
                <span className="text-[11px] text-[#00a3a6] font-bold">
                  Editing: Passenger {activePassengerTab + 1}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: passengerCount }, (_, idx) => {
                  const pConfig = passengersConfig[idx] || { mealChoice: 'veg', seat: availableSeats[0] };
                  const isCurrent = activePassengerTab === idx;
                  const mealShort = pConfig.mealChoice === 'veg' ? 'Veg' : pConfig.mealChoice === 'nonveg' ? 'Non-Veg' : pConfig.mealChoice === 'jain' ? 'Jain' : 'No Meal';
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePassengerTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#00a3a6] text-white border-[#00a3a6] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>Person {idx + 1}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isCurrent ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {mealShort}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Authentic Seat / Berth Choices for this exact express train */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Armchair className="w-4 h-4 text-[#00a3a6]" />
                {isChairCar ? t('seatSelector.seatAllocation', 'Chair Car Seat Allocation') : t('seatSelector.berthAllocation', 'AC Sleeper Berth Allocation')}
                {passengerCount > 1 && (
                  <span className="text-[#00a3a6] font-extrabold normal-case text-xs">
                    (for Person {activePassengerTab + 1})
                  </span>
                )}
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {t('seatSelector.layout', 'Layout:')} {t('layout.' + (isChairCar ? 'chaircar' : '3x2_ac'), currentTier.seatLayout)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableSeats.map((seatItem) => {
                const currentSeat = passengersConfig[activePassengerTab]?.seat || availableSeats[0];
                const isSelected = currentSeat.id === seatItem.id;
                return (
                  <button
                    key={seatItem.id}
                    type="button"
                    onClick={() => updatePassengerSeat(activePassengerTab, seatItem)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#00a3a6] bg-[#f0fdfa] text-[#0f766e] ring-2 ring-[#00a3a6]/20 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {t(`seat.${seatItem.id}.name`, seatItem.name)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {t(`seat.${seatItem.id}.desc`, seatItem.desc)}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#00a3a6] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* IRCTC Onboard Meal Selection - Individual Choice per Person (Hidden for Humsafar Express which has no complimentary catering) */}
          {!isHumsafar && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#00a3a6]" />
                  {t('seatSelector.complimentaryCatering', 'IRCTC Complimentary Catering')}
                  {passengerCount > 1 && (
                    <span className="text-[#00a3a6] font-extrabold normal-case text-xs">
                      (Choice for Person {activePassengerTab + 1})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t('seatSelector.includedInFare', 'Included in Fare')}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => updatePassengerMeal(activePassengerTab, 'veg')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    (passengersConfig[activePassengerTab]?.mealChoice || 'veg') === 'veg' 
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t('meal.veg.title', 'Pure Vegetarian')}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t('meal.veg.desc', 'Paneer, Dal, Basmati Rice & Roti')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => updatePassengerMeal(activePassengerTab, 'nonveg')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    passengersConfig[activePassengerTab]?.mealChoice === 'nonveg' 
                      ? 'border-rose-500 bg-rose-50/70 text-rose-800 ring-2 ring-rose-500/20' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t('meal.nonveg.title', 'Non-Vegetarian')}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t('meal.nonveg.desc', 'Chicken Curry / Egg Biryani')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => updatePassengerMeal(activePassengerTab, 'jain')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    passengersConfig[activePassengerTab]?.mealChoice === 'jain' 
                      ? 'border-amber-500 bg-amber-50/70 text-amber-800 ring-2 ring-amber-500/20' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t('meal.jain.title', 'Jain Satvik Meal')}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t('meal.jain.desc', 'Prepared without onion & garlic')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => updatePassengerMeal(activePassengerTab, 'none')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    passengersConfig[activePassengerTab]?.mealChoice === 'none' 
                      ? 'border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{t('meal.none.title', 'No Meal Required')}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t('meal.none.desc', 'Opt out of catering')}</div>
                </button>
              </div>
            </div>
          )}

          {/* Senior citizen priority checkbox */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">
                {isChairCar ? t('seatSelector.seniorSeatTitle', 'Senior Citizen Preferred Seating (60+ yrs)') : t('seatSelector.seniorBerthTitle', 'Senior Citizen Lower Berth Guarantee (LB)')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {isChairCar 
                  ? t('seatSelector.seniorSeatDesc', 'Auto-prioritizes front-row & easy entrance seats for senior passengers.') 
                  : t('seatSelector.seniorBerthDesc', 'Automatically prioritizes Lower Berth (LB) for elderly and female travelers.')}
              </div>
            </div>
            <input
              type="checkbox"
              checked={seniorPreference}
              onChange={(e) => setSeniorPreference(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#00a3a6] focus:ring-[#00a3a6] cursor-pointer"
            />
          </div>

          {/* Allocation preview */}
          <div className="p-4 rounded-2xl bg-[#f0fdfa] border border-[#99f6e4] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a3a6] text-white flex flex-col items-center justify-center font-black">
                <span className="text-[10px] leading-none opacity-80">{coachNumber}</span>
                <span className="text-sm leading-none font-extrabold">{passengersConfig[0]?.seat?.seatNum || 21}</span>
              </div>
              <div>
                <span className="font-bold text-[#0f766e] block">
                  {t('seatSelector.coach', 'Coach')} {coachNumber} • {t(`seat.${passengersConfig[0]?.seat?.id || 'lower'}.name`, passengersConfig[0]?.seat?.name || 'Lower Berth')} (#{passengersConfig[0]?.seat?.seatNum || 21}
                  {passengerCount > 1 ? ` - #${(parseInt(passengersConfig[0]?.seat?.seatNum, 10) || 21) + passengerCount - 1}` : ''})
                </span>
                <span className="text-slate-600 block">
                  {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'} • {t('trainClass.' + currentTier.code, currentTier.name)}
                </span>
                {passengerCount > 1 && !isHumsafar && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Meals: {passengersConfig.map((p, idx) => `P${idx+1}: ${p.mealChoice === 'veg' ? 'Veg' : p.mealChoice === 'nonveg' ? 'Non-Veg' : p.mealChoice === 'jain' ? 'Jain' : 'No Meal'}`).join(' • ')}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[#00a3a6] font-bold bg-white px-2.5 py-1 rounded-lg border border-cyan-200 shadow-xs">
              {t('seatSelector.autoReserved', 'Auto-Reserved')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {t('seatSelector.fare', 'Fare:')} <strong className="text-slate-900 text-sm">₹{(train.prices[travelClass] || train.prices.second) * passengerCount}</strong>
            {passengerCount > 1 && <span className="text-slate-400 block text-[10px]">(₹{train.prices[travelClass] || train.prices.second} × {passengerCount})</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {t('seatSelector.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="px-6 py-2.5 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-[#00a3a6]/20 cursor-pointer"
            >
              <span>{t('seatSelector.proceed', 'Proceed to Passenger Details')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
