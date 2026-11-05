const API_BASE = window.location.origin;

// State management
let allStations = [];
let allTrains = [];
let currentLock = null; // { lockId, seatNum, expiresAt, timerInterval }
let selectedBookingTrain = null;
let currentCancellationPnr = null;
let recentPnrs = [];

// ----------------- TAB SWITCHING -----------------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------- TOAST NOTIFICATIONS -----------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'));
    toast.innerHTML = `<div style="display:flex; align-items:center; gap:0.5rem;"><span>${icon}</span> <span>${message}</span></div>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ----------------- INITIALIZATION -----------------
document.addEventListener('DOMContentLoaded', async () => {
    // Set default travel date and disable past dates
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const dateStr = today.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const travelInput = document.getElementById('travelDate');
    const seatInput = document.getElementById('seatDate');
    travelInput.value = dateStr;
    travelInput.min = todayStr;
    seatInput.value = dateStr;
    seatInput.min = todayStr;

    await loadStations();
    await loadTrains();
    initPassengerRows();
    loadRecentPnrs();
});

// Load all stations from API
async function loadStations() {
    try {
        const res = await fetch(`${API_BASE}/api/stations`);
        allStations = await res.json();
        
        const srcSelect = document.getElementById('srcStation');
        const dstSelect = document.getElementById('dstStation');
        
        srcSelect.innerHTML = allStations.map(s => `<option value="${s.code}">${s.name} (${s.code}) - ${s.zone}</option>`).join('');
        dstSelect.innerHTML = allStations.map(s => `<option value="${s.code}">${s.name} (${s.code}) - ${s.zone}</option>`).join('');

        // Defaults
        srcSelect.value = "SBC";
        dstSelect.value = "MAS";
    } catch (e) {
        showToast("Failed to load stations list", "error");
    }
}

// Load all trains for dropdowns
async function loadTrains() {
    try {
        const res = await fetch(`${API_BASE}/api/trains`);
        allTrains = await res.json();

        const seatTrainSelect = document.getElementById('seatTrainNum');
        seatTrainSelect.innerHTML = allTrains.map(t => `<option value="${t.train_number}">${t.train_number} - ${t.train_name}</option>`).join('');

        onSeatTrainChange();
    } catch (e) {
        showToast("Failed to load trains catalog", "error");
    }
}

function swapStations() {
    const src = document.getElementById('srcStation');
    const dst = document.getElementById('dstStation');
    const temp = src.value;
    src.value = dst.value;
    dst.value = temp;
}

// ----------------- 1. TRAIN SEARCH & LIVE SCHEDULE (SABBIR) -----------------
async function searchTrains() {
    const src = document.getElementById('srcStation').value;
    const dst = document.getElementById('dstStation').value;
    const date = document.getElementById('travelDate').value;
    const category = document.getElementById('trainCategory').value;
    const container = document.getElementById('trainResults');

    if (src === dst) {
        showToast("Origin and Destination cannot be the same station!", "warning");
        return;
    }

    container.innerHTML = '<div class="card" style="text-align:center;"><p>🔍 Searching active trains & live routes...</p></div>';

    try {
        const res = await fetch(`${API_BASE}/api/trains/search?source=${src}&destination=${dst}&travel_date=${date}`);
        const data = await res.json();

        let trains = data.trains || [];
        if (category !== "ALL") {
            trains = trains.filter(t => t.train_type.toLowerCase().includes(category.toLowerCase()));
        }

        if (trains.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align:center; padding: 2.5rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🚉</div>
                    <h3>No Direct Trains Available</h3>
                    <p style="color:var(--text-muted); margin-top:0.5rem;">No scheduled trains found running on ${date} between selected stations. Try another date or category.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = trains.map(t => `
            <div class="train-card">
                <div class="train-card-top">
                    <div class="train-meta">
                        <h3>${t.train_number} - ${t.train_name}</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                            Runs on: <strong>${t.days_of_run.join(', ')}</strong>
                        </div>
                    </div>
                    <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
                        <span class="train-badge">${t.train_type}</span>
                        <button class="btn btn-outline btn-sm" onclick="viewTrainSchedule('${t.train_number}')">
                            🕒 Schedule
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="viewGpsRadar('${t.train_number}')">
                            🛰️ Live Radar
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="viewRunningStatus('${t.train_number}')">
                            ⏱️ Delays
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="viewOccupancyRadar('${t.train_number}')">
                            📊 Occupancy
                        </button>
                        <button class="btn btn-outline btn-sm" style="color:var(--primary); font-weight:600;" onclick="viewCoachForTrain('${t.train_number}', '${t.available_classes[0]}', '${date}')">
                            💺 2D Coach
                        </button>
                    </div>
                </div>

                <div class="train-timing-row">
                    <div class="timing-node">
                        <span class="time">${t.departure_time}</span>
                        <span class="station" style="cursor:pointer;" title="Click to view station facilities" onclick="viewStationFacilities('${t.source}')">${t.source} ℹ️</span>
                    </div>

                    <div class="timing-arrow">
                        <span>${t.segment_distance_km} km</span>
                        <div class="line"></div>
                        <span>Direct Route</span>
                    </div>

                    <div class="timing-node">
                        <span class="time">${t.arrival_time}</span>
                        <span class="station" style="cursor:pointer;" title="Click to view station facilities" onclick="viewStationFacilities('${t.destination}')">${t.destination} ℹ️</span>
                    </div>
                </div>

                <div>
                    <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">
                        SELECT CLASS TO BOOK:
                    </div>
                    <div class="class-tiles-row">
                        ${t.available_classes.map(cls => `
                            <div class="class-tile" onclick="selectTrainForBooking('${t.train_number}', '${t.source}', '${t.destination}', ${t.segment_distance_km}, '${date}', '${cls}')">
                                <div class="class-tile-header">
                                    <span>${cls}</span>
                                    <span>➔</span>
                                </div>
                                <div class="class-tile-avail">AVAILABLE</div>
                                <div class="class-tile-fare">Book Now</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        showToast(`Found ${trains.length} trains matching your route!`, "success");
    } catch (e) {
        container.innerHTML = `<div class="card"><p style="color:red">Error querying railway service: ${e.message}</p></div>`;
    }
}

// View train timetable modal
async function viewTrainSchedule(trainNumber) {
    const modal = document.getElementById('scheduleModal');
    const body = document.getElementById('schedModalBody');
    const title = document.getElementById('schedModalTrainName');
    const statusText = document.getElementById('schedModalLiveStatus');

    body.innerHTML = '<p>Loading timetable and live NTES data...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/api/trains/${trainNumber}/schedule`);
        const data = await res.json();
        const t = data.train_info;
        const live = data.live_status;

        title.innerText = `${t.train_number} - ${t.train_name} (${t.train_type})`;
        statusText.innerText = `● Live Status: ${live.status_message} (Station: ${live.current_station})`;

        body.innerHTML = `
            <div style="margin-bottom: 1.25rem; font-size: 0.88rem; background: #f8fafc; padding: 0.85rem; border-radius: 8px;">
                <strong>Source:</strong> ${t.source} | <strong>Destination:</strong> ${t.destination} | <strong>Total Distance:</strong> ${t.distance_km} km
            </div>
            <table class="passenger-table">
                <thead>
                    <tr>
                        <th>Station</th>
                        <th>Distance</th>
                        <th>Halt Time</th>
                        <th>Departure</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.halts.map(h => `
                        <tr>
                            <td><strong>${h.station_code}</strong></td>
                            <td>${h.distance_km} km</td>
                            <td>${h.halt_time}</td>
                            <td><strong style="color:var(--primary);">${h.dep}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

// Station facilities modal (Sabbir)
async function viewStationFacilities(stationCode) {
    const modal = document.getElementById('facilityModal');
    const title = document.getElementById('facModalStationName');
    const zone = document.getElementById('facModalZone');
    const body = document.getElementById('facModalBody');

    body.innerHTML = '<p>Fetching station amenities...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/api/stations/${stationCode}/facilities`);
        if (!res.ok) throw new Error("Station facilities information not available");
        const data = await res.json();
        const f = data.facilities;

        title.innerText = `${data.station_name} (${data.station_code})`;
        zone.innerText = `Zone: ${data.zone} | Platforms: ${f.platforms}`;

        body.innerHTML = `
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                <div style="background:#f8fafc; padding:0.75rem; border-radius:6px;">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">HIGH-SPEED RAILWIRE WI-FI</div>
                    <div style="font-weight:700; color:var(--success); margin-top:2px;">${f.wifi ? '✅ Available' : '❌ Not Available'}</div>
                </div>
                <div style="background:#f8fafc; padding:0.75rem; border-radius:6px;">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">WHEELCHAIR ACCESSIBLE</div>
                    <div style="font-weight:700; color:var(--success); margin-top:2px;">${f.wheelchair_accessible ? '✅ Full Accessibility' : '❌ Limited'}</div>
                </div>
                <div style="background:#f8fafc; padding:0.75rem; border-radius:6px;">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">AC RETIRING ROOMS</div>
                    <div style="font-weight:700; margin-top:2px;">${f.retiring_rooms} Rooms Available</div>
                </div>
                <div style="background:#f8fafc; padding:0.75rem; border-radius:6px;">
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">CLOAK ROOM / LUGGAGE LOCKER</div>
                    <div style="font-weight:700; margin-top:2px;">${f.cloak_room ? '✅ 24x7 Counter' : '❌ Not Available'}</div>
                </div>
            </div>
            <div style="margin-top:0.75rem; background:#fffaf0; border:1px solid #feebc8; padding:0.75rem; border-radius:6px; font-size:0.85rem;">
                <strong>🍔 Food Court & Dining:</strong>
                <ul style="margin: 0.25rem 0 0 1.25rem;">
                    ${f.food_court.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div style="margin-top:0.5rem; font-size:0.82rem; color:var(--text-muted);">
                🚗 Parking: <strong>${f.parking}</strong>
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

function closeFacilityModal() {
    document.getElementById('facilityModal').classList.remove('active');
}

// Live GPS Radar Modal (Sabbir)
async function viewGpsRadar(trainNumber) {
    const modal = document.getElementById('gpsModal');
    const title = document.getElementById('gpsModalTrainTitle');
    const body = document.getElementById('gpsModalBody');

    body.innerHTML = '<p>Connecting to NTES satellite feed...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/api/trains/${trainNumber}/live-tracking`);
        const data = await res.json();
        title.innerText = `🛰️ ${data.train_number} - ${data.train_name}`;

        body.innerHTML = `
            <div style="display:flex; justify-content:space-between; background:#1a202c; color:white; padding:1rem; border-radius:8px; margin-bottom:1rem;">
                <div>
                    <span style="font-size:0.75rem; color:#a0aec0;">CURRENT SPEED</span>
                    <div style="font-size:1.5rem; font-weight:800; color:#48bb78;">${data.speed_kmh} km/h</div>
                </div>
                <div>
                    <span style="font-size:0.75rem; color:#a0aec0;">TELEMETRY COORDINATES</span>
                    <div style="font-size:0.9rem; font-weight:700; margin-top:0.35rem;">${data.telemetry.latitude}° N, ${data.telemetry.longitude}° E</div>
                </div>
                <div>
                    <span style="font-size:0.75rem; color:#a0aec0;">SIGNAL STATUS</span>
                    <div style="font-size:0.9rem; font-weight:800; color:#48bb78; margin-top:0.35rem;">🟢 ${data.signal_status}</div>
                </div>
            </div>

            <div style="background:#f7fafc; border:1px solid var(--border); border-radius:8px; padding:1rem; font-size:0.9rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>Last Station Passed:</span>
                    <strong>${data.current_halt}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>Next Approaching Halt:</span>
                    <strong style="color:var(--primary); font-size:1.05rem;">${data.next_halt}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>Estimated Arrival Time:</span>
                    <strong>${data.eta_next_halt}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span>Remaining Distance:</span>
                    <strong>${data.distance_remaining_km} km</strong>
                </div>
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

function closeGpsModal() {
    document.getElementById('gpsModal').classList.remove('active');
}

function viewCoachForTrain(trainNum, coachClass, date) {
    const seatTrainSelect = document.getElementById('seatTrainNum');
    seatTrainSelect.value = trainNum;
    onSeatTrainChange();

    if (coachClass) {
        document.getElementById('seatClass').value = coachClass;
    }
    if (date) {
        document.getElementById('seatDate').value = date;
    }

    switchTab('seat-tab');
    loadCoachLayout();
}

// ----------------- 2. SEAT LAYOUT & CONCURRENCY LOCKS (SAMVIT) -----------------
function onSeatTrainChange() {
    const trainNum = document.getElementById('seatTrainNum').value;
    const train = allTrains.find(t => t.train_number === trainNum);
    const classSelect = document.getElementById('seatClass');

    if (train) {
        classSelect.innerHTML = train.available_classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    loadCoachLayout();
}

async function loadCoachLayout() {
    const trainNum = document.getElementById('seatTrainNum').value;
    const coachClass = document.getElementById('seatClass').value;
    const journeyDate = document.getElementById('seatDate').value;
    const container = document.getElementById('coachContainer');
    const infoText = document.getElementById('coachInfoText');
    const availText = document.getElementById('availSummaryText');

    if (!trainNum || !coachClass || !journeyDate) return;

    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Loading 2D berth diagram...</p>';
    infoText.innerText = `Train ${trainNum} • Coach Class: ${coachClass}`;

    try {
        // Fetch layout and availability summary in parallel
        const [layoutRes, availRes] = await Promise.all([
            fetch(`${API_BASE}/api/seats/layout?train_number=${trainNum}&journey_date=${journeyDate}&coach_class=${coachClass}`),
            fetch(`${API_BASE}/api/seats/availability?train_number=${trainNum}&journey_date=${journeyDate}&coach_class=${coachClass}`)
        ]);

        const layoutData = await layoutRes.json();
        const availData = await availRes.json();

        availText.innerText = `[${availData.status_text} | Total: ${availData.total_seats} seats]`;

        container.innerHTML = layoutData.seats.map(s => {
            const isMyLock = currentLock && currentLock.seatNum === s.seat_number;
            const extraClass = isMyLock ? 'SELECTED' : s.status;
            return `
                <div class="seat-item ${extraClass}" onclick="handleSeatClick('${trainNum}', '${coachClass}', '${journeyDate}', ${s.seat_number}, '${s.status}')">
                    <div class="seat-num">${s.seat_number}</div>
                    <div class="seat-type">${s.berth_type}</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        container.innerHTML = `<p style="grid-column: 1/-1; color:red">Error loading coach layout: ${e.message}</p>`;
    }
}

