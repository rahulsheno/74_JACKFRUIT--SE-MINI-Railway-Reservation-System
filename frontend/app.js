const API_BASE = window.location.origin;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// 1. Train Search
async function searchTrains() {
    const src = document.getElementById('srcStation').value;
    const dst = document.getElementById('dstStation').value;
    const date = document.getElementById('travelDate').value;
    const container = document.getElementById('trainResults');
    container.innerHTML = '<p>Loading available trains...</p>';

    try {
        const res = await fetch(`${API_BASE}/api/trains/search?source=${src}&destination=${dst}&travel_date=${date}`);
        const data = await res.json();

        if (!data.trains || data.trains.length === 0) {
            container.innerHTML = '<p>No direct trains found for selected route and date.</p>';
            return;
        }

        container.innerHTML = data.trains.map(t => `
            <div class="train-card">
                <div class="train-meta">
                    <h3>${t.train_number} - ${t.train_name}</h3>
                    <div class="train-time">
                        <span><strong>Dep:</strong> ${t.departure_time} (${t.source})</span>
                        <span>➔</span>
                        <span><strong>Arr:</strong> ${t.arrival_time} (${t.destination})</span>
                        <span><strong>Distance:</strong> ${t.segment_distance_km} km</span>
                    </div>
                    <div><strong>Available Classes:</strong> ${t.available_classes.join(', ')}</div>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="selectTrainForBooking('${t.train_number}', '${t.source}', '${t.destination}')">Book Now</button>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p style="color:red">Error connecting to railway server: ${e.message}</p>`;
    }
}

// 2. Interactive Coach Layout
async function loadCoachLayout() {
    const trainNum = document.getElementById('seatTrainNum').value;
    const coachClass = document.getElementById('seatClass').value;
    const container = document.getElementById('coachContainer');
    container.innerHTML = '<p>Generating coach berths...</p>';

    try {
        const res = await fetch(`${API_BASE}/api/seats/layout?train_number=${trainNum}&journey_date=2026-11-20&coach_class=${coachClass}`);
        const data = await res.json();

        container.innerHTML = data.seats.map(s => `
            <div class="seat-item ${s.status}" onclick="lockSeat('${trainNum}', '${coachClass}', ${s.seat_number}, '${s.status}')">
                <div class="seat-num">${s.seat_number}</div>
                <div class="seat-type">${s.berth_type}</div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

async function lockSeat(trainNum, coachClass, seatNum, status) {
    if (status !== 'AVAILABLE') {
        alert(`Seat ${seatNum} is already ${status}`);
        return;
    }
    const res = await fetch(`${API_BASE}/api/seats/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            train_number: trainNum,
            journey_date: '2026-11-20',
            coach_class: coachClass,
            seat_number: seatNum,
            user_id: 'guest_user'
        })
    });
    const d = await res.json();
    if (res.ok) {
        alert(`Seat ${seatNum} locked for 5 mins! Lock ID: ${d.lock_id}`);
        loadCoachLayout();
    } else {
        alert(d.detail || 'Lock failed');
    }
}

// 3. Booking & Fare Calculation
function selectTrainForBooking(trainNum, src, dst) {
    window.selectedTrain = { trainNum, src, dst };
    switchTab('booking-tab');
    updateFarePreview();
}

async function updateFarePreview() {
    const concession = document.getElementById('pConcession').value;
    try {
        const res = await fetch(`${API_BASE}/api/fare/calculate?distance_km=362&coach_class=3A&concession_type=${concession}`);
        const data = await res.json();
        document.getElementById('fbBase').innerText = `₹${data.base_fare.toFixed(2)}`;
        document.getElementById('fbDisc').innerText = `-₹${data.discount_amount.toFixed(2)}`;
        document.getElementById('fbTax').innerText = `₹${(data.superfast_surcharge + data.gst).toFixed(2)}`;
        document.getElementById('fbTotal').innerText = `₹${data.total_fare.toFixed(2)}`;
    } catch (e) {}
}

async function executeBooking() {
    const pName = document.getElementById('pName').value;
    const pAge = parseInt(document.getElementById('pAge').value);
    const pPref = document.getElementById('pPref').value;
    const pConcession = document.getElementById('pConcession').value;

    const reqBody = {
        user_id: 'passenger_web',
        train_number: (window.selectedTrain && window.selectedTrain.trainNum) || '12658',
        journey_date: '2026-11-20',
        source: (window.selectedTrain && window.selectedTrain.src) || 'SBC',
        destination: (window.selectedTrain && window.selectedTrain.dst) || 'MAS',
        coach_class: '3A',
        quota: 'GENERAL',
        passengers: [{
            name: pName,
            age: pAge,
            gender: 'M',
            berth_preference: pPref,
            concession_type: pConcession
        }]
    };

    const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
    });
    const data = await res.json();
    if (res.ok) {
        alert(`Booking Confirmed! Your PNR: ${data.pnr}\nTotal Paid: ₹${data.total_fare}`);
        document.getElementById('pnrInput').value = data.pnr;
        switchTab('pnr-tab');
        checkPnrStatus();
    } else {
        alert(data.detail || 'Booking failed');
    }
}

// 4. PNR Tracker & Cancellation
async function checkPnrStatus() {
    const pnr = document.getElementById('pnrInput').value.trim();
    if (!pnr) return;

    const card = document.getElementById('pnrResultCard');
    card.style.display = 'block';
    card.innerHTML = '<p>Querying PNR Status...</p>';

    try {
        const res = await fetch(`${API_BASE}/api/pnr/${pnr}`);
        if (!res.ok) {
            card.innerHTML = '<p style="color:red">PNR not found or invalid.</p>';
            return;
        }
        const b = await res.json();
        const p = b.passengers[0];
        card.innerHTML = `
            <h2>Ticket Details for PNR: ${b.pnr}</h2>
            <div class="train-time">
                <span><strong>Train:</strong> ${b.train_number} - ${b.train_name}</span>
                <span><strong>Date:</strong> ${b.journey_date}</span>
                <span><strong>Status:</strong> <span style="color: ${b.booking_status === 'CANCELLED' ? 'red' : 'green'}; font-weight:700;">${b.booking_status}</span></span>
            </div>
            <p><strong>Passenger:</strong> ${p.name} (Age: ${p.age})</p>
            <p><strong>Berth / Seat:</strong> ${p.status === 'CNF' ? `${p.coach} / Seat ${p.seat_number} (${p.berth_type})` : p.status}</p>
            <p><strong>Total Fare Paid:</strong> ₹${b.total_fare}</p>
            ${b.booking_status !== 'CANCELLED' ? `
                <button class="btn btn-danger" style="margin-top: 1rem;" onclick="cancelTicket('${b.pnr}')">Cancel Ticket & Claim Refund</button>
            ` : '<p style="color:gray; margin-top:1rem;"><em>This ticket has been cancelled.</em></p>'}
        `;
    } catch (e) {
        card.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

async function cancelTicket(pnr) {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    const res = await fetch(`${API_BASE}/api/bookings/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: pnr, hours_before_departure: 50.0 })
    });
    const d = await res.json();
    if (res.ok) {
        alert(`Ticket Cancelled!\nRefund Amount: ₹${d.refund.refund_amount}\nCancellation Charge: ₹${d.refund.cancellation_charge}`);
        checkPnrStatus();
    } else {
        alert(d.detail || 'Cancellation failed');
    }
}
