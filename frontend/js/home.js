let stationsData = {};
const searchHistory = new RecentSearchStack();

function populateStates(selectEl) {
  selectEl.innerHTML = '';
  Object.keys(stationsData).forEach((state) => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    selectEl.appendChild(option);
  });
}

function populateCities(stateSelectEl, citySelectEl) {
  const cities = stationsData[stateSelectEl.value] || [];
  citySelectEl.innerHTML = '';
  cities.forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelectEl.appendChild(option);
  });
}

function findStateForCity(city) {
  return Object.keys(stationsData).find((state) => stationsData[state].includes(city));
}

function renderRecentSearches() {
  const items = searchHistory.toArray();
  const wrap = document.getElementById('recentWrap');
  const chips = document.getElementById('recentChips');
  chips.innerHTML = '';

  if (items.length === 0) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  items.forEach((item) => {
    const chip = document.createElement('button');
    chip.className = 'recent-chip';
    chip.textContent = item.source + ' \u2192 ' + item.destination;
    chip.addEventListener('click', () => {
      const sourceState = findStateForCity(item.source);
      const destState = findStateForCity(item.destination);
      document.getElementById('sourceState').value = sourceState;
      populateCities(document.getElementById('sourceState'), document.getElementById('sourceCity'));
      document.getElementById('sourceCity').value = item.source;
      document.getElementById('destState').value = destState;
      populateCities(document.getElementById('destState'), document.getElementById('destCity'));
      document.getElementById('destCity').value = item.destination;
    });
    chips.appendChild(chip);
  });
}

function trainNameResultHtml(train) {
  return `
    <div class="name-result-item">
      <div>
        <div class="train-name">${train.name}</div>
        <div class="train-id">${train.source} &rarr; ${train.destination} &middot; ${train.departure} - ${train.arrival}</div>
      </div>
      <div class="name-result-price">
        <div class="price">&#8377;${train.price}</div>
        <button class="btn btn-primary" onclick="goToBooking('${train.id}','${train.source}','${train.destination}')">Book</button>
      </div>
    </div>
  `;
}

function goToBooking(trainId, source, destination) {
  const params = new URLSearchParams({ trainId, source, destination });
  window.location.href = 'booking.html?' + params.toString();
}

async function runTrainNameSearch() {
  const resultsBox = document.getElementById('trainNameResults');
  const query = document.getElementById('trainNameInput').value.trim();

  if (!query) {
    resultsBox.innerHTML = '';
    return;
  }

  resultsBox.innerHTML = '<div class="loading-state"><span class="spinner"></span><p>Searching...</p></div>';

  const matches = await apiGet('/trains/search-by-name?query=' + encodeURIComponent(query));

  if (matches.length === 0) {
    resultsBox.innerHTML = '<div class="name-search-empty"><span class="empty-icon">&#128269;</span>No trains match that name.</div>';
    return;
  }

  resultsBox.innerHTML = matches.map(trainNameResultHtml).join('');
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

  stationsData = await apiGet('/trains/stations');

  const sourceState = document.getElementById('sourceState');
  const sourceCity = document.getElementById('sourceCity');
  const destState = document.getElementById('destState');
  const destCity = document.getElementById('destCity');

  populateStates(sourceState);
  populateStates(destState);
  populateCities(sourceState, sourceCity);
  destState.value = Object.keys(stationsData)[1] || Object.keys(stationsData)[0];
  populateCities(destState, destCity);

  sourceState.addEventListener('change', () => populateCities(sourceState, sourceCity));
  destState.addEventListener('change', () => populateCities(destState, destCity));

  document.getElementById('swapBtn').addEventListener('click', () => {
    const tempState = sourceState.value;
    const tempCity = sourceCity.value;
    sourceState.value = destState.value;
    populateCities(sourceState, sourceCity);
    sourceCity.value = destCity.value;
    destState.value = tempState;
    populateCities(destState, destCity);
    destCity.value = tempCity;
  });

  document.getElementById('journeyDate').valueAsDate = new Date();

  document.getElementById('searchBtn').addEventListener('click', () => {
    const errorBox = document.getElementById('errorBox');
    errorBox.classList.remove('visible');

    const source = sourceCity.value;
    const destination = destCity.value;
    const sortBy = document.getElementById('sortPref').value;

    if (source === destination) {
      errorBox.textContent = 'Source and destination cannot be the same city';
      errorBox.classList.add('visible');
      return;
    }

    searchHistory.push({ source, destination });

    const params = new URLSearchParams({ source, destination, sortBy });
    window.location.href = 'results.html?' + params.toString();
  });

  document.getElementById('trainNameSearchBtn').addEventListener('click', runTrainNameSearch);
  document.getElementById('trainNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runTrainNameSearch();
  });

  renderRecentSearches();
}

init();