async function handleSeatClick(trainNum, coachClass, journeyDate, seatNum, status) {
    if (status === 'BOOKED') {
        showToast(`Seat ${seatNum} is already booked and occupied.`, "warning");
        return;
    }

    if (status === 'LOCKED' && (!currentLock || currentLock.seatNum !== seatNum)) {
        showToast(`Seat ${seatNum} is currently locked by another customer in checkout.`, "warning");
        return;
    }

    // Lock seat
    try {
        const res = await fetch(`${API_BASE}/api/seats/lock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                train_number: trainNum,
                journey_date: journeyDate,
                coach_class: coachClass,
                seat_number: seatNum,
                user_id: 'guest_web_session'
            })
        });

        const data = await res.json();
        if (res.ok) {
            startLockTimer(data.lock_id, seatNum);
            showToast(`Seat #${seatNum} locked for 5 minutes!`, "success");
            loadCoachLayout();

            // Show Proceed button
            document.getElementById('bookSelectedSeatBtn').style.display = 'inline-flex';
            document.getElementById('selectedSeatLabel').innerText = seatNum;
        } else {
            showToast(data.detail || "Unable to lock seat", "error");
        }
    } catch (e) {
        showToast("Error locking seat: " + e.message, "error");
    }
}

function startLockTimer(lockId, seatNum) {
    if (currentLock && currentLock.timerInterval) {
        clearInterval(currentLock.timerInterval);
    }

    const duration = 300; // 5 mins
    const expiresAt = Date.now() + duration * 1000;
    const badge = document.getElementById('lockTimerBadge');
    const seatLabel = document.getElementById('lockedSeatNum');
    const countdown = document.getElementById('lockCountdown');

    badge.style.display = 'flex';
    document.getElementById('releaseLockBtn').style.display = 'inline-flex';
    seatLabel.innerText = seatNum;

    const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        countdown.innerText = `${mins}:${secs}`;

        if (remaining <= 0) {
            clearInterval(interval);
            badge.style.display = 'none';
            document.getElementById('releaseLockBtn').style.display = 'none';
            document.getElementById('bookSelectedSeatBtn').style.display = 'none';
            currentLock = null;
            showToast("Seat reservation lock expired.", "info");
            loadCoachLayout();
        }
    }, 1000);

    currentLock = { lockId, seatNum, expiresAt, timerInterval: interval };
}

