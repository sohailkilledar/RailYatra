class HashMap {
  constructor(bucketCount = 64) {
    this.bucketCount = bucketCount;
    this.buckets = new Array(bucketCount).fill(null).map(() => []);
    this.count = 0;
  }

  hash(key) {
    let hashValue = 0;
    const stringKey = String(key);
    for (let i = 0; i < stringKey.length; i++) {
      hashValue = (hashValue * 31 + stringKey.charCodeAt(i)) % this.bucketCount;
    }
    return hashValue;
  }

  set(key, value) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const existing = bucket.find((entry) => entry.key === key);
    if (existing) {
      existing.value = value;
    } else {
      bucket.push({ key, value });
      this.count++;
    }
  }

  get(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const entry = bucket.find((entry) => entry.key === key);
    return entry ? entry.value : undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  delete(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const entryIndex = bucket.findIndex((entry) => entry.key === key);
    if (entryIndex !== -1) {
      bucket.splice(entryIndex, 1);
      this.count--;
      return true;
    }
    return false;
  }

  values() {
    const result = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        result.push(entry.value);
      }
    }
    return result;
  }

  size() {
    return this.count;
  }
}

module.exports = { HashMap };
