import React, { useState, useRef, useEffect } from 'react';
import { 
  Train, 
  Ticket, 
  ShoppingBag, 
  User, 
  Globe, 
  Menu, 
  X,
  ChevronDown,
  Check,
  Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenTickets, onOpenPnr, onOpenAuth, bookedTicketsCount = 0 }) {
  const { selectedLang, setLanguage, t, languages } = useLanguage();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setLangDropdownOpen(false);
      }
    }

    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [langDropdownOpen]);

  const handleSelectLanguage = (langObj) => {
    setLanguage(langObj);
    setLangDropdownOpen(false);
    setLangSearch('');
    
    // Official feedback toast
    setToastMessage(`${t('common.langChangedToast')} ${langObj.native} (${langObj.name})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const filteredLanguages = languages.filter(item => 
    item.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    item.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    item.region.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0a1120] text-white border-b border-slate-800 shadow-md">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#00a3a6] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-cyan-300/40 backdrop-blur-md">
          <Globe className="w-4 h-4 text-cyan-100" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main navigation container - full width edge-to-edge */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Logo pinned firmly at top left */}
          <a href="#" className="flex items-center gap-3.5 shrink-0 group py-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00a3a6] via-[#008f92] to-[#00696b] p-0.5 shadow-lg shadow-[#00a3a6]/25 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0c1629] flex items-center justify-center">
                <Train className="w-6 h-6 text-[#00a3a6]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  IRCTC <span className="text-[#00a3a6]">CONNECT</span>
                </span>
              </div>
            </div>
          </a>

          {/* Right Action Suite pinned firmly at top right - bigger boxes */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Language Selector Button */}
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-800/95 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition text-sm sm:text-base font-bold text-slate-100 hover:text-white cursor-pointer group shadow-md whitespace-nowrap"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                title={t('common.selectLang')}
              >
                <Globe className="w-5 h-5 text-[#00a3a6]" />
                <span className="tracking-wide">{selectedLang.native}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>

              {/* Dignified Official Language Dropdown */}
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-[#0f172a] border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up">
                  {/* Dropdown Header */}
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0f172a] border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#00a3a6]/20 flex items-center justify-center border border-[#00a3a6]/30">
                          <Globe className="w-4 h-4 text-[#00a3a6]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-wide">{t('common.selectLang')}</h4>
                          <p className="text-[10px] text-slate-400">{t('common.langSubtitle')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                        IRCTC
                      </span>
                    </div>

                    {/* Search Input */}
                    <div className="mt-3 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder={t('common.searchLangPlaceholder')}
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#00a3a6] focus:ring-1 focus:ring-[#00a3a6] transition"
                        autoFocus
                      />
                      {langSearch && (
                        <button
                          onClick={() => setLangSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Languages List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700">
                    {filteredLanguages.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No languages found matching "{langSearch}"
                      </div>
                    ) : (
                      filteredLanguages.map((languageItem) => {
                        const isSelected = selectedLang.code === languageItem.code;
                        return (
                          <button
                            key={languageItem.code}
                            onClick={() => handleSelectLanguage(languageItem)}
                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition group cursor-pointer ${
                              isSelected 
                                ? 'bg-[#00a3a6]/20 border-l-4 border-[#00a3a6] text-white' 
                                : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-cyan-300 group-hover:border-[#00a3a6]/50">
                                {languageItem.code.toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white tracking-wide">
                                    {languageItem.native}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    • {languageItem.name}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 group-hover:text-slate-300">
                                  {languageItem.region}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#00a3a6] flex items-center justify-center shrink-0 shadow-sm shadow-[#00a3a6]/50">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-[#0b1120] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Indian Railways Official Multi-Lingual Service
                    </span>
                    <span className="text-slate-500 font-mono">IRCTC</span>
                  </div>
                </div>
              )}
            </div>

            {/* PNR Status / E-Tickets */}
            <button
              onClick={onOpenPnr || onOpenTickets}
              className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-800/95 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition text-sm sm:text-base font-bold text-slate-100 hover:text-white cursor-pointer relative shadow-md whitespace-nowrap"
              title={t('header.pnrStatus', 'Check PNR Status & Booked Tickets')}
            >
              <Ticket className="w-5 h-5 text-[#00a3a6]" />
              <span className="hidden sm:inline whitespace-nowrap">{t('header.pnrStatus')}</span>
              <span className="sm:hidden whitespace-nowrap">{t('common.pnr', 'PNR')}</span>
              {bookedTicketsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#00a3a6] text-white text-xs font-black flex items-center justify-center animate-pulse shadow-md shadow-[#00a3a6]/50">
                  {bookedTicketsCount}
                </span>
              )}
            </button>

            {/* Bookings Cart */}
            <button 
              onClick={onOpenTickets}
              className="relative p-3 sm:p-3.5 rounded-2xl bg-slate-800/95 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition cursor-pointer shrink-0 shadow-md flex items-center justify-center"
              title="Bookings / Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {bookedTicketsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              )}
            </button>

            {/* Sign In / User Profile CTA */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenTickets}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer hover:bg-emerald-600/30 transition shadow-sm"
                  title="Signed In Passenger Profile"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-2 text-[11px] text-slate-400 hover:text-rose-400 hover:underline transition cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={onOpenAuth}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#00a3a6] hover:bg-[#008f92] text-white font-extrabold text-sm sm:text-base transition flex items-center gap-2 shadow-lg shadow-[#00a3a6]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="w-5 h-5" />
                <span>{t('header.signIn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