async function releaseCurrentLock() {
    if (!currentLock) return;
    const trainNum = document.getElementById('seatTrainNum').value;
    const coachClass = document.getElementById('seatClass').value;
    const journeyDate = document.getElementById('seatDate').value;
    const seatNum = currentLock.seatNum;

    try {
        const res = await fetch(`${API_BASE}/api/seats/unlock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                train_number: trainNum,
                journey_date: journeyDate,
                coach_class: coachClass,
                seat_number: seatNum,
                user_id: 'guest_web_session'
            })
        });

        if (res.ok) {
            clearInterval(currentLock.timerInterval);
            document.getElementById('lockTimerBadge').style.display = 'none';
            document.getElementById('releaseLockBtn').style.display = 'none';
            document.getElementById('bookSelectedSeatBtn').style.display = 'none';
            currentLock = null;
            showToast(`Lock on seat #${seatNum} released.`, "info");
            loadCoachLayout();
        } else {
            showToast("Unable to release lock", "error");
        }
    } catch (e) {
        showToast("Error releasing seat lock: " + e.message, "error");
    }
}

function proceedWithSelectedSeat() {
    if (!currentLock) return;
    const trainNum = document.getElementById('seatTrainNum').value;
    const train = allTrains.find(t => t.train_number === trainNum) || { source: 'SBC', destination: 'MAS', distance_km: 362 };
    const coachClass = document.getElementById('seatClass').value;
    const date = document.getElementById('seatDate').value;

    selectTrainForBooking(trainNum, train.source, train.destination, train.distance_km, date, coachClass, currentLock.seatNum);
}

