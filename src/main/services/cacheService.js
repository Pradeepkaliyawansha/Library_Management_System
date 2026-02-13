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

    // Different cache durations for different data types
    this.cacheDurations = {
      students: 2000, // 2 seconds - changes less frequently
      books: 2000, // 2 seconds - changes less frequently
      transactions: 1000, // 1 second - changes more frequently
      statistics: 2000, // 2 seconds - aggregated data
    };
  }

  get(key) {
    if (this.isValid(key)) {
      return this.cache[key];
    }
    return null;
  }

  set(key, value, customDuration = null) {
    this.cache[key] = value;
    this.lastUpdate[key] = Date.now();

    // Allow custom duration for specific use cases
    if (customDuration !== null) {
      const originalDuration = this.cacheDurations[key];
      this.cacheDurations[key] = customDuration;

      // Reset to original after this cache expires
      setTimeout(() => {
        this.cacheDurations[key] = originalDuration;
      }, customDuration);
    }
  }

  isValid(key) {
    const now = Date.now();
    const duration = this.cacheDurations[key] || 500;

    return this.cache[key] !== null && now - this.lastUpdate[key] < duration;
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

  // Get cache statistics for debugging
  getStats() {
    const now = Date.now();
    return Object.keys(this.cache).reduce((stats, key) => {
      stats[key] = {
        cached: this.cache[key] !== null,
        age: this.cache[key] ? now - this.lastUpdate[key] : null,
        valid: this.isValid(key),
        duration: this.cacheDurations[key],
      };
      return stats;
    }, {});
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
