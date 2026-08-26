const express = require('express');
const { readData, writeData } = require('../storageManager');
const { MinHeap } = require('../dsa/priorityQueue');
const { trains: seedTrains } = require('../data/trains');

const router = express.Router();

function loadTrains() {
  return readData('trains.json', seedTrains);
}

function saveTrains(trains) {
  writeData('trains.json', trains);
}

function loadBookings() {
  return readData('bookings.json', []);
}

function saveBookings(bookings) {
  writeData('bookings.json', bookings);
}

function loadWaitlist() {
  return readData('waitlist.json', {});
}

function saveWaitlist(waitlist) {
  writeData('waitlist.json', waitlist);
}

function heapFromArray(entries) {
  const heap = new MinHeap();
  for (const entry of entries) {
    heap.insert({ ...entry, priority: entry.timestamp });
  }
  return heap;
}

router.post('/', (req, res) => {
  const { trainId, passengerName, seats, ownerId } = req.body;

  if (!trainId || !passengerName || !seats || !ownerId) {
    return res.status(400).json({ error: 'Missing booking details' });
  }

  const seatCount = parseInt(seats, 10);
  const trains = loadTrains();
  const train = trains.find((t) => t.id === trainId);

  if (!train) {
    return res.status(404).json({ error: 'Train not found' });
  }

  const bookings = loadBookings();
  const bookingId = 'BK' + Date.now();

  if (train.availableSeats >= seatCount) {
    train.availableSeats -= seatCount;
    saveTrains(trains);

    const booking = {
      id: bookingId,
      ownerId,
      trainId,
      trainName: train.name,
      source: train.source,
      destination: train.destination,
      passengerName,
      seats: seatCount,
      status: 'Confirmed',
      waitlistPosition: null,
      createdAt: Date.now()
    };

    bookings.push(booking);
    saveBookings(bookings);
    return res.json(booking);
  }

  const waitlist = loadWaitlist();
  const trainWaitlist = waitlist[trainId] || [];
  const heap = heapFromArray(trainWaitlist);

  const waitlistEntry = {
    bookingId,
    ownerId,
    passengerName,
    seats: seatCount,
    timestamp: Date.now()
  };

  heap.insert({ ...waitlistEntry, priority: waitlistEntry.timestamp });
  const updatedList = heap.toSortedArray().map(({ priority, ...rest }) => rest);
  waitlist[trainId] = updatedList;
  saveWaitlist(waitlist);

  const position = updatedList.findIndex((entry) => entry.bookingId === bookingId) + 1;

  const booking = {
    id: bookingId,
    ownerId,
    trainId,
    trainName: train.name,
    source: train.source,
    destination: train.destination,
    passengerName,
    seats: seatCount,
    status: 'Waitlisted',
    waitlistPosition: position,
    createdAt: Date.now()
  };

  bookings.push(booking);
  saveBookings(bookings);
  res.json(booking);
});

router.get('/:ownerId', (req, res) => {
  const bookings = loadBookings();
  const ownerBookings = bookings
    .filter((b) => b.ownerId === req.params.ownerId)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(ownerBookings);
});

router.post('/cancel', (req, res) => {
  const { bookingId } = req.body;

  const bookings = loadBookings();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking || booking.status === 'Cancelled') {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const wasConfirmed = booking.status === 'Confirmed';
  booking.status = 'Cancelled';

  const trains = loadTrains();
  const train = trains.find((t) => t.id === booking.trainId);

  if (wasConfirmed && train) {
    train.availableSeats += booking.seats;

    const waitlist = loadWaitlist();
    const trainWaitlist = waitlist[booking.trainId] || [];

    if (trainWaitlist.length > 0) {
      const heap = heapFromArray(trainWaitlist);

      while (!heap.isEmpty() && train.availableSeats >= heap.peek().seats) {
        const next = heap.extractMin();
        const promoted = bookings.find((b) => b.id === next.bookingId);
        if (promoted) {
          promoted.status = 'Confirmed';
          promoted.waitlistPosition = null;
          train.availableSeats -= next.seats;
        }
      }

      const remaining = heap.toSortedArray().map(({ priority, ...rest }) => rest);
      remaining.forEach((entry, index) => {
        const waitingBooking = bookings.find((b) => b.id === entry.bookingId);
        if (waitingBooking) {
          waitingBooking.waitlistPosition = index + 1;
        }
      });
      waitlist[booking.trainId] = remaining;
      saveWaitlist(waitlist);
    }

    saveTrains(trains);
  }

  saveBookings(bookings);
  res.json(booking);
});

module.exports = router;