// ----------------- 3. MULTI-PASSENGER BOOKING & FARE CALCULATION (VINAYAK & RAHUL) -----------------
function selectTrainForBooking(trainNum, src, dst, dist, date, coachClass, lockedSeatNum = null) {
    selectedBookingTrain = { trainNum, src, dst, dist: dist || 362, date: date || document.getElementById('travelDate').value };

    // Update Banner
    const train = allTrains.find(t => t.train_number === trainNum);
    document.getElementById('bjTrainName').innerText = `${trainNum} - ${(train && train.train_name) || 'Express'}`;
    document.getElementById('bjRoute').innerText = `${src} ➔ ${dst}`;
    document.getElementById('bjDate').innerText = selectedBookingTrain.date;
    document.getElementById('bjDist').innerText = selectedBookingTrain.dist;

    // Populate Class select
    const classSelect = document.getElementById('bCoachClass');
    if (train && train.available_classes) {
        classSelect.innerHTML = train.available_classes.map(c => `<option value="${c}">${c}</option>`).join('');
    } else {
        classSelect.innerHTML = `<option value="3A">3A</option><option value="2A">2A</option><option value="SL">SL</option>`;
    }
    if (coachClass) classSelect.value = coachClass;

    // Set locked seat in first passenger row if provided
    if (lockedSeatNum) {
        const firstSeatInput = document.querySelector('.p-seat-num');
        if (firstSeatInput) firstSeatInput.value = lockedSeatNum;
    }

    switchTab('booking-tab');
    updateFarePreview();
}

function initPassengerRows() {
    const tbody = document.getElementById('passengerRows');
    tbody.innerHTML = '';
    addPassengerRow("Ravi Kumar", 32, "M", "Lower", "NONE");
}

