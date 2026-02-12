class CacheService {
  constructor() {
    this.cache = {
      students: null,
      books: null,
      transactions: null,
      statistics: null,
    };

    this.lastUpdate = {
      students: 0,
      books: 0,
      transactions: 0,
      statistics: 0,
    };

    this.cacheDuration = 500; // milliseconds
  }

  get(key) {
    if (this.isValid(key)) {
      return this.cache[key];
    }
    return null;
  }

  set(key, value) {
    this.cache[key] = value;
    this.lastUpdate[key] = Date.now();
  }

  isValid(key) {
    const now = Date.now();
    return (
      this.cache[key] !== null &&
      now - this.lastUpdate[key] < this.cacheDuration
    );
  }

  invalidate(keys) {
    keys.forEach((key) => {
      this.cache[key] = null;
      this.lastUpdate[key] = 0;
    });
  }

  invalidateAll() {
    Object.keys(this.cache).forEach((key) => {
      this.cache[key] = null;
      this.lastUpdate[key] = 0;
    });
  }

  clear() {
    this.cache = {
      students: null,
      books: null,
      transactions: null,
      statistics: null,
    };

    this.lastUpdate = {
      students: 0,
      books: 0,
      transactions: 0,
      statistics: 0,
    };
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
