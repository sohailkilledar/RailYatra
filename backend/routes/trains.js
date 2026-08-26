const express = require('express');

const { readData, writeData } = require('../storageManager');

const { Graph } = require('../dsa/graph');

const { quickSort, mergeSort, searchTrainsByName } = require('../dsa/sorting');

const { statesAndCities, routes } = require('../data/stations');

const { trains: seedTrains } = require('../data/trains');

const router = express.Router();

function buildGraph() {
  const graph = new Graph();

  for (const [a, b, distance, time] of routes) {
    graph.addRoute(a, b, distance, time);
  }

  return graph;
}

function loadTrains() {
  return readData('trains.json', seedTrains);
}

function saveTrains(trains) {
  writeData('trains.json', trains);
}

function findDirectTrains(allTrains, source, destination) {
  return allTrains.filter((t) => t.source === source && t.destination === destination);
}

function sortTrains(trainsList, sortBy) {
  if (sortBy === 'duration') {
    return mergeSort(trainsList, (a, b) => a.durationMinutes - b.durationMinutes);
  }

  if (sortBy === 'departure') {
    return mergeSort(trainsList, (a, b) => a.departure.localeCompare(b.departure));
  }

  return quickSort(trainsList, (a, b) => a.price - b.price);
}

router.get('/stations', (req, res) => {
  res.json(statesAndCities);
});

router.get('/search', (req, res) => {
  const { source, destination, sortBy } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ error: 'Source and destination are required' });
  }

  if (source === destination) {
    return res.status(400).json({ error: 'Source and destination cannot be the same' });
  }

  const allTrains = loadTrains();

  const directTrains = sortTrains(
    findDirectTrains(allTrains, source, destination),
    sortBy
  );

  if (directTrains.length > 0) {
    return res.json({ type: 'direct', trains: directTrains });
  }

  const graph = buildGraph();

  const result = graph.dijkstra(source, destination);

  if (!result) {
    return res.status(404).json({ error: 'No route found between these stations' });
  }

  const legs = [];

  for (let i = 0; i < result.path.length - 1; i++) {
    const from = result.path[i];
    const to = result.path[i + 1];

    const legTrains = sortTrains(
      findDirectTrains(allTrains, from, to),
      sortBy
    );

    legs.push({
      from,
      to,
      trains: legTrains
    });
  }

  res.json({
    type: 'connecting',
    path: result.path,
    totalDistance: result.totalDistance,
    legs
  });
});

router.get('/search-by-name', (req, res) => {
  const query = String(req.query.query || '').trim();

  if (!query) {
    return res.json([]);
  }

  const allTrains = loadTrains();
  const matches = searchTrainsByName(allTrains, query);

  res.json(matches);
});

router.get('/all', (req, res) => {
  res.json(loadTrains());
});

router.get('/id/:trainId', (req, res) => {
  const allTrains = loadTrains();

  const train = allTrains.find((t) => t.id === req.params.trainId);

  if (!train) {
    return res.status(404).json({ error: 'Train not found' });
  }

  res.json(train);
});

module.exports = router;