function addPassengerRow(name = "", age = 28, gender = "M", pref = "Lower", concession = "NONE") {
    const tbody = document.getElementById('passengerRows');
    const rowCount = tbody.querySelectorAll('tr').length;
    if (rowCount >= 6) {
        showToast("Maximum 6 passengers allowed per booking ticket.", "warning");
        return;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="font-weight:700; color:var(--text-muted);">${rowCount + 1}</td>
        <td><input type="text" class="p-name" placeholder="Full Name" value="${name}"></td>
        <td><input type="number" class="p-age" min="1" max="120" value="${age}" onchange="updateFarePreview()"></td>
        <td>
            <select class="p-gender">
                <option value="M" ${gender === 'M' ? 'selected' : ''}>Male</option>
                <option value="F" ${gender === 'F' ? 'selected' : ''}>Female</option>
                <option value="T" ${gender === 'T' ? 'selected' : ''}>Transgender</option>
            </select>
        </td>
        <td>
            <select class="p-pref">
                <option value="Lower" ${pref === 'Lower' ? 'selected' : ''}>Lower Berth</option>
                <option value="Middle" ${pref === 'Middle' ? 'selected' : ''}>Middle Berth</option>
                <option value="Upper" ${pref === 'Upper' ? 'selected' : ''}>Upper Berth</option>
                <option value="Side Lower" ${pref === 'Side Lower' ? 'selected' : ''}>Side Lower</option>
                <option value="Side Upper" ${pref === 'Side Upper' ? 'selected' : ''}>Side Upper</option>
                <option value="NONE">No Preference</option>
            </select>
            <input type="hidden" class="p-seat-num" value="">
        </td>
        <td>
            <select class="p-concession" onchange="updateFarePreview()">
                <option value="NONE" ${concession === 'NONE' ? 'selected' : ''}>General (No Concession)</option>
                <option value="SENIOR_CITIZEN_MALE" ${concession === 'SENIOR_CITIZEN_MALE' ? 'selected' : ''}>Senior Citizen Male (40% off)</option>
                <option value="SENIOR_CITIZEN_FEMALE" ${concession === 'SENIOR_CITIZEN_FEMALE' ? 'selected' : ''}>Senior Citizen Female (50% off)</option>
                <option value="STUDENT" ${concession === 'STUDENT' ? 'selected' : ''}>Student Pass (50% off)</option>
                <option value="DIVYANGJAN" ${concession === 'DIVYANGJAN' ? 'selected' : ''}>Divyangjan / PwD (75% off)</option>
                <option value="ARMED_FORCES" ${concession === 'ARMED_FORCES' ? 'selected' : ''}>Armed Forces / Defense (50% off)</option>
                <option value="CHILD_5_11" ${concession === 'CHILD_5_11' ? 'selected' : ''}>Child 5-11 yrs (50% off)</option>
                <option value="INFANT_UNDER_5" ${concession === 'INFANT_UNDER_5' ? 'selected' : ''}>Infant Under 5 yrs (Free Travel)</option>
            </select>
        </td>
        <td>
            ${rowCount > 0 ? `<button class="btn btn-outline btn-sm" style="color:red;" onclick="removePassengerRow(this)">✕</button>` : ''}
        </td>
    `;
    tbody.appendChild(tr);
    updateFarePreview();
}

function removePassengerRow(btn) {
    btn.closest('tr').remove();
    // Re-index numbers
    document.querySelectorAll('#passengerRows tr').forEach((tr, idx) => {
        tr.cells[0].innerText = idx + 1;
    });
    updateFarePreview();
}

async function updateFarePreview() {
    const coachClass = document.getElementById('bCoachClass').value || '3A';
    const quota = document.getElementById('bQuota').value || 'GENERAL';
    const dist = (selectedBookingTrain && selectedBookingTrain.dist) || 362;

    const rows = document.querySelectorAll('#passengerRows tr');
    if (rows.length === 0) return;

    let totalBase = 0;
    let totalDiscount = 0;
    let totalTatkal = 0;
    let totalSf = 0;
    let totalGst = 0;
    let grandTotal = 0;

    for (const r of rows) {
        const concession = r.querySelector('.p-concession').value;
        try {
            const res = await fetch(`${API_BASE}/api/fare/calculate?distance_km=${dist}&coach_class=${coachClass}&concession_type=${concession}&quota=${quota}`);
            const data = await res.json();
            totalBase += data.base_fare;
            totalDiscount += data.discount_amount;
            totalTatkal += data.tatkal_surcharge;
            totalSf += data.superfast_surcharge;
            totalGst += data.gst;
            grandTotal += data.total_fare;
        } catch (e) {}
    }

    document.getElementById('fbBase').innerText = `₹${totalBase.toFixed(2)}`;
    document.getElementById('fbDisc').innerText = `-₹${totalDiscount.toFixed(2)}`;
    document.getElementById('fbTatkal').innerText = `₹${totalTatkal.toFixed(2)}`;
    document.getElementById('fbSf').innerText = `₹${totalSf.toFixed(2)}`;
    document.getElementById('fbGst').innerText = `₹${totalGst.toFixed(2)}`;
    document.getElementById('fbTotal').innerText = `₹${grandTotal.toFixed(2)}`;

    document.getElementById('payModalAmount').innerText = `₹${grandTotal.toFixed(2)}`;
}

function openPaymentModal() {
    // Validate passengers
    const rows = document.querySelectorAll('#passengerRows tr');
    for (const r of rows) {
        const name = r.querySelector('.p-name').value.trim();
        const age = parseInt(r.querySelector('.p-age').value);
        if (!name) {
            showToast("Please enter name for all passengers.", "warning");
            return;
        }
        if (isNaN(age) || age < 1 || age > 120) {
            showToast("Please enter a valid age (1-120) for all passengers.", "warning");
            return;
        }
    }

    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

async function executeBooking() {
    closePaymentModal();

    const trainNum = (selectedBookingTrain && selectedBookingTrain.trainNum) || '12658';
    const train = allTrains.find(t => t.train_number === trainNum) || { source: 'SBC', destination: 'MAS' };
    const date = (selectedBookingTrain && selectedBookingTrain.date) || document.getElementById('travelDate').value;
    const coachClass = document.getElementById('bCoachClass').value;
    const quota = document.getElementById('bQuota').value;

    const rows = document.querySelectorAll('#passengerRows tr');
    const passengers = [];

    rows.forEach(r => {
        const name = r.querySelector('.p-name').value.trim();
        const age = parseInt(r.querySelector('.p-age').value);
        const gender = r.querySelector('.p-gender').value;
        const pref = r.querySelector('.p-pref').value;
        const concession = r.querySelector('.p-concession').value;
        const seatNumStr = r.querySelector('.p-seat-num').value;
        const seatNum = seatNumStr ? parseInt(seatNumStr) : null;

        passengers.push({
            name,
            age,
            gender,
            berth_preference: pref,
            concession_type: concession,
            seat_number: seatNum
        });
    });

    const reqBody = {
        user_id: 'passenger_web_user',
        train_number: trainNum,
        journey_date: date,
        source: (selectedBookingTrain && selectedBookingTrain.src) || train.source,
        destination: (selectedBookingTrain && selectedBookingTrain.dst) || train.destination,
        coach_class: coachClass,
        quota: quota,
        passengers: passengers
    };

    try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });

        const data = await res.json();
        if (res.ok) {
            showToast(`Ticket Confirmed! PNR: ${data.pnr}`, "success");
            saveRecentPnr(data.pnr);
            
            // Clean lock if any
            if (currentLock && currentLock.timerInterval) {
                clearInterval(currentLock.timerInterval);
                document.getElementById('lockTimerBadge').style.display = 'none';
                currentLock = null;
            }

            document.getElementById('pnrInput').value = data.pnr;
            switchTab('pnr-tab');
            checkPnrStatus();
        } else {
            showToast(data.detail || "Booking failed", "error");
        }
    } catch (e) {
        showToast("Error processing booking: " + e.message, "error");
    }
}

// ----------------- 4. PNR TRACKER & CANCELLATION (RAHUL) -----------------
async function checkPnrStatus(explicitPnr = null) {
    const pnr = (explicitPnr || document.getElementById('pnrInput').value).trim();
    if (!pnr) {
        showToast("Please enter a valid 10-digit PNR number.", "warning");
        return;
    }

    const card = document.getElementById('pnrResultCard');
    card.style.display = 'block';
    card.innerHTML = '<div class="card" style="text-align:center;"><p>🔎 Fetching official PNR status...</p></div>';

    try {
        const res = await fetch(`${API_BASE}/api/pnr/${pnr}`);
        if (!res.ok) {
            card.innerHTML = `
                <div class="card" style="text-align:center; padding: 2rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">❓</div>
                    <h3>PNR Not Found</h3>
                    <p style="color:var(--text-muted);">No reservation found for PNR "${pnr}". Please check the digits and try again.</p>
                </div>
            `;
            return;
        }

        const b = await res.json();
        saveRecentPnr(b.pnr);

        const statusClass = b.booking_status === 'CONFIRMED' ? 'CONFIRMED' : (b.booking_status === 'CANCELLED' ? 'CANCELLED' : 'PARTIAL');

        card.innerHTML = `
            <div class="ticket-container">
                <div class="ticket-header">
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">INDIAN RAILWAYS E-TICKET RECEIPT</div>
                        <div class="pnr-display">PNR: ${b.pnr}</div>
                    </div>
                    <div>
                        <span class="status-badge ${statusClass}">${b.booking_status}</span>
                    </div>
                </div>

                <div class="ticket-grid">
                    <div class="ticket-item">
                        <span class="label">Train Name & Number</span>
                        <span class="val">${b.train_number} - ${b.train_name}</span>
                    </div>
                    <div class="ticket-item">
                        <span class="label">Date of Journey</span>
                        <span class="val">${b.journey_date}</span>
                    </div>
                    <div class="ticket-item">
                        <span class="label">From ➔ To</span>
                        <span class="val">${b.source} ➔ ${b.destination}</span>
                    </div>
                    <div class="ticket-item">
                        <span class="label">Departure / Arrival</span>
                        <span class="val">${b.departure_time || '--:--'} / ${b.arrival_time || '--:--'}</span>
                    </div>
                    <div class="ticket-item">
                        <span class="label">Class & Quota</span>
                        <span class="val">${b.coach_class} (${b.quota || 'GENERAL'})</span>
                    </div>
                    <div class="ticket-item">
                        <span class="label">Total Fare Paid</span>
                        <span class="val" style="color:var(--primary);">₹${b.total_fare.toFixed(2)}</span>
                    </div>
                </div>

                <div style="margin: 1.5rem 0;">
                    <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #2d3748;">Passenger Allocation Details</h4>
                    <table class="passenger-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Passenger Name</th>
                                <th>Age / Gender</th>
                                <th>Booking Status</th>
                                <th>Coach / Seat #</th>
                                <th>Berth Type</th>
                                <th>Fare</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${b.passengers.map((p, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${p.name}</strong></td>
                                    <td>${p.age} / ${p.gender}</td>
                                    <td>
                                        <span class="status-badge ${p.status === 'CNF' ? 'CONFIRMED' : (p.status === 'CANCELLED' ? 'CANCELLED' : 'PARTIAL')}" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">
                                            ${p.status === 'CNF' ? 'CONFIRMED' : (p.status === 'RAC' ? `RAC #${p.queue_position}` : (p.status === 'WL' ? `WL #${p.queue_position}` : p.status))}
                                        </span>
                                    </td>
                                    <td><strong>${p.coach ? `${p.coach} / Seat ${p.seat_number}` : '--'}</strong></td>
                                    <td>${p.berth_type || '--'}</td>
                                    <td>₹${p.fare.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.82rem; color: var(--text-muted); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>Transaction ID: <strong>${b.payment ? b.payment.transaction_id : 'TXN_SYSTEM'}</strong> | Method: ${b.payment ? b.payment.payment_method : 'UPI'}</div>
                    <div>Booked on: ${new Date(b.booked_at * 1000).toLocaleString()}</div>
                </div>

                ${b.booking_status === 'CANCELLED' && b.refund_details ? `
                    <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                        <h4 style="color: var(--danger); font-size: 0.95rem;">Refund Processed</h4>
                        <div style="display:flex; justify-content:space-between; margin-top:0.4rem; font-size:0.88rem;">
                            <span>Deduction Clerkage Fee: <strong>₹${b.refund_details.cancellation_charge}</strong></span>
                            <span style="color:var(--success); font-weight:700;">Net Refund Amount: ₹${b.refund_details.refund_amount}</span>
                        </div>
                    </div>
                ` : ''}

                <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap:wrap; gap:1rem;">
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        <button class="btn btn-outline" onclick="window.print()">🖨️ Print / Save E-Ticket</button>
                        <button class="btn btn-outline" style="color:var(--primary); font-weight:600;" onclick="viewTaxInvoice('${b.pnr}', '${b.train_number}', '${b.coach_class}', ${b.total_fare})">🧾 View GST Tax Invoice</button>
                    </div>
                    ${b.booking_status !== 'CANCELLED' ? `
                        <button class="btn btn-danger" onclick="openCancelModal('${b.pnr}', ${b.total_fare}, '${b.coach_class}')">
                            ✕ Cancel Ticket & Claim Refund
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (e) {
        card.innerHTML = `<div class="card"><p style="color:red">Error querying PNR: ${e.message}</p></div>`;
    }
}

let currentCancelTotalPaid = 0;
let currentCancelCoachClass = '3A';

function openCancelModal(pnr, totalPaid, coachClass = '3A') {
    currentCancellationPnr = pnr;
    currentCancelTotalPaid = totalPaid;
    currentCancelCoachClass = coachClass;

    document.getElementById('cancelPnrLabel').innerText = pnr;
    document.getElementById('cancelTotalPaid').innerText = `₹${totalPaid.toFixed(2)}`;
    document.getElementById('cancelTimeframe').value = "50";
    onCancelTimeframeChange();

    document.getElementById('cancelModal').classList.add('active');
}

async function onCancelTimeframeChange() {
    if (!currentCancellationPnr) return;
    const hours = parseFloat(document.getElementById('cancelTimeframe').value) || 50.0;
    try {
        const res = await fetch(`${API_BASE}/api/fare/refund-estimate?total_paid=${currentCancelTotalPaid}&hours_before_departure=${hours}&coach_class=${currentCancelCoachClass}`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('cancelFee').innerText = `-₹${data.cancellation_charge.toFixed(2)}`;
            document.getElementById('cancelRefundAmount').innerText = `₹${data.refund_amount.toFixed(2)}`;
        }
    } catch (e) {}
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('active');
    currentCancellationPnr = null;
}

async function confirmCancelTicket() {
    if (!currentCancellationPnr) return;
    const pnr = currentCancellationPnr;
    const hours = parseFloat(document.getElementById('cancelTimeframe').value) || 50.0;
    closeCancelModal();

    try {
        const res = await fetch(`${API_BASE}/api/bookings/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pnr: pnr, hours_before_departure: hours })
        });

        const data = await res.json();
        if (res.ok) {
            showToast(`Ticket cancelled! Refund of ₹${data.refund.refund_amount} issued.`, "success");
            checkPnrStatus(pnr);
        } else {
            showToast(data.detail || "Cancellation failed", "error");
        }
    } catch (e) {
        showToast("Error cancelling ticket: " + e.message, "error");
    }
}

// ----------------- RECENT PNRS STORAGE -----------------
function saveRecentPnr(pnr) {
    if (!recentPnrs.includes(pnr)) {
        recentPnrs.unshift(pnr);
        if (recentPnrs.length > 5) recentPnrs.pop();
        try {
            sessionStorage.setItem('recent_pnrs', JSON.stringify(recentPnrs));
        } catch (e) {}
        loadRecentPnrs();
    }
}

function loadRecentPnrs() {
    try {
        const stored = sessionStorage.getItem('recent_pnrs');
        if (stored) recentPnrs = JSON.parse(stored);
    } catch (e) {}

    const container = document.getElementById('recentPnrsContainer');
    const list = document.getElementById('recentPnrsList');

    if (recentPnrs.length > 0) {
        container.style.display = 'block';
        list.innerHTML = recentPnrs.map(p => `
            <button class="btn btn-outline btn-sm" style="margin: 0.2rem;" onclick="checkPnrStatus('${p}')">${p}</button>
        `).join('');
    } else {
        container.style.display = 'none';
    }
}


// ----------------- 6. LIVE RUNNING TIMETABLE & DELAYS (SABBIR) -----------------
async function viewRunningStatus(trainNumber) {
    const modal = document.getElementById('runningStatusModal');
    const body = document.getElementById('runningStatusBody');
    const title = document.getElementById('runningStatusTrainTitle');
    title.innerText = '⏱️ Running Status: Train ' + trainNumber;
    body.innerHTML = '<p>Fetching live NTES delay telemetry...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/api/trains/${trainNumber}/running-status`);
        if (!res.ok) throw new Error('Live running data unavailable');
        const data = await res.json();

        body.innerHTML = `
            <div style="background:#ebf8ff; border:1px solid #bee3f8; border-radius:8px; padding:0.85rem; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${data.train_name}</strong>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Current Location: <strong>${data.current_location}</strong></div>
                </div>
                <div style="text-align:right;">
                    <span class="status-badge ${data.overall_delay_minutes > 0 ? 'PARTIAL' : 'CONFIRMED'}">
                        ${data.overall_delay_minutes === 0 ? 'ON TIME' : `${data.overall_delay_minutes} min late`}
                    </span>
                </div>
            </div>

            <div style="max-height:300px; overflow-y:auto;">
                <table class="passenger-table">
                    <thead>
                        <tr>
                            <th>Station</th>
                            <th>Platform</th>
                            <th>Sch. Dep</th>
                            <th>Delay</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.station_status.map(s => `
                            <tr>
                                <td><strong>${s.station_code}</strong></td>
                                <td>Pf ${s.platform}</td>
                                <td>${s.scheduled_departure}</td>
                                <td><span style="color:${s.delay_minutes > 0 ? '#c53030' : '#276749'}; font-weight:600;">+${s.delay_minutes}m</span></td>
                                <td><span class="status-badge ${s.status === 'DEPARTED' ? 'CANCELLED' : (s.status === 'ARRIVED' ? 'CONFIRMED' : 'PARTIAL')}" style="font-size:0.75rem;">${s.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Unable to retrieve live running status: ${e.message}</p>`;
    }
}

function closeRunningStatusModal() {
    document.getElementById('runningStatusModal').classList.remove('active');
}

// ----------------- 7. COACH OCCUPANCY RADAR (SAMVIT) -----------------
async function viewOccupancyRadar(trainNumber) {
    const modal = document.getElementById('occupancyModal');
    const body = document.getElementById('occupancyModalBody');
    const title = document.getElementById('occupancyTrainTitle');
    title.innerText = '📊 Coach Occupancy: Train ' + trainNumber;
    body.innerHTML = '<p>Computing live inventory capacity metrics...</p>';
    modal.classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/api/trains/${trainNumber}/occupancy`);
        if (!res.ok) throw new Error('Occupancy metrics unavailable');
        const data = await res.json();

        body.innerHTML = `
            <div style="background:#f7fafc; border:1px solid var(--border); border-radius:8px; padding:0.85rem; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                    <span>Overall Capacity Utilization:</span>
                    <strong style="color:var(--primary);">${data.overall_occupancy_pct}% (${data.overall_booked}/${data.overall_capacity} seats)</strong>
                </div>
                <div style="width:100%; height:10px; background:#edf2f7; border-radius:5px; overflow:hidden;">
                    <div style="width:${Math.min(100, data.overall_occupancy_pct)}%; height:100%; background:var(--primary);"></div>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${data.class_breakdown.map(c => `
                    <div style="border:1px solid var(--border); border-radius:8px; padding:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                            <span style="font-weight:700;">Class ${c.coach_class}</span>
                            <span style="font-size:0.85rem; color:var(--text-muted);">${c.available} available / ${c.total_seats} total</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted); margin-bottom:0.3rem;">
                            <span>RAC: ${c.rac_count} | WL: ${c.wl_count}</span>
                            <span style="font-weight:600; color:${c.occupancy_rate_pct > 80 ? '#c53030' : '#276749'}">${c.occupancy_rate_pct}% Booked</span>
                        </div>
                        <div style="width:100%; height:8px; background:#edf2f7; border-radius:4px; overflow:hidden;">
                            <div style="width:${Math.min(100, c.occupancy_rate_pct)}%; height:100%; background:${c.occupancy_rate_pct > 80 ? '#e53e3e' : '#319795'};"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Unable to load coach occupancy: ${e.message}</p>`;
    }
}

function closeOccupancyModal() {
    document.getElementById('occupancyModal').classList.remove('active');
}

// ----------------- 8. OFFICIAL CRIS GST TAX INVOICE (VINAYAK) -----------------
async function viewTaxInvoice(pnr, trainNumber, coachClass, totalFare) {
    const modal = document.getElementById('taxInvoiceModal');
    const body = document.getElementById('taxInvoiceBody');
    body.innerHTML = '<p>Generating official CRIS GST tax invoice...</p>';
    modal.classList.add('active');

    try {
        const payload = {
            pnr: pnr,
            train_number: trainNumber,
            coach_class: coachClass,
            fare_summary: { total_fare: totalFare },
            passengers: [{ name: 'Passenger', age: 30 }]
        };

        const res = await fetch(`${API_BASE}/api/fare/eticket-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Invoice generation failed');
        const inv = await res.json();
        const ch = inv.itemized_charges;

        body.innerHTML = `
            <div style="border: 1px dashed var(--border); padding: 1rem; border-radius: 8px; background: #fff;">
                <div style="text-align:center; border-bottom:1px solid #edf2f7; padding-bottom:0.75rem; margin-bottom:0.75rem;">
                    <h3 style="font-size:1.1rem; color:var(--primary); margin:0;">${inv.supplier_name}</h3>
                    <div style="font-size:0.78rem; color:var(--text-muted);">GSTIN: <strong>${inv.gstin_supplier}</strong> | SAC Code: <strong>${inv.sac_code}</strong></div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">Invoice #: <strong>${inv.invoice_number}</strong></div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; font-size:0.85rem; margin-bottom:0.75rem;">
                    <div>PNR: <strong>${inv.pnr}</strong></div>
                    <div>Train: <strong>${inv.train_number}</strong></div>
                    <div>Class: <strong>${inv.coach_class}</strong></div>
                    <div>Category: <strong>${inv.is_ac_coach ? 'AC Class (5% GST)' : 'Non-AC (GST Exempt)'}</strong></div>
                </div>

                <table class="passenger-table" style="margin-bottom:0.75rem;">
                    <thead>
                        <tr>
                            <th>Charge Description</th>
                            <th style="text-align:right;">Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Base Taxable Ticket Fare</td>
                            <td style="text-align:right;">₹${ch.base_taxable_fare.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>CGST (${(ch.gst_percentage / 2).toFixed(1)}%)</td>
                            <td style="text-align:right;">₹${ch.cgst_amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>SGST (${(ch.gst_percentage / 2).toFixed(1)}%)</td>
                            <td style="text-align:right;">₹${ch.sgst_amount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>IRCTC Convenience Fee (Incl. 18% GST)</td>
                            <td style="text-align:right;">₹${(ch.irctc_convenience_fee + ch.convenience_fee_gst).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Optional Travel Insurance</td>
                            <td style="text-align:right;">₹${ch.travel_insurance.toFixed(2)}</td>
                        </tr>
                        <tr style="background:#f7fafc; font-weight:700;">
                            <td>Grand Total (Paid)</td>
                            <td style="text-align:right; color:var(--primary); font-size:1.05rem;">₹${ch.grand_total.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="font-size:0.75rem; color:var(--text-muted); text-align:center;">
                    * This is a computer-generated tax invoice issued pursuant to Section 31 of CGST Act, 2017.
                </div>
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<p style="color:red">Unable to generate invoice: ${e.message}</p>`;
    }
}

function closeTaxInvoiceModal() {
    document.getElementById('taxInvoiceModal').classList.remove('active');
}
