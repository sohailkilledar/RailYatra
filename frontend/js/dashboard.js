function bookingCardHtml(booking) {
  const statusClass = booking.status.toLowerCase();
  const canCancel = booking.status === 'Confirmed' || booking.status === 'Waitlisted';

  return `
    <div class="card booking-card">
      <div>
        <div class="train-name">${booking.trainName}</div>
        <div class="train-id">${booking.source} &rarr; ${booking.destination} &middot; ${booking.seats} seat(s)</div>
        <div class="train-id">Passenger: ${booking.passengerName}</div>
      </div>
      <div style="display:flex; align-items:center; gap:14px;">
        <span class="badge ${statusClass}">${booking.status}${booking.waitlistPosition ? ' #' + booking.waitlistPosition : ''}</span>
        ${canCancel ? `<button class="btn btn-danger" onclick="cancelBooking('${booking.id}')">Cancel</button>` : ''}
      </div>
    </div>
  `;
}

async function loadBookings(ownerId) {
  const wrap = document.getElementById('bookingsWrap');
  wrap.innerHTML = '<div class="card loading-state"><span class="spinner"></span><p>Loading your bookings...</p></div>';

  const bookings = await apiGet('/bookings/' + encodeURIComponent(ownerId));

  if (bookings.length === 0) {
    wrap.innerHTML = '<div class="card empty-state"><div class="empty-icon">&#128197;</div><h3>No bookings yet</h3><p>Search for a train and book your first trip.</p></div>';
    return;
  }

  wrap.innerHTML = bookings.map(bookingCardHtml).join('');
}

async function cancelBooking(bookingId) {
  const session = getSession();
  await apiPost('/bookings/cancel', { bookingId });
  loadBookings(session.id);
}

async function init() {
  const session = requireSession();
  if (!session) return;

  document.getElementById('userPill').textContent = session.isGuest ? 'Guest session' : session.name;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });

  document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.href = 'home.html';
  });

  loadBookings(session.id);
}

init();
