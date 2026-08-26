# RailYatra - Train Ticket Booking System

## Folder structure

```
railyatra/
  backend/
    server.js
    package.json
    data/
      stations.js      Indian states, cities (all major Maharashtra cities plus more) and route distances
      trains.js         seed data for trains on each route
    dsa/
      graph.js          Graph + Dijkstra's shortest path
      priorityQueue.js  Min-heap (used by Dijkstra and the waitlist)
      sorting.js        quick sort, merge sort, binary search
      hashMap.js        custom hash table for user lookup
      stack.js          stack (recent activity)
    routes/
      auth.js
      trains.js
      bookings.js
    storageManager.js   reads/writes JSON files as the database
    storage/            auto-created: users.json, trains.json, bookings.json, waitlist.json
  frontend/
    index.html          landing page (login / register / guest)
    login.html
    register.html
    home.html            search form
    results.html         search results
    booking.html          seat booking
    dashboard.html        my bookings
    css/style.css
    js/api.js, session.js, home.js, results.js, booking.js, dashboard.js
```

## How to run

1. Install Node.js (v18 or later).
2. Open a terminal in `backend/` and run:
   ```
   npm install
   npm start
   ```
3. Open `http://localhost:3000` in your browser. The Express server also serves the frontend files, so no separate frontend server is needed.

The `storage/` folder is created automatically on first run and acts as the database (plain JSON files). Delete it any time to reset all data.

## Where each DSA concept is used

- **Graph + Dijkstra's algorithm** (`dsa/graph.js`): the rail network is modeled as a weighted graph of stations. When you search a route with no direct train, Dijkstra finds the shortest total-distance path through intermediate stations.
- **Min-heap / priority queue** (`dsa/priorityQueue.js`): powers Dijkstra's algorithm internally, and also manages each train's waitlist so the earliest request is promoted first when a seat becomes free.
- **Sorting algorithms** (`dsa/sorting.js`): quick sort orders results by price, merge sort orders results by duration or departure time, and insertion sort powers the "search by train name" box on the home page (the list is sorted by name, then scanned for matches).
- **Hash table** (`dsa/hashMap.js`): stores registered users keyed by email for average O(1) lookup during login/registration.
- **Stack** (`dsa/stack.js` and the client-side equivalent in `js/session.js`): keeps the most recent searches, most recent on top.


A good demo flow: search a route that has no direct train (for example New Delhi to Mumbai) to show Dijkstra finding a multi-leg path, then book more seats than are available on a small train (for example Tippu Express, 60 seats) to show the waitlist queue, then cancel the first booking to show automatic promotion from the waitlist.
