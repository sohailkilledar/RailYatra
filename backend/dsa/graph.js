const { MinHeap } = require('./priorityQueue');

class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addStation(station) {
    if (!this.adjacencyList.has(station)) {
      this.adjacencyList.set(station, []);
    }
  }

  addRoute(stationA, stationB, distanceKm, avgMinutes) {
    this.addStation(stationA);
    this.addStation(stationB);
    this.adjacencyList.get(stationA).push({ node: stationB, distance: distanceKm, time: avgMinutes });
    this.adjacencyList.get(stationB).push({ node: stationA, distance: distanceKm, time: avgMinutes });
  }

  getNeighbors(station) {
    return this.adjacencyList.get(station) || [];
  }

  hasStation(station) {
    return this.adjacencyList.has(station);
  }

  allStations() {
    return Array.from(this.adjacencyList.keys());
  }

  dijkstra(source, destination) {
    if (!this.hasStation(source) || !this.hasStation(destination)) {
      return null;
    }

    const distances = new Map();
    const previous = new Map();
    const visited = new Set();

    for (const station of this.allStations()) {
      distances.set(station, Infinity);
    }
    distances.set(source, 0);

    const heap = new MinHeap();
    heap.insert({ node: source, priority: 0 });

    while (!heap.isEmpty()) {
      const { node: current } = heap.extractMin();

      if (visited.has(current)) continue;
      visited.add(current);

      if (current === destination) break;

      for (const neighbor of this.getNeighbors(current)) {
        if (visited.has(neighbor.node)) continue;
        const newDistance = distances.get(current) + neighbor.distance;
        if (newDistance < distances.get(neighbor.node)) {
          distances.set(neighbor.node, newDistance);
          previous.set(neighbor.node, current);
          heap.insert({ node: neighbor.node, priority: newDistance });
        }
      }
    }

    if (distances.get(destination) === Infinity) {
      return null;
    }

    const path = [];
    let step = destination;
    while (step !== undefined) {
      path.unshift(step);
      step = previous.get(step);
    }

    return {
      path,
      totalDistance: distances.get(destination)
    };
  }
}

module.exports = { Graph };
