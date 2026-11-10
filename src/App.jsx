import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import SearchResults from './components/SearchResults';
import SeatSelectorModal from './components/SeatSelectorModal';
import BookingModal from './components/BookingModal';
import ETicketModal from './components/ETicketModal';
import CancellationModal from './components/CancellationModal';
import DestinationsSection from './components/DestinationsSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import LiveTrackingModal from './components/LiveTrackingModal';
import PnrStatusModal from './components/PnrStatusModal';
import AuthModal from './components/AuthModal';
import GmailConfirmationModal from './components/GmailConfirmationModal';
import { generateSchedules } from './services/trainEngine';
import { fetchLiveTrainsBetween } from './services/railRadarService';
import { fetchAllBookedTickets } from './services/hashDatabaseClient';
import { getLocalDateString } from './services/dateHelper';
import { STATIONS } from './data/irctcData';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [searchParams, setSearchParams] = useState({
    origin: STATIONS[0], // New Delhi (NDLS)
    destination: STATIONS[7], // Varanasi Junction (BSB)
    depDate: getLocalDateString(),
    passengers: 1,
    discountCard: 'none',
    travelClass: 'second',
    tripType: 'oneway'
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLiveRailRadar, setIsLiveRailRadar] = useState(true);

  // Modals state
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState('second');
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [seatDetails, setSeatDetails] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [currentTicketModal, setCurrentTicketModal] = useState(null);
  const [gmailModalData, setGmailModalData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookedTickets, setBookedTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('irctc_booked_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [legalModalTab, setLegalModalTab] = useState(null); // 'privacy' | 'terms' | 'security' | 'contact' | null
  const [liveTrackingTrain, setLiveTrackingTrain] = useState(null);
  const [pnrModalOpen, setPnrModalOpen] = useState(false);
  const [cancelTicketModal, setCancelTicketModal] = useState(null);

  // Persist booked tickets to localStorage across page reloads
  useEffect(() => {
    try {
      localStorage.setItem('irctc_booked_tickets', JSON.stringify(bookedTickets));
    } catch (err) {
      console.warn('LocalStorage save notice:', err);
    }
  }, [bookedTickets]);

  // Sync with Backend SQLite Database on initial mount
  useEffect(() => {
    async function syncBackendTickets() {
      try {
        const dbTickets = await fetchAllBookedTickets();
        if (dbTickets && dbTickets.length > 0) {
          setBookedTickets(prev => {
            const pnrMap = new Map();
            // Start with backend tickets from SQLite
            dbTickets.forEach(t => pnrMap.set(String(t.pnr), t));
            // Layer in any client tickets
            prev.forEach(t => {
              if (!pnrMap.has(String(t.pnr))) {
                pnrMap.set(String(t.pnr), t);
              }
            });
            return Array.from(pnrMap.values());
          });
        }
      } catch (err) {
        console.warn('SQLite backend sync notice:', err);
      }
    }
    syncBackendTickets();
  }, []);

  // Initialize with live RailRadar Indian Railways schedules on first load
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setIsSearching(true);
      try {
        const res = await fetchLiveTrainsBetween({
          origin: STATIONS[0], // New Delhi (NDLS)
          destination: STATIONS[7], // Varanasi Junction (BSB)
          depDate: getLocalDateString(),
          passengers: 1,
          discountCard: 'none',
          travelClass: 'second'
        });
        if (isMounted) {
          setSearchResults(res.trains);
          setIsLiveRailRadar(res.isLive);
          setIsSearching(false);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = generateSchedules({
            origin: STATIONS[0],
            destination: STATIONS[7],
            date: getLocalDateString(),
            passengers: 1,
            discountCard: 'none',
            travelClass: 'second'
          });
          setSearchResults(fallback);
          setIsLiveRailRadar(false);
          setIsSearching(false);
        }
      }
    }
    loadInitial();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = async (params) => {
    setIsSearching(true);
    setSearchParams(params);

    try {
      const res = await fetchLiveTrainsBetween(params);
      setSearchResults(res.trains);
      setIsLiveRailRadar(res.isLive);
    } catch (err) {
      const fallback = generateSchedules(params);
      setSearchResults(fallback);
      setIsLiveRailRadar(false);
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // User clicked "Choose" on a train card
  const handleSelectTrain = (train, travelClass) => {
    setSelectedTrain(train);
    setSelectedClass(travelClass);
    setSeatModalOpen(true);
  };

  // User confirmed seat choices in SeatSelectorModal
  const handleConfirmSeat = (seats) => {
    setSeatDetails(seats);
    setSeatModalOpen(false);
    setBookingModalOpen(true);
  };

  // User clicked Back from BookingModal to go back to SeatSelectorModal
  const handleBackToSeatSelection = () => {
    setBookingModalOpen(false);
    setSeatModalOpen(true);
  };

  // User completed passenger details & payment
  const handleBookingComplete = (ticketRecord) => {
    setBookedTickets(prev => [ticketRecord, ...prev]);
    setBookingModalOpen(false);

    // Prepare Gmail confirmation dispatch
    setGmailModalData({
      to: ticketRecord.email || 'passenger@example.com',
      subject: `IRCTC E-Ticket Confirmation: PNR ${ticketRecord.pnr} - ${ticketRecord.train?.carrier}`,
      passengerName: ticketRecord.passengerName,
      pnr: ticketRecord.pnr,
      train: ticketRecord.train,
      date: ticketRecord.searchParams?.depDate,
      classLabel: ticketRecord.travelClass === 'first' ? 'Executive / 1A / 2A' : 'Standard / 3A / CC',
      seatNumber: `${ticketRecord.seatDetails?.coach || 'C1'} - ${ticketRecord.seatDetails?.seat || '21'} (${ticketRecord.seatDetails?.position || 'Window'})`,
      totalFare: ticketRecord.totalPrice,
      ticket: ticketRecord
    });
  };

  // User confirmed cancellation & refund
  const handleConfirmCancel = async (pnr, refundData) => {
    setBookedTickets(prev => prev.map(tkt => {
      if (tkt.pnr === pnr) {
        return {
          ...tkt,
          status: 'CANCELLED',
          refundDetails: refundData
        };
      }
      return tkt;
    }));

    if (currentTicketModal && currentTicketModal.pnr === pnr) {
      setCurrentTicketModal(prev => ({
        ...prev,
        status: 'CANCELLED',
        refundDetails: refundData
      }));
    }

    try {
      await fetch('http://localhost:5000/api/cancel-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr, refundData })
      });
    } catch (err) {
      console.warn('Backend server not reachable for cancellation sync:', err);
    }
  };

  // User clicked a destination card
  const handleSelectCity = (cityName) => {
    const found = STATIONS.find(s => 
      s.city.toLowerCase() === cityName.toLowerCase() || 
      s.name.toLowerCase().includes(cityName.toLowerCase())
    );
    if (found) {
      const newParams = {
        ...searchParams,
        origin: STATIONS[0],
        destination: found
      };
      handleSearch(newParams);
    }
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
          {/* Header */}
          <Header
            onOpenTickets={() => {
              if (bookedTickets.length > 0) {
                setCurrentTicketModal(bookedTickets[0]);
              } else {
                setPnrModalOpen(true);
              }
            }}
            onOpenPnr={() => setPnrModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            bookedTicketsCount={bookedTickets.length}
          />

        {/* Main Content */}
        <main className="flex-1">
          {/* Search Console */}
          <HeroSearch 
            onSearch={handleSearch}
            isSearching={isSearching}
          />

          {/* Live Search Results */}
          <SearchResults
            results={searchResults}
            searchParams={searchParams}
            isLiveRailRadar={isLiveRailRadar}
            onSelectTrain={handleSelectTrain}
            onCheckLiveStatus={setLiveTrackingTrain}
          />

          {/* Top Destinations */}
          <DestinationsSection
            onSelectCity={handleSelectCity}
          />

          {/* FAQs */}
          <FaqSection />
        </main>

        {/* Footer */}
        <Footer onOpenLegal={(tab) => setLegalModalTab(tab)} />

        {/* Live GPS & RailRadar Telemetry Modal */}
        {liveTrackingTrain && (
          <LiveTrackingModal
            train={liveTrackingTrain}
            onClose={() => setLiveTrackingTrain(null)}
          />
        )}

        {/* Live 10-Digit PNR Status Verification Modal */}
        {pnrModalOpen && (
          <PnrStatusModal
            bookedTickets={bookedTickets}
            onClose={() => setPnrModalOpen(false)}
            onOpenTicket={setCurrentTicketModal}
            onOpenCancel={(ticket) => setCancelTicketModal(ticket)}
          />
        )}

        {/* Modals */}
        {seatModalOpen && selectedTrain && (
          <SeatSelectorModal
            train={selectedTrain}
            travelClass={selectedClass}
            searchParams={searchParams}
            onClose={() => setSeatModalOpen(false)}
            onConfirm={handleConfirmSeat}
          />
        )}

        {bookingModalOpen && selectedTrain && (
          <BookingModal
            train={selectedTrain}
            travelClass={selectedClass}
            seatDetails={seatDetails}
            searchParams={searchParams}
            onClose={() => setBookingModalOpen(false)}
            onBack={handleBackToSeatSelection}
            onBookingComplete={handleBookingComplete}
          />
        )}

        {currentTicketModal && (
          <ETicketModal
            ticket={currentTicketModal}
            onClose={() => setCurrentTicketModal(null)}
            onOpenCancel={(ticket) => setCancelTicketModal(ticket)}
          />
        )}

        {/* Cancellation & Refund Processing Modal */}
        {cancelTicketModal && (
          <CancellationModal
            ticket={cancelTicketModal}
            onClose={() => setCancelTicketModal(null)}
            onConfirmCancel={handleConfirmCancel}
          />
        )}

        {/* Gmail Delivery Preview Modal */}
        {gmailModalData && (
          <GmailConfirmationModal
            emailData={gmailModalData}
            onClose={() => setGmailModalData(null)}
            onOpenTicket={(ticket) => {
              setGmailModalData(null);
              setCurrentTicketModal(ticket);
            }}
          />
        )}

        {/* User Sign In / Register OTP Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />

        {legalModalTab && (
          <LegalModal
            activeTab={legalModalTab}
            onClose={() => setLegalModalTab(null)}
          />
        )}
      </div>
    </LanguageProvider>
    </AuthProvider>
  );
}
