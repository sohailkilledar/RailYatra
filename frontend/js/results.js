function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours + 'h ' + (minutes ? minutes + 'm' : '');
}

function trainCardHtml(train) {
  const seatsClass = train.availableSeats <= 5 && train.availableSeats > 0 ? 'low' : '';
  const seatsText = train.availableSeats > 0 ? train.availableSeats + ' seats left' : 'Waitlist only';

  return `
    <div class="card train-card">
      <div>
        <div class="train-name">${train.name}</div>
        <div class="train-id">${train.id}</div>
      </div>
      <div class="time-row">
        <div class="time-block">
          <div class="time">${train.departure}</div>
          <div class="place">${train.source}</div>
        </div>
        <div class="time-line"><span>${formatMinutes(train.durationMinutes)}</span></div>
        <div class="time-block">
          <div class="time">${train.arrival}</div>
          <div class="place">${train.destination}</div>
        </div>
      </div>
      <div class="price-block">
        <div class="price">&#8377;${train.price}</div>
        <div class="seats-left ${seatsClass}">${seatsText}</div>
      </div>
      <button class="btn btn-primary" onclick="bookTrain('${train.id}','${train.source}','${train.destination}')">Book</button>
    </div>
  `;
}

function bookTrain(trainId, source, destination) {
  const params = new URLSearchParams({ trainId, source, destination });
  window.location.href = 'booking.html?' + params.toString();
}

function renderResults(data, source, destination) {
  const wrap = document.getElementById('resultsWrap');
  const title = document.getElementById('routeTitle');
  const subtitle = document.getElementById('routeSubtitle');

  if (data.type === 'direct') {
    title.textContent = source + ' \u2192 ' + destination;
    subtitle.textContent = data.trains.length + ' direct train(s) found';

    if (data.trains.length === 0) {
      wrap.innerHTML = '<div class="card empty-state"><div class="empty-icon">&#128667;</div><h3>No trains found</h3><p>Try a different route or date.</p></div>';
      return;
    }

    wrap.innerHTML = data.trains.map(trainCardHtml).join('');
    return;
  }

  if (data.type === 'connecting') {
    title.textContent = source + ' \u2192 ' + destination;
    subtitle.textContent = 'No direct train. Shortest connecting route found using Dijkstra\u2019s algorithm, ' + data.totalDistance + ' km total.';

    const banner = `
      <div class="route-path-banner">
        ${data.path.map((stop, i) => `<span class="hop">${stop}</span>` + (i < data.path.length - 1 ? '&rarr;' : '')).join('')}
      </div>
    `;

    const legsHtml = data.legs.map((leg) => {
      const legTrains = leg.trains.length > 0
        ? leg.trains.map(trainCardHtml).join('')
        : '<div class="card empty-state"><div class="empty-icon">&#128667;</div><h3>No trains on this leg</h3><p>This connecting leg currently has no listed trains.</p></div>';

      return `
        <div class="leg-block">
          <div class="leg-heading">Leg: ${leg.from} &rarr; ${leg.to}</div>
          ${legTrains}
        </div>
      `;
    }).join('');

    wrap.innerHTML = banner + legsHtml;
    return;
  }

  wrap.innerHTML = '<div class="card empty-state"><div class="empty-icon">&#128667;</div><h3>No route found</h3><p>These two stations are not connected in the network.</p></div>';
}

async function runSearch(sortBy) {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const destination = params.get('destination');

  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sort === sortBy);
  });

  document.getElementById('resultsWrap').innerHTML = '<div class="card loading-state"><span class="spinner"></span><p>Searching for trains...</p></div>';

  try {
    const data = await apiGet(`/trains/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&sortBy=${sortBy}`);
    renderResults(data, source, destination);
  } catch (err) {
    document.getElementById('resultsWrap').innerHTML = `<div class="card empty-state"><div class="empty-icon">&#9888;</div><h3>${err.message}</h3></div>`;
  }
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

  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', () => runSearch(btn.dataset.sort));
  });

  const params = new URLSearchParams(window.location.search);
  runSearch(params.get('sortBy') || 'price');
}

init();
