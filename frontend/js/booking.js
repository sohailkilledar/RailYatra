let currentTrain = null;

function renderTrainSummary(train) {
  document.getElementById('trainSummary').innerHTML = `
    <div class="summary-row"><span class="label">Train</span><span class="value">${train.name} (${train.id})</span></div>
    <div class="summary-row"><span class="label">Route</span><span class="value">${train.source} &rarr; ${train.destination}</span></div>
    <div class="summary-row"><span class="label">Timing</span><span class="value">${train.departure} - ${train.arrival}</span></div>
    <div class="summary-row"><span class="label">Fare per seat</span><span class="value">&#8377;${train.price}</span></div>
    <div class="summary-row"><span class="label">Seats available</span><span class="value">${train.availableSeats}</span></div>
  `;
}

function renderBookingResult(booking) {
  document.getElementById('detailsView').style.display = 'none';
  const successView = document.getElementById('successView');
  successView.style.display = 'block';

  const banner = document.getElementById('statusBanner');
  const heading = document.getElementById('statusHeading');
  const text = document.getElementById('statusText');

  if (booking.status === 'Confirmed') {
    banner.className = 'status-banner confirmed';
    heading.innerHTML = '<span class="status-icon">&#10003;</span>Booking confirmed';
    text.textContent = 'Your seat has been reserved successfully.';
  } else {
    banner.className = 'status-banner waitlisted';
    heading.innerHTML = '<span class="status-icon">&#8987;</span>You are on the waitlist';
    text.textContent = 'Position ' + booking.waitlistPosition + ' in queue. You will be confirmed automatically if a seat opens up.';
  }

  document.getElementById('bookingSummary').innerHTML = `
    <div class="summary-row"><span class="label">Booking ID</span><span class="value">${booking.id}</span></div>
    <div class="summary-row"><span class="label">Train</span><span class="value">${booking.trainName}</span></div>
    <div class="summary-row"><span class="label">Route</span><span class="value">${booking.source} &rarr; ${booking.destination}</span></div>
    <div class="summary-row"><span class="label">Passenger</span><span class="value">${booking.passengerName}</span></div>
    <div class="summary-row"><span class="label">Seats</span><span class="value">${booking.seats}</span></div>
  `;
}

async function init() {
  const session = requireSession();
  if (!session) return;

  document.getElementById('userPill').textContent = session.isGuest ? 'Guest session' : session.name;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });

  document.getElementById('dashboardBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  const params = new URLSearchParams(window.location.search);
  const trainId = params.get('trainId');

  try {
    currentTrain = await apiGet('/trains/id/' + encodeURIComponent(trainId));
    renderTrainSummary(currentTrain);
  } catch (err) {
    document.getElementById('errorBox').textContent = err.message;
    document.getElementById('errorBox').classList.add('visible');
    return;
  }

  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById('errorBox');
    errorBox.classList.remove('visible');

    const passengerName = document.getElementById('passengerName').value.trim();
    const seats = parseInt(document.getElementById('seatCount').value, 10);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="spinner"></span> Booking...';

    try {
      const booking = await apiPost('/bookings', {
        trainId: currentTrain.id,
        passengerName,
        seats,
        ownerId: session.id
      });
      renderBookingResult(booking);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalLabel;
    }
  });
}

init();
