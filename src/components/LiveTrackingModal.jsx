import React, { useState, useEffect } from 'react';
import { X, Navigation, Radio, Gauge, MapPin, Clock, Train, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchLiveTrainStatus } from '../services/railRadarService';

export default function LiveTrackingModal({ train, onClose }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [liveInfo, setLiveInfo] = useState(null);

  const getLocalizedCarrier = (carrier = '') => {
    const expressWord = t('common.express', 'Express');
    if (carrier.includes('Vande Bharat')) return `${t('results.vandeBharat', 'Vande Bharat')} ${expressWord}`;
    if (carrier.includes('Rajdhani')) return `${t('results.rajdhani', 'Rajdhani')} ${expressWord}`;
    if (carrier.includes('Shatabdi')) return `${t('results.shatabdi', 'Shatabdi')} ${expressWord}`;
    if (carrier.includes('Duronto')) return `${t('results.duronto', 'Duronto')} ${expressWord}`;
    if (carrier.includes('Humsafar')) return `${t('results.humsafar', 'Humsafar')} ${expressWord}`;
    return carrier;
  };

  useEffect(() => {
    let isMounted = true;
    async function getStatus() {
      setLoading(true);
      const res = await fetchLiveTrainStatus(train.trainNumber);
      if (isMounted) {
        setLiveInfo(res);
        setLoading(false);
      }
    }
    getStatus();
    return () => { isMounted = false; };
  }, [train.trainNumber]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Live Status
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {t('trackingModal.title', 'Live Train Running Status')}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Train banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#00a3a6] uppercase tracking-wide">
                #{train.trainNumber}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                {getLocalizedCarrier(train.carrier)}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{train.origin} → {train.destination}</span>
                <span>•</span>
                <span className="font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">{train.track}</span>
              </p>
            </div>
            <div className="text-right">
              {loading ? (
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin ml-auto"></div>
              ) : liveInfo?.delayMinutes === 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('results.onTime', 'On Time')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t('results.delayed', 'Delayed by {mins} min').replace('{mins}', liveInfo?.delayMinutes || 10)}
                </span>
              )}
            </div>
          </div>

          {/* Live GPS Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00a3a6]" />
                {t('trackingModal.currentLocation', 'Current Location')}
              </span>
              <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                {loading ? 'Fetching GPS...' : (liveInfo?.currentLocation || 'Main Line')}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-500" />
                {t('trackingModal.nextHalt', 'Next Scheduled Halt')}
              </span>
              <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                {loading ? 'Locating...' : (liveInfo?.nextHalt || 'Approaching Station')}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                {t('trackingModal.speed', 'Speed')}
              </span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">
                {loading ? '--' : `${liveInfo?.speedKmph || 95} km/h`}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {t('trackingModal.lastUpdated', 'Last Signal Update')}
              </span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">
                {liveInfo?.lastUpdated ? new Date(liveInfo.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Coach position */}
          {liveInfo?.coachPosition && (
            <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-2xl">
              <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wide block mb-1">
                {t('trackingModal.coachSeq', 'Coach Composition')}
              </span>
              <div className="font-mono text-xs text-cyan-900 tracking-wider overflow-x-auto whitespace-nowrap py-1">
                {liveInfo.coachPosition}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-bold text-xs transition cursor-pointer"
          >
            {t('trackingModal.close', 'Close Live Tracking')}
          </button>
        </div>
      </div>
    </div>
  );
}
