const SESSION_KEY = 'tb_session';
const SEARCH_HISTORY_KEY = 'tb_recent_searches';

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

function startGuestSession() {
  const guest = { id: 'GUEST-' + Date.now(), name: 'Guest', isGuest: true };
  setSession(guest);
  return guest;
}

class RecentSearchStack {
  constructor(maxSize = 5) {
    this.maxSize = maxSize;
    this.items = this.load();
  }

  load() {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  save() {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.items));
  }

  push(entry) {
    this.items = this.items.filter((item) => !(item.source === entry.source && item.destination === entry.destination));
    this.items.push(entry);
    if (this.items.length > this.maxSize) {
      this.items.shift();
    }
    this.save();
  }

  toArray() {
    return [...this.items].reverse();
  }
}
